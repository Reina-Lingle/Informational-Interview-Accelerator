/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CommandCenterContact, TargetCompany } from '../../types/index.ts';
import { generateTiaraQuestions, getStructuredAgenda, TiaraQuestion } from '../../services/meetingCoach.ts';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface MeetingCoachViewProps {
  contacts: CommandCenterContact[];
  companies: TargetCompany[];
  selectedContactId?: string;
  onSelectContactId: (id: string) => void;
  onAdvanceToFollowThrough: (contact: CommandCenterContact) => void;
}

export const MeetingCoachView: React.FC<MeetingCoachViewProps> = ({
  contacts,
  companies,
  selectedContactId,
  onSelectContactId,
  onAdvanceToFollowThrough,
}) => {
  // Find scheduled contact or default to first contact with scheduled status
  const scheduledContact =
    contacts.find((c) => c.id === selectedContactId) ||
    contacts.find((c) => c.meetingStatus === 'Scheduled') ||
    contacts[0];

  const relatedCompany = companies.find((co) => co.id === scheduledContact?.companyId);

  // 20-minute meeting countdown timer
  const [timerSeconds, setTimerSeconds] = useState(20 * 60); // 1200 seconds
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(20 * 60);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  // 60-Second Rehearsal State
  const [rehearsalText, setRehearsalText] = useState(
    'Thank you so much for taking 20 minutes today. I want to be strictly respectful of your time, so we will wrap promptly at the 20-minute mark. To give quick context: I have been leading product initiatives in tech, and I am currently exploring how teams like yours approach scaling. I am here purely to learn your perspective.'
  );

  const wordsInRehearsal = rehearsalText.trim().split(/\s+/).filter(Boolean).length;
  // Average speaking speed: 130-150 words per minute -> ~60 seconds = ~140 words
  const estimatedSeconds = Math.round((wordsInRehearsal / 140) * 60);

  if (!scheduledContact || !relatedCompany) {
    return <div className="p-6 text-sm text-slate-500">No scheduled meeting record found.</div>;
  }

  const tiaraQuestions = generateTiaraQuestions(
    relatedCompany,
    scheduledContact,
    'Product Management'
  );

  const agendaPhases = getStructuredAgenda();

  // Progress percentage (20 min countdown)
  const elapsedSeconds = 20 * 60 - timerSeconds;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / (20 * 60)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Workflow WF-05 · Nathan Perez & Marcia Ballinger Structure</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            20-Minute Meeting Preparation Coach
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured 20-minute conversation with 5 priority TIARA questions, company intelligence, and referral close.
          </p>
        </div>

        {/* Contact Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Interviewee:</label>
          <select
            value={scheduledContact.id}
            onChange={(e) => onSelectContactId(e.target.value)}
            className="text-xs font-semibold p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contactName} ({c.companyName} · {c.meetingStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 20-Minute Master Agenda Bar & Live Stopwatch */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Live 20-Minute Meeting Controller
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">
                Interview with {scheduledContact.contactName} ({relatedCompany.companyName})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly enforcing the 20-minute boundary establishes professional discipline and respect.
            </p>
          </div>

          {/* Stopwatch Display and Controls */}
          <div className="flex items-center gap-3">
            <div className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              {formatTimer(timerSeconds)}
            </div>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`p-2 rounded-md text-white transition-colors ${
                timerRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800'
              }`}
              title={timerRunning ? 'Pause' : 'Start 20-Min Clock'}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reset Clock"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              progressPercent > 90 ? 'bg-rose-500' : progressPercent > 75 ? 'bg-amber-500' : 'bg-slate-900 dark:bg-slate-100'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 4 Agenda Phase Markers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {agendaPhases.map((phase, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
            >
              <div className="font-mono tabular-nums text-[11px] text-slate-400 font-semibold">
                {phase.minuteRange}
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {phase.title.replace(/^Phase \d+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Column (Brief & 60s Rehearsal) - Right Column (TIARA Questions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Company & Contact Intelligence Brief (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Company Brief Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Company & Contact Intelligence Brief
              </h3>
              <p className="text-xs text-slate-500">
                Grounding facts for {relatedCompany.companyName} (LAMP Rank {relatedCompany.lampRank})
              </p>
            </div>

            {/* Verified Facts */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Facts (BR-07)</span>
              </div>
              <ul className="text-slate-700 dark:text-slate-300 space-y-1 pl-5 list-disc text-[11px]">
                {relatedCompany.companyIntelligence.verifiedFacts.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>

            {/* Inferred Hypotheses */}
            {relatedCompany.companyIntelligence.inferred.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Inferred Perspectives</span>
                </div>
                <ul className="text-slate-600 dark:text-slate-400 space-y-1 pl-5 list-disc text-[11px]">
                  {relatedCompany.companyIntelligence.inferred.map((inf, idx) => (
                    <li key={idx}>{inf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Unknowns to Validate */}
            {relatedCompany.companyIntelligence.unknown.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Key Unknowns to Inquire</span>
                </div>
                <ul className="text-slate-500 dark:text-slate-400 space-y-1 pl-5 list-disc text-[11px]">
                  {relatedCompany.companyIntelligence.unknown.map((unk, idx) => (
                    <li key={idx}>{unk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 60-Second Rehearsal Simulator (Introvert-friendly structure) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Phase 1: 60-Second Elevator Setup Rehearsal
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                ~{estimatedSeconds}s speaking time
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Practice your opening present-past-future setup. Keep it strictly under 60 seconds so the contact does 80% of the talking.
            </p>

            <textarea
              rows={4}
              value={rehearsalText}
              onChange={(e) => setRehearsalText(e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-400"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Word count: {wordsInRehearsal} words (Target: 120–150 words)</span>
              <span className={estimatedSeconds > 65 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>
                {estimatedSeconds <= 60 ? 'Optimal duration (≤ 60s)' : 'Slightly long (> 60s)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Five Priority TIARA Questions & Closing Script (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Five Priority TIARA Questions (Min 3:00 – 15:00)
                </h3>
                <p className="text-xs text-slate-500">
                  Dalton's TIARA Framework: Trends, Insights, Advice, Resources, Assignments
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold">5 Questions</span>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {tiaraQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] flex items-center justify-center font-bold">
                        {q.category[0]}
                      </span>
                      <span>{q.label} ({q.category})</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed pl-6.5">
                    "{q.question}"
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pl-6.5">
                    Coaching rationale: {q.rationale}
                  </p>
                </div>
              ))}
            </div>

            {/* Closing Script: Phase 3 & 4 (Referrals & Reciprocity) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Phase 3 & 4: Professional Introductions & Reciprocity Close (Min 15:00 – 20:00)
              </h4>

              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  The Referral Bridge (Min 15:00):
                </span>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "Based on what we have discussed today and the areas you suggested exploring, is there anyone else either inside or outside of the company you think it would be valuable for me to speak with?"
                </p>
              </div>

              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Reciprocity & Hard Stop (Min 18:00):
                </span>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "We are right at the 20-minute mark and I promised to protect your schedule. Before we wrap, how can I be helpful to you? Whether connecting with someone in my network or sharing any research, I would love to return the favor."
                </p>
              </div>
            </div>

            {/* Advance to Follow-Through Action */}
            <div className="pt-3 flex justify-end">
              <button
                onClick={() => onAdvanceToFollowThrough(scheduledContact)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs"
              >
                <span>Meeting Complete → Capture Notes & Follow-Through</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
