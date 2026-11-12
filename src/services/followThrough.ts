/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CommandCenterContact,
  InterviewNotes,
  ClassificationEvidence,
  RelationshipClassification,
  Commitment,
  Referral,
} from '../types/index.ts';

/**
 * Parses raw post-meeting notes or transcripts deterministically (with AI enhancement)
 * Extracts:
 * 1. Verified Takeaways vs Inferences
 * 2. Commitments (User obligations vs Contact promises)
 * 3. Referrals / Names mentioned
 * 4. Recommended next actions
 */
export function extractIntelligenceFromNotes(
  rawText: string,
  contact: CommandCenterContact
): InterviewNotes {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const verifiedTakeaways: string[] = [];
  const inferences: string[] = [];
  const commitments: Commitment[] = [];
  const referrals: Referral[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Check for commitments
    if (
      lower.includes('i will') ||
      lower.includes('i promised to') ||
      lower.includes("i'll send") ||
      lower.includes('agreed to follow up with') ||
      lower.includes('my commitment')
    ) {
      commitments.push({
        id: `com-${Date.now()}-${commitments.length}`,
        text: line.replace(/^[-*•\d.]+\s*/, ''),
        owner: 'User',
        verified: true,
        status: 'Pending',
      });
      continue;
    }

    if (
      lower.includes('promised to') ||
      lower.includes('will introduce') ||
      lower.includes('offered to connect') ||
      lower.includes('will send over') ||
      lower.includes('contact will')
    ) {
      commitments.push({
        id: `com-${Date.now()}-${commitments.length}`,
        text: line.replace(/^[-*•\d.]+\s*/, ''),
        owner: 'Contact',
        verified: true,
        status: 'Pending',
      });
      continue;
    }

    // Check for referrals
    if (
      lower.includes('recommended talking to') ||
      lower.includes('suggested speaking with') ||
      lower.includes('connect with') ||
      lower.includes('introduce to')
    ) {
      const clean = line.replace(/^[-*•\d.]+\s*/, '');
      referrals.push({
        id: `ref-${Date.now()}-${referrals.length}`,
        name: clean.split(/[.,(]/)[0] || clean,
        title: 'Referral Contact',
        company: contact.companyName,
        pursued: false,
        notes: clean,
      });
      continue;
    }

    // Distinguish factual statements from inferred interpretations
    if (
      lower.includes('seems like') ||
      lower.includes('probably') ||
      lower.includes('likely') ||
      lower.includes('my impression') ||
      lower.includes('felt like')
    ) {
      inferences.push(line.replace(/^[-*•\d.]+\s*/, ''));
    } else {
      verifiedTakeaways.push(line.replace(/^[-*•\d.]+\s*/, ''));
    }
  }

  // Fallbacks if notes were brief
  if (verifiedTakeaways.length === 0 && lines.length > 0) {
    verifiedTakeaways.push(lines[0]);
  }

  return {
    rawNotesOrTranscript: rawText,
    verifiedTakeaways,
    inferences,
    commitments,
    referrals,
    nextAction: commitments.some((c) => c.owner === 'User')
      ? 'Fulfill meeting commitment and send thank-you note within 24 hours.'
      : 'Send personalized thank-you email referencing key discussion takeaways.',
    recordedAt: new Date().toISOString(),
  };
}

/**
 * Recommends Dalton relationship classification strictly with evidence safeguards (BR-05 & T12)
 * Do NOT classify without adequate interaction evidence!
 */
export function evaluateRelationshipClassification(
  contact: CommandCenterContact,
  interviewNotes?: InterviewNotes
): {
  canClassify: boolean;
  recommended: RelationshipClassification;
  evidence: ClassificationEvidence;
} {
  const interactions = contact.communicationsHistory.length + (contact.meetingStatus === 'Completed' ? 1 : 0);
  const referralsOffered = (interviewNotes?.referrals?.length || 0) > 0;
  const commitmentsFromContact = (interviewNotes?.commitments?.filter((c) => c.owner === 'Contact').length || 0) > 0;

  // Safeguard: Insufficient evidence (T12)
  if (interactions < 1 && contact.meetingStatus !== 'Completed') {
    return {
      canClassify: false,
      recommended: 'Unclassified',
      evidence: {
        interactionCount: interactions,
        responseSpeed: 'Unknown',
        adviceQuality: 'No meeting yet',
        referralProvided: false,
        curmudgeonFlags: [],
        rationale: 'Insufficient interaction history. Dalton method requires substantive interaction evidence before categorizing.',
        recommendedClassification: 'Unclassified',
        confirmedByHuman: false,
      },
    };
  }

  // Booster evidence: Volunteered referrals, offered future introductions, or enthusiastic advice
  if (referralsOffered || commitmentsFromContact) {
    return {
      canClassify: true,
      recommended: 'Booster',
      evidence: {
        interactionCount: interactions,
        responseSpeed: 'High',
        adviceQuality: 'Actionable & expansive',
        referralProvided: referralsOffered,
        curmudgeonFlags: [],
        rationale: 'Contact volunteered introductions or commitments without hesitation, demonstrating active advocacy.',
        recommendedClassification: 'Booster',
        confirmedByHuman: false,
      },
    };
  }

  // Curmudgeon detection: Declined meeting rudely, discouraged outreach, or explicit negative tone
  const hasNegativeFlags = contact.outreachStatus === 'Declined';
  if (hasNegativeFlags) {
    return {
      canClassify: true,
      recommended: 'Curmudgeon',
      evidence: {
        interactionCount: interactions,
        responseSpeed: 'Curt',
        adviceQuality: 'Unhelpful or resistant',
        referralProvided: false,
        curmudgeonFlags: ['Declined conversation or displayed unsupportive attitude'],
        rationale: 'Contact indicated resistance or unsupportive sentiment. Do not pursue further follow-ups.',
        recommendedClassification: 'Curmudgeon',
        confirmedByHuman: false,
      },
    };
  }

  // Obligate: Helpful within polite bounds, answered questions, but did not proactively volunteer connections
  return {
    canClassify: true,
    recommended: 'Obligate',
    evidence: {
      interactionCount: interactions,
      responseSpeed: 'Standard',
      adviceQuality: 'Polite and informational',
      referralProvided: false,
      curmudgeonFlags: [],
      rationale: 'Contact was courteous and answered questions, but did not volunteer active sponsorship or introductions.',
      recommendedClassification: 'Obligate',
      confirmedByHuman: false,
    },
  };
}

/**
 * Generates Monthly Harvest Cycle check-in message (WF-09, T15)
 */
export function generateMonthlyHarvestMessage(
  contact: CommandCenterContact,
  discussionTopic: string,
  progressUpdate: string
): string {
  const firstName = contact.contactName.split(' ')[0] || contact.contactName;

  return `Hi ${firstName},\n\nI was reflecting on our conversation regarding ${discussionTopic || 'your team’s focus'} and wanted to share a quick update. Following your advice, ${progressUpdate || 'I reviewed the resources you mentioned and applied those insights to my current research'}.\n\nNo reply needed—just wanted to share my gratitude again for your guidance and wish you a productive month!\n\nBest regards,`;
}
