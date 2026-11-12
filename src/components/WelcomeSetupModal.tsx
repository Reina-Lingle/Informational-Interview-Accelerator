/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserCareerProfile } from '../types/index.ts';
import { Sparkles, Check, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

interface WelcomeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserCareerProfile;
  onSaveProfile: (profile: UserCareerProfile) => void;
}

export const WelcomeSetupModal: React.FC<WelcomeSetupModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [targetIndustry, setTargetIndustry] = useState(profile.targetIndustry);
  const [weeklyGoal, setWeeklyGoal] = useState(profile.weeklyOutreachGoal);
  const [alumniSchool, setAlumniSchool] = useState(profile.alumniAffiliations[0] || 'Stanford University');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      targetRole,
      targetIndustry,
      weeklyOutreachGoal: weeklyGoal,
      alumniAffiliations: [alumniSchool, 'University of Michigan'],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-6 text-slate-900 dark:text-slate-100">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Methodology Setup · The 2-Hour Job Search</span>
          </div>
          <h2 className="text-xl font-bold mt-1">
            Welcome to Informational Interview Accelerator (IIA)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            "The job seeker is the Orchestrator. AI is the Coach/Copilot." Networking is relationship building and information gathering, not asking contacts for jobs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Target Career Role
            </label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Staff / Principal Product Manager"
              className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Primary Target Industry
            </label>
            <input
              type="text"
              required
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              placeholder="e.g. Developer Platforms & Cloud Infrastructure"
              className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Alumni / Natural Affiliation
              </label>
              <input
                type="text"
                value={alumniSchool}
                onChange={(e) => setAlumniSchool(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Weekly Outreach Goal
              </label>
              <select
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value={2}>2 new contacts / week (Gentle)</option>
                <option value={3}>3 new contacts / week (Standard)</option>
                <option value={4}>4 new contacts / week (Dalton Recommended)</option>
                <option value={5}>5 new contacts / week (Intensive)</option>
              </select>
            </div>
          </div>

          {/* 5 Core Principles Reminder */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Core Methodological Safeguards:
            </span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>LAMP Rank: Advocacy + Motivation + Posting (lower = higher priority).</li>
              <li>3B7 Cadence: Contact B at 3 business days; never nudge Contact A at 3B.</li>
              <li>Six-Point Email: Under 75 words, advice-not-jobs, connection first.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs"
            >
              <span>Begin Orchestrating</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
