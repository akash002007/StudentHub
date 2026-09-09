"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GitPullRequest,
  Search,
  RefreshCw,
  Building2,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock3,
  Layers,
  Award,
  X,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RecruitmentApplicationStatus } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Status Action Modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<RecruitmentApplicationStatus>("SHORTLISTED");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.warn("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpenStatusModal = (app: any) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setReason("");
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
    setReason("");
  };

  const handleSaveStatus = async () => {
    if (!selectedApp) return;

    if (!reason.trim()) {
      toastError("A justification reason is required for status overrides.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || `Application updated to ${newStatus}`);
        handleCloseModal();
        fetchApplications();
      } else {
        toastError(data.error || "Failed to update application.");
      }
    } catch (err: any) {
      toastError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELECTED":
        return <Badge variant="emerald">Selected</Badge>;
      case "SHORTLISTED":
        return <Badge variant="lavender">Shortlisted</Badge>;
      case "IN_SELECTION":
        return <Badge variant="purple">In Selection</Badge>;
      case "ELIGIBLE":
        return <Badge variant="blue">Eligible</Badge>;
      case "ELIGIBILITY_FAILED":
      case "REJECTED":
        return <Badge variant="rose">{status.replace("_", " ")}</Badge>;
      default:
        return <Badge variant="amber">{status.replace("_", " ")}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Cross-Platform Candidate Pipeline
            </span>
            <span className="text-xs text-muted-foreground">{applications.length} Submissions Monitored</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Application Pipeline Oversight
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Audit candidate applications across all employers, inspect eligibility match engines, and review stage qualification records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchApplications} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border/80 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, application ID, drive, or company..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Application Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="IN_SELECTION">In Selection</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
              <option value="ELIGIBILITY_FAILED">Eligibility Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="overflow-hidden border-border/80 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Recruitment Drive</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Eligibility Match</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <GitPullRequest className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No applications found matching query.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={app.studentAvatar} name={app.studentName} size="sm" />
                        <div>
                          <p className="font-semibold text-foreground">{app.studentName}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-blue-500" />
                            {app.university}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{app.driveTitle}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-blue-500" />
                          {app.company}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <span className="font-medium text-foreground">{app.currentStageName || "Stage 1"}</span>
                      <span className="block text-[10px] text-muted-foreground uppercase">{app.currentStageType || "SCREENING"}</span>
                    </td>
                    <td className="py-3 px-4">
                      {app.eligibility ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold ${
                              app.eligibility.status === "ELIGIBLE" ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {app.eligibility.score}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">({app.eligibility.status})</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStatusModal(app)}
                      >
                        Override Status
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Override Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base text-foreground">
                  Update Status: {selectedApp.studentName}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">New Application Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RecruitmentApplicationStatus)}
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="IN_SELECTION">IN_SELECTION</option>
                <option value="SELECTED">SELECTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Audit Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="State the justification for modifying candidate application status..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="gradient" size="sm" onClick={handleSaveStatus} isLoading={isSubmitting}>
                Apply Status Change
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
