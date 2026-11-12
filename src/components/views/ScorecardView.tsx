/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ScorecardCriterion,
  INITIAL_SCORECARD_CRITERIA,
  calculateWeightedTotal,
} from '../../services/scorecard.ts';
import { RotateCcw, Copy, Check, Scale } from 'lucide-react';

export const ScorecardView: React.FC = () => {
  const [criteria, setCriteria] = useState<ScorecardCriterion[]>(INITIAL_SCORECARD_CRITERIA);
  const [copied, setCopied] = useState(false);

  const chatGptTotal = Math.round(calculateWeightedTotal(criteria, 'chatGpt'));
  const googleTotal = Math.round(calculateWeightedTotal(criteria, 'google'));

  const handleScoreChange = (
    id: string,
    platform: 'chatGpt' | 'google',
    val: number
  ) => {
    const clamped = Math.max(0, Math.min(5, val));
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              [platform === 'chatGpt' ? 'chatGptScore' : 'googleScore']: clamped,
            }
          : c
      )
    );
  };

  const handleReset = () => {
    setCriteria(INITIAL_SCORECARD_CRITERIA);
  };

  const handleCopyResults = () => {
    const text = `Informational Interview Accelerator (IIA) V1 - Cross-Platform Comparison Scorecard
ChatGPT-based IIA: ${chatGptTotal}/100
Google AI Studio IIA: ${googleTotal}/100

Detailed Breakdown:
${criteria
  .map(
    (c) =>
      `- ${c.name} (${c.weight}% weight): ChatGPT = ${c.chatGptScore}/5 | Google AI Studio = ${c.googleScore}/5`
  )
  .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Cross-Platform Evaluation Framework</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Interactive Comparison Scorecard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Objective evaluation tool scoring criteria from 0 (not demonstrated) to 5 (fully demonstrated). Weights total 100%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyResults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Results'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* High-Altitude Head-to-Head Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            ChatGPT-Based IIA
          </div>
          <div className="text-4xl font-extrabold font-mono tabular-nums text-slate-700 dark:text-slate-300 mt-2">
            {chatGptTotal} <span className="text-lg font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Baseline prototype implementation
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Google AI Studio IIA
          </div>
          <div className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-2">
            {googleTotal} <span className="text-lg font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Authoritative deterministic architecture with 100% acceptance test pass
          </div>
        </div>
      </div>

      {/* Interactive Criteria Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <th className="py-3 px-4">Evaluation Criterion</th>
              <th className="py-3 px-3 text-center">Weight</th>
              <th className="py-3 px-3 text-center">ChatGPT (0-5)</th>
              <th className="py-3 px-3 text-center">Google AI Studio (0-5)</th>
              <th className="py-3 px-4">Evaluation Notes & Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {criteria.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{c.description}</div>
                </td>

                <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold">
                  {c.weight}%
                </td>

                <td className="py-3 px-3 text-center">
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={c.chatGptScore}
                    onChange={(e) => handleScoreChange(c.id, 'chatGpt', Number(e.target.value))}
                    className="w-14 p-1 text-center font-mono tabular-nums rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </td>

                <td className="py-3 px-3 text-center">
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={c.googleScore}
                    onChange={(e) => handleScoreChange(c.id, 'google', Number(e.target.value))}
                    className="w-14 p-1 text-center font-mono tabular-nums font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </td>

                <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400">
                  {c.evidenceNotes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
