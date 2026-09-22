"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Briefcase,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Users2,
  Award,
  Bookmark,
  Calendar,
  Layers,
  ChevronRight,
  FileText,
  Video,
  Building2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { getTimeAwareGreeting, getStatusBadgeStyle } from "@/lib/utils";
import { CareerDNASummaryCard } from "@/components/dashboard/CareerDNASummaryCard";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { normalizeVerificationStatus } from "@/lib/student-access-policy";
import { RejectedAccountScreen } from "@/components/shared/RejectedAccountScreen";
import { Lock, ShieldAlert, CheckCircle } from "lucide-react";
import { StudentProfile } from "@/types";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user, role, isLoaded } = useAuth();
  const normRole = (role || "STUDENT").toUpperCase();
  const isRecruiter = ["RECRUITER", "COMPANY_ADMIN"].includes(normRole);

  const [greeting, setGreeting] = useState("Good morning");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isRecruiter) {
      router.replace("/dashboard/recruiter");
    }
  }, [isLoaded, isRecruiter, router]);

  useEffect(() => {
    if (!isRecruiter) {
      setGreeting(getTimeAwareGreeting(new Date()));
      fetchOverview();
    }
  }, [isRecruiter]);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/overview");
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data.overview);
      } else {
        setError("Unable to load latest recruitment dashboard data.");
      }
    } catch (err) {
      console.error("Failed to load student overview:", err);
      setError("Network error connecting to student overview service.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoaded && isRecruiter) {
    return null;
  }

  const student = user as StudentProfile | null;
  const normVerif = normalizeVerificationStatus(student?.verificationStatus);

  if (normVerif === "REJECTED") {
    return <RejectedAccountScreen />;
  }

  const isUnderManualReview =
    normVerif === "MANUAL_REVIEW_REQUESTED" || normVerif === "UNDER_REVIEW";

  const kpis = overviewData?.kpis || {
    activeApplicationsCount: 0,
    upcomingAssessmentsCount: 0,
    upcomingInterviewsCount: 0,
    selectedCount: 0,
    openDrivesCount: 0,
  };

  const upcomingEvents = overviewData?.upcomingEvents || [];
  const recommendedDrives = overviewData?.recommendedDrives || [];
  const activeApplications = overviewData?.activeApplications || [];

  return (
    <div className="space-y-8">
      {/* Dynamic Greeting & Career Overview Banner */}
      <WelcomeCard
        portalBadge="Candidate Recruitment Hub"
        userName={user?.name}
        description={
          kpis.upcomingInterviewsCount > 0 || kpis.upcomingAssessmentsCount > 0
            ? `You have ${kpis.upcomingAssessmentsCount} assessment(s) and ${kpis.upcomingInterviewsCount} interview round(s) scheduled. Keep your profile verified to stand out.`
            : "Explore verified recruitment drives, check your structured eligibility, and track multi-round selection pipelines."
        }
      />

      {/* Restricted Student Workspace (Section 8) */}
      {isUnderManualReview && (
        <Card className="p-6 sm:p-7 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
                🔒
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                  Account Verification
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your student verification is currently under manual review.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/50 text-amber-700 dark:text-amber-300 font-bold px-3 py-1 bg-amber-500/15 text-xs w-fit"
            >
              {normVerif === "UNDER_REVIEW"
                ? "Under Review"
                : "Manual Review Requested"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-card border border-amber-500/30 space-y-1">
              <span className="text-muted-foreground font-medium">
                Verification Status:
              </span>
              <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <span>👤</span>
                {normVerif === "UNDER_REVIEW"
                  ? "Officer Under Review"
                  : "Manual Review Requested"}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-amber-500/30 space-y-1">
              <span className="text-muted-foreground font-medium">Document:</span>
              <p className="font-bold text-foreground text-sm">
                {student?.verificationRequest?.documentName ||
                  "Student Verification Document"}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-amber-500/30 space-y-1">
              <span className="text-muted-foreground font-medium">Requested:</span>
              <p className="font-bold text-foreground text-sm">
                {student?.verificationRequest?.submittedAt || "Recently Submitted"}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">
                Some CommandSkill features are temporarily locked:
              </span>{" "}
              Career DNA, Connected Accounts, and Job/Internship Applications will
              automatically unlock once verified.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/onboarding?step=overview">
                <Button
                  size="sm"
                  variant="gradient"
                  className="text-xs font-semibold"
                >
                  Review Status
                </Button>
              </Link>
              <Link href="/dashboard/documents">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold"
                >
                  View Documents
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Global Section Error Banner if Overview Failed */}
      {error && (
        <Card className="p-5 border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Dashboard Overview Unavailable</h3>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            className="text-xs font-semibold shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry
          </Button>
        </Card>
      )}

      {/* Career DNA Summary Section */}
      <CareerDNASummaryCard userId={user?.id} />

      {/* Quick Statistics Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          label="Active Applications"
          value={kpis.activeApplicationsCount}
          hint={<span className="text-blue-600 dark:text-blue-400 font-semibold">In Selection Pipeline</span>}
          icon={<GitPullRequest className="w-4 h-4" />}
          iconVariant="blue"
          href="/dashboard/applications"
          isLoading={isLoading}
        />

        <MetricCard
          label="Assessments"
          value={kpis.upcomingAssessmentsCount}
          hint={<span className="text-blue-500 font-semibold">Coding &amp; Technical Tests</span>}
          icon={<FileText className="w-4 h-4" />}
          iconVariant="blue"
          href="/dashboard/assessments"
          isLoading={isLoading}
        />

        <MetricCard
          label="Interviews Scheduled"
          value={kpis.upcomingInterviewsCount}
          hint={<span className="text-emerald-500 font-semibold">1-on-1 Engineering Rounds</span>}
          icon={<Calendar className="w-4 h-4" />}
          iconVariant="emerald"
          href="/dashboard/interviews"
          isLoading={isLoading}
        />

        <MetricCard
          label="Selections & Merit"
          value={kpis.selectedCount}
          hint={<span className="text-amber-500 font-semibold">Official Results Out</span>}
          icon={<Award className="w-4 h-4" />}
          iconVariant="amber"
          href="/dashboard/results"
          isLoading={isLoading}
        />
      </div>

      {/* Main 2-Column Section: Open Recruitment Opportunities & Application/Events Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recommended Open Recruitment Drives (7 cols) with subtle atmospheric container */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-blue-50/40 via-card/40 to-transparent dark:from-blue-950/15 dark:via-card/20 border border-blue-500/10 dark:border-border/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Featured Recruitment Drives
              </h2>
              <p className="text-xs text-muted-foreground">
                Verified opportunities matching your branch, graduation year, and skills
              </p>
            </div>
            <Link href="/dashboard/drives">
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View All Drives
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2].map((i) => (
                  <Card key={i} className="p-5 border border-outline-variant bg-surface-container-lowest space-y-3.5 animate-pulse">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                        <div className="space-y-2">
                          <div className="w-44 h-4 bg-muted rounded-md" />
                          <div className="w-32 h-3 bg-muted/70 rounded-md" />
                        </div>
                      </div>
                      <div className="w-20 h-5 bg-muted rounded-full shrink-0" />
                    </div>
                    <div className="w-full h-8 bg-muted/50 rounded-md" />
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <div className="flex gap-1.5">
                        <div className="w-14 h-4 bg-muted rounded-md" />
                        <div className="w-14 h-4 bg-muted rounded-md" />
                      </div>
                      <div className="w-28 h-7 bg-muted rounded-xl" />
                    </div>
                  </Card>
                ))}
              </>
            ) : recommendedDrives.length === 0 ? (
              <Card className="p-8 text-center border-dashed border border-border bg-card/60">
                <Building2 className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-foreground">No Drives Currently Available</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  There are no verified recruitment drives matching your profile at this moment. Check back soon!
                </p>
              </Card>
            ) : (
              recommendedDrives.map((drive: any) => (
                <Card
                  key={drive.id}
                  hoverEffect
                  className="p-5 border border-border/80 bg-card/95 rounded-2xl space-y-3.5 shadow-xs hover:border-blue-500/40 hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.08)] transition-all relative overflow-hidden group z-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.05] via-transparent to-cyan-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0 p-1 flex items-center justify-center">
                        {drive.companyLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={drive.companyLogo}
                            alt={drive.company}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                          {drive.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {drive.company} • {drive.location} ({drive.workMode}) •{" "}
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {drive.salaryStipend}
                          </span>
                        </p>
                      </div>
                    </div>

                    <Badge variant="purple" size="sm" className="font-bold shrink-0">
                      {drive.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {drive.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {drive.eligibilityCriteria?.requiredSkills?.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80 border border-border/40"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Link href={`/dashboard/drives/${drive.id}`}>
                      <Button variant="gradient" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                        Check Eligibility &amp; Apply
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Recruitment Events & Recent Applications (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Events Box (Section 19: Unified Dashboard Upcoming Widget) */}
          {isLoading ? (
            <Card className="p-5 border border-border/80 bg-card rounded-2xl space-y-4 animate-pulse">
              <div className="w-48 h-4 bg-muted rounded-md" />
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 h-16" />
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 h-16" />
              </div>
            </Card>
          ) : (
            <Card className="p-5 border border-border/80 bg-card rounded-2xl space-y-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] relative overflow-hidden z-0">
              <div className="flex items-center justify-between pb-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      UPCOMING
                    </span>
                    <h3 className="font-bold text-xs text-foreground">
                      Career Activities &amp; Timeline
                    </h3>
                  </div>
                </div>
                <Link
                  href="/dashboard/calendar"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Calendar →
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <p className="font-semibold">No upcoming career activities.</p>
                  <p className="text-[11px] opacity-75 mt-0.5">Explore open recruitment drives to schedule interviews.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((evt: any) => {
                    const isToday = evt.date === "2026-09-17";
                    const isTomorrow = evt.date === "2026-09-18";
                    const isFinal = evt.isFinalRound || (evt.badge || "").toLowerCase().includes("final");
                    const dateHeader = isToday ? "Today" : isTomorrow ? "Tomorrow" : "28 Sept";

                    return (
                      <div key={evt.id} className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                          {dateHeader}
                        </span>
                        <Link href={evt.link || "/dashboard/calendar"}>
                          <div
                            className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all hover:scale-[1.01] cursor-pointer ${
                              isFinal
                                ? "bg-rose-500/5 border-rose-500/30 ring-1 ring-rose-500/15"
                                : evt.type === "INTERVIEW"
                                ? "bg-muted/40 border-border hover:border-indigo-500/40"
                                : "bg-muted/40 border-border hover:border-purple-500/40"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base shrink-0">
                                {evt.type === "INTERVIEW" ? "🎥" : evt.type === "ASSESSMENT" ? "📋" : "📅"}
                              </span>
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-foreground truncate flex items-center gap-1.5">
                                  <span>{evt.title}</span>
                                  {isFinal && (
                                    <Badge variant="rose" className="text-[9px] px-1.5 py-0 font-extrabold">
                                      Final Round
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">{evt.subtitle}</div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-2">
                              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {evt.time || "10:00 AM"}
                              </div>
                              <span className="text-[9px] text-muted-foreground">Scheduled</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-border/40">
                <Link href="/dashboard/calendar" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 font-semibold">
                    View Calendar
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Active Applications Mini-Tracker */}
          <Card className="p-5 border border-border/80 bg-card rounded-2xl space-y-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] relative overflow-hidden z-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Application Pipeline</h3>
                <p className="text-xs text-muted-foreground">Your active recruitment stages</p>
              </div>
              <Link href="/dashboard/applications">
                <Button variant="ghost" size="sm">
                  Full Pipeline
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-2.5 animate-pulse">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 h-14" />
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 h-14" />
                </div>
              ) : activeApplications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No applications submitted yet.
                </div>
              ) : (
                activeApplications.map((app: any) => (
                  <Link key={app.id} href={`/dashboard/applications`}>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs hover:bg-muted/70 transition-colors">
                      <div className="overflow-hidden text-left min-w-0 pr-2">
                        <div className="font-bold text-foreground truncate">{app.driveTitle}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {app.company} • Stage: <strong>{app.currentStageName}</strong>
                        </div>
                      </div>

                      <Badge variant="outline" size="sm" className="shrink-0 font-bold">
                        {app.status}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
