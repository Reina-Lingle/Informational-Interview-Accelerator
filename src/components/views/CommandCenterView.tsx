/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CommandCenterContact, TargetCompany, RelationshipClassification } from '../../types/index.ts';
import { countElapsedBusinessDays } from '../../services/cadence.ts';
import { Users, Mail, Calendar, CheckSquare, MessageSquare, ExternalLink, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CommandCenterViewProps {
  contacts: CommandCenterContact[];
  companies: TargetCompany[];
  currentDate: string;
  onUpdateContact: (contact: CommandCenterContact) => void;
  onSelectContactForOutreach: (contact: CommandCenterContact) => void;
  onSelectContactForMeeting: (contact: CommandCenterContact) => void;
  onSelectContactForFollowThrough: (contact: CommandCenterContact) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  contacts,
  companies,
  currentDate,
  onUpdateContact,
  onSelectContactForOutreach,
  onSelectContactForMeeting,
  onSelectContactForFollowThrough,
}) => {
  const [selectedContact, setSelectedContact] = useState<CommandCenterContact | null>(null);
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterClassification, setFilterClassification] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((c) => {
    const matchesRole = filterRole === 'All' ? true : c.contactRoleDesignation === filterRole;
    const matchesClassification =
      filterClassification === 'All' ? true : c.relationshipClassification === filterClassification;
    const matchesSearch =
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesClassification && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Authoritative Notion Database 2 of 2 (BR-09)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Informational Interview Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Single authoritative contact and interaction database linked directly to Target Companies.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Total Contacts: {contacts.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 font-medium">Role:</span>
          {['All', 'Contact A', 'Contact B'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterRole === r
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {r}
            </button>
          ))}

          <span className="text-slate-400 font-medium ml-2">Classification:</span>
          {['All', 'Unclassified', 'Booster', 'Obligate', 'Curmudgeon'].map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClassification(cls)}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterClassification === cls
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search contacts, roles, companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Authoritative Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Contact / Title</th>
              <th className="py-3 px-3">Related Company</th>
              <th className="py-3 px-3">Role / Provenance</th>
              <th className="py-3 px-3">Classification</th>
              <th className="py-3 px-3">Outreach Status</th>
              <th className="py-3 px-3">Cadence Clocks (3B / 7B)</th>
              <th className="py-3 px-3">Meeting Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {filteredContacts.map((contact) => {
              const elapsedBD = contact.day0Date
                ? countElapsedBusinessDays(contact.day0Date, currentDate)
                : 0;

              return (
                <tr
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {contact.contactName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {contact.title}
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                    {contact.companyName}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {contact.contactRoleDesignation}
                    </span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-slate-500">{contact.initialContactType}</span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        contact.relationshipClassification === 'Booster'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : contact.relationshipClassification === 'Obligate'
                          ? 'text-blue-600 dark:text-blue-400'
                          : contact.relationshipClassification === 'Curmudgeon'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {contact.relationshipClassification}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {contact.outreachStatus}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-[11px]">
                    {contact.day0Date ? (
                      <div>
                        <div>Day 0: {contact.day0Date} ({elapsedBD}d ago)</div>
                        <div className="text-slate-400">3B: {contact.due3B} · 7B: {contact.due7B}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Clock not started</span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`font-medium ${
                        contact.meetingStatus === 'Scheduled'
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : contact.meetingStatus === 'Completed'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {contact.meetingStatus}
                    </span>
                    {contact.meetingDate && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {contact.meetingDate}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {contact.meetingStatus === 'Scheduled' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectContactForMeeting(contact);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors"
                      >
                        Meeting Coach
                      </button>
                    ) : contact.meetingStatus === 'Completed' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectContactForFollowThrough(contact);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded transition-colors"
                      >
                        Follow Through
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectContactForOutreach(contact);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded transition-colors"
                      >
                        Outreach
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Contact Record Drawer / Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-2xl w-full p-6 shadow-xl space-y-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase">
                  Command Center Record · Linked to {selectedContact.companyName}
                </div>
                <h3 className="text-xl font-bold mt-1">{selectedContact.contactName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedContact.title} · Role: {selectedContact.contactRoleDesignation} · Provenance: {selectedContact.initialContactType}
                </p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cadence Timing Clocks Section */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-md border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Independent 3B7 Timing State (BR-02 & WF-04)
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Day 0 Sent Date</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {selectedContact.day0Date || 'Not started'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">3B Cadence Due</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {selectedContact.due3B || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">7B Nudge Due</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {selectedContact.due7B || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Relationship Classification Section (BR-05) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Relationship Classification (Dalton Method)
                </h4>
                <span className="text-xs font-semibold">
                  {selectedContact.relationshipClassification}
                </span>
              </div>

              {selectedContact.classificationEvidence ? (
                <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Evidence Rationale:
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedContact.classificationEvidence.rationale}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Interactions: {selectedContact.classificationEvidence.interactionCount} · Advice Quality: {selectedContact.classificationEvidence.adviceQuality} · Referral Provided: {selectedContact.classificationEvidence.referralProvided ? 'Yes' : 'No'}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Currently Unclassified. Dalton method requires substantive interaction history before classifying to avoid bias.
                </p>
              )}
            </div>

            {/* Communications History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Communications History
              </h4>
              {selectedContact.communicationsHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No messages logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedContact.communicationsHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded border border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/30 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {msg.type}: {msg.subject}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleDateString()} · {msg.externalStatus}
                        </span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap mt-1">
                        {msg.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commitments & Referrals */}
            {(selectedContact.commitments.length > 0 || selectedContact.referrals.length > 0) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Commitments Logged:
                  </h5>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    {selectedContact.commitments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Referrals Received:
                  </h5>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    {selectedContact.referrals.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Drawer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectContactForOutreach(selectedContact);
                  setSelectedContact(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors"
              >
                Open Outreach Workspace →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
