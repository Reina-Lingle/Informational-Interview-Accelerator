/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// IIA V1 DATA MODEL & DICTIONARY (BR-09)
// Exactly two authoritative Notion databases
// ==========================================

export type CompanyStatus =
  | 'Active Queue'
  | 'Researching'
  | 'Outreach Active'
  | 'Interviewing'
  | 'Completed'
  | 'Pipeline Reserve'
  | 'Archived';

export interface CompanyIntelligence {
  verifiedFacts: string[];
  inferred: string[];
  unknown: string[];
  recentNews?: string;
  keyChallenges?: string;
  alumniPresence?: string;
  sourceUrl?: string;
  lastUpdated: string;
}

/**
 * Authoritative Database 1: TARGET COMPANIES
 * Governs the 6-10 active company queue prioritized by LAMP rank
 */
export interface TargetCompany {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  status: CompanyStatus;
  advocacy: number;  // 1-5 (1 = strong alumni/connection density, 5 = none)
  motivation: number; // 1-5 (1 = dream company, 5 = low interest)
  posting: number;    // 1-5 (1 = active public hiring in target area, 5 = no postings)
  lampRank: number;   // Calculated: Advocacy + Motivation + Posting (lower = higher priority)
  initialContact?: string; // Name of Contact A
  initialContactId?: string;
  companyIntelligence: CompanyIntelligence;
  nextAction: string;
  nextActionDate: string;
  notes?: string;
}

export type InitialContactType = 'Alumni' | 'Natural Connection' | 'Cold' | 'Referral';

export type RelationshipClassification =
  | 'Unclassified'
  | 'Booster'
  | 'Obligate'
  | 'Curmudgeon';

export type OutreachStatus =
  | 'Not Started'
  | 'Drafting'
  | 'Awaiting Content Approval'
  | 'Awaiting Execution Approval'
  | 'Sent'
  | 'Replied'
  | 'No Reply'
  | 'Declined';

export type MeetingStatus = 'None' | 'Requested' | 'Scheduled' | 'Completed' | 'Canceled';

export interface CommunicationMessage {
  id: string;
  timestamp: string;
  type: 'Initial Outreach' | '3B Recommendation' | '7B Nudge' | 'Reply Received' | 'Thank You' | 'Check-in';
  subject: string;
  body: string;
  approvedContent: boolean;
  authorizedExecution: boolean;
  executedAt?: string;
  externalStatus: 'Simulated Sent' | 'Delivered' | 'Pending Approval' | 'Received';
}

export interface Commitment {
  id: string;
  text: string;
  owner: 'User' | 'Contact';
  dueDate?: string;
  verified: boolean;
  status: 'Pending' | 'Completed';
}

export interface Referral {
  id: string;
  name: string;
  title: string;
  company: string;
  contactInfo?: string;
  pursued: boolean;
  notes?: string;
}

export interface InterviewNotes {
  rawNotesOrTranscript: string;
  verifiedTakeaways: string[];
  inferences: string[];
  commitments: Commitment[];
  referrals: Referral[];
  nextAction: string;
  recordedAt: string;
}

export interface ClassificationEvidence {
  interactionCount: number;
  responseSpeed: string;
  adviceQuality: string;
  referralProvided: boolean;
  curmudgeonFlags: string[];
  rationale: string;
  recommendedClassification: RelationshipClassification;
  confirmedByHuman: boolean;
}

/**
 * Authoritative Database 2: INFORMATIONAL INTERVIEW COMMAND CENTER
 * Contact-level records linked directly to Target Companies
 */
export interface CommandCenterContact {
  id: string;
  contactName: string;
  companyId: string;
  companyName: string;
  title: string;
  initialContactType: InitialContactType;
  relationshipClassification: RelationshipClassification;
  classificationEvidence?: ClassificationEvidence;
  contactDetails: {
    email?: string;
    linkedin?: string;
    location?: string;
    mutualConnections?: string[];
  };
  contactRoleDesignation: 'Contact A' | 'Contact B' | 'Other';
  outreachStatus: OutreachStatus;
  day0Date?: string;
  due3B?: string;  // Exactly 3 business days from Day 0
  due7B?: string;  // Exactly 7 business days from Day 0
  meetingStatus: MeetingStatus;
  meetingDate?: string;
  meetingTime?: string;
  meetingLocation?: string;
  communicationsHistory: CommunicationMessage[];
  interviewNotes?: InterviewNotes;
  referrals: string[];
  commitments: string[];
  followUpDate?: string;
  lastTouch?: string;
  nextAction: string;
}

export interface NextBestAction {
  id: string;
  recommendation: string; // The primary NEXT BEST ACTION
  whyNow: string;         // The deterministic & contextual rationale
  actionLabel: string;    // Action trigger text (e.g. "Review Contact B", "Approve Nudge")
  actionType:
    | 'review_contact_b'
    | 'prepare_nudge_a'
    | 'approve_outreach'
    | 'prepare_meeting'
    | 'follow_through_notes'
    | 'monthly_nurture'
    | 'replenish_queue';
  evidence: string[];     // Supporting factors & evidence
  targetCompanyId?: string;
  targetCompanyName?: string;
  targetContactId?: string;
  targetContactName?: string;
  requiresContentApproval: boolean;
  requiresExecutionApproval: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  authorizedBy: string;
  externalService: 'Simulated Gmail' | 'Simulated Google Calendar' | 'Simulated Notion' | 'Deterministic Engine';
  status: 'Authorized & Confirmed' | 'Pending Human Approval' | 'Rejected by User' | 'Simulated Failure';
  details: string;
}

export interface UserCareerProfile {
  name: string;
  targetRole: string;
  targetIndustry: string;
  locationPreference: string;
  alumniAffiliations: string[];
  weeklyOutreachGoal: number;
  coachingLevel: 'High Teaching (Detailed explanations)' | 'Balanced' | 'High Autonomy (Orchestrator)';
  simulatedServices: {
    notionSync: boolean;
    gmailSync: boolean;
    calendarSync: boolean;
  };
}

export interface SixPointValidationResult {
  wordCount: number;
  wordCountPass: boolean;
  adviceNotJobPass: boolean;
  connectionFirstPass: boolean;
  requestIsQuestionPass: boolean;
  dualInterestPass: boolean;
  recipientFocusPass: boolean;
  recipientPercentage: number;
  noFabricationPass: boolean;
  overallPass: boolean;
  feedbackNotes: string[];
}
