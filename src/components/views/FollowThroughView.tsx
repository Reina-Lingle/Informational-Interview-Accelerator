/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CommandCenterContact,
  TargetCompany,
  InterviewNotes,
  RelationshipClassification,
} from '../../types/index.ts';
import {
  extractIntelligenceFromNotes,
  evaluateRelationshipClassification,
  generateMonthlyHarvestMessage,
} from '../../services/followThrough.ts';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  Plus,
  Clock,
  Sparkles,
  UserCheck,
  Mail,
} from 'lucide-react';

interface FollowThroughViewProps {
  contacts: CommandCenterContact[];
  companies: TargetCompany[];
  selectedContactId?: string;
  onSelectContactId: (id: string) => void;
  onSaveInterviewIntelligence: (
    contactId: string,
    notes: InterviewNotes,
    classification: RelationshipClassification
  ) => void;
  onRequestApproval: (
    contact: CommandCenterContact,
    subject: string,
    body: string,
    isNudge: boolean
  ) => void;
}

export const FollowThroughView: React.FC<FollowThroughViewProps> = ({
  contacts,
  companies,
  selectedContactId,
  onSelectContactId,
  onSaveInterviewIntelligence,
  onRequestApproval,
}) => {
  // Find completed interview contact or default to first contact
  const activeContact =
    contacts.find((c) => c.id === selectedContactId) ||
    contacts.find((c) => c.meetingStatus === 'Completed') ||
    contacts[0];

  const relatedCompany = companies.find((co) => co.id === activeContact?.companyId);

  // Raw notes state
  const [rawNotes, setRawNotes] = useState(
    activeContact?.interviewNotes?.rawNotesOrTranscript ||
      `Meeting notes with ${activeContact?.contactName || 'Contact'}:
- Great discussion regarding team scaling and developer productivity.
- I promised to send over my portfolio case study on multi-brand design tokens.
- Contact offered to connect me with Sarah Wu on the core engine team.
- Recommended talking to Sarah regarding compiler design and infrastructure.
- Seems like the team is prioritizing engineering throughput over vanity metrics.`
  );

  // Intelligence state
  const [extractedNotes, setExtractedNotes] = useState<InterviewNotes>(() =>
    extractIntelligenceFromNotes(rawNotes, activeContact)
  );

  // Classification evaluation (BR-05 & T12)
  const classificationResult = evaluateRelationshipClassification(activeContact, extractedNotes);
  const [chosenClassification, setChosenClassification] = useState<RelationshipClassification>(
    activeContact.relationshipClassification !== 'Unclassified'
      ? activeContact.relationshipClassification
      : classificationResult.recommended
  );

  const [thankYouSubject, setThankYouSubject] = useState(
    `Thank you / Great connecting today (${relatedCompany?.companyName || 'Team'})`
  );

  const [thankYouBody, setThankYouBody] = useState(
    `Hi ${activeContact?.contactName?.split(' ')[0] || 'there'},\n\nThank you so much for generously taking 20 minutes to share your insights on ${relatedCompany?.companyName || 'your team'} today.\n\nYour perspective on engineering empathy really resonated with me. As promised, I have attached my case study on design tokens for your reference.\n\nI will also reach out to Sarah as you suggested. Please let me know whenever I can be helpful to you in return!\n\nBest regards,\nAlex`
  );

  const handleParseNotes = () => {
    const parsed = extractIntelligenceFromNotes(rawNotes, activeContact);
    setExtractedNotes(parsed);
    const evalRes = evaluateRelationshipClassification(activeContact, parsed);
    if (evalRes.canClassify) {
      setChosenClassification(evalRes.recommended);
    }
  };

  const handleSaveAll = () => {
    onSaveInterviewIntelligence(activeContact.id, extractedNotes, chosenClassification);
  };

  if (!activeContact) {
    return <div className="p-6 text-sm text-slate-500">No contact record found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Workflow WF-06 & WF-07 · Dalton Method</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Post-Meeting Intelligence & Follow-Through
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Extract takeaways, commitments, referrals, and evidence-grounded relationship classifications (Booster/Obligate/Curmudgeon).
          </p>
        </div>

        {/* Contact Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Contact:</label>
          <select
            value={activeContact.id}
            onChange={(e) => {
              onSelectContactId(e.target.value);
              const found = contacts.find((c) => c.id === e.target.value);
              if (found?.interviewNotes) {
                setRawNotes(found.interviewNotes.rawNotesOrTranscript);
                setExtractedNotes(found.interviewNotes);
              }
            }}
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

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Raw Notes & Extracted Commitments (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Raw Notes Input Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Meeting Notes or Transcript
                </h3>
                <p className="text-xs text-slate-500">
                  Paste bullets, quotes, or commitments from your conversation
                </p>
              </div>

              <button
                type="button"
                onClick={handleParseNotes}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Extract Intelligence</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Paste raw notes or call transcript here..."
              className="w-full text-xs font-mono p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Extracted Takeaways: Verified vs Inferred (BR-07, T11) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Extracted Intelligence & Commitments (T11)
              </h3>
              <p className="text-xs text-slate-500">
                Traceability distinction: Verified facts vs. inferred interpretation
              </p>
            </div>

            {/* Commitments Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Commitments & Action Items ({extractedNotes.commitments.length})
              </h4>
              {extractedNotes.commitments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No commitments detected in notes.</p>
              ) : (
                <div className="space-y-2">
                  {extractedNotes.commitments.map((com, idx) => (
                    <div
                      key={com.id || idx}
                      className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              com.owner === 'User'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {com.owner === 'User' ? 'My Commitment' : 'Contact Commitment'}:
                          </span>
                          <span className="text-slate-800 dark:text-slate-200">{com.text}</span>
                        </div>
                        {com.dueDate && (
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            Due: {com.dueDate} (Within 24 hours)
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referrals Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Candidate Referrals & Introductions ({extractedNotes.referrals.length})
              </h4>
              {extractedNotes.referrals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No new referrals identified.</p>
              ) : (
                <div className="space-y-2">
                  {extractedNotes.referrals.map((ref, idx) => (
                    <div
                      key={ref.id || idx}
                      className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {ref.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{ref.notes}</div>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Ready for review</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Classification Review & Thank-You Drafter (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Dalton Relationship Classification Guard (BR-05 & T12) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Relationship Classification Engine (BR-05)</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                Booster vs. Obligate vs. Curmudgeon
              </h3>
            </div>

            {/* Premature Classification Guard Alert (T12) */}
            {!classificationResult.canClassify ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 rounded">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Insufficient Interaction Evidence Guard (T12)</span>
                </div>
                <p>{classificationResult.evidence.rationale}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Recommended: {classificationResult.recommended}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {classificationResult.evidence.rationale}
                  </p>
                </div>

                {/* Classification Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Orchestrator Classification Confirmation:
                  </label>
                  <select
                    value={chosenClassification}
                    onChange={(e) => setChosenClassification(e.target.value as RelationshipClassification)}
                    className="w-full text-xs font-semibold p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Unclassified">Unclassified</option>
                    <option value="Booster">Booster (Active advocate & volunteers referrals)</option>
                    <option value="Obligate">Obligate (Polite, answers questions, no proactive referrals)</option>
                    <option value="Curmudgeon">Curmudgeon (Resistant, dismissive, or negative)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 24-Hour Thank You Note Composer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                24-Hour Thank You & Commitment Fulfill Note
              </h3>
              <p className="text-xs text-slate-500">
                Send within 24 hours of conversation. Emphasize reciprocity.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={thankYouSubject}
                  onChange={(e) => setThankYouSubject(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Body
                </label>
                <textarea
                  rows={6}
                  value={thankYouBody}
                  onChange={(e) => setThankYouBody(e.target.value)}
                  className="w-full font-mono p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>
            </div>

            {/* Bottom Execution & Save Strip */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded transition-colors"
              >
                Save Intelligence to Command Center
              </button>

              <button
                type="button"
                onClick={() =>
                  onRequestApproval(activeContact, thankYouSubject, thankYouBody, false)
                }
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Review & Authorize Thank You</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
