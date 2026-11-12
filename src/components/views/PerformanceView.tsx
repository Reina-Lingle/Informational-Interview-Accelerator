/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HISTORICAL_FOUR_WEEK_METRICS } from '../../data/fixtures.ts';
import { TrendingUp, Users, CalendarCheck, CheckSquare, Sparkles } from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const metrics = HISTORICAL_FOUR_WEEK_METRICS;
  const totalOutreach = metrics.outreachSent.reduce((a, b) => a + b, 0);
  const totalInterviews = metrics.interviewsCompleted.reduce((a, b) => a + b, 0);
  const totalReferrals = metrics.referralsGenerated.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>Workflow WF-10 · Dalton Weekly Planning & Review</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Four-Week Performance & Relationship Velocity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Metrics focus strictly on relationship building and intelligence gathering. Job applications are tracked outside the core IIA system (BR-10).
        </p>
      </div>

      {/* Top 3 High-Altitude Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>4-Week Outreach Initiations</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-2">
            {totalOutreach}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Target: 3–4 new contacts weekly
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Interviews Completed</span>
            <CalendarCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-2">
            {totalInterviews}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            100% 20-minute discipline adhered
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Referrals Generated</span>
            <Sparkles className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-2">
            {totalReferrals}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Organic network expansion via TIARA
          </div>
        </div>
      </div>

      {/* 4-Week Rolling Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Four-Week Rolling Activity Matrix (T17)
          </h3>
          <span className="text-xs font-mono text-slate-400">Weekly Cadence Trends</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <th className="py-3 px-4">Metric</th>
              {metrics.weeks.map((w, idx) => (
                <th key={idx} className="py-3 px-4 text-center font-mono">
                  {w}
                </th>
              ))}
              <th className="py-3 px-4 text-right font-mono">4-Wk Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Outreach Sent (Six-Point Emails)
              </td>
              {metrics.outreachSent.map((val, idx) => (
                <td key={idx} className="py-3 px-4 text-center font-mono tabular-nums">
                  {val}
                </td>
              ))}
              <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                {metrics.outreachSent.reduce((a, b) => a + b, 0)}
              </td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Replies Received
              </td>
              {metrics.repliesReceived.map((val, idx) => (
                <td key={idx} className="py-3 px-4 text-center font-mono tabular-nums">
                  {val}
                </td>
              ))}
              <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                {metrics.repliesReceived.reduce((a, b) => a + b, 0)}
              </td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Interviews Scheduled
              </td>
              {metrics.interviewsScheduled.map((val, idx) => (
                <td key={idx} className="py-3 px-4 text-center font-mono tabular-nums">
                  {val}
                </td>
              ))}
              <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                {metrics.interviewsScheduled.reduce((a, b) => a + b, 0)}
              </td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Interviews Completed
              </td>
              {metrics.interviewsCompleted.map((val, idx) => (
                <td key={idx} className="py-3 px-4 text-center font-mono tabular-nums">
                  {val}
                </td>
              ))}
              <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                {metrics.interviewsCompleted.reduce((a, b) => a + b, 0)}
              </td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                Commitment Fulfillment Rate (%)
              </td>
              {metrics.commitmentsFulfillRate.map((val, idx) => (
                <td key={idx} className="py-3 px-4 text-center font-mono tabular-nums">
                  {val}%
                </td>
              ))}
              <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                96% avg
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Scope Management Philosophy Banner (BR-10) */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
          Scope Management & Anti-AI Slop Governance (BR-10):
        </span>
        <p>
          No gamification, experience points (XP), leaderboards, or job application funnel tracking. The Informational Interview Accelerator exists solely to turn job seekers into independent relationship builders through proven methodology.
        </p>
      </div>
    </div>
  );
};
