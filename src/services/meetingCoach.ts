/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TargetCompany, CommandCenterContact } from '../types/index.ts';

export interface TiaraQuestion {
  category: 'Trends' | 'Insights' | 'Advice' | 'Resources' | 'Assignments';
  label: string;
  question: string;
  rationale: string;
}

export interface MeetingAgendaSection {
  minuteRange: string;
  title: string;
  purpose: string;
  keyScriptOrPrompt: string;
  coachingTip: string;
}

export function generateTiaraQuestions(
  company: TargetCompany,
  contact: CommandCenterContact,
  userTargetRole: string
): TiaraQuestion[] {
  return [
    {
      category: 'Trends',
      label: 'Industry & Company Trends',
      question: `What major trends or technology shifts are having the greatest impact on ${company.companyName}'s roadmap right now?`,
      rationale: 'Establishes high-altitude dialogue and signals you are informed without quizzing the contact.',
    },
    {
      category: 'Insights',
      label: 'Role & Team Realities',
      question: `Looking back at your transition into ${contact.title || 'your role'} at ${company.companyName}, what surprised you most about the day-to-day culture?`,
      rationale: 'Uncovers unwritten organizational realities and reveals what skills actually move projects forward.',
    },
    {
      category: 'Advice',
      label: 'Strategic Guidance',
      question: `If you were approaching the ${userTargetRole || 'product management'} space today, what core capabilities or experiences would you focus on demonstrating?`,
      rationale: 'Invites the contact to be a mentor/coach rather than putting them on the spot as an evaluator.',
    },
    {
      category: 'Resources',
      label: 'Essential Knowledge Sources',
      question: `What publications, internal frameworks, or specialized communities do you find most valuable for keeping an edge?`,
      rationale: 'Yields immediate actionable learning material and gives a reason for subsequent follow-up.',
    },
    {
      category: 'Assignments',
      label: 'High-Impact Work',
      question: `What project or initiative has been the most meaningful contribution your team has tackled over the last couple of quarters?`,
      rationale: 'Allows the contact to speak proudly of their accomplishments while revealing organizational priorities.',
    },
  ];
}

export function getStructuredAgenda(): MeetingAgendaSection[] {
  return [
    {
      minuteRange: '0:00 – 3:00',
      title: 'Phase 1: Warm-up & 60-Second Setup',
      purpose: 'Establish rapport, thank them for their time, confirm the 20-minute hard stop, and deliver your concise present-past-future setup.',
      keyScriptOrPrompt: '"Thank you so much for taking 20 minutes today. I want to be strictly respectful of your time, so we will wrap promptly at the 20-minute mark. To give quick context: I have been leading product initiatives in tech, and I am currently exploring how teams like yours approach scaling. I am here purely to learn your perspective."',
      coachingTip: 'Keep your background story under 60 seconds. Do not recite your resume; set the stage so they do 80% of the talking.',
    },
    {
      minuteRange: '3:00 – 15:00',
      title: 'Phase 2: Five Priority TIARA Questions',
      purpose: 'Deep dive into Trends, Insights, Advice, Resources, and Assignments.',
      keyScriptOrPrompt: 'Ask the prepared TIARA questions. Listen actively, take quiet bullet notes, and ask natural clarifying follow-ups.',
      coachingTip: 'Resist the urge to pitch yourself when they mention a problem. Validate their insight and anchor on advice.',
    },
    {
      minuteRange: '15:00 – 18:00',
      title: 'Phase 3: The Referral Bridge',
      purpose: 'Expand your professional network organically without putting the contact in an uncomfortable position.',
      keyScriptOrPrompt: '"Based on what we have discussed today and the areas you suggested exploring, is there anyone else either inside or outside of the company you think it would be valuable for me to speak with?"',
      coachingTip: 'If they hesitate, offer an easy out: "No worries at all if no one comes to mind immediately—if someone occurs to you down the road, please let me know."',
    },
    {
      minuteRange: '18:00 – 20:00',
      title: 'Phase 4: Reciprocity & Respectful Close',
      purpose: 'Enforce the 20-minute boundary and offer mutual value before parting.',
      keyScriptOrPrompt: '"We are right at the 20-minute mark and I promised to protect your schedule. Before we wrap, how can I be helpful to you? Whether connecting with someone in my network or sharing any research, I would love to return the favor."',
      coachingTip: 'Stopping proactively at minute 20 earns tremendous respect. If they volunteer to keep talking, you may continue, but let it be their choice.',
    },
  ];
}
