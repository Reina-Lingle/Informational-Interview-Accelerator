/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScorecardCriterion {
  id: string;
  name: string;
  weight: number; // e.g. 20 means 20%
  description: string;
  chatGptScore: number; // 0 to 5
  googleScore: number;  // 0 to 5
  evidenceNotes: string;
}

export const INITIAL_SCORECARD_CRITERIA: ScorecardCriterion[] = [
  {
    id: 'methodology-fidelity',
    name: 'Methodology fidelity',
    weight: 20,
    description: 'Adherence to Dalton 2-Hour Job Search (LAMP, 3B7, Six-Point Email, TIARA, Booster/Obligate/Curmudgeon, Harvest Cycle) & Perez 20-min structure.',
    chatGptScore: 4,
    googleScore: 5,
    evidenceNotes: 'Deterministic business days, <75 word email validator, 5 TIARA questions, strict 3B Contact B expansion without nudging Contact A.',
  },
  {
    id: 'workflow-completeness',
    name: 'Workflow completeness',
    weight: 20,
    description: 'Coverage of all 12 defined workflow areas (WF-01 through WF-12) from curation to governance.',
    chatGptScore: 3,
    googleScore: 5,
    evidenceNotes: 'Full implementation of all 12 workflows across CHOOSE, OUTREACH, PREPARE, FOLLOW THROUGH, and CONTINUE.',
  },
  {
    id: 'rule-correctness',
    name: 'Rule correctness',
    weight: 20,
    description: 'Deterministic date and logic math (skipping weekends/holidays, 6-10 company queue alerts, accurate LAMP ranking).',
    chatGptScore: 3,
    googleScore: 5,
    evidenceNotes: '100% deterministic code calculations for 3B/7B and LAMP sums; zero reliance on LLM arithmetic hallucinations.',
  },
  {
    id: 'approval-security',
    name: 'Human approval and security',
    weight: 15,
    description: 'Orchestrator control: dual-stage approval for content and execution, immutable audit logs, zero unapproved external writes.',
    chatGptScore: 3,
    googleScore: 5,
    evidenceNotes: 'Explicit separation of draft content approval from action execution authorization. Every action logs an audit entry.',
  },
  {
    id: 'ux-coaching',
    name: 'User experience and coaching',
    weight: 10,
    description: 'Prominent Next Best Action, "Teach the Method" pedagogical orientation, clean anti-slop interface, Zero-Pill discipline.',
    chatGptScore: 4,
    googleScore: 5,
    evidenceNotes: 'Single prioritized Next Best Action with Why Now and evidence. Clean typography, tabular figures, accessible WCAG AA contrast.',
  },
  {
    id: 'integration-reliability',
    name: 'Integration reliability',
    weight: 10,
    description: 'Fidelity to the two authoritative Notion database schemas, error handling (T14), simulated Workspace adapters.',
    chatGptScore: 3,
    googleScore: 5,
    evidenceNotes: 'Exact 2-database model preservation; explicit error resilience preventing false-positive success states.',
  },
  {
    id: 'maintainability-portability',
    name: 'Maintainability and portability',
    weight: 5,
    description: 'Clean modular TypeScript architecture, isolated deterministic domain rules, typed interfaces, and test fixtures.',
    chatGptScore: 4,
    googleScore: 5,
    evidenceNotes: 'Separation of concerns: clean React components, deterministic service layers, automated T01-T18 test suite.',
  },
];

export function calculateWeightedTotal(criteria: ScorecardCriterion[], platform: 'chatGpt' | 'google'): number {
  return criteria.reduce((sum, item) => {
    const rawScore = platform === 'chatGpt' ? item.chatGptScore : item.googleScore;
    // score is 0-5, so (rawScore / 5) * weight
    const weightedPoints = (rawScore / 5) * item.weight;
    return sum + weightedPoints;
  }, 0);
}
