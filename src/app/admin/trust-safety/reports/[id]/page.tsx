"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  XCircle,
  Building2,
  Briefcase,
  User,
  Layers,
  FileText,
  Upload,
  Send,
  ShieldAlert,
  AlertOctagon,
  ExternalLink,
  Info,
  Calendar,
  MessageSquare,
  Lock,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  TrustSafetyReport,
  TrustSafetyStatus,
  ReportPriority,
  EnforcementActionType,
  EnforcementDuration,
  EntitySafetyHistory,
  CompanyRiskSignals,
} from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminReportInvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { id } = resolvedParams;

  const [report, setReport] = useState<TrustSafetyReport | null>(null);
  const [history, setHistory] = useState<EntitySafetyHistory | null>(null);
  const [companySignals, setCompanySignals] = useState<CompanyRiskSignals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Investigation Note state
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Moderator Assignment / Status state
  const [moderatorName, setModeratorName] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Enforcement Modal state
  const [isEnforceModalOpen, setIsEnforceModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<EnforcementActionType>("WARNING");
  const [enforcementDuration, setEnforcementDuration] = useState<EnforcementDuration>("7_DAYS");
  const [enforcementReason, setEnforcementReason] = useState("");
  const [isEnforcing, setIsEnforcing] = useState(false);

  // Resolution Modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState<"RESOLVED" | "DISMISSED">("RESOLVED");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const { success, error: toastError } = useToast();

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trust-safety/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        const r: TrustSafetyReport = data.report;
        setReport(r);
        setModeratorName(r.assignedModeratorName || "");

        // Fetch entity history and company signals
        const targetId = r.reportedUserId || r.reportedOpportunityId || r.reportedCompanyId || r.targetId;
        const q = new URLSearchParams();
        q.append("entityType", r.entityType);
        q.append("entityId", targetId);
        if (r.reportedCompanyId) q.append("companyId", r.reportedCompanyId);

        const hRes = await fetch(`/api/trust-safety/entity-history?${q.toString()}`);
        if (hRes.ok) {
          const hData = await hRes.json();
          setHistory(hData.history);
          setCompanySignals(hData.companySignals);
        }
      } else {
        toastError("Case report not found.");
      }
    } catch {
      toastError("Error loading case report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/trust-safety/reports/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success("Investigation note saved.");
        setNewNote("");
        loadReport();
      } else {
        toastError(data.error || "Failed to add note.");
      }
    } catch {
      toastError("Network error while adding note.");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TrustSafetyStatus, newPriority?: ReportPriority) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/trust-safety/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority || report?.priority,
          assignedModeratorName: moderatorName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(`Case updated to ${newStatus}.`);
        loadReport();
      } else {
        toastError(data.error || "Failed to update case.");
      }
    } catch {
      toastError("Failed to update case.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExecuteEnforcement = async () => {
    if (!enforcementReason.trim()) {
      toastError("Enforcement reason is mandatory.");
      return;
    }

    setIsEnforcing(true);
    try {
      const res = await fetch(`/api/trust-safety/reports/${id}/enforce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: selectedAction,
          duration: enforcementDuration,
          reason: enforcementReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(`Enforcement action "${selectedAction}" executed.`);
        setIsEnforceModalOpen(false);
        setEnforcementReason("");
        loadReport();
      } else {
        toastError(data.error || "Failed to execute enforcement.");
      }
    } catch {
      toastError("Network error while executing enforcement.");
    } finally {
      setIsEnforcing(false);
    }
  };

  const handleResolveCase = async () => {
    if (!resolutionNotes.trim()) {
      toastError("Resolution notes are required.");
      return;
    }

    setIsResolving(true);
    try {
      const res = await fetch(`/api/trust-safety/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: resolutionStatus,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(`Case marked as ${resolutionStatus}.`);
        setIsResolveModalOpen(false);
        setResolutionNotes("");
        loadReport();
      } else {
        toastError(data.error || "Failed to resolve case.");
      }
    } catch {
      toastError("Network error while resolving case.");
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Clock3 className="w-8 h-8 animate-spin text-rose-400 mx-auto" />
        <p className="text-xs text-slate-400">Loading case workspace...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Case Not Found</h3>
        <p className="text-xs text-slate-400">Case #{id} does not exist in the database.</p>
        <Link href="/admin/trust-safety/reports">
          <Button variant="outline" size="sm">
            Return to Queue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Back to queue & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <Link
            href="/admin/trust-safety/reports"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Moderation Queue</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
              CASE #{report.caseNumber}
            </h1>
            <Badge
              variant={
                report.priority === "CRITICAL"
                  ? "rose"
                  : report.priority === "HIGH"
                  ? "rose"
                  : "purple"
              }
              className="text-xs font-mono font-bold uppercase"
            >
              {report.priority}
            </Badge>
            <Badge
              variant={
                report.status === "RESOLVED"
                  ? "emerald"
                  : report.status === "ACTION"
                  ? "rose"
                  : "blue"
              }
              className="text-xs font-mono uppercase"
            >
              {report.status}
            </Badge>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus("INVESTIGATION")}
            disabled={report.status === "INVESTIGATION"}
            className="text-xs"
          >
            Start Investigation
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEnforceModalOpen(true)}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Enforce Action</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setResolutionStatus("RESOLVED");
              setIsResolveModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolve Case</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResolutionStatus("DISMISSED");
              setIsResolveModalOpen(true);
            }}
            className="text-slate-400 hover:text-white text-xs"
          >
            Dismiss
          </Button>
        </div>
      </div>

      {/* Grid: Main Investigation vs Context & History Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Case Dossier & Evidence & Investigation Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Reported Entity Card with Side-by-Side Verification vs T&S */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Reported Entity Dossier
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {report.targetId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400">Entity Title / Name</span>
                <p className="text-base font-bold text-white">{report.targetTitle}</p>
                {report.reportedCompanyName && (
                  <p className="text-xs text-slate-400">Company: {report.reportedCompanyName}</p>
                )}
                <Badge variant="purple" className="text-[10px] uppercase">
                  {report.entityType}
                </Badge>
              </div>

              {/* Strict Verification vs Trust & Safety side-by-side indicator */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Verification Status
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-rose-400">
                    Trust & Safety
                  </span>
                </div>
                <div className="flex items-center justify-between font-semibold text-xs">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Legal Identity
                  </span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {report.priority} Flag
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Verification verifies credentials. Trust & Safety ensures non-abusive platform behavior.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Report Details & Category & Description */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Violation Allegation
              </span>
              <span className="text-xs text-slate-400">
                Submitted {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Violation Category</span>
                <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold text-sm inline-block">
                  {report.category}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Reporter Statement</span>
                <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  &quot;{report.description}&quot;
                </div>
              </div>

              {report.additionalInfo && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Additional Context</span>
                  <p className="text-xs text-slate-300 bg-white/5 border border-white/5 rounded-xl p-3">
                    {report.additionalInfo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Evidence Gallery */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Submitted Evidence ({report.evidence?.length || 0})
                </span>
              </div>
            </div>

            {report.evidence && report.evidence.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-slate-950/60 border border-white/10 rounded-xl p-3 space-y-2 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" className="text-[9px] uppercase">
                          {ev.type}
                        </Badge>
                        <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                          {ev.fileName || "Evidence Item"}
                        </span>
                      </div>
                      {ev.fileUrl && (
                        <a
                          href={ev.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {ev.description && (
                      <p className="text-xs text-slate-400 leading-snug">{ev.description}</p>
                    )}

                    {ev.fileUrl && ev.type === "SCREENSHOT" && (
                      <div className="rounded-lg overflow-hidden border border-white/10 max-h-40 bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ev.fileUrl}
                          alt={ev.description || "Evidence snapshot"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 pt-1 border-t border-white/5 flex justify-between">
                      <span>Uploaded by {ev.uploadedBy}</span>
                      <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No external screenshots or file evidence submitted for this case.
              </div>
            )}
          </div>

          {/* Section 4: Internal Investigation Timeline & Notes */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Internal Moderator Notes ({report.internalNotes?.length || 0})
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Confidential to Staff</span>
            </div>

            {/* Existing notes thread */}
            <div className="space-y-3">
              {report.internalNotes && report.internalNotes.length > 0 ? (
                report.internalNotes.map((n) => (
                  <div
                    key={n.id}
                    className="bg-slate-950/40 border border-white/10 rounded-xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{n.authorName}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {n.authorRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {n.note}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">
                  No internal notes recorded yet.
                </div>
              )}
            </div>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-semibold text-slate-300 block">
                Add Investigation Finding / Moderator Note
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log internal evidence findings, cross-references, or recruiter statements..."
                rows={3}
                className="w-full bg-slate-950/60 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNote ? "Posting..." : "Post Note"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Context, Signals, & Enforcement Summary */}
        <div className="space-y-6">
          {/* Active Enforcement Banner (If any) */}
          {report.enforcementAction && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">
                  Enforced Action: {report.enforcementAction}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <strong>Duration:</strong> {report.enforcementDuration}
                </p>
                <p>
                  <strong>Reason:</strong> {report.enforcementReason}
                </p>
                {report.enforcedAt && (
                  <p className="text-[11px] text-slate-400">
                    Enforced by {report.enforcedBy} on{" "}
                    {new Date(report.enforcedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Assigned Moderator Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Case Assignment
            </span>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Assigned Investigator</label>
                <input
                  type="text"
                  value={moderatorName}
                  onChange={(e) => setModeratorName(e.target.value)}
                  placeholder="e.g. Admin A17..."
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(report.status)}
                disabled={isUpdatingStatus}
                className="w-full text-xs"
              >
                Save Assignment
              </Button>
            </div>
          </div>

          {/* Repeat Offender Signals */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Repeat Offender Signals
            </span>

            {history ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Total Lifetime Reports</span>
                  <span className="font-bold text-white">{history.totalReports}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Confirmed Violations</span>
                  <span className={`font-bold ${history.confirmedViolations > 0 ? "text-rose-400" : "text-slate-300"}`}>
                    {history.confirmedViolations}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Previous Warnings</span>
                  <span className="font-bold text-slate-300">{history.warningsCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Active Investigations</span>
                  <span className={`font-bold ${history.activeInvestigations > 1 ? "text-amber-400" : "text-slate-300"}`}>
                    {history.activeInvestigations}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading repeat offender profile...</p>
            )}
          </div>

          {/* Company-Level Risk Signals */}
          {companySignals && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Company Risk Signals
                </span>
                <Badge
                  variant={
                    companySignals.riskLevel === "CRITICAL"
                      ? "rose"
                      : companySignals.riskLevel === "HIGH"
                      ? "rose"
                      : "purple"
                  }
                  className="text-[10px] uppercase font-mono"
                >
                  {companySignals.riskLevel} Risk
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-300 font-semibold">{companySignals.companyName}</p>
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block">Recruiters Flagged</span>
                    <span className="font-bold text-white">{companySignals.recruitersReportedCount}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block">Drives Flagged</span>
                    <span className="font-bold text-white">{companySignals.opportunitiesReportedCount}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-snug">
                  {companySignals.totalReportsCount} total reports aggregated across all company listings.
                </p>
              </div>
            </div>
          )}

          {/* Reporter Information Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Reporter Info
            </span>
            <p className="text-white font-semibold">{report.reporterName}</p>
            <p className="text-slate-400 font-mono text-[11px]">{report.reporterEmail}</p>
            <p className="text-slate-500 text-[10px]">Role: {report.reporterRole || "STUDENT"}</p>
          </div>
        </div>
      </div>

      {/* Enforcement Modal */}
      <Modal isOpen={isEnforceModalOpen} onClose={() => setIsEnforceModalOpen(false)} maxWidth="lg">
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Execute Enforcement Action</h3>
              <p className="text-xs text-slate-400">Target: {report.targetTitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Action Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Enforcement Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as EnforcementActionType)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
              >
                <option value="WARNING">Issue Formal Warning</option>
                <option value="OPPORTUNITY_RESTRICTED">Restrict Opportunity / Drive</option>
                <option value="USER_RESTRICTED">Restrict User Account Capabilities</option>
                <option value="RECRUITER_SUSPENDED">Suspend Recruiter Account</option>
                <option value="COMPANY_SUSPENDED">Suspend Enterprise / Company</option>
                <option value="CONTENT_REMOVED">Remove Flagged Content</option>
                <option value="ACCOUNT_BANNED">Permanent Platform Ban</option>
                <option value="ESCALATED">Escalate to Legal / Executive</option>
              </select>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Enforcement Duration
              </label>
              <select
                value={enforcementDuration}
                onChange={(e) => setEnforcementDuration(e.target.value as EnforcementDuration)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
              >
                <option value="24_HOURS">24 Hours</option>
                <option value="7_DAYS">7 Days</option>
                <option value="30_DAYS">30 Days</option>
                <option value="PERMANENT">Permanent</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Mandatory Compliance Justification <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={enforcementReason}
                onChange={(e) => setEnforcementReason(e.target.value)}
                placeholder="State the confirmed rule violation, evidence findings, and terms of service clause..."
                rows={3}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                required
              />
            </div>

            {/* Warning callout */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                Destructive Action Confirmation
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Executing this action will immediately enforce restrictions across the platform, notify
                the entity, and record an indelible entry in the immutable audit logs.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="outline" size="sm" onClick={() => setIsEnforceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isEnforcing || !enforcementReason.trim()}
              onClick={handleExecuteEnforcement}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              {isEnforcing ? "Executing..." : "Confirm & Execute Enforcement"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resolution Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} maxWidth="md">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Conclude Case #{report.caseNumber}</h3>
              <p className="text-xs text-slate-400">Mark case as {resolutionStatus}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Resolution Notes (Visible to Reporter) <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain the conclusion and actions taken (e.g. Listing updated, official warning issued, or no policy violation found)..."
                rows={4}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="outline" size="sm" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isResolving || !resolutionNotes.trim()}
              onClick={handleResolveCase}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              {isResolving ? "Saving..." : `Conclude as ${resolutionStatus}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
