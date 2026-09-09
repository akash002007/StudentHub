"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  GitPullRequest,
  Award,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useAuth } from "@/context/AuthContext";

export default function CollegePlacementDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 1248,
    activeDrives: 14,
    totalApplications: 682,
    studentsPlaced: 312,
  });

  const fetchCollegeOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recruiter/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.activeDrives) setDrives(data.activeDrives);
        if (data.kpis) {
          setStats((prev) => ({
            ...prev,
            activeDrives: data.kpis.activeDrivesCount || prev.activeDrives,
            totalApplications: data.kpis.totalApplicationsCount || prev.totalApplications,
            studentsPlaced: data.kpis.selectedCandidatesCount || prev.studentsPlaced,
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to load college overview:", err);
      setError("Unable to sync latest campus drive telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero */}
      <WelcomeCard
        portalBadge="College Placement Center"
        userName={user?.name || "Placement Officer"}
        title="Campus Placement Command Center"
        description="Coordinate university campus recruitment drives, monitor department placement rates, track student eligibility, and publish auditable placement records."
        primaryAction={{
          label: "View Campus Drives",
          href: "/dashboard/drives",
          icon: <ArrowRight className="w-3.5 h-3.5" />,
        }}
        secondaryAction={{
          label: "Candidate Screening",
          href: "/dashboard/recruiter/screening",
          icon: <ChevronRight className="w-3.5 h-3.5" />,
        }}
        rightWidget={
          <div className="shrink-0 w-full lg:w-72 p-4 rounded-2xl bg-muted/40 border border-border/80 backdrop-blur-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Placement Season &apos;26</span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Phase 1 Live</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full w-[68%]" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                68% Placed
              </span>
              <span className="font-bold text-foreground">312 / 460 Target</span>
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
            onClick={fetchCollegeOverview}
            className="gap-1.5 border-destructive/30 hover:bg-destructive/10 text-destructive"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </Card>
      )}

      {/* 4 Core Placement KPI Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          label="Registered Students"
          value={stats.totalStudents.toLocaleString()}
          hint="All Academic Branches"
          icon={<GraduationCap className="w-4 h-4" />}
          iconVariant="blue"
          isLoading={isLoading}
          href="/dashboard/recruiter/students"
        />
        <MetricCard
          label="Active Campus Drives"
          value={stats.activeDrives.toString()}
          hint="Visiting Employers"
          icon={<Briefcase className="w-4 h-4" />}
          iconVariant="purple"
          isLoading={isLoading}
          href="/dashboard/drives"
        />
        <MetricCard
          label="Student Applications"
          value={stats.totalApplications.toString()}
          hint="In Selection Pipeline"
          icon={<GitPullRequest className="w-4 h-4" />}
          iconVariant="blue"
          isLoading={isLoading}
          href="/dashboard/recruiter/applications"
        />
        <MetricCard
          label="Students Placed"
          value={stats.studentsPlaced.toString()}
          hint="Offers Verified & Locked"
          icon={<Award className="w-4 h-4" />}
          iconVariant="emerald"
          isLoading={isLoading}
          href="/dashboard/recruiter/results"
        />
      </section>

      {/* Quick Access Control Plane */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Campus Drives", href: "/dashboard/drives", icon: Briefcase, desc: "Active listings" },
          { label: "Candidate Screening", href: "/dashboard/recruiter/screening", icon: Users, desc: "Verify criteria" },
          { label: "Selection Pipeline", href: "/dashboard/recruiter/selection", icon: Layers, desc: "Stage manager" },
          { label: "Interviews", href: "/dashboard/recruiter/interviews", icon: Calendar, desc: "Rounds scheduled" },
          { label: "Merit & Offers", href: "/dashboard/recruiter/results", icon: Award, desc: "Locked lists" },
          { label: "Analytics & Trends", href: "/dashboard/recruiter/analytics", icon: BarChart3, desc: "Placement telemetry" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="p-3.5 border-border/80 bg-card hover:border-blue-500/50 hover:shadow-xs transition-all flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-foreground">{item.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </section>

      {/* Main 2-Column Section: Active Placement Drives & Department Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Campus Drives (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Active Campus Placement Drives
              </h2>
              <p className="text-xs text-muted-foreground">
                Company recruitment drives currently accepting student applications
              </p>
            </div>
            <Link
              href="/dashboard/drives"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [1, 2].map((i) => (
                <Card key={i} className="p-5 border-border/80 bg-card rounded-2xl space-y-3 animate-pulse">
                  <div className="h-5 w-40 bg-muted rounded" />
                  <div className="h-4 w-60 bg-muted rounded" />
                </Card>
              ))
            ) : drives.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground bg-card rounded-2xl">
                No active placement drives found.
              </Card>
            ) : (
              drives.slice(0, 3).map((drive) => (
                <Card
                  key={drive.id}
                  className="p-5 border-border/80 bg-card rounded-2xl hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm" className="font-bold uppercase tracking-wider">
                        {drive.status?.replace("_", " ") || "ACTIVE"}
                      </Badge>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {drive.salaryStipend}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground">{drive.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {drive.department} • {drive.location} • {drive.openingsCount} Openings
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dashboard/recruiter/screening?driveId=${drive.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Screening
                      </Button>
                    </Link>
                    <Link href={`/dashboard/drives/${drive.id}`}>
                      <Button size="sm" variant="gradient" className="text-xs">
                        Drive Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Branch Placement Progress & Milestones (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Branch Placement Ratios
          </h2>

          <Card className="p-5 border-border/80 bg-card rounded-2xl space-y-4">
            {[
              { branch: "Computer Science & Engineering", placed: 142, total: 180, pct: 78 },
              { branch: "Information Technology", placed: 98, total: 120, pct: 81 },
              { branch: "Electronics & Communication", placed: 52, total: 90, pct: 57 },
              { branch: "Mechanical & Electrical", placed: 20, total: 70, pct: 28 },
            ].map((b, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{b.branch}</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {b.placed} / {b.total} ({b.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
