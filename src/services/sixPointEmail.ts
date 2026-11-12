/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SixPointValidationResult } from '../types/index.ts';

/**
 * Dalton Six-Point Email Validation Engine (BR-03 & WF-03)
 * Steve Dalton's 2-Hour Job Search rules:
 * 
 * 1. Under 75 words (brevity minimizes cognitive load for busy professionals)
 * 2. Ask for insight or advice, NOT job leads (networking is information gathering)
 * 3. State connection first (alumni, mutual contact, or specific shared background)
 * 4. Express request as a question (clear call to action that ends with a question mark)
 * 5. Describe narrow and broad professional interest
 * 6. Devote more than half of the message to the recipient (> 50% focus)
 * 7. Traceability / Zero-fabrication guarantee (BR-07, T09)
 */

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const FORBIDDEN_JOB_KEYWORDS = [
  'job',
  'jobs',
  'hiring',
  'open position',
  'open positions',
  'open role',
  'open roles',
  'vacancy',
  'vacancies',
  'resume',
  'cv',
  'interview for',
  'apply for',
  'referral for a role',
  'job opening',
  'looking to get hired',
];

const ADVICE_INSIGHT_KEYWORDS = [
  'advice',
  'insight',
  'insights',
  'perspective',
  'perspectives',
  'learn about',
  'experience',
  'experiences',
  'guidance',
  'thoughts on',
  'hear how',
  'journey',
  'path',
];

const SECOND_PERSON_TOKENS = ['you', 'your', 'yours', 'yourself'];
const FIRST_PERSON_TOKENS = ['i', 'me', 'my', 'mine', 'myself'];

export function validateSixPointEmail(
  emailBody: string,
  verifiedConnectionInfo?: {
    hasAlumniConnection: boolean;
    hasMutualConnection: boolean;
    knownReferralName?: string;
  }
): SixPointValidationResult {
  const words = emailBody.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const feedbackNotes: string[] = [];

  // Rule 1: Under 75 words
  const wordCountPass = wordCount > 0 && wordCount < 75;
  if (!wordCountPass) {
    if (wordCount >= 75) {
      feedbackNotes.push(`Word count is ${wordCount} words (exceeds 75-word limit by ${wordCount - 74} words). Cut fluff.`);
    } else {
      feedbackNotes.push('Message is empty.');
    }
  }

  // Rule 2: Ask for insight/advice, NOT job leads
  const lowerBody = emailBody.toLowerCase();
  const forbiddenFound = FORBIDDEN_JOB_KEYWORDS.filter((kw) => lowerBody.includes(kw));
  const hasAdviceKeywords = ADVICE_INSIGHT_KEYWORDS.some((kw) => lowerBody.includes(kw));
  const adviceNotJobPass = forbiddenFound.length === 0 && hasAdviceKeywords;

  if (forbiddenFound.length > 0) {
    feedbackNotes.push(`Violates "No Job Asks" rule: mentions "${forbiddenFound.join(', ')}". Ask for advice or perspective only.`);
  } else if (!hasAdviceKeywords) {
    feedbackNotes.push('Missing explicit request for advice, perspective, or learning about their experience.');
  }

  // Rule 3: State the relationship/connection first
  // Check the first 1 or 2 sentences
  const sentences = emailBody.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const firstSentence = (sentences[0] || '').toLowerCase();
  const secondSentence = (sentences[1] || '').toLowerCase();
  const openingTwoSentences = `${firstSentence} ${secondSentence}`;

  const connectionKeywords = [
    'fellow',
    'alumn',
    'university',
    'college',
    'school',
    'introduced',
    'suggested i reach out',
    'recommended i connect',
    'noticed you also',
    'fellow member',
    'both worked',
    'mutual',
    'connection',
    'saw your profile',
    'your background in',
  ];

  const connectionFirstPass = connectionKeywords.some((kw) => openingTwoSentences.includes(kw));
  if (!connectionFirstPass) {
    feedbackNotes.push('State your connection or shared background in the opening sentence before making your ask.');
  }

  // Rule 4: Express request as a question
  const hasQuestionMark = emailBody.includes('?');
  const questionWords = ['would you', 'could you', 'do you have', 'might you', 'are you open', 'may i', 'any chance'];
  const hasQuestionFormat = questionWords.some((qw) => lowerBody.includes(qw)) && hasQuestionMark;
  const requestIsQuestionPass = hasQuestionMark && hasQuestionFormat;

  if (!requestIsQuestionPass) {
    feedbackNotes.push('The ask must be phrased cleanly as a question ending in a question mark (e.g. "Would you have 15-20 minutes for a brief call?")');
  }

  // Rule 5: Describe both narrow and broad professional interest
  // Narrow (e.g., specific role, product transition, team practice) & Broad (industry trajectory, market, space)
  const narrowTokens = ['transition', 'product', 'engineering', 'design', 'team', 'practice', 'role', 'work', 'lead', 'scale'];
  const broadTokens = ['industry', 'space', 'market', 'field', 'trends', 'landscape', 'growth', 'sector'];

  const hasNarrow = narrowTokens.some((t) => lowerBody.includes(t));
  const hasBroad = broadTokens.some((t) => lowerBody.includes(t));
  const dualInterestPass = hasNarrow && hasBroad;

  if (!dualInterestPass) {
    if (!hasNarrow) {
      feedbackNotes.push('Add narrow interest: reference their specific role, functional transition, or team focus.');
    }
    if (!hasBroad) {
      feedbackNotes.push('Add broad interest: reference the broader industry space, domain trends, or market direction.');
    }
  }

  // Rule 6: Devote more than half the message to recipient
  let secondPersonCount = 0;
  let firstPersonCount = 0;

  for (const w of words) {
    const cleaned = w.toLowerCase().replace(/[^a-z]/g, '');
    if (SECOND_PERSON_TOKENS.includes(cleaned)) secondPersonCount++;
    if (FIRST_PERSON_TOKENS.includes(cleaned)) firstPersonCount++;
  }

  const totalPronouns = secondPersonCount + firstPersonCount;
  const recipientPercentage =
    totalPronouns > 0 ? Math.round((secondPersonCount / totalPronouns) * 100) : 50;

  const recipientFocusPass = recipientPercentage >= 50;
  if (!recipientFocusPass) {
    feedbackNotes.push(
      `Recipient focus is ${recipientPercentage}% (target is > 50%). Reduce "I / me / my" sentences and emphasize "you / your work".`
    );
  }

  // Rule 7: Zero-Fabrication guarantee (T09)
  let noFabricationPass = true;
  if (verifiedConnectionInfo) {
    if (
      !verifiedConnectionInfo.hasAlumniConnection &&
      (lowerBody.includes('fellow alumnus') || lowerBody.includes('fellow alumni'))
    ) {
      noFabricationPass = false;
      feedbackNotes.push('Fabrication detected: claims alumni connection not verified in contact record.');
    }
    if (
      !verifiedConnectionInfo.hasMutualConnection &&
      !verifiedConnectionInfo.knownReferralName &&
      lowerBody.includes('suggested i connect with you')
    ) {
      noFabricationPass = false;
      feedbackNotes.push('Fabrication detected: claims a referral that does not exist in records.');
    }
  }

  const overallPass =
    wordCountPass &&
    adviceNotJobPass &&
    connectionFirstPass &&
    requestIsQuestionPass &&
    dualInterestPass &&
    recipientFocusPass &&
    noFabricationPass;

  return {
    wordCount,
    wordCountPass,
    adviceNotJobPass,
    connectionFirstPass,
    requestIsQuestionPass,
    dualInterestPass,
    recipientFocusPass,
    recipientPercentage,
    noFabricationPass,
    overallPass,
    feedbackNotes,
  };
}

/**
 * Generates a verified Dalton Six-Point template based on contact and company facts
 */
export function generateDaltonTemplate(
  contactName: string,
  companyName: string,
  connectionType: 'Alumni' | 'Mutual' | 'Shared Background',
  connectionDetail: string,
  narrowInterest: string,
  broadInterest: string
): string {
  const firstName = contactName.split(' ')[0] || contactName;

  if (connectionType === 'Alumni') {
    return `Hi ${firstName},\n\nAs a fellow ${connectionDetail} alum, I noticed your impressive transition into ${narrowInterest} at ${companyName}.\n\nGiven the rapid evolution across the broader ${broadInterest} space, would you be open to a brief 15-minute call sometime next week to share your perspectives on how your team operates?\n\nBest regards,`;
  }

  if (connectionType === 'Mutual') {
    return `Hi ${firstName},\n\nOur mutual contact ${connectionDetail} suggested I reach out given your leadership in ${narrowInterest} at ${companyName}.\n\nWith key shifts unfolding in the ${broadInterest} sector, would you have 15 minutes for a quick phone conversation to share your advice on navigating the space?\n\nBest regards,`;
  }

  return `Hi ${firstName},\n\nFollowing your work in ${narrowInterest} at ${companyName}, I was fascinated by your team's approach in the wider ${broadInterest} market.\n\nAs someone also focusing on ${connectionDetail}, would you be open to a brief 15-minute call to share your advice on your journey there?\n\nBest regards,`;
}
