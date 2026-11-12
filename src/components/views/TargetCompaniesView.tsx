/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TargetCompany, CompanyStatus } from '../../types/index.ts';
import { calculateLampScore, prioritizeCompanies, evaluateQueueHealth } from '../../services/lamp.ts';
import { Building2, Plus, ExternalLink, AlertCircle, CheckCircle2, HelpCircle, X, ArrowUpDown } from 'lucide-react';

interface TargetCompaniesViewProps {
  companies: TargetCompany[];
  onUpdateCompany: (company: TargetCompany) => void;
  onAddCompany: (company: TargetCompany) => void;
  onInitiateOutreach: (company: TargetCompany) => void;
}

export const TargetCompaniesView: React.FC<TargetCompaniesViewProps> = ({
  companies,
  onUpdateCompany,
  onAddCompany,
  onInitiateOutreach,
}) => {
  const [selectedCompany, setSelectedCompany] = useState<TargetCompany | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Queue Health check (BR-01, T02)
  const queueHealth = evaluateQueueHealth(companies);

  // Sorting
  const sortedCompanies = prioritizeCompanies(companies);

  const filteredCompanies = sortedCompanies.filter((co) => {
    const matchesFilter =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? co.status === 'Active Queue' || co.status === 'Outreach Active' || co.status === 'Researching' || co.status === 'Interviewing'
        : co.status === statusFilter;

    const matchesSearch =
      co.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      co.industry.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // New Company Form State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newAdvocacy, setNewAdvocacy] = useState(2);
  const [newMotivation, setNewMotivation] = useState(2);
  const [newPosting, setNewPosting] = useState(2);
  const [newVerifiedFact, setNewVerifiedFact] = useState('');

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const lampRank = calculateLampScore(newAdvocacy, newMotivation, newPosting);
    const newCo: TargetCompany = {
      id: `co-${Date.now()}`,
      companyName: newCompanyName.trim(),
      industry: newIndustry.trim() || 'Technology',
      website: newWebsite.trim(),
      status: 'Active Queue',
      advocacy: newAdvocacy,
      motivation: newMotivation,
      posting: newPosting,
      lampRank,
      companyIntelligence: {
        verifiedFacts: newVerifiedFact ? [newVerifiedFact] : ['Recently added to target company list.'],
        inferred: [],
        unknown: ['Team structure in target department.'],
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      nextAction: 'Research potential alumni or natural connections (Contact A).',
      nextActionDate: new Date().toISOString().split('T')[0],
    };

    onAddCompany(newCo);
    setIsAddingNew(false);
    setNewCompanyName('');
    setNewIndustry('');
    setNewWebsite('');
    setNewVerifiedFact('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Authoritative Notion Database 1 of 2 (BR-09)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Target Companies (LAMP Matrix)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            LAMP Rank = Advocacy (1-5) + Motivation (1-5) + Posting (1-5). Lower numerical rank is higher priority.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Target Company</span>
        </button>
      </div>

      {/* Queue Health Status Banner (BR-01, T02) */}
      <div
        className={`p-4 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          queueHealth.isDeficient
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
            : queueHealth.isOverflowing
            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`}
      >
        <div className="flex items-start sm:items-center gap-2">
          {queueHealth.isDeficient ? (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          )}
          <div>
            <span className="font-semibold">Active Queue Health: </span>
            <span className="font-mono tabular-nums font-bold">{queueHealth.activeCount}</span> / 6–10 target range. {queueHealth.recommendation}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
          Total in Database: {companies.length}
        </div>
      </div>

      {/* Filter & Search Bar (Segmented Controls) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          {['All', 'Active', 'Interviewing', 'Outreach Active', 'Pipeline Reserve'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by company or industry..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* High-Density Authoritative Database Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Priority / Company</th>
              <th className="py-3 px-3">Industry</th>
              <th className="py-3 px-3 text-center">Advocacy (A)</th>
              <th className="py-3 px-3 text-center">Motivation (M)</th>
              <th className="py-3 px-3 text-center">Posting (P)</th>
              <th className="py-3 px-3 text-center">LAMP Rank</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Initial Contact</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {filteredCompanies.map((co) => (
              <tr
                key={co.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => setSelectedCompany(co)}
              >
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{co.companyName}</span>
                    {co.website && (
                      <a
                        href={co.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5 truncate max-w-xs">
                    {co.nextAction}
                  </div>
                </td>

                <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                  {co.industry}
                </td>

                <td className="py-3 px-3 text-center font-mono tabular-nums">
                  {co.advocacy}
                </td>

                <td className="py-3 px-3 text-center font-mono tabular-nums">
                  {co.motivation}
                </td>

                <td className="py-3 px-3 text-center font-mono tabular-nums">
                  {co.posting}
                </td>

                <td className="py-3 px-3 text-center font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {co.lampRank}
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {co.status}
                  </span>
                </td>

                <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {co.initialContact || (
                    <span className="text-slate-400 italic">None selected</span>
                  )}
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateOutreach(co);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    Outreach
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Company Intelligence Drawer / Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-2xl w-full p-6 shadow-xl space-y-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase">
                  Target Company Record
                </div>
                <h3 className="text-xl font-bold mt-1">{selectedCompany.companyName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCompany.industry} · Calculated LAMP Rank: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedCompany.lampRank}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editable Scoring Form */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-md border border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                  Advocacy (1-5)
                </label>
                <select
                  value={selectedCompany.advocacy}
                  onChange={(e) => {
                    const adv = Number(e.target.value);
                    const updated = {
                      ...selectedCompany,
                      advocacy: adv,
                      lampRank: calculateLampScore(adv, selectedCompany.motivation, selectedCompany.posting),
                    };
                    setSelectedCompany(updated);
                    onUpdateCompany(updated);
                  }}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value={1}>1: High Alumni / Advocates</option>
                  <option value={2}>2: Moderate Connections</option>
                  <option value={3}>3: 2nd-degree Connections</option>
                  <option value={4}>4: Weak / Sparse</option>
                  <option value={5}>5: Zero Advocates Found</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                  Motivation (1-5)
                </label>
                <select
                  value={selectedCompany.motivation}
                  onChange={(e) => {
                    const mot = Number(e.target.value);
                    const updated = {
                      ...selectedCompany,
                      motivation: mot,
                      lampRank: calculateLampScore(selectedCompany.advocacy, mot, selectedCompany.posting),
                    };
                    setSelectedCompany(updated);
                    onUpdateCompany(updated);
                  }}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value={1}>1: Dream Employer</option>
                  <option value={2}>2: High Interest</option>
                  <option value={3}>3: Moderate Interest</option>
                  <option value={4}>4: Secondary Option</option>
                  <option value={5}>5: Low / Lukewarm</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                  Posting (1-5)
                </label>
                <select
                  value={selectedCompany.posting}
                  onChange={(e) => {
                    const post = Number(e.target.value);
                    const updated = {
                      ...selectedCompany,
                      posting: post,
                      lampRank: calculateLampScore(selectedCompany.advocacy, selectedCompany.motivation, post),
                    };
                    setSelectedCompany(updated);
                    onUpdateCompany(updated);
                  }}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value={1}>1: Active Open Roles in Area</option>
                  <option value={2}>2: Recent Postings (30d)</option>
                  <option value={3}>3: General Hiring Only</option>
                  <option value={4}>4: Infrequent Postings</option>
                  <option value={5}>5: Zero Public Postings</option>
                </select>
              </div>
            </div>

            {/* Traceability: Verified Facts vs Inferences vs Unknowns (BR-07) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Company Intelligence (BR-07 Traceability)
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Updated: {selectedCompany.companyIntelligence.lastUpdated || 'Recent'}
                </span>
              </div>

              {/* Verified Facts */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Factual Foundation</span>
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-5 list-disc">
                  {selectedCompany.companyIntelligence.verifiedFacts.map((fact, i) => (
                    <li key={i}>{fact}</li>
                  ))}
                </ul>
              </div>

              {/* Inferred Intelligence */}
              {selectedCompany.companyIntelligence.inferred.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Inferred Perspectives (Working Hypotheses)</span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-5 list-disc">
                    {selectedCompany.companyIntelligence.inferred.map((inf, i) => (
                      <li key={i}>{inf}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unknowns */}
              {selectedCompany.companyIntelligence.unknown.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Unknowns (To Inquire During Informational Interview)</span>
                  </div>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pl-5 list-disc">
                    {selectedCompany.companyIntelligence.unknown.map((unk, i) => (
                      <li key={i}>{unk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Status Switcher & Drawer Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={selectedCompany.status}
                  onChange={(e) => {
                    const updated = {
                      ...selectedCompany,
                      status: e.target.value as CompanyStatus,
                    };
                    setSelectedCompany(updated);
                    onUpdateCompany(updated);
                  }}
                  className="text-xs p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="Active Queue">Active Queue</option>
                  <option value="Researching">Researching</option>
                  <option value="Outreach Active">Outreach Active</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Pipeline Reserve">Pipeline Reserve</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onInitiateOutreach(selectedCompany);
                    setSelectedCompany(null);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-xs"
                >
                  Prepare Outreach →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Company Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateCompany}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold">Add Target Company to LAMP Matrix</h3>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI, Cloudflare, Figma"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Cloud Infrastructure"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Scoring */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="font-semibold block mb-1">Advocacy (1-5)</label>
                  <select
                    value={newAdvocacy}
                    onChange={(e) => setNewAdvocacy(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={1}>1: Alumni Present</option>
                    <option value={2}>2: Moderate</option>
                    <option value={3}>3: 2nd-degree</option>
                    <option value={4}>4: Weak</option>
                    <option value={5}>5: None</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Motivation (1-5)</label>
                  <select
                    value={newMotivation}
                    onChange={(e) => setNewMotivation(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={1}>1: Dream</option>
                    <option value={2}>2: High</option>
                    <option value={3}>3: Moderate</option>
                    <option value={4}>4: Low</option>
                    <option value={5}>5: Cold</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Posting (1-5)</label>
                  <select
                    value={newPosting}
                    onChange={(e) => setNewPosting(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={1}>1: Active Roles</option>
                    <option value={2}>2: Recent Roles</option>
                    <option value={3}>3: General</option>
                    <option value={4}>4: Rare</option>
                    <option value={5}>5: None</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="font-semibold block mb-1">Verified Fact or News (BR-07)</label>
                <input
                  type="text"
                  placeholder="e.g. Recently launched new developer platform product line."
                  value={newVerifiedFact}
                  onChange={(e) => setNewVerifiedFact(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors"
              >
                Save Target Company
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
