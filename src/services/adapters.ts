/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TargetCompany, CommandCenterContact, AuditLogEntry } from '../types/index.ts';

export interface NotionSchemaField {
  name: string;
  type: string;
  allowedValues?: string[];
  ownership: 'User' | 'System' | 'Computed';
  description: string;
}

export const NOTION_TARGET_COMPANIES_SCHEMA: NotionSchemaField[] = [
  { name: 'Company Name', type: 'Title', ownership: 'User', description: 'Target employer name' },
  { name: 'Industry', type: 'Select', ownership: 'User', description: 'Target business sector' },
  { name: 'Website', type: 'URL', ownership: 'User', description: 'Official corporate website' },
  { name: 'Status', type: 'Select', allowedValues: ['Active Queue', 'Researching', 'Outreach Active', 'Interviewing', 'Completed', 'Pipeline Reserve', 'Archived'], ownership: 'User', description: 'Pipeline stage' },
  { name: 'Advocacy', type: 'Number (1-5)', allowedValues: ['1: High Alumni', '2: Medium', '3: Low', '4: Minimal', '5: None'], ownership: 'User', description: 'Internal advocate or alumni connection density' },
  { name: 'Motivation', type: 'Number (1-5)', allowedValues: ['1: Dream', '2: High', '3: Moderate', '4: Low', '5: Lukewarm'], ownership: 'User', description: 'Personal interest in employer' },
  { name: 'Posting', type: 'Number (1-5)', allowedValues: ['1: Active open roles', '2: Recent roles', '3: Occasional', '4: Sparse', '5: None'], ownership: 'User', description: 'Public job posting activity in target department' },
  { name: 'LAMP Rank', type: 'Formula (Advocacy + Motivation + Posting)', ownership: 'Computed', description: 'Deterministic priority score (lower = higher priority)' },
  { name: 'Initial Contact', type: 'Text', ownership: 'User', description: 'Contact A name' },
  { name: 'Company Intelligence', type: 'Rich Text', ownership: 'System', description: 'Verified facts vs. Inferred intelligence' },
  { name: 'Next Action', type: 'Text', ownership: 'Computed', description: 'Current highest-leverage next action' },
  { name: 'Next Action Date', type: 'Date', ownership: 'Computed', description: 'Deterministic due date' },
];

export const NOTION_COMMAND_CENTER_SCHEMA: NotionSchemaField[] = [
  { name: 'Contact Name', type: 'Title', ownership: 'User', description: 'Professional contact name' },
  { name: 'Related Company', type: 'Relation (Target Companies)', ownership: 'User', description: 'Link to authoritative Target Company' },
  { name: 'Initial Contact Type', type: 'Select', allowedValues: ['Alumni', 'Natural Connection', 'Cold', 'Referral'], ownership: 'User', description: 'Initial relationship provenance' },
  { name: 'Relationship Classification', type: 'Select', allowedValues: ['Unclassified', 'Booster', 'Obligate', 'Curmudgeon'], ownership: 'User', description: 'Dalton behavioral classification (requires evidence)' },
  { name: 'Contact Details', type: 'Rich Text', ownership: 'User', description: 'Email, LinkedIn, Location, Mutuals' },
  { name: 'Outreach Status', type: 'Select', allowedValues: ['Not Started', 'Drafting', 'Awaiting Content Approval', 'Awaiting Execution Approval', 'Sent', 'Replied', 'No Reply', 'Declined'], ownership: 'User', description: 'Outreach lifecycle' },
  { name: 'Day 0 Date', type: 'Date', ownership: 'System', description: 'Timestamp of authorized initial outreach' },
  { name: '3B Due', type: 'Date', ownership: 'Computed', description: 'Exactly 3 business days from Day 0' },
  { name: '7B Due', type: 'Date', ownership: 'Computed', description: 'Exactly 7 business days from Day 0' },
  { name: 'Meeting Status', type: 'Select', allowedValues: ['None', 'Requested', 'Scheduled', 'Completed', 'Canceled'], ownership: 'User', description: 'Informational interview status' },
  { name: 'Meeting Date', type: 'Date / Time', ownership: 'User', description: 'Scheduled interview date & time' },
  { name: 'Communications History', type: 'Rich Text', ownership: 'System', description: 'Logged emails, nudges, and replies' },
  { name: 'Interview Notes / Transcript', type: 'Rich Text', ownership: 'User', description: 'Meeting notes, takeaways, and intelligence' },
  { name: 'Referrals', type: 'Multi-select / Text', ownership: 'User', description: 'Candidate introductions received' },
  { name: 'Commitments', type: 'Multi-select / Text', ownership: 'User', description: 'Action items agreed during conversation' },
  { name: 'Follow-Up Date', type: 'Date', ownership: 'Computed', description: 'Next scheduled touchpoint' },
  { name: 'Last Touch', type: 'Date', ownership: 'System', description: 'Most recent substantive interaction date' },
  { name: 'Next Action', type: 'Text', ownership: 'Computed', description: 'Next step recommendation' },
];

export interface SimulatedOperationResult {
  success: boolean;
  service: 'Simulated Gmail' | 'Simulated Google Calendar' | 'Simulated Notion';
  action: string;
  auditEntry: AuditLogEntry;
  error?: string;
}

/**
 * Executes a simulated external operation with strict human authorization audit logging
 */
export async function executeSimulatedOperation(
  service: 'Simulated Gmail' | 'Simulated Google Calendar' | 'Simulated Notion',
  actionDescription: string,
  authorizedBy: string,
  details: string,
  forceFailure = false
): Promise<SimulatedOperationResult> {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (forceFailure) {
    const failedEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: actionDescription,
      authorizedBy,
      externalService: service,
      status: 'Simulated Failure',
      details: `Execution failed: 503 Service Unavailable (${details})`,
    };
    return {
      success: false,
      service,
      action: actionDescription,
      auditEntry: failedEntry,
      error: 'Simulated connection failure. Changes were NOT written to external service.',
    };
  }

  const auditEntry: AuditLogEntry = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: actionDescription,
    authorizedBy,
    externalService: service,
    status: 'Authorized & Confirmed',
    details,
  };

  return {
    success: true,
    service,
    action: actionDescription,
    auditEntry,
  };
}
