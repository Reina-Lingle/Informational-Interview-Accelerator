/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Check, X, Send, Calendar, Database } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  targetRecipient: string;
  targetCompany: string;
  serviceType: 'Simulated Gmail' | 'Simulated Google Calendar' | 'Simulated Notion';
  contentPreview: string;
  subjectPreview?: string;
  requiresContentApproval: boolean;
  requiresExecutionApproval: boolean;
  onAuthorize: (approvedContent: boolean, authorizedExecution: boolean) => void;
  onReject: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  title,
  targetRecipient,
  targetCompany,
  serviceType,
  contentPreview,
  subjectPreview,
  requiresContentApproval,
  requiresExecutionApproval,
  onAuthorize,
  onReject,
}) => {
  const [contentApproved, setContentApproved] = useState(false);
  const [executionAuthorized, setExecutionAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const canExecute =
    (!requiresContentApproval || contentApproved) &&
    (!requiresExecutionApproval || executionAuthorized);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onAuthorize(contentApproved, executionAuthorized);
    setIsSubmitting(false);
    onClose();
  };

  const handleRejectClick = () => {
    onReject();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full p-6 shadow-xl space-y-6 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Orchestrator Governance Gate (BR-06)</span>
            </div>
            <h3 className="text-lg font-bold mt-1">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target: {targetRecipient} · {targetCompany} · Service: {serviceType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Review Preview */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500 block">
            Content Review
          </label>
          {subjectPreview && (
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 mr-2">Subject:</span>
              {subjectPreview}
            </div>
          )}
          <div className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-800 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {contentPreview}
          </div>
        </div>

        {/* Dual Approval Checkboxes */}
        <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-md border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mandatory Verification Checkpoints:
          </div>

          {requiresContentApproval && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={contentApproved}
                onChange={(e) => setContentApproved(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Checkpoint 1: Content Approval
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  I have verified this message strictly satisfies Dalton's Six-Point criteria, asks for advice rather than a job, and contains no fabricated personal or career details.
                </p>
              </div>
            </label>
          )}

          {requiresExecutionApproval && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={executionAuthorized}
                onChange={(e) => setExecutionAuthorized(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Checkpoint 2: Execution Authorization
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  I explicitly authorize the system to trigger this operation via {serviceType} and advance relationship status in the Command Center database.
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleRejectClick}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject / Halt Operation</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canExecute || isSubmitting}
              onClick={handleConfirm}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-md transition-colors shadow-xs ${
                canExecute && !isSubmitting
                  ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Executing...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Authorize & Execute</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
