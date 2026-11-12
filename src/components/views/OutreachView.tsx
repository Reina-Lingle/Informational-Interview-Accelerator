/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CommandCenterContact, TargetCompany, SixPointValidationResult } from '../../types/index.ts';
import { validateSixPointEmail, generateDaltonTemplate } from '../../services/sixPointEmail.ts';
import {
  evaluateCadenceStatus,
  addBusinessDays,
  countElapsedBusinessDays,
} from '../../services/cadence.ts';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface OutreachViewProps {
  contacts: CommandCenterContact[];
  companies: TargetCompany[];
  selectedContactId?: string;
  onSelectContactId: (id: string) => void;
  onRequestApproval: (
    contact: CommandCenterContact,
    subject: string,
    body: string,
    isNudge: boolean
  ) => void;
  currentDate: string;
}

export const OutreachView: React.FC<OutreachViewProps> = ({
  contacts,
  companies,
  selectedContactId,
  onSelectContactId,
  onRequestApproval,
  currentDate,
}) => {
  // Find current contact or default to first contact needing outreach
  const activeContact =
    contacts.find((c) => c.id === selectedContactId) ||
    contacts.find((c) => c.outreachStatus === 'Awaiting Content Approval') ||
    contacts.find((c) => c.contactRoleDesignation === 'Contact B') ||
    contacts[0];

  const relatedCompany = companies.find((co) => co.id === activeContact?.companyId);

  // Email Editor state
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [validation, setValidation] = useState<SixPointValidationResult>({
    wordCount: 0,
    wordCountPass: false,
    adviceNotJobPass: false,
    connectionFirstPass: false,
    requestIsQuestionPass: false,
    dualInterestPass: false,
    recipientFocusPass: false,
    recipientPercentage: 0,
    noFabricationPass: true,
    overallPass: false,
    feedbackNotes: [],
  });

  // Sync draft from contact history or generate standard Dalton draft
  useEffect(() => {
    if (!activeContact) return;

    const existingDraft = activeContact.communicationsHistory.find(
      (m) => m.externalStatus === 'Pending Approval' || m.type === 'Initial Outreach'
    );

    if (existingDraft) {
      setSubject(existingDraft.subject);
      setEmailBody(existingDraft.body);
    } else {
      // Generate initial Dalton draft based on contact's provenance
      const isAlumni = activeContact.initialContactType === 'Alumni';
      const isMutual = activeContact.initialContactType === 'Natural Connection';
      const template = generateDaltonTemplate(
        activeContact.contactName,
        activeContact.companyName,
        isAlumni ? 'Alumni' : isMutual ? 'Mutual' : 'Shared Background',
        isAlumni ? 'Stanford' : isMutual ? 'our mutual network' : 'developer tools',
        'product leadership',
        'cloud observability'
      );
      setSubject(
        isAlumni
          ? `Stanford alum / ${activeContact.companyName} perspectives`
          : `Connecting / ${activeContact.companyName} product insights`
      );
      setEmailBody(template);
    }
  }, [activeContact?.id]);

  // Live validator effect
  useEffect(() => {
    const verifiedInfo = {
      hasAlumniConnection: activeContact?.initialContactType === 'Alumni',
      hasMutualConnection:
        activeContact?.initialContactType === 'Natural Connection' ||
        activeContact?.initialContactType === 'Referral',
      knownReferralName: activeContact?.referrals?.[0],
    };

    const result = validateSixPointEmail(emailBody, verifiedInfo);
    setValidation(result);
  }, [emailBody, activeContact]);

  if (!activeContact) {
    return <div className="p-6 text-sm text-slate-500">No contact available for outreach.</div>;
  }

  // Calculate cadence status
  const cadenceStatus = evaluateCadenceStatus(
    activeContact.day0Date,
    currentDate,
    activeContact.outreachStatus === 'Replied'
  );

  // Check if contact has a counterpart B at the same company
  const siblingContacts = contacts.filter((c) => c.companyId === activeContact.companyId);

  const handleTemplateLoad = (type: 'Alumni' | 'Mutual' | 'Nudge') => {
    if (type === 'Nudge') {
      const firstName = activeContact.contactName.split(' ')[0];
      setSubject(`Following up / ${subject || 'perspectives'}`);
      setEmailBody(
        `Hi ${firstName},\n\nI know how busy things get leading ${activeContact.title || 'your team'} at ${activeContact.companyName}, so I wanted to briefly float this back to the top of your inbox.\n\nWould you still have 15 minutes for a quick chat next week?\n\nBest,\nAlex`
      );
      return;
    }

    const t = generateDaltonTemplate(
      activeContact.contactName,
      activeContact.companyName,
      type === 'Alumni' ? 'Alumni' : 'Mutual',
      type === 'Alumni' ? 'Stanford' : 'our mutual connection',
      'product strategy',
      relatedCompany?.industry || 'tech infrastructure'
    );
    setEmailBody(t);
  };

  const isNudge = cadenceStatus.stage === 'At 7B: Prepare Nudge to Contact A';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Workflow WF-03 & WF-04 · Dalton Method</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Outreach Workspace & 3B7 Pace Keeper
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict Dalton Six-Point Email validation (<span className="font-mono tabular-nums">75</span> word limit) with deterministic business-day clocks.
          </p>
        </div>

        {/* Contact Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Contact:</label>
          <select
            value={activeContact.id}
            onChange={(e) => onSelectContactId(e.target.value)}
            className="text-xs font-semibold p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contactName} ({c.companyName} · {c.contactRoleDesignation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cadence Status Strip (BR-02 & T03–T07) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              3B7 Cadence Engine: {activeContact.contactName} ({activeContact.contactRoleDesignation})
            </span>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Current Date: {currentDate}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Day 0 (Initial Send)</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {activeContact.day0Date || 'Not yet dispatched'}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              Independent clock strictly for this contact.
            </div>
          </div>

          <div
            className={`p-3 rounded border ${
              cadenceStatus.stage === 'At 3B: Recommend Contact B'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className="text-slate-400 block text-[11px]">3B Milestone (3 Business Days)</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {activeContact.due3B || 'Calculated upon Day 0'}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              At 3B without reply: Branch to Contact B! (No nudge to A).
            </div>
          </div>

          <div
            className={`p-3 rounded border ${
              cadenceStatus.stage === 'At 7B: Prepare Nudge to Contact A'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className="text-slate-400 block text-[11px]">7B Milestone (7 Business Days)</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {activeContact.due7B || 'Calculated upon Day 0'}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              At 7B without reply: Prepare ultra-brief nudge to A.
            </div>
          </div>
        </div>

        {/* Dynamic Cadence Advice Banner */}
        <div className="text-xs p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Cadence Recommendation:
            </span>{' '}
            <span className="text-slate-700 dark:text-slate-300">
              {cadenceStatus.recommendationNote}
            </span>
          </div>
        </div>

        {/* 3B Transition affordance: Switch to Contact B if available */}
        {siblingContacts.length > 1 && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              Contacts at {activeContact.companyName}:
            </span>
            <div className="flex items-center gap-2">
              {siblingContacts.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => onSelectContactId(sc.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    sc.id === activeContact.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sc.contactRoleDesignation}: {sc.contactName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Workspace: Editor & Dalton Validation Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Email Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Six-Point Email Composer
              </h3>
              <p className="text-xs text-slate-500">
                To: {activeContact.contactName} &lt;{activeContact.contactDetails.email || 'email@fictional.com'}&gt;
              </p>
            </div>

            {/* Quick Template Switcher */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Templates:</span>
              <button
                type="button"
                onClick={() => handleTemplateLoad('Alumni')}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
              >
                Alumni
              </button>
              <button
                type="button"
                onClick={() => handleTemplateLoad('Mutual')}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
              >
                Connection
              </button>
              <button
                type="button"
                onClick={() => handleTemplateLoad('Nudge')}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
              >
                7B Nudge
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Stanford alum / Developer platform perspectives"
              className="w-full text-xs p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Message Body Field */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400">
                Email Body
              </label>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  validation.wordCount < 75
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {validation.wordCount} / 75 words
              </span>
            </div>

            <textarea
              rows={9}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Draft your Dalton Six-Point message here..."
              className="w-full text-xs font-mono p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Action Trigger Button with Human Approval Gate */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Simulated Gmail dispatch requires dual human approval</span>
            </div>

            <button
              onClick={() => onRequestApproval(activeContact, subject, emailBody, isNudge)}
              disabled={!validation.overallPass}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors shadow-xs ${
                validation.overallPass
                  ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Review & Authorize Send</span>
            </button>
          </div>
        </div>

        {/* Right Column: Six-Point Dalton Rule Validator (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Dalton Six-Point Static Validator
            </h3>
            <span
              className={`text-xs font-semibold font-mono ${
                validation.overallPass
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {validation.overallPass ? 'ALL CHECKS PASSED' : 'REFINEMENT REQUIRED'}
            </span>
          </div>

          {/* Six Rules Checklist */}
          <div className="space-y-3 text-xs">
            {/* Rule 1 */}
            <div className="flex items-start gap-2.5">
              {validation.wordCountPass ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  1. Under 75 words
                </div>
                <div className="text-slate-500 text-[11px]">
                  Current: <span className="font-mono tabular-nums">{validation.wordCount}</span> words. Brevity respects their busy schedule.
                </div>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex items-start gap-2.5">
              {validation.adviceNotJobPass ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  2. Ask for insight / advice, NOT job leads
                </div>
                <div className="text-slate-500 text-[11px]">
                  No job-seeking words ("job", "hiring", "resume", "openings").
                </div>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex items-start gap-2.5">
              {validation.connectionFirstPass ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  3. State connection or relationship first
                </div>
                <div className="text-slate-500 text-[11px]">
                  Mention alumni, shared group, or common background in opening lines.
                </div>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex items-start gap-2.5">
              {validation.requestIsQuestionPass ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  4. Express request as a question
                </div>
                <div className="text-slate-500 text-[11px]">
                  Clear, polite invitation ending in a question mark.
                </div>
              </div>
            </div>

            {/* Rule 5 */}
            <div className="flex items-start gap-2.5">
              {validation.dualInterestPass ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  5. Dual interest (narrow & broad)
                </div>
                <div className="text-slate-500 text-[11px]">
                  Specific role/topic + broader industry/space trajectory.
                </div>
              </div>
            </div>

            {/* Rule 6 */}
            <div className="flex items-start gap-2.5">
              {validation.recipientFocusPass ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  6. Recipient focus &gt; 50%
                </div>
                <div className="text-slate-500 text-[11px]">
                  Recipient pronouns: <span className="font-mono tabular-nums font-bold">{validation.recipientPercentage}%</span> (target &gt; 50%). Focus on them, not yourself.
                </div>
              </div>
            </div>

            {/* Rule 7: Zero Fabrication Check (T09) */}
            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {validation.noFabricationPass ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  7. Anti-Fabrication & Traceability (BR-07)
                </div>
                <div className="text-slate-500 text-[11px]">
                  Connection claims must match recorded data. Never hallucinate personalization.
                </div>
              </div>
            </div>
          </div>

          {/* Feedback notes */}
          {validation.feedbackNotes.length > 0 && (
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-semibold block">Refinement Guidance:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {validation.feedbackNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
