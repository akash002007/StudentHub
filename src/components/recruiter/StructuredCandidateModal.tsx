"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  GraduationCap,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Send,
  History,
  Clock,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { EligibilityBreakdownView } from "@/components/recruiter/EligibilityBreakdownView";
import { RecruitmentApplication, RecruitmentApplicationStatus } from "@/types";

interface StructuredCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: RecruitmentApplication | null;
  onStatusChange: (newStatus: RecruitmentApplicationStatus, notes?: string) => void;
  onManualOverride?: (newStatus: RecruitmentApplicationStatus, reason: string) => void;
  onMessage?: () => void;
}

export function StructuredCandidateModal({
  isOpen,
  onClose,
  application,
  onStatusChange,
  onManualOverride,
  onMessage,
}: StructuredCandidateModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "eligibility" | "history">("profile");
  const [notes, setNotes] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  if (!application) return null;

  const handleApplyOverride = () => {
    if (!overrideReason.trim()) return;
    if (onManualOverride) {
      onManualOverride("ELIGIBLE", overrideReason.trim());
      setShowOverrideForm(false);
      setOverrideReason("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-start gap-4">
            <Avatar
              src={application.studentAvatar}
              alt={application.studentName}
              size="lg"
              className="ring-2 ring-blue-500/20 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  {application.studentName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  {application.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                  {application.degree} • {application.branch}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {application.university}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  CGPA: {application.cgpa}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {onMessage && (
              <Button variant="outline" size="sm" onClick={onMessage}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Message
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2.5 text-xs font-semibold px-2 border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Candidate Profile & Academic Data
          </button>
          <button
            onClick={() => setActiveTab("eligibility")}
            className={`pb-2.5 text-xs font-semibold px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "eligibility"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Eligibility Breakdown
            {application.eligibility && (
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  application.eligibility.status === "ELIGIBLE"
                    ? "bg-emerald-500/20 text-emerald-600"
                    : "bg-primary/20 text-rose-600"
                }`}
              >
                {application.eligibility.score}%
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 text-xs font-semibold px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Stage History ({application.history?.length || 1})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            {/* Academic & Bio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
                <span className="text-[11px] text-muted-foreground">Degree & Branch</span>
                <div className="font-bold text-xs text-foreground mt-0.5">
                  {application.degree}
                </div>
                <div className="text-[11px] text-muted-foreground">{application.branch}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
                <span className="text-[11px] text-muted-foreground">Academic Standing</span>
                <div className="font-bold text-xs text-foreground mt-0.5">
                  CGPA: {application.cgpa}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Graduation: {application.graduationYear} • Backlogs: {application.backlogs}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border">
                <span className="text-[11px] text-muted-foreground">Current Selection Stage</span>
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {application.currentStageName}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Applied: {new Date(application.appliedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-foreground">Demonstrated Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {application.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter Candidate Verification Claims (Section 19) */}
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">Candidate Verification Claims</span>
                    <p className="text-[10px] text-muted-foreground">
                      Verified by institutional credentials & automated verification
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  Trust Verified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-[10px] text-muted-foreground">Identity</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-[10px] text-muted-foreground">Education</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-[10px] text-muted-foreground">Degree</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-[10px] text-muted-foreground">Internship</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
              </div>

              {/* Privacy Safeguard Notice */}
              <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40 flex items-center justify-between">
                <span>
                  🔒 Sensitive identity documents (Govt ID, College ID) are protected and restricted from recruiter access.
                </span>
              </div>
            </div>

            {/* Resume & Permitted Documents */}
            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    Candidate Resume
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Authorized shareable applicant document
                  </div>
                </div>
              </div>
              <a
                href={application.resumeUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
              >
                Inspect Resume
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Screening Decision Actions */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">Screening Action</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => onStatusChange("REJECTED", notes)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => onStatusChange("SHORTLISTED", notes)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Shortlist Candidate
                  </Button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add optional recruiter evaluation note..."
                  className="w-full h-9 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Structured Eligibility Breakdown */}
        {activeTab === "eligibility" && (
          <div className="space-y-4">
            <EligibilityBreakdownView eligibility={application.eligibility} />

            {/* Manual Override Option */}
            {application.eligibility?.status !== "ELIGIBLE" && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-blue-500/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Manual Eligibility Override
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => setShowOverrideForm(!showOverrideForm)}
                  >
                    {showOverrideForm ? "Cancel" : "Authorize Override"}
                  </Button>
                </div>

                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                  Authorizing a manual eligibility override marks the candidate as eligible and
                  records an immutable audit trail entry with your identity and justification.
                </p>

                {showOverrideForm && (
                  <div className="space-y-2 pt-2 border-t border-amber-500/20">
                    <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                      Mandatory Justification / Reason:
                    </label>
                    <textarea
                      rows={2}
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Exceptional CalHacks 1st place project and strong open source proof-of-work compensating for minor backlog..."
                      className="w-full p-2.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="gradient"
                        disabled={!overrideReason.trim()}
                        onClick={handleApplyOverride}
                      >
                        Confirm Override & Mark Eligible
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="space-y-2">
              {(application.history || []).map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span>{h.stageName}</span>
                      <Badge variant="purple" size="sm">
                        {h.status}
                      </Badge>
                    </div>
                    {h.note && <div className="text-[11px] text-muted-foreground">{h.note}</div>}
                    <div className="text-[10px] text-slate-400">By: {h.actor}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
