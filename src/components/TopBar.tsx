/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Moon, Sun, RotateCcw, CheckCircle2 } from 'lucide-react';

export type MainViewTab =
  | 'dashboard'
  | 'choose'
  | 'outreach'
  | 'prepare'
  | 'follow_through'
  | 'continue'
  | 'companies'
  | 'command_center'
  | 'performance'
  | 'scorecard'
  | 'tests'
  | 'settings'
  | 'demo';

interface TopBarProps {
  activeTab: MainViewTab;
  onSelectTab: (tab: MainViewTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenNextBestAction: () => void;
  onResetDemo: () => void;
  pendingApprovalsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onOpenNextBestAction,
  onResetDemo,
  pendingApprovalsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark Brand element */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm"
            >
              <div className="w-8 h-8 rounded bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm tracking-tight">
                IIA
              </div>
              <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                Informational Interview Accelerator
              </span>
            </button>
            <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 font-mono">
              v1.0
            </span>
          </div>

          {/* Zone 2: Five Core Dalton Activities Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onSelectTab('choose')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'choose' || activeTab === 'companies'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold border-b-2 border-slate-900 dark:border-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              CHOOSE
            </button>
            <button
              onClick={() => onSelectTab('outreach')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'outreach'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold border-b-2 border-slate-900 dark:border-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              OUTREACH
            </button>
            <button
              onClick={() => onSelectTab('prepare')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'prepare'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold border-b-2 border-slate-900 dark:border-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              PREPARE
            </button>
            <button
              onClick={() => onSelectTab('follow_through')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'follow_through'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold border-b-2 border-slate-900 dark:border-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              FOLLOW THROUGH
            </button>
            <button
              onClick={() => onSelectTab('continue')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'continue' || activeTab === 'dashboard'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold border-b-2 border-slate-900 dark:border-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              CONTINUE
            </button>
          </nav>

          {/* Zone 3: Primary Action + Secondary Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Next Best Action Button */}
            <button
              onClick={onOpenNextBestAction}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shadow-xs"
              title="View Current Next Best Action"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Next Best Action</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Demo Reset */}
            <button
              onClick={onResetDemo}
              title="Reset Demo Scenario Fixtures"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar for direct access to authoritative databases & tools */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 py-2 overflow-x-auto text-xs scrollbar-none gap-4">
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Databases:</span>
            <button
              onClick={() => onSelectTab('companies')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                activeTab === 'companies' ? 'text-slate-900 dark:text-slate-100 font-semibold underline' : ''
              }`}
            >
              1. Target Companies (LAMP)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onSelectTab('command_center')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                activeTab === 'command_center' ? 'text-slate-900 dark:text-slate-100 font-semibold underline' : ''
              }`}
            >
              2. Command Center (Contacts)
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <button
              onClick={() => onSelectTab('performance')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                activeTab === 'performance' ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''
              }`}
            >
              Performance Trends
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onSelectTab('scorecard')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                activeTab === 'scorecard' ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''
              }`}
            >
              Comparison Scorecard
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onSelectTab('tests')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                activeTab === 'tests' ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''
              }`}
            >
              Acceptance Tests (T01–T18)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onSelectTab('demo')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                activeTab === 'demo' ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''
              }`}
            >
              Demo Guide
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onSelectTab('settings')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                activeTab === 'settings' ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
