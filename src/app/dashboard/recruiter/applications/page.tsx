"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GitPullRequest,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Send,
  UserCheck,
  Award,
  ChevronDown,
  Layers,
  FileText,
  User,
  SlidersHorizontal,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import { StructuredCandidateModal } from "@/components/recruiter/StructuredCandidateModal";
import { RecruitmentApplication, RecruitmentDrive, RecruitmentApplicationStatus } from "@/types";

export default function RecruiterApplicationsPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [applications, setApplications] = useState<RecruitmentApplication[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriveFilter, setSelectedDriveFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedEligibilityFilter, setSelectedEligibilityFilter] = useState<string>("all");

  // Selection for bulk actions
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchDrives();
  }, [selectedDriveFilter, selectedStatusFilter, selectedEligibilityFilter]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDriveFilter !== "all") params.append("driveId", selectedDriveFilter);
      if (selectedStatusFilter !== "all") params.append("status", selectedStatusFilter);
      if (selectedEligibilityFilter !== "all") params.append("eligibilityStatus", selectedEligibilityFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/recruiter/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/recruiter/drives");
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.warn("Failed fetching drives:", err);
    }
  };

  const handleOpenCandidate = (app: RecruitmentApplication) => {
    setSelectedCandidate(app);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (newStatus: RecruitmentApplicationStatus, notes?: string) => {
    if (!selectedCandidate) return;
    try {
      const res = await fetch(`/api/recruiter/applications/${selectedCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) {
        success(`Status updated to ${newStatus.replace("_", " ")}`);
        fetchApplications();
        setIsModalOpen(false);
      }
    } catch (err) {
      toastError("Failed to update candidate status.");
    }
  };

  const handleManualOverride = async (newStatus: RecruitmentApplicationStatus, reason: string) => {
    if (!selectedCandidate) return;
    try {
      const res = await fetch(`/api/recruiter/applications/${selectedCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, isOverride: true, overrideReason: reason }),
      });
      if (res.ok) {
        success("Manual eligibility override authorized & logged to audit trail.");
        fetchApplications();
        setIsModalOpen(false);
      }
    } catch (err) {
      toastError("Failed to record manual override.");
    }
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.map((a) => a.id));
    }
  };

  const handleToggleSelectApp = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: "SHORTLIST" | "REJECT") => {
    if (selectedAppIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const res = await fetch("/api/recruiter/applications/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: selectedAppIds, action }),
      });
      if (res.ok) {
        const data = await res.json();
        success(`Bulk ${action.toLowerCase()} completed for ${data.processedCount} candidates.`);
        setSelectedAppIds([]);
        fetchApplications();
      }
    } catch (err) {
      toastError("Failed executing bulk action.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pipeline & Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Application Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Multi-criteria candidate review, automated criteria verification, and stage movement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchApplications} isLoading={isLoading}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Link href="/dashboard/recruiter/screening">
              <Button variant="gradient" size="sm" leftIcon={<UserCheck className="w-4 h-4" />}>
                Screening Workbench
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchApplications()}
                placeholder="Search candidates, skills, university..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Drive Filter */}
            <div>
              <select
                value={selectedDriveFilter}
                onChange={(e) => setSelectedDriveFilter(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Recruitment Drives</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Eligibility Filter */}
            <div>
              <select
                value={selectedEligibilityFilter}
                onChange={(e) => setSelectedEligibilityFilter(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Eligibility Results</option>
                <option value="ELIGIBLE">100% Criteria Eligible</option>
                <option value="REQUIRES_MANUAL_REVIEW">Requires Manual Review</option>
                <option value="NOT_ELIGIBLE">Criteria Failed</option>
              </select>
            </div>

            {/* Application Status Filter */}
            <div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Application Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ELIGIBLE">Eligible</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="IN_SELECTION">In Selection Pipeline</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
                <option value="WAITLISTED">Waitlisted</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Banner */}
          {selectedAppIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs">
              <span className="font-bold text-purple-900 dark:text-purple-200">
                {selectedAppIds.length} candidate(s) selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="gradient"
                  isLoading={isBulkProcessing}
                  onClick={() => handleBulkAction("SHORTLIST")}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Bulk Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  isLoading={isBulkProcessing}
                  onClick={() => handleBulkAction("REJECT")}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Bulk Reject
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Applications Data Table */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        applications.length > 0 && selectedAppIds.length === applications.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded accent-purple-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5 font-semibold">Candidate</th>
                  <th className="px-4 py-3.5 font-semibold">Recruitment Drive</th>
                  <th className="px-4 py-3.5 font-semibold">Eligibility Breakdown</th>
                  <th className="px-4 py-3.5 font-semibold">Current Stage</th>
                  <th className="px-4 py-3.5 font-semibold">Application Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Loading candidate applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No applications found matching criteria.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        selectedAppIds.includes(app.id) ? "bg-purple-500/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedAppIds.includes(app.id)}
                          onChange={() => handleToggleSelectApp(app.id)}
                          className="rounded accent-purple-600 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={app.studentAvatar} alt={app.studentName} size="sm" />
                          <div>
                            <div className="font-bold text-foreground">{app.studentName}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {app.degree} • {app.university}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-medium text-foreground">{app.driveTitle}</span>
                        <div className="text-[11px] text-muted-foreground">{app.company}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        {app.eligibility ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                app.eligibility.status === "ELIGIBLE"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                  : app.eligibility.status === "REQUIRES_MANUAL_REVIEW"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                              }`}
                            >
                              {app.eligibility.status === "ELIGIBLE" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              {app.eligibility.status === "ELIGIBLE"
                                ? "PASS"
                                : app.eligibility.status === "REQUIRES_MANUAL_REVIEW"
                                ? "REVIEW"
                                : "FAIL"}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              ({app.eligibility.passedCount}/{app.eligibility.totalCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-foreground">
                        {app.currentStageName}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="purple" size="sm">
                          {app.status.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleOpenCandidate(app)}
                        >
                          Review & Action
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Candidate Profile / Criteria Modal */}
        <StructuredCandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          application={selectedCandidate}
          onStatusChange={handleStatusChange}
          onManualOverride={handleManualOverride}
          onMessage={() => {
            setIsModalOpen(false);
            router.push("/dashboard/recruiter/messages");
          }}
        />
      </div>
    </RoleGuard>
  );
}
