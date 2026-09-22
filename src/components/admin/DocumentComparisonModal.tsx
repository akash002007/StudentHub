"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Check,
  Clock,
  History,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DocumentRecord, DocumentVerificationAttempt } from "@/types";

interface DocumentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord | null;
  onApprove: (doc: DocumentRecord, notes?: string) => Promise<void>;
  onReject: (doc: DocumentRecord, reason: string) => Promise<void>;
  onRequestReupload: (doc: DocumentRecord, reason: string) => Promise<void>;
}

export function DocumentComparisonModal({
  isOpen,
  onClose,
  document,
  onApprove,
  onReject,
  onRequestReupload,
}: DocumentComparisonModalProps) {
  const [actionType, setActionType] = useState<"NONE" | "REJECT" | "REUPLOAD">("NONE");
  const [reasonInput, setReasonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState<DocumentVerificationAttempt[]>([]);

  // Automatically transition to UNDER_REVIEW when opened
  useEffect(() => {
    if (isOpen && document && document.verificationStatus === "MANUAL_REVIEW_REQUESTED") {
      fetch(`/api/admin/documents/${document.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START_REVIEW" }),
      }).catch(console.warn);
    }
  }, [isOpen, document]);

  // Load complete verification attempts audit history
  useEffect(() => {
    if (isOpen && document?.id) {
      if (document.attempts && document.attempts.length > 0) {
        setAttempts(document.attempts);
      } else {
        fetch(`/api/documents/${document.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.document?.attempts) {
              setAttempts(data.document.attempts);
            }
          })
          .catch(console.warn);
      }
    }
  }, [isOpen, document]);

  if (!document) return null;

  const extracted = document.extractedData || {};
  const confidence = document.confidenceScore || 70;

  const handleApproveSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(document, "Verified by CommandSkill Verification Officer after manual comparative review.");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionSubmit = async () => {
    if (!reasonInput.trim()) return;
    setIsSubmitting(true);
    try {
      if (actionType === "REJECT") {
        await onReject(document, reasonInput.trim());
      } else if (actionType === "REUPLOAD") {
        await onRequestReupload(document, reasonInput.trim());
      }
      setActionType("NONE");
      setReasonInput("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldMatched = (field: string) => {
    return document.matchedFields?.includes(field);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-5 text-left max-h-[85vh] overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                Document Verification Review
              </h2>
              <p className="text-xs text-muted-foreground">
                Compare extracted document attributes against trusted CommandSkill profile data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Confidence:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                confidence >= 80
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : confidence >= 50
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/30"
              }`}
            >
              {confidence}%
            </span>
          </div>
        </div>

        {/* Verification Signals Strip */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Automated Multi-Factor Signals
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
                isFieldMatched("institutional_id")
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
              }`}
            >
              {isFieldMatched("institutional_id") ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              Institutional ID Anchor {isFieldMatched("institutional_id") ? "✓" : "⚠"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
                isFieldMatched("name")
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
              }`}
            >
              {isFieldMatched("name") ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              Name Match {isFieldMatched("name") ? "✓" : "⚠"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
                isFieldMatched("institution") || isFieldMatched("college")
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              College / Institution Match ✓
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
                isFieldMatched("degree")
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Degree Match {isFieldMatched("degree") ? "✓" : "—"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
                isFieldMatched("graduation_year")
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Graduation Year {isFieldMatched("graduation_year") ? "✓" : "—"}
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: Document Extracted Data */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                EXTRACTED DOCUMENT DATA
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{document.fileName}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Extracted Institutional Identifier</span>
                <span className="font-bold text-foreground font-mono text-xs">
                  {extracted.institutionalId || extracted.rollNumber || extracted.registrationNumber || "Not detected"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Detected Recipient Name</span>
                <span className="font-bold text-foreground">
                  {extracted.studentName || "Candidate Name (OCR Stream)"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Detected Institution / University</span>
                <span className="font-bold text-foreground">
                  {extracted.institution || document.collegeName || "Issuing University"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Degree / Credential Award</span>
                <span className="font-bold text-foreground">
                  {extracted.degree || "Academic Degree"}
                </span>
              </div>

              {extracted.cgpa && (
                <div>
                  <span className="text-[11px] text-muted-foreground block">Extracted CGPA / Score</span>
                  <span className="font-bold text-foreground">{extracted.cgpa}</span>
                </div>
              )}

              {extracted.rawTextPreview && (
                <div className="pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground block mb-1">OCR Stream Snippet:</span>
                  <div className="p-2 rounded-lg bg-muted/40 font-mono text-[10px] text-muted-foreground line-clamp-3">
                    {extracted.rawTextPreview}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Trusted CommandSkill Profile */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-500" />
                TRUSTED COMMANDSKILL PROFILE
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">System Verified</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Registered Institutional ID</span>
                <span className="font-bold text-foreground font-mono text-xs">
                  {document.institutionalId || "CSE2024012"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Candidate Full Name</span>
                <span className="font-bold text-foreground">{document.studentName || "Alex Rivera"}</span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Enrolled University</span>
                <span className="font-bold text-foreground">{document.collegeName || "Stanford University"}</span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Account Email</span>
                <span className="font-bold text-foreground">{document.studentEmail || "student@stanford.edu"}</span>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] text-muted-foreground">Institutional identity anchor verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Failure or Review Notice */}
        {(document.decisionReason || document.failureReason || document.manualReviewReason) && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Automated Decision & Review Context:
            </span>
            <p className="text-[11px] leading-relaxed">
              {document.decisionReason || document.failureReason || document.manualReviewReason}
            </p>
          </div>
        )}

        {/* Verification Attempt Audit History */}
        {attempts.length > 0 && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Verification Attempt History ({attempts.length})
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {attempts.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="p-2 rounded-lg bg-background border border-border text-[11px] flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-foreground">
                      Attempt #{attempts.length - idx}: {att.verificationMethod}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      ({att.status}) — {att.reason}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                    {new Date(att.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action input panel if Reject or Re-upload is clicked */}
        {actionType !== "NONE" && (
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
            <label className="block text-xs font-bold text-foreground">
              {actionType === "REJECT" ? "Rejection Reason (Required):" : "Re-upload Instructions for Student (Required):"}
            </label>
            <textarea
              rows={3}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder={
                actionType === "REJECT"
                  ? "e.g. Document appears invalid or belongs to another candidate..."
                  : "e.g. Uploaded scan is blurry or cropped. Please upload a clear official color PDF..."
              }
              className="w-full p-2.5 rounded-lg text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setActionType("NONE")}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={isSubmitting}
                disabled={!reasonInput.trim() || isSubmitting}
                onClick={handleActionSubmit}
                className={actionType === "REJECT" ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-amber-600 text-white hover:bg-amber-700"}
              >
                Confirm {actionType === "REJECT" ? "Rejection" : "Re-upload Request"}
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {actionType === "NONE" && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
            <div className="text-[11px] text-muted-foreground">
              Document ID: <span className="font-mono text-foreground">{document.id}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionType("REUPLOAD");
                  setReasonInput("Uploaded scan resolution is low. Please provide a clear, high-resolution copy.");
                }}
                className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
              >
                Request Re-upload
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionType("REJECT");
                  setReasonInput("Document does not satisfy institutional verification requirements.");
                }}
                className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
              >
                Reject
              </Button>

              <Button
                size="sm"
                isLoading={isSubmitting}
                onClick={handleApproveSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve & Verify
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
