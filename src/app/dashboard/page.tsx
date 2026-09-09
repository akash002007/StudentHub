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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { getTimeAwareGreeting, getStatusBadgeStyle } from "@/lib/utils";
import { CareerDNASummaryCard } from "@/components/dashboard/CareerDNASummaryCard";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user, role, isLoaded } = useAuth();
  const normRole = (role || "STUDENT").toUpperCase();
  const isRecruiter = ["RECRUITER", "COMPANY_ADMIN"].includes(normRole);

  const [greeting, setGreeting] = useState("Good morning");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    try {
      const res = await fetch("/api/student/overview");
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data.overview);
      }
    } catch (err) {
      console.error("Failed to load student overview:", err);
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
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-900/20 via-card to-blue-900/15 border border-purple-500/20 shadow-sm overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gradient" size="sm" className="font-semibold">
                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                Candidate Recruitment Hub
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting},{" "}
              <span className="text-gradient">
                {user?.name ? user.name.split(" ")[0] : "Alex"}
              </span>
              !
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              {kpis.upcomingInterviewsCount > 0 || kpis.upcomingAssessmentsCount > 0
                ? `You have ${kpis.upcomingAssessmentsCount} assessment(s) and ${kpis.upcomingInterviewsCount} interview round(s) scheduled. Keep your profile verified to stand out.`
                : "Explore verified recruitment drives, check your structured eligibility, and track multi-round selection pipelines."}
            </p>
          </div>

          {/* Profile Completion Meter */}
          <div className="p-4 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-md shrink-0 w-full md:w-72 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Profile Strength</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">85%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                style={{ width: "85%" }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Verified Academic Records</span>
              <Link href="/dashboard/profile" className="text-purple-600 font-semibold hover:underline">
                Profile &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Career DNA Summary Section */}
      <CareerDNASummaryCard userId={user?.id} />

      {/* Quick Statistics Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/dashboard/applications">
          <Card hoverEffect className="p-5 border-border/80 bg-card cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Applications
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <GitPullRequest className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {kpis.activeApplicationsCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-purple-600 dark:text-purple-400 font-semibold">In Selection Pipeline</span>
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/assessments">
          <Card hoverEffect className="p-5 border-border/80 bg-card cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assessments
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {kpis.upcomingAssessmentsCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-purple-500 font-semibold">Coding & Technical Tests</span>
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/interviews">
          <Card hoverEffect className="p-5 border-border/80 bg-card cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interviews Scheduled
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {kpis.upcomingInterviewsCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">1-on-1 Engineering Rounds</span>
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/results">
          <Card hoverEffect className="p-5 border-border/80 bg-card cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selections & Merit
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {kpis.selectedCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-amber-500 font-semibold">Official Results Out</span>
            </p>
          </Card>
        </Link>
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
            {recommendedDrives.map((drive: any) => (
              <Card
                key={drive.id}
                hoverEffect
                className="p-5 border-border bg-card space-y-3.5 transition-all"
              >
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
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
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
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Recruitment Events & Recent Applications (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Events Box */}
          {upcomingEvents.length > 0 && (
            <Card className="p-5 border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Upcoming Recruitment Schedule
                  </h3>
                  <p className="text-xs text-muted-foreground">Assigned tests &amp; interview rounds</p>
                </div>
              </div>

              <div className="space-y-3">
                {upcomingEvents.map((evt: any) => (
                  <Link key={evt.id} href={evt.link}>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-xs hover:border-purple-500/40 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground">{evt.title}</div>
                        <div className="text-[11px] text-muted-foreground">{evt.subtitle}</div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
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
          )}

          {/* Active Applications Mini-Tracker */}
          <Card className="p-5 border-border bg-card space-y-4">
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
              {activeApplications.length === 0 ? (
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
