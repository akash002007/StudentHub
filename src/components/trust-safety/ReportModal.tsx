"use client";

import React, { useState } from "react";
import {
  Flag,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileText,
  X,
  Shield,
  Send,
  ExternalLink,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { CATEGORIES_BY_ENTITY_TYPE } from "@/data/trust-safety-constants";
import { TrustSafetyEntityType, ReportEvidence } from "@/types";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: TrustSafetyEntityType;
  targetId: string;
  targetTitle: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reportedCompanyId?: string;
  reportedCompanyName?: string;
  reportedOpportunityId?: string;
  reportedContentId?: string;
  onSuccess?: (caseNumber: string) => void;
}

export function ReportModal({
  isOpen,
  onClose,
  entityType,
  targetId,
  targetTitle,
  reportedUserId,
  reportedUserName,
  reportedCompanyId,
  reportedCompanyName,
  reportedOpportunityId,
  reportedContentId,
  onSuccess,
}: ReportModalProps) {
  const categories = CATEGORIES_BY_ENTITY_TYPE[entityType] || CATEGORIES_BY_ENTITY_TYPE.OTHER;
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceList, setEvidenceList] = useState<Omit<ReportEvidence, "id" | "reportId" | "createdAt">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseNumber, setSubmittedCaseNumber] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const handleAddEvidence = () => {
    if (!evidenceUrl.trim() && !evidenceDescription.trim()) return;
    setEvidenceList((prev) => [
      ...prev,
      {
        type: evidenceUrl.match(/\.(png|jpg|jpeg|webp)$/i) ? "SCREENSHOT" : "DOCUMENT",
        fileUrl: evidenceUrl.trim() || undefined,
        fileName: evidenceUrl ? evidenceUrl.split("/").pop() : "evidence_note.txt",
        description: evidenceDescription.trim() || "Uploaded supporting evidence",
        uploadedBy: "Reporter",
      },
    ]);
    setEvidenceUrl("");
    setEvidenceDescription("");
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      toastError("Please provide a detailed description (minimum 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/trust-safety/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          targetId,
          targetTitle,
          reportedUserId,
          reportedUserName,
          reportedCompanyId,
          reportedCompanyName,
          reportedOpportunityId,
          reportedContentId,
          category: selectedCategory,
          description: description.trim(),
          additionalInfo: additionalInfo.trim() || undefined,
          evidence: evidenceList,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedCaseNumber(data.caseNumber);
        success("Report submitted successfully.");
        if (onSuccess) onSuccess(data.caseNumber);
      } else {
        toastError(data.error || "Failed to submit report.");
      }
    } catch (err: any) {
      toastError("Network error while submitting report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setDescription("");
    setAdditionalInfo("");
    setEvidenceList([]);
    setSubmittedCaseNumber(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetAndClose} maxWidth="xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Submit Trust & Safety Report
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Help protect the StudentHub community against abuse and fraud
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation State */}
        {submittedCaseNumber ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CASE #{submittedCaseNumber}
              </span>
              <h3 className="text-lg font-bold text-white">Report Submitted Successfully</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Our Trust & Safety moderation team has received your report and will thoroughly review it.
                You can track updates under your account dashboard.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 text-left max-w-md mx-auto text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Info className="w-4 h-4 text-blue-400" />
                <span>What happens next?</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Priority triage & evidence analysis by moderators</li>
                <li>Investigation without revealing your identity to the reported party</li>
                <li>Notification sent to your dashboard once a decision is made</li>
              </ul>
            </div>

            <div className="pt-3">
              <Button variant="primary" onClick={handleResetAndClose} className="px-8">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Entity Summary Card */}
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Reported {entityType.toLowerCase()}
                </span>
                <p className="text-sm font-semibold text-white truncate max-w-md">{targetTitle}</p>
                {reportedCompanyName && (
                  <p className="text-xs text-slate-400">Associated: {reportedCompanyName}</p>
                )}
              </div>
              <Badge variant="rose" className="text-[10px] uppercase">
                {entityType}
              </Badge>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Report Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Detailed Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what occurred with specific dates, message snippets, or demands (minimum 10 characters)..."
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
                required
              />
              <span className="text-[11px] text-slate-400">
                {description.length} characters (minimum 10)
              </span>
            </div>

            {/* Evidence Attachment Section */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  Supporting Evidence (Screenshots, Links, Documents)
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>

              {/* Evidence inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Image URL or Drive link..."
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                />
                <input
                  type="text"
                  placeholder="Evidence description / context..."
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  className="bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  disabled={!evidenceUrl.trim() && !evidenceDescription.trim()}
                  className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 font-medium transition-colors"
                >
                  + Add Evidence Item
                </button>
              </div>

              {/* Attached evidence pills */}
              {evidenceList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {evidenceList.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="max-w-[180px] truncate">{ev.fileName || ev.description}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(i)}
                        className="text-slate-400 hover:text-rose-400 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Additional Notes / Other Affected Students (Optional)
              </label>
              <input
                type="text"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="e.g. Fellow classmates also received similar solicitations..."
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Filing false or fraudulent reports is a violation of StudentHub guidelines. Your
                identity remains confidential and is protected from the reported party.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button type="button" variant="outline" onClick={handleResetAndClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || description.trim().length < 10}
                className="bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
