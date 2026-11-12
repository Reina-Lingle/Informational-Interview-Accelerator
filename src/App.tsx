/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TargetCompany,
  CommandCenterContact,
  AuditLogEntry,
  UserCareerProfile,
  NextBestAction,
  InterviewNotes,
  RelationshipClassification,
} from './types/index.ts';
import {
  INITIAL_COMPANIES,
  INITIAL_CONTACTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USER_PROFILE,
} from './data/fixtures.ts';
import { calculateNextBestAction } from './services/nextBestAction.ts';
import { calculateContactCadenceClocks } from './services/cadence.ts';
import { executeSimulatedOperation } from './services/adapters.ts';

import { TopBar, MainViewTab } from './components/TopBar.tsx';
import { ApprovalModal } from './components/ApprovalModal.tsx';
import { WelcomeSetupModal } from './components/WelcomeSetupModal.tsx';

import { DashboardView } from './components/views/DashboardView.tsx';
import { TargetCompaniesView } from './components/views/TargetCompaniesView.tsx';
import { CommandCenterView } from './components/views/CommandCenterView.tsx';
import { OutreachView } from './components/views/OutreachView.tsx';
import { MeetingCoachView } from './components/views/MeetingCoachView.tsx';
import { FollowThroughView } from './components/views/FollowThroughView.tsx';
import { PerformanceView } from './components/views/PerformanceView.tsx';
import { AcceptanceTestsView } from './components/views/AcceptanceTestsView.tsx';
import { ScorecardView } from './components/views/ScorecardView.tsx';
import { DemoModeView } from './components/views/DemoModeView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Application State
  const [currentDate] = useState('2026-11-12');
  const [companies, setCompanies] = useState<TargetCompany[]>(INITIAL_COMPANIES);
  const [contacts, setContacts] = useState<CommandCenterContact[]>(INITIAL_CONTACTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [userProfile, setUserProfile] = useState<UserCareerProfile>(INITIAL_USER_PROFILE);

  const [activeTab, setActiveTab] = useState<MainViewTab>('dashboard');
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>('con-elena');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  // Approval Modal State (BR-06 Dual-Stage Human Authorization Gate)
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    title: string;
    targetRecipient: string;
    targetCompany: string;
    serviceType: 'Simulated Gmail' | 'Simulated Google Calendar' | 'Simulated Notion';
    contentPreview: string;
    subjectPreview?: string;
    requiresContentApproval: boolean;
    requiresExecutionApproval: boolean;
    targetContactId?: string;
    isNudge?: boolean;
  }>({
    isOpen: false,
    title: '',
    targetRecipient: '',
    targetCompany: '',
    serviceType: 'Simulated Gmail',
    contentPreview: '',
    requiresContentApproval: true,
    requiresExecutionApproval: true,
  });

  // Calculate dynamic Next Best Action (BR-08)
  const nba = calculateNextBestAction(companies, contacts, currentDate);

  // Count pending items requiring human approval
  const pendingApprovalsCount = contacts.filter(
    (c) =>
      c.outreachStatus === 'Awaiting Content Approval' ||
      c.outreachStatus === 'Awaiting Execution Approval'
  ).length;

  // Handle NBA Action button click
  const handleTriggerNba = (action: NextBestAction) => {
    if (action.actionType === 'prepare_meeting') {
      if (action.targetContactId) setSelectedContactId(action.targetContactId);
      setActiveTab('prepare');
    } else if (action.actionType === 'follow_through_notes') {
      if (action.targetContactId) setSelectedContactId(action.targetContactId);
      setActiveTab('follow_through');
    } else if (action.actionType === 'review_contact_b' || action.actionType === 'prepare_nudge_a' || action.actionType === 'approve_outreach') {
      if (action.targetContactId) setSelectedContactId(action.targetContactId);
      setActiveTab('outreach');
    } else if (action.actionType === 'replenish_queue') {
      setActiveTab('companies');
    } else if (action.actionType === 'monthly_nurture') {
      if (action.targetContactId) setSelectedContactId(action.targetContactId);
      setActiveTab('follow_through');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Human Approval Request Trigger (from Outreach or Follow-Through)
  const handleRequestApproval = (
    contact: CommandCenterContact,
    subject: string,
    body: string,
    isNudge: boolean
  ) => {
    setApprovalModal({
      isOpen: true,
      title: isNudge ? 'Authorize 7B Nudge Dispatch' : 'Authorize Six-Point Outreach Dispatch',
      targetRecipient: contact.contactName,
      targetCompany: contact.companyName,
      serviceType: 'Simulated Gmail',
      contentPreview: body,
      subjectPreview: subject,
      requiresContentApproval: true,
      requiresExecutionApproval: true,
      targetContactId: contact.id,
      isNudge,
    });
  };

  // Human Authorization Execution Handler (Orchestrator decision)
  const handleAuthorizeExecution = async (approvedContent: boolean, authorizedExecution: boolean) => {
    if (!approvalModal.targetContactId) return;

    const contact = contacts.find((c) => c.id === approvalModal.targetContactId);
    if (!contact) return;

    // Execute simulated external operation with audit entry
    const op = await executeSimulatedOperation(
      approvalModal.serviceType,
      `${approvalModal.title} to ${contact.contactName} (${contact.companyName})`,
      `${userProfile.name} (Orchestrator)`,
      `Dual-Stage Gate: Content approved = ${approvedContent}, Execution authorized = ${authorizedExecution}`
    );

    // Record immutable audit entry
    setAuditLogs((prev) => [op.auditEntry, ...prev]);

    // If initial send, start Day 0 clock with deterministic 3B & 7B
    if (!contact.day0Date) {
      const clocks = calculateContactCadenceClocks(currentDate);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contact.id
            ? {
                ...c,
                outreachStatus: 'Sent',
                day0Date: clocks.day0Date,
                due3B: clocks.due3B,
                due7B: clocks.due7B,
                communicationsHistory: [
                  ...c.communicationsHistory,
                  {
                    id: `msg-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: approvalModal.isNudge ? '7B Nudge' : 'Initial Outreach',
                    subject: approvalModal.subjectPreview || 'Outreach',
                    body: approvalModal.contentPreview,
                    approvedContent: true,
                    authorizedExecution: true,
                    executedAt: new Date().toISOString(),
                    externalStatus: 'Simulated Sent',
                  },
                ],
              }
            : c
        )
      );
    } else {
      // Record follow-up message
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contact.id
            ? {
                ...c,
                outreachStatus: 'Sent',
                communicationsHistory: [
                  ...c.communicationsHistory,
                  {
                    id: `msg-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: approvalModal.isNudge ? '7B Nudge' : 'Check-in',
                    subject: approvalModal.subjectPreview || 'Update',
                    body: approvalModal.contentPreview,
                    approvedContent: true,
                    authorizedExecution: true,
                    executedAt: new Date().toISOString(),
                    externalStatus: 'Simulated Sent',
                  },
                ],
              }
            : c
        )
      );
    }
  };

  // Rejection handler (T13: User rejects -> No message sent)
  const handleRejectExecution = () => {
    if (!approvalModal.targetContactId) return;
    const contact = contacts.find((c) => c.id === approvalModal.targetContactId);
    const rejectedEntry: AuditLogEntry = {
      id: `aud-rej-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Rejected: ${approvalModal.title} to ${contact?.contactName || 'Contact'}`,
      authorizedBy: `${userProfile.name} (Orchestrator)`,
      externalService: approvalModal.serviceType,
      status: 'Rejected by User',
      details: 'User halted operation at human approval gate. External dispatch canceled.',
    };
    setAuditLogs((prev) => [rejectedEntry, ...prev]);
  };

  // Update company record (e.g. from LAMP matrix drawer)
  const handleUpdateCompany = (updated: TargetCompany) => {
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Add new target company
  const handleAddCompany = (newCo: TargetCompany) => {
    setCompanies((prev) => [newCo, ...prev]);
    const auditEntry: AuditLogEntry = {
      id: `aud-add-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Added Target Company: ${newCo.companyName} (LAMP Rank ${newCo.lampRank})`,
      authorizedBy: `${userProfile.name} (Orchestrator)`,
      externalService: 'Simulated Notion',
      status: 'Authorized & Confirmed',
      details: `Saved to Authoritative Database 1 (Target Companies). Status: ${newCo.status}.`,
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  // Update contact record (e.g. from Command Center)
  const handleUpdateContact = (updated: CommandCenterContact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Save Interview Intelligence (from Follow-Through view)
  const handleSaveInterviewIntelligence = (
    contactId: string,
    notes: InterviewNotes,
    classification: RelationshipClassification
  ) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? {
              ...c,
              interviewNotes: notes,
              relationshipClassification: classification,
              commitments: notes.commitments.map((com) => com.text),
              referrals: notes.referrals.map((r) => r.name),
              meetingStatus: 'Completed',
            }
          : c
      )
    );

    const targetContact = contacts.find((c) => c.id === contactId);
    const auditEntry: AuditLogEntry = {
      id: `aud-notes-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Saved Post-Meeting Intelligence & Classification for ${targetContact?.contactName || 'Contact'}`,
      authorizedBy: `${userProfile.name} (Orchestrator)`,
      externalService: 'Simulated Notion',
      status: 'Authorized & Confirmed',
      details: `Extracted ${notes.commitments.length} commitments, ${notes.referrals.length} referrals. Classified as: ${classification}.`,
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  // Reset Demo Mode back to pristine fixtures (T18)
  const handleResetDemo = () => {
    setCompanies(INITIAL_COMPANIES);
    setContacts(INITIAL_CONTACTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setUserProfile(INITIAL_USER_PROFILE);
    setSelectedContactId('con-elena');
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Universal TopBar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'choose') setActiveTab('companies');
          else if (tab === 'continue') setActiveTab('dashboard');
          else setActiveTab(tab);
        }}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenNextBestAction={() => handleTriggerNba(nba)}
        onResetDemo={handleResetDemo}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            companies={companies}
            contacts={contacts}
            nba={nba}
            onTriggerNba={handleTriggerNba}
            onNavigate={(tab) => {
              if (tab === 'choose') setActiveTab('companies');
              else if (tab === 'continue') setActiveTab('dashboard');
              else setActiveTab(tab);
            }}
            onSelectCompany={(co) => {
              setActiveTab('companies');
            }}
            onSelectContact={(con) => {
              setSelectedContactId(con.id);
              setActiveTab('command_center');
            }}
            auditLogs={auditLogs}
            currentDate={currentDate}
          />
        )}

        {(activeTab === 'choose' || activeTab === 'companies') && (
          <TargetCompaniesView
            companies={companies}
            onUpdateCompany={handleUpdateCompany}
            onAddCompany={handleAddCompany}
            onInitiateOutreach={(co) => {
              // Select related contact if exists or default
              const rel = contacts.find((c) => c.companyId === co.id);
              if (rel) setSelectedContactId(rel.id);
              setActiveTab('outreach');
            }}
          />
        )}

        {activeTab === 'command_center' && (
          <CommandCenterView
            contacts={contacts}
            companies={companies}
            currentDate={currentDate}
            onUpdateContact={handleUpdateContact}
            onSelectContactForOutreach={(c) => {
              setSelectedContactId(c.id);
              setActiveTab('outreach');
            }}
            onSelectContactForMeeting={(c) => {
              setSelectedContactId(c.id);
              setActiveTab('prepare');
            }}
            onSelectContactForFollowThrough={(c) => {
              setSelectedContactId(c.id);
              setActiveTab('follow_through');
            }}
          />
        )}

        {activeTab === 'outreach' && (
          <OutreachView
            contacts={contacts}
            companies={companies}
            selectedContactId={selectedContactId}
            onSelectContactId={setSelectedContactId}
            onRequestApproval={handleRequestApproval}
            currentDate={currentDate}
          />
        )}

        {activeTab === 'prepare' && (
          <MeetingCoachView
            contacts={contacts}
            companies={companies}
            selectedContactId={selectedContactId}
            onSelectContactId={setSelectedContactId}
            onAdvanceToFollowThrough={(c) => {
              setSelectedContactId(c.id);
              setActiveTab('follow_through');
            }}
          />
        )}

        {activeTab === 'follow_through' && (
          <FollowThroughView
            contacts={contacts}
            companies={companies}
            selectedContactId={selectedContactId}
            onSelectContactId={setSelectedContactId}
            onSaveInterviewIntelligence={handleSaveInterviewIntelligence}
            onRequestApproval={handleRequestApproval}
          />
        )}

        {activeTab === 'performance' && <PerformanceView />}

        {activeTab === 'tests' && <AcceptanceTestsView />}

        {activeTab === 'scorecard' && <ScorecardView />}

        {activeTab === 'demo' && (
          <DemoModeView
            onResetDemo={handleResetDemo}
            onNavigate={(tab) => {
              if (tab === 'choose') setActiveTab('companies');
              else if (tab === 'continue') setActiveTab('dashboard');
              else setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
          />
        )}
      </main>

      {/* Dual-Stage Human Approval Gate Modal (BR-06) */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal((prev) => ({ ...prev, isOpen: false }))}
        title={approvalModal.title}
        targetRecipient={approvalModal.targetRecipient}
        targetCompany={approvalModal.targetCompany}
        serviceType={approvalModal.serviceType}
        contentPreview={approvalModal.contentPreview}
        subjectPreview={approvalModal.subjectPreview}
        requiresContentApproval={approvalModal.requiresContentApproval}
        requiresExecutionApproval={approvalModal.requiresExecutionApproval}
        onAuthorize={handleAuthorizeExecution}
        onReject={handleRejectExecution}
      />

      {/* Welcome & Setup Modal */}
      <WelcomeSetupModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        profile={userProfile}
        onSaveProfile={setUserProfile}
      />

      {/* Clean Unobtrusive Footer per Frontend Constitution */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Informational Interview Accelerator (IIA)
            </span>
            <span aria-hidden="true">·</span>
            <span>Version 1.0</span>
            <span aria-hidden="true">·</span>
            <span>Dalton 2-Hour Job Search Framework</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsWelcomeOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Setup Intake
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('settings')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Notion Data Dictionary
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('tests')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              T01–T18 Tests
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
