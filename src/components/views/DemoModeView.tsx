/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, ArrowRight, Play, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { MainViewTab } from '../TopBar.tsx';

interface DemoModeViewProps {
  onResetDemo: () => void;
  onNavigate: (tab: MainViewTab) => void;
}

export const DemoModeView: React.FC<DemoModeViewProps> = ({ onResetDemo, onNavigate }) => {
  const steps = [
    {
      number: '01',
      title: 'CHOOSE: Target Company LAMP Prioritization (WF-01)',
      description:
        'Walk through the LAMP matrix. Explain that LAMP = Advocacy + Motivation + Posting, where lower numerical sums receive higher priority. Notice that Stripe (Rank 3) leads the queue, while Canva (Rank 9) stays in reserve.',
      actionTab: 'companies' as MainViewTab,
      actionLabel: 'Inspect LAMP Matrix',
    },
    {
      number: '02',
      title: 'OUTREACH: Dalton Six-Point Email Validation (WF-03)',
      description:
        'Open the Six-Point Email editor. Show the real-time validator checking the 75-word ceiling, advice-not-jobs constraint, connection-first order, and recipient-focus percentage. Point out that the send button requires explicit human authorization.',
      actionTab: 'outreach' as MainViewTab,
      actionLabel: 'Open Outreach Workspace',
    },
    {
      number: '03',
      title: 'CADENCE: 3B7 Pace Keeper with Independent Clocks (WF-04)',
      description:
        'Demonstrate that Rachel Adams (CloudScale) has reached 3 business days without reply. The system strictly recommends Contact B (Marcus Vance) and explicitly forbids nudging Rachel. In contrast, Michael Tan (Datadog) has reached 7 business days, prompting a polite 7B nudge.',
      actionTab: 'outreach' as MainViewTab,
      actionLabel: 'Review 3B7 Clocks',
    },
    {
      number: '04',
      title: 'PREPARE: 20-Minute Meeting Coach & TIARA Questions (WF-05)',
      description:
        'Examine Elena Rostova’s upcoming interview at Stripe. Walk through the 4-phase 20-minute countdown timer, the 60-second background elevator pitch rehearsal, and the 5 TIARA questions (Trends, Insights, Advice, Resources, Assignments).',
      actionTab: 'prepare' as MainViewTab,
      actionLabel: 'Open Meeting Coach',
    },
    {
      number: '05',
      title: 'FOLLOW THROUGH: Commitment Extraction & Booster Classification (WF-06 & WF-07)',
      description:
        'Review the transcript from yesterday’s meeting with David Chen at Figma. Show the automatic extraction of 2 commitments and 1 referral (Sarah Wu). Highlight the classification guard that refuses premature classification without evidence.',
      actionTab: 'follow_through' as MainViewTab,
      actionLabel: 'Inspect Follow-Through',
    },
    {
      number: '06',
      title: 'CONTINUE: Deterministic Next Best Action Directive (BR-08)',
      description:
        'Return to the Dashboard. Point out that the system presents exactly ONE primary recommendation at a time, complete with "Why Now" rationale and evidence traceability.',
      actionTab: 'dashboard' as MainViewTab,
      actionLabel: 'View Dashboard Directive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Workflow WF-11 · Evaluator & Presenter Guide</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Demonstration Mode & Scenario Guide
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step walkthrough script for evaluating the Informational Interview Accelerator V1 baseline.
          </p>
        </div>

        <button
          onClick={onResetDemo}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Fixtures (T18)</span>
        </button>
      </div>

      {/* Scenario Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Preloaded Evaluation Scenario: Alex Mercer (Staff PM Track)</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The synthetic dataset simulates a mid-flight relationship building pipeline with 10 target companies (diverse LAMP scores), 7 contacts across various 3B7 stages, 1 scheduled meeting, 1 recently completed meeting with unfulfilled commitments, and 1 warm Booster qualifying for the Monthly Harvest Cycle.
        </p>
      </div>

      {/* Walkthrough Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {step.number}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                {step.description}
              </p>
            </div>

            <button
              onClick={() => onNavigate(step.actionTab)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap self-start md:self-center"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
