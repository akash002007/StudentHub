"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Search,
  RefreshCw,
  Building2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/context/ToastContext";

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Action Modal
  const [selectedRecruiter, setSelectedRecruiter] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "SUSPENDED" | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchRecruiters = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/recruiters?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecruiters(data.recruiters || []);
      }
    } catch (err) {
      console.warn("Failed to fetch recruiters:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const handleOpenAction = (recruiter: any, status: "ACTIVE" | "SUSPENDED") => {
    setSelectedRecruiter(recruiter);
    setTargetStatus(status);
    setReason("");
  };

  const handleCloseModal = () => {
    setSelectedRecruiter(null);
    setTargetStatus(null);
    setReason("");
  };

  const handleExecuteAction = async () => {
    if (!selectedRecruiter || !targetStatus) return;

    if (!reason.trim()) {
      toastError("A justification reason is required for recruiter status changes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/recruiters/${selectedRecruiter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || `Recruiter status updated to ${targetStatus}`);
        handleCloseModal();
        fetchRecruiters();
      } else {
        toastError(data.error || "Failed to update recruiter.");
      }
    } catch (err: any) {
      toastError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Recruiter Operations
            </span>
            <span className="text-xs text-muted-foreground">{recruiters.length} Recruiters Managed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Recruiter Oversight Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor verified hiring managers, inspect drive ownership, review recruiting volume, and enforce credential suspensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRecruiters} isLoading={isLoading}>
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
              placeholder="Search by recruiter name, email, or company..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Recruiters</option>
              <option value="SUSPENDED">Suspended Recruiters</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Recruiters Table */}
      <Card className="overflow-hidden border-border/80 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Recruiter</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Activity Stats</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading recruiters...
                  </td>
                </tr>
              ) : recruiters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No recruiters found.
                  </td>
                </tr>
              ) : (
                recruiters.map((r) => {
                  const isSuspended = r.status === "SUSPENDED";

                  return (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={r.avatar} name={r.name} size="sm" />
                          <div>
                            <p className="font-semibold text-foreground">{r.name}</p>
                            <p className="text-[11px] text-muted-foreground">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium text-foreground">{r.company || "Independent"}</span>
                          {r.companyVerified && (
                            <span title="Verified Employer">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {r.title || "Talent Acquisition"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span><strong>{r.activeListingsCount || 0}</strong> drives</span>
                          <span><strong>{r.candidatesReviewed || 0}</strong> candidates</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isSuspended ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            Suspended
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </div>
                        )}
                        {r.suspensionReason && (
                          <p className="text-[10px] text-rose-500/80 mt-0.5 max-w-xs truncate">
                            {r.suspensionReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => handleOpenAction(r, "ACTIVE")}
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                            onClick={() => handleOpenAction(r, "SUSPENDED")}
                          >
                            Suspend
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Status Modal */}
      {selectedRecruiter && targetStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                {targetStatus === "SUSPENDED" ? (
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                <h3 className="font-bold text-base text-foreground">
                  {targetStatus === "SUSPENDED"
                    ? `Suspend Recruiter: ${selectedRecruiter.name}`
                    : `Reactivate Recruiter: ${selectedRecruiter.name}`}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Reason / Audit Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="State the reason for this recruiter status change..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={targetStatus === "SUSPENDED" ? "danger" : "gradient"}
                size="sm"
                onClick={handleExecuteAction}
                isLoading={isSubmitting}
              >
                Confirm {targetStatus === "SUSPENDED" ? "Suspension" : "Reactivation"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
