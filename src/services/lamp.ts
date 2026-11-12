/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TargetCompany } from '../types/index.ts';

/**
 * LAMP Prioritization Engine (BR-01 & WF-01)
 * Steve Dalton's 2-Hour Job Search methodology:
 * 
 * L = List (The universe of target employers)
 * A = Advocacy (1 = strong internal alumni or personal connection, 5 = no advocate found)
 * M = Motivation (1 = top choice/dream employer, 5 = lukewarm interest)
 * P = Posting (1 = current job opening in target department, 5 = no public postings)
 * 
 * LAMP Rank = Advocacy + Motivation + Posting
 * Lower numerical rank receives higher priority!
 * Target: Maintain 6 to 10 companies in the active queue.
 */

export function calculateLampScore(advocacy: number, motivation: number, posting: number): number {
  const clamp = (val: number) => Math.max(1, Math.min(5, Math.round(val)));
  return clamp(advocacy) + clamp(motivation) + clamp(posting);
}

/**
 * Sorts companies by priority:
 * 1. LAMP Rank ascending (lowest sum = top priority)
 * 2. Motivation ascending (as primary tie-breaker)
 * 3. Advocacy ascending (as secondary tie-breaker)
 */
export function prioritizeCompanies(companies: TargetCompany[]): TargetCompany[] {
  return [...companies].sort((a, b) => {
    if (a.lampRank !== b.lampRank) {
      return a.lampRank - b.lampRank;
    }
    if (a.motivation !== b.motivation) {
      return a.motivation - b.motivation;
    }
    return a.advocacy - b.advocacy;
  });
}

export interface QueueHealthStatus {
  activeCount: number;
  isDeficient: boolean;     // < 6 companies
  isOptimal: boolean;       // 6 to 10 companies
  isOverflowing: boolean;   // > 10 companies
  recommendation: string;
}

export function evaluateQueueHealth(companies: TargetCompany[]): QueueHealthStatus {
  const activeCompanies = companies.filter(
    (c) => c.status === 'Active Queue' || c.status === 'Outreach Active' || c.status === 'Researching'
  );
  const activeCount = activeCompanies.length;

  if (activeCount < 6) {
    return {
      activeCount,
      isDeficient: true,
      isOptimal: false,
      isOverflowing: false,
      recommendation: `Active company queue is low (${activeCount}/6 min). Replenish by promoting ${6 - activeCount} company from your Reserve list.`,
    };
  }

  if (activeCount > 10) {
    return {
      activeCount,
      isDeficient: false,
      isOptimal: false,
      isOverflowing: true,
      recommendation: `Active company queue is high (${activeCount}/10 max). Keep focus disciplined: move lowest priority companies to Reserve.`,
    };
  }

  return {
    activeCount,
    isDeficient: false,
    isOptimal: true,
    isOverflowing: false,
    recommendation: `Active company queue is healthy (${activeCount} active, within 6-10 target range). Focus on outreach execution.`,
  };
}
