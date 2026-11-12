/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cadence Timing Engine (BR-02 & WF-04)
 * Strictly deterministic calendar math for Dalton's 3B7 rule.
 * 
 * Holiday-Handling Policy:
 * 1. Saturdays and Sundays are excluded from business-day calculations.
 * 2. Official fixed and floating US Federal Holidays are excluded:
 *    - New Year's Day (Jan 1)
 *    - Martin Luther King Jr. Day (3rd Monday of Jan)
 *    - Washington's Birthday / Presidents' Day (3rd Monday of Feb)
 *    - Memorial Day (Last Monday of May)
 *    - Juneteenth National Independence Day (June 19)
 *    - Independence Day (July 4)
 *    - Labor Day (1st Monday of Sept)
 *    - Columbus / Indigenous Peoples' Day (2nd Monday of Oct)
 *    - Veterans Day (Nov 11)
 *    - Thanksgiving Day (4th Thursday of Nov)
 *    - Christmas Day (Dec 25)
 * 3. 7B Business Day Clarification:
 *    Per approved IIA V1 specification, 7B represents exactly seven (7) BUSINESS days,
 *    not seven calendar days.
 */

// Format YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // Noon to prevent timezone boundary drift
}

/**
 * Checks if a given date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Checks if a given date is an official US Federal Holiday
 */
export function isUSFederalHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Fixed holidays
  if (month === 0 && day === 1) return true; // New Year's Day
  if (month === 5 && day === 19) return true; // Juneteenth
  if (month === 6 && day === 4) return true; // July 4th
  if (month === 10 && day === 11) return true; // Veterans Day
  if (month === 11 && day === 25) return true; // Christmas

  // Floating holidays
  // MLK Day: 3rd Monday in January
  if (month === 0 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
  // Presidents' Day: 3rd Monday in February
  if (month === 1 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
  // Memorial Day: Last Monday in May
  if (month === 4 && dayOfWeek === 1 && day >= 25) return true;
  // Labor Day: 1st Monday in September
  if (month === 8 && dayOfWeek === 1 && day <= 7) return true;
  // Columbus Day: 2nd Monday in October
  if (month === 9 && dayOfWeek === 1 && day >= 8 && day <= 14) return true;
  // Thanksgiving: 4th Thursday in November
  if (month === 10 && dayOfWeek === 4 && day >= 22 && day <= 28) return true;

  return false;
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isUSFederalHoliday(date);
}

/**
 * Deterministically adds N business days to a given start date.
 * If the start date falls on a weekend or holiday, counting begins on the next business day.
 */
export function addBusinessDays(startDateStr: string, businessDaysToAdd: number): string {
  const current = parseDate(startDateStr);
  let daysAdded = 0;

  while (daysAdded < businessDaysToAdd) {
    current.setDate(current.getDate() + 1);
    if (isBusinessDay(current)) {
      daysAdded++;
    }
  }

  return formatDate(current);
}

/**
 * Deterministically calculates the number of elapsed business days between two dates.
 * Excludes the start day, includes the end day.
 */
export function countElapsedBusinessDays(startDateStr: string, endDateStr: string): number {
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  if (start >= end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current < end) {
    current.setDate(current.getDate() + 1);
    if (isBusinessDay(current)) {
      count++;
    }
  }

  return count;
}

/**
 * Calculates independent Day 0, 3B, and 7B dates for a contact
 */
export function calculateContactCadenceClocks(day0DateStr: string) {
  const due3B = addBusinessDays(day0DateStr, 3);
  const due7B = addBusinessDays(day0DateStr, 7);
  return {
    day0Date: day0DateStr,
    due3B,
    due7B,
  };
}

export type CadenceStage =
  | 'Pre-Outreach'
  | 'Pending Reply (Before 3B)'
  | 'At 3B: Recommend Contact B'
  | 'Between 3B and 7B'
  | 'At 7B: Prepare Nudge to Contact A'
  | 'Past 7B (Unanswered)'
  | 'Contact Replied (Cadence Closed)';

/**
 * Evaluates current cadence status for a contact
 */
export function evaluateCadenceStatus(
  day0DateStr: string | undefined,
  currentDateStr: string,
  hasReplied: boolean
): {
  stage: CadenceStage;
  elapsedBusinessDays: number;
  recommendationNote: string;
} {
  if (!day0DateStr) {
    return {
      stage: 'Pre-Outreach',
      elapsedBusinessDays: 0,
      recommendationNote: 'Outreach not yet initiated.',
    };
  }

  if (hasReplied) {
    return {
      stage: 'Contact Replied (Cadence Closed)',
      elapsedBusinessDays: 0,
      recommendationNote: 'Contact replied. Unanswered follow-up timers suppressed.',
    };
  }

  const elapsed = countElapsedBusinessDays(day0DateStr, currentDateStr);

  if (elapsed < 3) {
    return {
      stage: 'Pending Reply (Before 3B)',
      elapsedBusinessDays: elapsed,
      recommendationNote: `${3 - elapsed} business day(s) until 3B milestone. Do not contact yet.`,
    };
  }

  if (elapsed >= 3 && elapsed < 7) {
    return {
      stage: 'At 3B: Recommend Contact B',
      elapsedBusinessDays: elapsed,
      recommendationNote: '3 business days elapsed with no response. Recommend outreach to Contact B. Do NOT nudge Contact A.',
    };
  }

  return {
    stage: 'At 7B: Prepare Nudge to Contact A',
    elapsedBusinessDays: elapsed,
    recommendationNote: '7 business days elapsed with no response. Prepare a polite, ultra-brief nudge to Contact A.',
  };
}
