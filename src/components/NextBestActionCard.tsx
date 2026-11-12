/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NextBestAction } from '../types/index.ts';
import { ArrowRight, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

interface NextBestActionCardProps {
  nba: NextBestAction;
  onTriggerAction: (nba: NextBestAction) => void;
  isCompact?: boolean;
}

export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({
  nba,
  onTriggerAction,
  isCompact = false,
}) => {
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 sm:p-6 transition-colors shadow-xs">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          {/* Header indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-400">
            <span className="uppercase">Next Best Action</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-normal text-slate-500 dark:text-slate-400">Deterministic Recommendation</span>
          </div>

          {/* Primary Directive */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
            {nba.recommendation}
          </h2>

          {/* Why Now */}
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Why now: </span>
            {nba.whyNow}
          </div>

          {/* Evidence / Supporting Factors */}
          {!isCompact && nba.evidence && nba.evidence.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
                Supporting Evidence & Method Grounding
              </span>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {nba.evidence.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 dark:text-slate-600 select-none">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Human Governance Safeguard */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>
              {nba.requiresExecutionApproval
                ? 'Human approval required before message dispatch or database write'
                : 'Interactive workspace review ready for Orchestrator'}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="shrink-0 flex flex-col justify-center items-start md:items-end gap-2">
          <button
            onClick={() => onTriggerAction(nba)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>{nba.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Job seeker acts as Orchestrator
          </span>
        </div>
      </div>
    </section>
  );
};
