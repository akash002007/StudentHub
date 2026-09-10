"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users2,
  GitPullRequest,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Building2,
  UserCheck,
  Award,
  Layers,
  FileText,
  Video,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { getTimeAwareGreeting } from "@/lib/utils";
import { StructuredCandidateModal } from "@/components/recruiter/StructuredCandidateModal";
import { RecruitmentDrive, RecruitmentApplication, CandidateInterviewRecord, RecruiterAuditLogEntry } from "@/types";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useAuth } from "@/context/AuthContext";

export default function RecruiterDashboardHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");

  // Live Server Data States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState({
    activeDrivesCount: 0,
    totalApplicationsCount: 0,
    eligibleCandidatesCount: 0,
    shortlistedCandidatesCount: 0,
    interviewsCount: 0,
    selectedCandidatesCount: 0,
  });
  const [activeDrives, setActiveDrives] = useState<RecruitmentDrive[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecruitmentApplication[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<CandidateInterviewRecord[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<RecruiterAuditLogEntry[]>([]);

  // Candidate Profile Modal
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setGreeting(getTimeAwareGreeting(new Date()));
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recruiter/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.kpis) setKpis(data.kpis);
        if (data.activeDrives) setActiveDrives(data.activeDrives);
        if (data.recentApplications) setRecentApplications(data.recentApplications);
        if (data.upcomingInterviews) setUpcomingInterviews(data.upcomingInterviews);
        if (data.recentAuditLogs) setRecentAuditLogs(data.recentAuditLogs);
      } else {
        setError("Unable to load latest recruiter metrics and active drives.");
      }
    } catch (err) {
      console.warn("Failed to fetch recruiter overview:", err);
      setError("Network error connecting to recruiter overview service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCandidate = (app: RecruitmentApplication) => {
    setSelectedCandidate(app);
    setIsModalOpen(true);
  };

  const handleCandidateStatusUpdate = async (newStatus: string, notes?: string) => {
    if (!selectedCandidate) return;
    try {
      const res = await fetch(`/api/recruiter/applications/${selectedCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) {
        fetchOverviewData();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualOverride = async (newStatus: string, reason: string) => {
    if (!selectedCandidate) return;
    try {
      const res = await fetch(`/api/recruiter/applications/${selectedCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, isOverride: true, overrideReason: reason }),
      });
      if (res.ok) {
        fetchOverviewData();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-8">
        {/* Workspace Hero Header */}
        <WelcomeCard
          portalBadge="Structured Recruitment Workspace"
          userName={user?.name || "Sarah Chen"}
          description="Manage structured recruitment drives, evaluate academic eligibility, coordinate multi-stage assessments, and publish auditable merit lists."
          primaryAction={{
            label: "Create Recruitment Drive",
            href: "/dashboard/recruiter/drives/new",
            icon: <PlusCircle className="w-3.5 h-3.5" />
          }}
          secondaryAction={{
            label: "Screening Workbench",
            href: "/dashboard/recruiter/screening",
            icon: <UserCheck className="w-3.5 h-3.5" />
          }}
          rightWidget={
            <div className="shrink-0 w-full lg:w-72 p-4 rounded-2xl bg-muted/40 border border-border/80 backdrop-blur-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Pipeline Health</span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">RPSC Active</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Total Applicants</span>
                <span className="font-bold text-foreground">{kpis.totalApplicationsCount}</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Eligible Candidates</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{kpis.eligibleCandidatesCount}</span>
              </div>
            </div>
          }
        />

        {error && (
          <Card className="p-4 border-destructive/40 bg-destructive/5 text-destructive flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchOverviewData}
              className="gap-1.5 border-destructive/30 hover:bg-destructive/10 text-destructive"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </Card>
        )}

        {/* 6 Real Database KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <MetricCard
            label="Active Drives"
            value={kpis.activeDrivesCount}
            hint="Live recruitment drives"
            icon={<Briefcase className="w-4 h-4" />}
            iconVariant="blue"
            isLoading={isLoading}
            href="/dashboard/recruiter/drives"
          />

          <MetricCard
            label="Applications"
            value={kpis.totalApplicationsCount}
            hint="Candidate pipeline"
            icon={<GitPullRequest className="w-4 h-4" />}
            iconVariant="blue"
            isLoading={isLoading}
            href="/dashboard/recruiter/applications"
          />

          <MetricCard
            label="Eligible"
            value={kpis.eligibleCandidatesCount}
            hint="100% Criteria Passed"
            icon={<ShieldCheck className="w-4 h-4" />}
            iconVariant="emerald"
            isLoading={isLoading}
            href="/dashboard/recruiter/screening"
          />

          <MetricCard
            label="Shortlisted"
            value={kpis.shortlistedCandidatesCount}
            hint="Passed to Assessment"
            icon={<UserCheck className="w-4 h-4" />}
            iconVariant="purple"
            isLoading={isLoading}
            href="/dashboard/recruiter/selection"
          />

          <MetricCard
            label="Interviews"
            value={kpis.interviewsCount}
            hint="Scheduled & In-Progress"
            icon={<Calendar className="w-4 h-4" />}
            iconVariant="amber"
            isLoading={isLoading}
            href="/dashboard/recruiter/interviews"
          />

          <MetricCard
            label="Selected"
            value={kpis.selectedCandidatesCount}
            hint="Final merit offers"
            icon={<Award className="w-4 h-4" />}
            iconVariant="rose"
            isLoading={isLoading}
            href="/dashboard/recruiter/results"
          />
        </div>

        {/* Recruitment Pipeline Funnel Overview */}
        <Card className="p-5 border-border bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <h2 className="text-base font-bold text-foreground">
                  Structured Recruitment Workflow Funnel
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stage progression pipeline across all active drives.
              </p>
            </div>
            <Link
              href="/dashboard/recruiter/selection"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Stage Manager <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                step: "1. Drive & Criteria",
                label: `${kpis.activeDrivesCount} Active`,
                sub: "Structured rules",
                color: "border-blue-500/30 bg-blue-500/5",
              },
              {
                step: "2. Applications",
                label: `${kpis.totalApplicationsCount} Applied`,
                sub: "Pipeline intake",
                color: "border-blue-500/30 bg-blue-500/5",
              },
              {
                step: "3. Eligibility Check",
                label: `${kpis.eligibleCandidatesCount} Eligible`,
                sub: "Criteria verified",
                color: "border-blue-500/30 bg-emerald-500/5",
              },
              {
                step: "4. Assessment Round",
                label: `${kpis.shortlistedCandidatesCount} In Test`,
                sub: "Score recording",
                color: "border-blue-500/30 bg-blue-500/5",
              },
              {
                step: "5. Interview Round",
                label: `${kpis.interviewsCount} Scheduled`,
                sub: "Evaluations",
                color: "border-blue-500/30 bg-amber-500/5",
              },
              {
                step: "6. Merit & Selection",
                label: `${kpis.selectedCandidatesCount} Selected`,
                sub: "Locked results",
                color: "border-rose-500/30 bg-primary/5",
              },
            ].map((f, i) => (
              <div key={i} className={`p-3 rounded-2xl border ${f.color} space-y-1`}>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {f.step}
                </div>
                <div className="text-sm font-extrabold text-foreground">{f.label}</div>
                <div className="text-[11px] text-muted-foreground">{f.sub}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Two Column Section: Active Recruitment Drives & Upcoming Interviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Drives (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Active Recruitment Drives
                </h2>
                <p className="text-xs text-muted-foreground">
                  Recruitment campaigns currently accepting candidates and undergoing multi-stage evaluation.
                </p>
              </div>
              <Link
                href="/dashboard/recruiter/drives"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View All ({activeDrives.length}) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-5 space-y-4 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-5 w-20 bg-muted rounded" />
                      <div className="h-5 w-16 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="pt-3 border-t border-border flex justify-between">
                      <div className="h-7 w-24 bg-muted rounded" />
                      <div className="h-7 w-20 bg-muted rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : activeDrives.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground bg-card">
                No active recruitment drives found.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeDrives.map((drive) => (
                  <Card
                    key={drive.id}
                    className="p-5 border-border/80 hover:border-blue-500/40 transition-all bg-card flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="purple" size="sm" className="font-bold uppercase tracking-wider">
                          {drive.status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {drive.salaryStipend}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-foreground leading-snug line-clamp-1">
                        {drive.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {drive.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground pt-1">
                        <span className="font-medium text-foreground">{drive.department}</span>
                        <span>•</span>
                        <span>{drive.location}</span>
                        <span>•</span>
                        <span>{drive.openingsCount} Openings</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/80 space-y-3">
                      <div className="grid grid-cols-3 gap-1 text-center text-xs">
                        <div className="p-2 rounded-xl bg-muted/60">
                          <div className="font-extrabold text-foreground">{drive.applicantsCount}</div>
                          <div className="text-[10px] text-muted-foreground">Applied</div>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                          <div className="font-extrabold">{drive.eligibleCount}</div>
                          <div className="text-[10px]">Eligible</div>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                          <div className="font-extrabold">{drive.shortlistedCount}</div>
                          <div className="text-[10px]">Shortlisted</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Link
                          href={`/dashboard/recruiter/screening?driveId=${drive.id}`}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Screen Candidates →
                        </Link>
                        <Link href={`/dashboard/recruiter/results?driveId=${drive.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Merit & Results
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Interviews & Audit Feed (1 Col) */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Upcoming Interviews
                </h2>
                <Link
                  href="/dashboard/recruiter/interviews"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Manage
                </Link>
              </div>

              <div className="space-y-2.5">
                {upcomingInterviews.length === 0 ? (
                  <Card className="p-5 text-center text-xs text-muted-foreground bg-card">
                    No interviews scheduled.
                  </Card>
                ) : (
                  upcomingInterviews.map((int) => (
                    <Card key={int.id} className="p-3.5 bg-card border-border hover:border-blue-500/30 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={int.candidateAvatar} alt={int.candidateName} size="sm" />
                          <div>
                            <div className="text-xs font-bold text-foreground">{int.candidateName}</div>
                            <div className="text-[11px] text-muted-foreground">{int.candidateUniversity}</div>
                          </div>
                        </div>
                        <Badge variant="purple" size="sm" className="text-[10px]">
                          {int.type}
                        </Badge>
                      </div>

                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {int.date} at {int.time}
                        </span>
                        {int.meetingLink && (
                          <a
                            href={int.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                          >
                            <Video className="w-3 h-3" /> Meet
                          </a>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Recent Audit Trail
                </h2>
                <Link
                  href="/dashboard/recruiter/audit-logs"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  All Logs
                </Link>
              </div>

              <div className="space-y-2">
                {recentAuditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border text-[11px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{log.action.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications Table */}
        <Card className="p-5 border-border bg-card shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-blue-500" />
                <h2 className="text-base font-bold text-foreground">Recent Candidate Applications</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect structured candidate qualifications, eligibility pass/fail status, and screening decisions.
              </p>
            </div>
            <Link
              href="/dashboard/recruiter/applications"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Full Pipeline ({kpis.totalApplicationsCount}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">Drive / Position</th>
                  <th className="px-4 py-3 font-semibold">Eligibility Verification</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted" />
                          <div className="space-y-1">
                            <div className="w-24 h-4 bg-muted rounded" />
                            <div className="w-32 h-3 bg-muted rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><div className="w-28 h-4 bg-muted rounded" /></td>
                      <td className="px-4 py-3.5"><div className="w-20 h-5 bg-muted rounded" /></td>
                      <td className="px-4 py-3.5"><div className="w-16 h-4 bg-muted rounded" /></td>
                      <td className="px-4 py-3.5"><div className="w-20 h-5 bg-muted rounded" /></td>
                      <td className="px-4 py-3.5 text-right"><div className="w-16 h-7 bg-muted rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No candidate applications received yet.
                    </td>
                  </tr>
                ) : (
                  recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/40 transition-colors">
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
                      <td className="px-4 py-3.5 text-foreground font-medium">{app.driveTitle}</td>
                      <td className="px-4 py-3.5">
                        {app.eligibility ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              app.eligibility.status === "ELIGIBLE"
                                ? "bg-emerald-500/10 text-emerald-600 border border-blue-500/30"
                                : app.eligibility.status === "REQUIRES_MANUAL_REVIEW"
                                ? "bg-amber-500/10 text-amber-600 border border-blue-500/30"
                                : "bg-primary/10 text-rose-600 border border-rose-500/30"
                            }`}
                          >
                            {app.eligibility.status === "ELIGIBLE" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {app.eligibility.status === "ELIGIBLE"
                              ? "100% Eligible"
                              : app.eligibility.status === "REQUIRES_MANUAL_REVIEW"
                              ? "Review Needed"
                              : "Failed Criteria"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-foreground">{app.currentStageName}</span>
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
                          Inspect Profile
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Candidate Profile / Eligibility Modal */}
        <StructuredCandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          application={selectedCandidate}
          onStatusChange={handleCandidateStatusUpdate}
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
