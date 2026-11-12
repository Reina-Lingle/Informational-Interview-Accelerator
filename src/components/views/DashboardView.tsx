/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TargetCompany, CommandCenterContact, NextBestAction, AuditLogEntry } from '../../types/index.ts';
import { NextBestActionCard } from '../NextBestActionCard.tsx';
import { evaluateQueueHealth } from '../../services/lamp.ts';
import { countElapsedBusinessDays } from '../../services/cadence.ts';
import { MainViewTab } from '../TopBar.tsx';
import { ArrowUpRight, Building2, Users, CalendarCheck, Clock, AlertCircle } from 'lucide-react';

interface DashboardViewProps {
  companies: TargetCompany[];
  contacts: CommandCenterContact[];
  nba: NextBestAction;
  onTriggerNba: (nba: NextBestAction) => void;
  onNavigate: (tab: MainViewTab) => void;
  onSelectCompany: (company: TargetCompany) => void;
  onSelectContact: (contact: CommandCenterContact) => void;
  auditLogs: AuditLogEntry[];
  currentDate: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  companies,
  contacts,
  nba,
  onTriggerNba,
  onNavigate,
  onSelectCompany,
  onSelectContact,
  auditLogs,
  currentDate,
}) => {
  const queueHealth = evaluateQueueHealth(companies);
  const activeCompanies = companies.filter(
    (c) => c.status === 'Active Queue' || c.status === 'Outreach Active' || c.status === 'Researching'
  );

  const outreachThisWeek = contacts.filter(
    (c) => c.outreachStatus === 'Sent' || c.outreachStatus === 'Replied'
  ).length;

  const interviewsScheduled = contacts.filter(
    (c) => c.meetingStatus === 'Scheduled' || c.meetingStatus === 'Requested'
  ).length;

  const followUpsDue = contacts.filter((c) => {
    if (c.outreachStatus === 'Sent' && c.day0Date) {
      const elapsed = countElapsedBusinessDays(c.day0Date, currentDate);
      return elapsed >= 3;
    }
    return false;
  }).length;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Metric Strip */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Pipeline Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Job Seeker: <span className="font-semibold text-slate-700 dark:text-slate-300">Alex Mercer</span> · Staff PM Track · Date: <span className="font-mono tabular-nums">{currentDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('choose')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md transition-colors"
            >
              Curate Companies
            </button>
            <button
              onClick={() => onNavigate('outreach')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs"
            >
              Draft Outreach
            </button>
          </div>
        </div>

        {/* 4-Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('companies')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Active Companies</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-2">
              {queueHealth.activeCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Target: 6–10 queue</span>
              {queueHealth.isDeficient && (
                <span className="text-amber-600 font-semibold">(Low)</span>
              )}
            </div>
          </div>

          <div
            onClick={() => onNavigate('outreach')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Outreach Sent</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-2">
              {outreachThisWeek}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Goal: 4 initiations / week
            </div>
          </div>

          <div
            onClick={() => onNavigate('prepare')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Interviews Scheduled</span>
              <CalendarCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-2">
              {interviewsScheduled}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Next: Elena Rostova (Stripe)
            </div>
          </div>

          <div
            onClick={() => onNavigate('outreach')}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Follow-ups Due (3B/7B)</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-2">
              {followUpsDue}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              CloudScale (3B) · Datadog (7B)
            </div>
          </div>
        </div>
      </div>

      {/* Prominent NEXT BEST ACTION Card (BR-08) */}
      <NextBestActionCard nba={nba} onTriggerAction={onTriggerNba} />

      {/* Active Queue Health Alert Banner (if queue < 6) */}
      {queueHealth.isDeficient && (
        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Active Queue Alert (BR-01):</strong> Your active company queue has {queueHealth.activeCount} companies (minimum target is 6). Replenish from your Reserve list to maintain relationship velocity.
            </span>
          </div>
          <button
            onClick={() => onNavigate('companies')}
            className="font-semibold underline ml-4 whitespace-nowrap hover:text-amber-950 dark:hover:text-amber-100"
          >
            Replenish Queue →
          </button>
        </div>
      )}

      {/* Two-Column Grid: Active Companies (Prioritized by LAMP) & Cadence Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Top LAMP Priority Companies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Active Companies
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prioritized by LAMP Rank (Advocacy + Motivation + Posting)
              </p>
            </div>
            <button
              onClick={() => onNavigate('companies')}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <span>View All ({companies.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {activeCompanies.slice(0, 5).map((co) => (
              <div
                key={co.id}
                onClick={() => onSelectCompany(co)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {co.companyName}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {co.industry}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-sm">
                    {co.nextAction}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    LAMP Rank {co.lampRank}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    A:{co.advocacy} M:{co.motivation} P:{co.posting}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Cadence Actions (3B/7B) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Upcoming Cadence Actions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Independent 3B7 Follow-Up & Meeting Clocks (BR-02)
              </p>
            </div>
            <button
              onClick={() => onNavigate('outreach')}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <span>Outreach Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* 3B Action Item */}
            <div className="p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  3B: Review Contact B (Marcus Vance)
                </span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400 font-medium">
                  3 Business Days Elapsed
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                CloudScale: Rachel Adams has not replied. Branch to Contact B without nudging Rachel.
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('outreach')}
                  className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:underline"
                >
                  Open 3B Workspace →
                </button>
              </div>
            </div>

            {/* 7B Action Item */}
            <div className="p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  7B: Nudge Contact A (Michael Tan)
                </span>
                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  7 Business Days Elapsed
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Datadog: Michael Tan has not replied. Prepare ultra-brief, zero-guilt check-in message.
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('outreach')}
                  className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:underline"
                >
                  Review 7B Nudge →
                </button>
              </div>
            </div>

            {/* Meeting Prep Item */}
            <div className="p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Meeting: Prepare Brief for Elena Rostova
                </span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                  Friday 10:30 AM PST
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Stripe: 20-min informational conversation confirmed. Review 5 TIARA questions.
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('prepare')}
                  className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:underline"
                >
                  Open Meeting Coach →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance & Audit Trail Strip (BR-06) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent Orchestrator Governance & Execution Log
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            Immutable Audit Trail
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
          {auditLogs.slice(0, 3).map((log) => (
            <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {log.action}
                </span>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {log.details}
                </div>
              </div>

              <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                <div>{log.externalService} · {log.status}</div>
                <div>{new Date(log.timestamp).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
