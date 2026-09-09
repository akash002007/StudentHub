"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Play,
  X,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DriveStatus } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminRecruitmentDrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Status Override Modal
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<DriveStatus | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchDrives = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/drives?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.warn("Failed to fetch drives:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const handleOpenOverrideModal = (drive: any, status: DriveStatus) => {
    setSelectedDrive(drive);
    setTargetStatus(status);
    setReason("");
  };

  const handleCloseModal = () => {
    setSelectedDrive(null);
    setTargetStatus(null);
    setReason("");
  };

  const handleExecuteOverride = async () => {
    if (!selectedDrive || !targetStatus) return;

    if (!reason.trim()) {
      toastError("A justification reason is required for administrative status overrides.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/drives/${selectedDrive.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || `Drive status updated to ${targetStatus}`);
        handleCloseModal();
        fetchDrives();
      } else {
        toastError(data.error || "Failed to update drive status.");
      }
    } catch (err: any) {
      toastError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLICATIONS_OPEN":
      case "PUBLISHED":
        return <Badge variant="emerald">Applications Open</Badge>;
      case "SCREENING":
        return <Badge variant="blue">Screening Phase</Badge>;
      case "SELECTION_IN_PROGRESS":
        return <Badge variant="purple">Selection in Progress</Badge>;
      case "RESULTS_PUBLISHED":
        return <Badge variant="lavender">Results Published</Badge>;
      case "CLOSED":
        return <Badge variant="default">Closed</Badge>;
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
              Campus &amp; Corporate Recruitment
            </span>
            <span className="text-xs text-muted-foreground">{drives.length} Drives Registered</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Recruitment Drives Oversight
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor institutional drives, inspect candidate funnel metrics, review stage rules, and execute administrative status overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDrives} isLoading={isLoading}>
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
              placeholder="Search by drive title, employer, role, or location..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Drive Statuses</option>
              <option value="APPLICATIONS_OPEN">Applications Open</option>
              <option value="SCREENING">Screening Phase</option>
              <option value="SELECTION_IN_PROGRESS">Selection In Progress</option>
              <option value="RESULTS_PUBLISHED">Results Published</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading recruitment drives...
          </div>
        ) : drives.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No recruitment drives found matching current criteria.
          </div>
        ) : (
          drives.map((d) => (
            <Card key={d.id} className="p-5 border-border/80 bg-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        {d.company}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {d.role}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground">{d.title}</h3>
                  </div>

                  <div>{getStatusBadge(d.status)}</div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{d.location}</span>
                  </div>
                  {d.stipend && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{d.stipend}</span>
                    </div>
                  )}
                  {d.endDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>Deadline: {new Date(d.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Candidate Funnel KPI */}
                <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border/60 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-base font-extrabold text-foreground">{d.applicationsCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Candidates</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                      {d.stagesCount || 4}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Stages</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {d.status === "RESULTS_PUBLISHED" ? "Complete" : "In Progress"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Funnel State</p>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  ID: <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{d.id}</code>
                </span>

                <div className="flex items-center gap-2">
                  {d.status !== "CLOSED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                      onClick={() => handleOpenOverrideModal(d, "CLOSED")}
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Close Drive
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => handleOpenOverrideModal(d, "APPLICATIONS_OPEN")}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Re-open Drive
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Override Modal */}
      {selectedDrive && targetStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-foreground">
                  Override Status: {selectedDrive.title}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              You are changing the recruitment status from{" "}
              <strong className="text-foreground">{selectedDrive.status}</strong> to{" "}
              <strong className="text-foreground">{targetStatus}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Justification Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Specify the reason for this administrative intervention..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={targetStatus === "CLOSED" ? "danger" : "gradient"}
                size="sm"
                onClick={handleExecuteOverride}
                isLoading={isSubmitting}
              >
                Apply Override
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
