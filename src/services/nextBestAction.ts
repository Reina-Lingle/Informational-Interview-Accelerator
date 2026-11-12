/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TargetCompany, CommandCenterContact, NextBestAction } from '../types/index.ts';
import { countElapsedBusinessDays } from './cadence.ts';
import { prioritizeCompanies } from './lamp.ts';

/**
 * Next Best Action Engine (BR-08, WF-10, T16)
 * Deterministic prioritization hierarchy:
 * 
 * 1. Immediate Meeting Preparation (Meeting scheduled soon)
 * 2. Post-Meeting Follow-Through (Within 24h of completed interview)
 * 3. 7B Cadence Trigger (7 business days unanswered -> Nudge Contact A)
 * 4. 3B Cadence Trigger (3 business days unanswered -> Recommend Contact B, no nudge to A)
 * 5. Active Queue Replenishment (< 6 active companies)
 * 6. Pending Outreach Approval (Draft ready for human authorization)
 * 7. Monthly Harvest Nurture (Booster/Obligate 30+ days post-meeting)
 * 8. Top LAMP Company Initial Outreach (Advance highest-priority target)
 */

export function calculateNextBestAction(
  companies: TargetCompany[],
  contacts: CommandCenterContact[],
  todayDateStr: string
): NextBestAction {
  const sortedCompanies = prioritizeCompanies(companies);
  const activeCompanies = sortedCompanies.filter(
    (c) => c.status === 'Active Queue' || c.status === 'Outreach Active' || c.status === 'Researching'
  );

  // 1. Scheduled Meeting Prep (Priority 1)
  const scheduledMeetingContact = contacts.find((c) => c.meetingStatus === 'Scheduled');
  if (scheduledMeetingContact) {
    const relatedCompany = companies.find((co) => co.id === scheduledMeetingContact.companyId);
    return {
      id: 'nba-meeting-prep',
      recommendation: `Prepare 20-minute briefing and TIARA questions for ${scheduledMeetingContact.contactName}`,
      whyNow: `Informational interview is scheduled for ${scheduledMeetingContact.meetingDate || 'upcoming date'}. Thorough preparation prevents awkwardness and builds confidence.`,
      actionLabel: 'Open Meeting Coach',
      actionType: 'prepare_meeting',
      evidence: [
        `Contact confirmed conversation: ${scheduledMeetingContact.contactName} (${scheduledMeetingContact.title || 'Role'} at ${scheduledMeetingContact.companyName})`,
        'Dalton Rule: Structured 20-minute meetings require 5 priority questions and verified company background.',
      ],
      targetCompanyId: scheduledMeetingContact.companyId,
      targetCompanyName: scheduledMeetingContact.companyName,
      targetContactId: scheduledMeetingContact.id,
      targetContactName: scheduledMeetingContact.contactName,
      requiresContentApproval: false,
      requiresExecutionApproval: false,
    };
  }

  // 2. Post-Meeting Follow-Through (Priority 2)
  const completedMeetingContact = contacts.find(
    (c) => c.meetingStatus === 'Completed' && (!c.interviewNotes || c.outreachStatus !== 'Sent')
  );
  if (completedMeetingContact) {
    return {
      id: 'nba-post-meeting',
      recommendation: `Capture intelligence and approve thank-you note for ${completedMeetingContact.contactName}`,
      whyNow: 'Conversations fade quickly. Dalton and Perez recommend sending a tailored thank-you within 24 hours of meeting.',
      actionLabel: 'Complete Follow-Through',
      actionType: 'follow_through_notes',
      evidence: [
        `Meeting with ${completedMeetingContact.contactName} recently finished.`,
        'Fulfilling commitments and recording referrals immediately preserves momentum.',
      ],
      targetCompanyId: completedMeetingContact.companyId,
      targetCompanyName: completedMeetingContact.companyName,
      targetContactId: completedMeetingContact.id,
      targetContactName: completedMeetingContact.contactName,
      requiresContentApproval: true,
      requiresExecutionApproval: true,
    };
  }

  // 3. 7B Cadence Trigger (Priority 3)
  for (const contact of contacts) {
    if (
      contact.contactRoleDesignation === 'Contact A' &&
      contact.outreachStatus === 'Sent' &&
      contact.day0Date
    ) {
      const elapsed = countElapsedBusinessDays(contact.day0Date, todayDateStr);
      if (elapsed >= 7) {
        return {
          id: `nba-7b-${contact.id}`,
          recommendation: `Prepare ultra-brief 7B nudge to ${contact.contactName} at ${contact.companyName}`,
          whyNow: `${elapsed} business days have elapsed since initial outreach with no reply. Steve Dalton's 7B rule permits one short check-in.`,
          actionLabel: 'Review 7B Nudge',
          actionType: 'prepare_nudge_a',
          evidence: [
            `Day 0 outreach sent: ${contact.day0Date}`,
            `Elapsed business days: ${elapsed} (threshold is 7 business days)`,
            'Cadence rule: Nudge must be polite, under 40 words, without guilt or pressure.',
          ],
          targetCompanyId: contact.companyId,
          targetCompanyName: contact.companyName,
          targetContactId: contact.id,
          targetContactName: contact.contactName,
          requiresContentApproval: true,
          requiresExecutionApproval: true,
        };
      }
    }
  }

  // 4. 3B Cadence Trigger (Priority 4)
  for (const contact of contacts) {
    if (
      contact.contactRoleDesignation === 'Contact A' &&
      contact.outreachStatus === 'Sent' &&
      contact.day0Date
    ) {
      const elapsed = countElapsedBusinessDays(contact.day0Date, todayDateStr);
      if (elapsed >= 3 && elapsed < 7) {
        // Look for Contact B at this company
        const contactB = contacts.find(
          (c) => c.companyId === contact.companyId && c.contactRoleDesignation === 'Contact B'
        );
        return {
          id: `nba-3b-${contact.id}`,
          recommendation: `Review Contact B at ${contact.companyName}`,
          whyNow: `Original contact (${contact.contactName}) has not replied after 3 business days (${elapsed} elapsed). Expand company pipeline without nudging the original contact.`,
          actionLabel: 'Review Contact B',
          actionType: 'review_contact_b',
          evidence: [
            `Contact A (${contact.contactName}) sent on ${contact.day0Date} (${elapsed} business days ago).`,
            'Dalton Rule: Do NOT nudge Contact A at 3B. Branch to Contact B at the same company with an independent clock.',
            contactB ? `Contact B ready: ${contactB.contactName}` : 'No Contact B drafted yet; candidate search recommended.',
          ],
          targetCompanyId: contact.companyId,
          targetCompanyName: contact.companyName,
          targetContactId: contactB?.id || contact.id,
          targetContactName: contactB?.contactName || 'New Contact B',
          requiresContentApproval: true,
          requiresExecutionApproval: true,
        };
      }
    }
  }

  // 5. Active Queue Replenishment (Priority 5)
  if (activeCompanies.length < 6) {
    return {
      id: 'nba-replenish-queue',
      recommendation: `Replenish active company queue (${activeCompanies.length}/6 minimum active)`,
      whyNow: 'Your active company pipeline dropped below the recommended threshold of 6 companies. Maintaining 6-10 ensures steady informational velocity.',
      actionLabel: 'Replenish Queue',
      actionType: 'replenish_queue',
      evidence: [
        `Current active companies: ${activeCompanies.length}`,
        'BR-01 & BR-02 mandate maintaining approximately 6-10 active target employers.',
      ],
      requiresContentApproval: false,
      requiresExecutionApproval: false,
    };
  }

  // 6. Outreach Draft Awaiting Approval (Priority 6)
  const pendingApprovalContact = contacts.find(
    (c) => c.outreachStatus === 'Awaiting Content Approval' || c.outreachStatus === 'Awaiting Execution Approval'
  );
  if (pendingApprovalContact) {
    return {
      id: `nba-approve-${pendingApprovalContact.id}`,
      recommendation: `Authorize Six-Point Email outreach to ${pendingApprovalContact.contactName}`,
      whyNow: 'A validated Dalton outreach draft is ready. Explicit human approval is required before sending.',
      actionLabel: 'Review & Authorize',
      actionType: 'approve_outreach',
      evidence: [
        `Candidate: ${pendingApprovalContact.contactName} at ${pendingApprovalContact.companyName}`,
        'Six-Point validation checks passed; human authorization gate pending.',
      ],
      targetCompanyId: pendingApprovalContact.companyId,
      targetCompanyName: pendingApprovalContact.companyName,
      targetContactId: pendingApprovalContact.id,
      targetContactName: pendingApprovalContact.contactName,
      requiresContentApproval: true,
      requiresExecutionApproval: true,
    };
  }

  // 7. Monthly Harvest Nurture (Priority 7)
  const harvestContact = contacts.find(
    (c) =>
      (c.relationshipClassification === 'Booster' || c.relationshipClassification === 'Obligate') &&
      c.meetingStatus === 'Completed'
  );
  if (harvestContact) {
    return {
      id: `nba-harvest-${harvestContact.id}`,
      recommendation: `Send Monthly Harvest check-in to ${harvestContact.contactName} (${harvestContact.relationshipClassification})`,
      whyNow: 'Maintain warm relationships with past interviewees through periodic, value-adding updates without asking for favors.',
      actionLabel: 'Draft Harvest Update',
      actionType: 'monthly_nurture',
      evidence: [
        `Relationship: ${harvestContact.relationshipClassification} at ${harvestContact.companyName}`,
        'Dalton Harvest Cycle: Regular light-touch nurturing builds advocates over time.',
      ],
      targetCompanyId: harvestContact.companyId,
      targetCompanyName: harvestContact.companyName,
      targetContactId: harvestContact.id,
      targetContactName: harvestContact.contactName,
      requiresContentApproval: true,
      requiresExecutionApproval: true,
    };
  }

  // 8. Default: Highest LAMP Target Outreach (Priority 8)
  const topCompany = activeCompanies[0] || sortedCompanies[0];
  return {
    id: 'nba-top-lamp',
    recommendation: `Initiate outreach at highest-priority target: ${topCompany.companyName} (LAMP Rank ${topCompany.lampRank})`,
    whyNow: `${topCompany.companyName} holds your highest priority score based on Advocacy (${topCompany.advocacy}), Motivation (${topCompany.motivation}), and Postings (${topCompany.posting}).`,
    actionLabel: 'Draft Initial Outreach',
    actionType: 'approve_outreach',
    evidence: [
      `LAMP Rank ${topCompany.lampRank} (Advocacy: ${topCompany.advocacy}, Motivation: ${topCompany.motivation}, Posting: ${topCompany.posting})`,
      `Industry: ${topCompany.industry}`,
      'The Orchestrator should sustain 2-3 new contact initiations weekly.',
    ],
    targetCompanyId: topCompany.id,
    targetCompanyName: topCompany.companyName,
    requiresContentApproval: true,
    requiresExecutionApproval: true,
  };
}
