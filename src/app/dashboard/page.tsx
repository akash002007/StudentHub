"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
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
        {/* Left Column: Recommended Open Recruitment Drives (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
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
                  className="p-5 border border-border/80 bg-card rounded-2xl space-y-3.5 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all relative overflow-hidden group z-0"
                >
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
          {/* Upcoming Events Box */}
          {isLoading ? (
            <Card className="p-5 border border-border/80 bg-card rounded-2xl space-y-4 animate-pulse">
              <div className="w-48 h-4 bg-muted rounded-md" />
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 h-16" />
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 h-16" />
              </div>
            </Card>
          ) : upcomingEvents.length > 0 ? (
            <Card className="p-5 border border-border/80 bg-card rounded-2xl space-y-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] relative overflow-hidden z-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Upcoming Recruitment Schedule
                  </h3>
                  <p className="text-xs text-muted-foreground">Assigned tests &amp; interview rounds</p>
                </div>
              </div>

              <div className="space-y-3">
                {upcomingEvents.map((evt: any) => (
                  <Link key={evt.id} href={evt.link}>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-xs hover:border-blue-500/40 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground">{evt.title}</div>
                        <div className="text-[11px] text-muted-foreground">{evt.subtitle}</div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                          {evt.date} {evt.time ? `• ${evt.time}` : ""}
                        </div>
                      </div>

                      <Badge variant="purple" size="sm" className="shrink-0 font-bold">
                        {evt.badge}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

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
