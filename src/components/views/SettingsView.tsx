/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  NOTION_TARGET_COMPANIES_SCHEMA,
  NOTION_COMMAND_CENTER_SCHEMA,
} from '../../services/adapters.ts';
import { UserCareerProfile } from '../../types/index.ts';
import { Database, ShieldCheck, Calendar, Sliders, CheckCircle2, Lock } from 'lucide-react';

interface SettingsViewProps {
  userProfile: UserCareerProfile;
  onUpdateProfile: (profile: UserCareerProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [activeSchemaTab, setActiveSchemaTab] = useState<'companies' | 'command_center'>('companies');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>Workflow WF-12 · Data Objects & System Governance</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings & Authoritative Data Dictionary
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          IIA is governed by exactly two authoritative Notion databases. No extra databases or hidden contacts tables are permitted (BR-09).
        </p>
      </div>

      {/* Two Authoritative Databases Schema Viewer (BR-09 & WF-12) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Database className="w-4 h-4 text-slate-400" />
              <span>Authoritative Notion Database Schemas</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict schema contracts for future Notion API bidirectional synchronization.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-xs">
            <button
              onClick={() => setActiveSchemaTab('companies')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeSchemaTab === 'companies'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              1. TARGET COMPANIES ({NOTION_TARGET_COMPANIES_SCHEMA.length} fields)
            </button>
            <button
              onClick={() => setActiveSchemaTab('command_center')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeSchemaTab === 'command_center'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              2. COMMAND CENTER ({NOTION_COMMAND_CENTER_SCHEMA.length} fields)
            </button>
          </div>
        </div>

        {/* Schema Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Field Name</th>
                <th className="py-2.5 px-3">Notion Type</th>
                <th className="py-2.5 px-3">Ownership</th>
                <th className="py-2.5 px-3">Description & Allowed Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {(activeSchemaTab === 'companies'
                ? NOTION_TARGET_COMPANIES_SCHEMA
                : NOTION_COMMAND_CENTER_SCHEMA
              ).map((f) => (
                <tr key={f.name}>
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {f.name}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{f.type}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[11px] font-medium ${
                        f.ownership === 'Computed'
                          ? 'text-amber-600 dark:text-amber-400 font-mono font-semibold'
                          : f.ownership === 'System'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {f.ownership}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                    {f.description}
                    {f.allowedValues && (
                      <span className="block text-slate-400 font-mono mt-0.5">
                        Allowed: [{f.allowedValues.join(', ')}]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pedagogical Guidance Level ("Teach the Method, Not Dependence") */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Coaching Philosophy & Autonomy Level</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            "Teach the Method, Not Dependence": Initially provide detailed explanations, then gradually transfer judgment to the job seeker.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300 block">
            Current Pedagogical Coaching Mode:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                mode: 'High Teaching (Detailed explanations)',
                desc: 'Explains every rationale, business rule, and timing reason behind recommendations.',
              },
              {
                mode: 'Balanced',
                desc: 'Streamlined rationale with expandable method grounding.',
              },
              {
                mode: 'High Autonomy (Orchestrator)',
                desc: 'Minimal coaching prompts; assumes full fluency in Dalton & Perez methodology.',
              },
            ].map((item) => (
              <div
                key={item.mode}
                onClick={() =>
                  onUpdateProfile({
                    ...userProfile,
                    coachingLevel: item.mode as any,
                  })
                }
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  userProfile.coachingLevel === item.mode
                    ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800/60 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100">{item.mode}</div>
                <div className="text-[11px] text-slate-500 mt-1 font-normal leading-relaxed">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documented Holiday & Business-Day Policies */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Documented Business-Day & Holiday-Handling Policies</span>
        </div>

        <div className="text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <p>
            1. <strong>Weekend Exclusion:</strong> All Saturdays and Sundays are strictly excluded from Day 0, 3B, and 7B cadence counts.
          </p>
          <p>
            2. <strong>Federal Holiday Exclusion:</strong> Calculations deterministically bypass all 11 US Federal Holidays (New Year’s Day, MLK Day, Presidents’ Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas).
          </p>
          <p>
            3. <strong>7B Rule Resolution:</strong> Per the approved IIA V1 specification, 7B strictly represents seven (7) business days, not calendar days.
          </p>
        </div>
      </div>
    </div>
  );
};
