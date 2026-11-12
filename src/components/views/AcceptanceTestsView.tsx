/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { runAllAcceptanceTests, TestCaseResult } from '../../services/testRunner.ts';
import { CheckCircle2, XCircle, RotateCcw, ShieldCheck } from 'lucide-react';

export const AcceptanceTestsView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>(() => runAllAcceptanceTests());
  const [lastRunTime, setLastRunTime] = useState<string>(new Date().toLocaleTimeString());

  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  const handleReRun = () => {
    const fresh = runAllAcceptanceTests();
    setTestResults(fresh);
    setLastRunTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Quality Assurance & Acceptance Testing Matrix</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Automated Acceptance Test Runner (T01–T18)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic verification of business rules, 3B7 calendar math, approval gates, and error states.
          </p>
        </div>

        <button
          onClick={handleReRun}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Re-run Test Suite</span>
        </button>
      </div>

      {/* Summary Scorecard Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold font-mono text-lg">
            {passRate}%
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {passedCount} of {totalCount} Acceptance Tests Passing
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Verified at {lastRunTime} · Strict deterministic assertions
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Engine: Deterministic calendar & static validation
        </div>
      </div>

      {/* Test List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <th className="py-3 px-4 w-16">ID</th>
              <th className="py-3 px-4">Test Case & Methodology Focus</th>
              <th className="py-3 px-4">Expected Deterministic Behavior</th>
              <th className="py-3 px-4">Actual Result</th>
              <th className="py-3 px-4 text-right w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {testResults.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                  {t.id}
                </td>

                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.details}</div>
                </td>

                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                  {t.expected}
                </td>

                <td className="py-3 px-4 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  {t.actual}
                </td>

                <td className="py-3 px-4 text-right">
                  {t.passed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PASS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                      <XCircle className="w-3.5 h-3.5" />
                      FAIL
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
