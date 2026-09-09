"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Flag,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  XCircle,
  FileText,
  User,
  Building2,
  Briefcase,
  X,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ModerationReport, ReportStatus, ReportTargetType } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [targetTypeFilter, setTargetTypeFilter] = useState("ALL");

  // Resolution Modal
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<ReportStatus>("RESOLVED");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (targetTypeFilter !== "ALL") params.append("targetType", targetTypeFilter);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.warn("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, targetTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleOpenResolution = (report: ModerationReport, status: ReportStatus) => {
    setSelectedReport(report);
    setResolutionStatus(status);
    setResolutionNotes("");
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    setResolutionNotes("");
  };

  const handleSaveResolution = async () => {
    if (!selectedReport) return;

    if (!resolutionNotes.trim()) {
      toastError("Resolution notes are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: resolutionStatus,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(`Report marked as ${resolutionStatus}.`);
        handleCloseModal();
        fetchReports();
      } else {
        toastError(data.error || "Failed to update report.");
      }
    } catch (err: any) {
      toastError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetIcon = (type: ReportTargetType) => {
    switch (type) {
      case "DRIVE":
        return <Layers className="w-4 h-4 text-purple-500" />;
      case "USER":
        return <User className="w-4 h-4 text-blue-500" />;
      case "COMPANY":
        return <Building2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Briefcase className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="amber">Pending Investigation</Badge>;
      case "INVESTIGATING":
        return <Badge variant="blue">Under Review</Badge>;
      case "RESOLVED":
        return <Badge variant="emerald">Resolved</Badge>;
      case "DISMISSED":
        return <Badge variant="default">Dismissed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Trust &amp; Safety Moderation
            </span>
            <span className="text-xs text-muted-foreground">{reports.length} Reports Logged</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Moderation &amp; Incident Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Investigate community-flagged postings, duplicate identity detections, and policy violations across candidates and recruiters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border/80 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by reason, target title, details, or reporter..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Target Types</option>
              <option value="DRIVE">Recruitment Drives</option>
              <option value="USER">User Accounts</option>
              <option value="COMPANY">Companies</option>
              <option value="APPLICATION">Applications</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Resolution Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="INVESTIGATING">Under Investigation</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports Feed */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12 text-center text-muted-foreground bg-card">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading moderation queue...
          </Card>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground bg-card">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="font-semibold text-foreground">No reports requiring attention</p>
            <p className="text-xs text-muted-foreground mt-1">Platform moderation queues are fully resolved.</p>
          </Card>
        ) : (
          reports.map((r) => {
            const isPending = r.status === "PENDING" || r.status === "INVESTIGATING";

            return (
              <Card key={r.id} className="p-5 border-border/80 bg-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-muted border border-border">
                      {getTargetIcon(r.targetType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{r.targetTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                          {r.targetType}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                        {r.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    {getStatusBadge(r.status)}
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground/90">
                  {r.details}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
                  <div>
                    Reported by: <span className="font-medium text-foreground">{r.reporterName}</span> ({r.reporterEmail})
                  </div>

                  {r.resolutionNotes && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Resolved by {r.resolvedBy}: &quot;{r.resolutionNotes}&quot;
                    </div>
                  )}

                  {isPending && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenResolution(r, "DISMISSED")}
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => handleOpenResolution(r, "RESOLVED")}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Resolve Incident
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground">
                {resolutionStatus === "RESOLVED" ? "Resolve Report" : "Dismiss Report"}
              </h3>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Target: <strong className="text-foreground">{selectedReport.targetTitle}</strong>
              <br />
              Reason: <span className="text-foreground">{selectedReport.reason}</span>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Resolution Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Detail what administrative action was taken to resolve or dismiss this issue..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={resolutionStatus === "RESOLVED" ? "gradient" : "outline"}
                size="sm"
                onClick={handleSaveResolution}
                isLoading={isSubmitting}
              >
                Confirm {resolutionStatus === "RESOLVED" ? "Resolution" : "Dismissal"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
