"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  FileText,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import { EligibilityBreakdownView } from "@/components/recruiter/EligibilityBreakdownView";
import { StructuredCandidateModal } from "@/components/recruiter/StructuredCandidateModal";
import { RecruitmentApplication, RecruitmentDrive, RecruitmentApplicationStatus } from "@/types";

export default function CandidateScreeningPage() {
  const { success, error: toastError } = useToast();

  const [applications, setApplications] = useState<RecruitmentApplication[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"ELIGIBLE" | "FAILED" | "ALL">("ELIGIBLE");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Selected candidate for modal review
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDrives();
    fetchApplications();
  }, [selectedDriveId]);

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/recruiter/drives");
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDriveId !== "all") params.append("driveId", selectedDriveId);

      const res = await fetch(`/api/recruiter/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStatus = async (appId: string, newStatus: RecruitmentApplicationStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/recruiter/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) {
        success(`Candidate marked as ${newStatus.replace("_", " ")}`);
        fetchApplications();
      }
    } catch (err) {
      toastError("Failed to update status.");
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
        success("Manual eligibility override recorded in immutable audit log.");
        fetchApplications();
        setIsModalOpen(false);
      }
    } catch (err) {
      toastError("Failed to record override.");
    }
  };

  const eligibleList = applications.filter((a) => a.eligibility?.status === "ELIGIBLE");
  const failedOrReviewList = applications.filter(
    (a) => a.eligibility?.status === "NOT_ELIGIBLE" || a.eligibility?.status === "REQUIRES_MANUAL_REVIEW"
  );

  const displayedList = (activeTab === "ELIGIBLE"
    ? eligibleList
    : activeTab === "FAILED"
    ? failedOrReviewList
    : applications
  ).filter(
    (a) =>
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Screening Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Candidate Screening Workbench
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Inspect automated eligibility verdicts, review passing & failing academic parameters, and authorize auditable overrides.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchApplications} isLoading={isLoading}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Link href="/dashboard/recruiter/selection">
              <Button variant="gradient" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
                Selection Stages
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab("ELIGIBLE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "ELIGIBLE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Eligible ({eligibleList.length})
            </button>

            <button
              onClick={() => setActiveTab("FAILED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "FAILED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Criteria Failed / Review ({failedOrReviewList.length})
            </button>

            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Applicants ({applications.length})
            </button>
          </div>

          {/* Drive Selector & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter screening..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Screening Cards Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading screening data...</div>
        ) : displayedList.length === 0 ? (
          <Card className="p-12 text-center space-y-2 bg-card border-border">
            <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto" />
            <div className="font-bold text-foreground">No candidate records found in this view</div>
            <p className="text-xs text-muted-foreground">
              Try switching tabs or selecting a different recruitment drive.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {displayedList.map((app) => (
              <Card
                key={app.id}
                className="p-5 border-border/80 hover:border-purple-500/40 transition-all bg-card flex flex-col justify-between space-y-4 shadow-xs"
              >
                {/* Candidate top info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={app.studentAvatar} alt={app.studentName} size="md" />
                      <div>
                        <h2 className="font-extrabold text-sm text-foreground">{app.studentName}</h2>
                        <div className="text-[11px] text-muted-foreground">
                          {app.degree} • {app.university}
                        </div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                          {app.driveTitle}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {app.eligibility ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            app.eligibility.status === "ELIGIBLE"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                              : app.eligibility.status === "REQUIRES_MANUAL_REVIEW"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                          }`}
                        >
                          {app.eligibility.status === "ELIGIBLE" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {app.eligibility.status === "ELIGIBLE"
                            ? "Eligible"
                            : app.eligibility.status === "REQUIRES_MANUAL_REVIEW"
                            ? "Manual Review"
                            : "Failed Criteria"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Criteria Preview Snapshot */}
                  {app.eligibility && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">Criteria Breakdown</span>
                        <span className="font-mono text-muted-foreground">
                          {app.eligibility.passedCount}/{app.eligibility.totalCount} Passed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {app.eligibility.criteria.slice(0, 4).map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 truncate">
                            {c.passed ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            )}
                            <span className="truncate text-muted-foreground">
                              {c.name}: <strong className="text-foreground">{c.candidateValue}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">
                      Current Stage: <strong className="text-foreground">{app.currentStageName}</strong>
                    </span>
                    <Badge variant="purple" size="sm">
                      {app.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold"
                    onClick={() => {
                      setSelectedCandidate(app);
                      setIsModalOpen(true);
                    }}
                  >
                    Inspect Full Profile
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {app.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        onClick={() => handleQuickStatus(app.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                    )}
                    {app.status !== "SHORTLISTED" && app.status !== "IN_SELECTION" && (
                      <Button
                        size="sm"
                        variant="gradient"
                        className="h-8 text-xs"
                        onClick={() => handleQuickStatus(app.id, "SHORTLISTED")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Shortlist
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Structured Candidate Modal with Manual Override */}
        <StructuredCandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          application={selectedCandidate}
          onStatusChange={(status, notes) => {
            if (selectedCandidate) {
              handleQuickStatus(selectedCandidate.id, status, notes);
              setIsModalOpen(false);
            }
          }}
          onManualOverride={handleManualOverride}
        />
      </div>
    </RoleGuard>
  );
}
