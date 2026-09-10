"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  Building2,
  Shield,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Dna,
  UserCheck,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";

interface OverviewData {
  college: any;
  metrics: {
    totalStudents: number;
    eligibleStudents: number;
    activePlacementDrives: number;
    studentsPlaced: number;
    placementRate: number;
    offersReceived: number;
    companiesEngaged: number;
    pendingVerifications: number;
    averagePackage: string;
    highestPackage: string;
  };
  pipelineFunnel: {
    applied: number;
    underReview: number;
    assessment: number;
    interview: number;
    offered: number;
    placed: number;
  };
  recentDrives: any[];
  upcomingInterviews: any[];
  studentCount: number;
}

export default function CollegeDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/college/overview");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load college overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const metrics = data?.metrics;
  const college = data?.college;
  const pipeline = data?.pipelineFunnel;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Institutional Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Placement & Career Development Cell
              </span>
              <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                Active Campus
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {college?.name || "Stanford University"}
            </h1>
            <p className="text-sm text-blue-100/80 max-w-2xl">
              Welcome, {user?.name || "Dr. Ronald Evans"} (Dean of Training & Placements). Real-time campus recruitment intelligence, eligible candidate curation, and multi-tier corporate placement tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/college/eligible-students">
              <Button
                variant="gradient"
                className="shadow-md shadow-blue-500/20 text-xs sm:text-sm h-10 px-4"
                rightIcon={<UserCheck className="w-4 h-4" />}
              >
                Eligible Student Discovery
              </Button>
            </Link>
            <Link href="/college/placement-drives">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm h-10 px-4"
                rightIcon={<Briefcase className="w-4 h-4" />}
              >
                Campus Drives
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Total Enrolled Students"
          value={loading ? "..." : metrics?.totalStudents ?? 0}
          hint="Across all batches"
          icon={<GraduationCap className="w-4 h-4" />}
          iconVariant="blue"
          badge={`${metrics?.pendingVerifications || 0} Pending KYC`}
          badgeVariant="amber"
          href="/college/students"
        />
        <MetricCard
          label="Placement Rate"
          value={loading ? "..." : `${metrics?.placementRate ?? 0}%`}
          hint={`${metrics?.studentsPlaced ?? 0} Students Placed`}
          icon={<TrendingUp className="w-4 h-4" />}
          iconVariant="emerald"
          badge="High Velocity"
          badgeVariant="emerald"
          href="/college/results"
        />
        <MetricCard
          label="Active Campus Drives"
          value={loading ? "..." : metrics?.activePlacementDrives ?? 0}
          hint="Participating Employers"
          icon={<Briefcase className="w-4 h-4" />}
          iconVariant="purple"
          badge="In-Progress"
          badgeVariant="purple"
          href="/college/placement-drives"
        />
        <MetricCard
          label="Total Offers Received"
          value={loading ? "..." : metrics?.offersReceived ?? 0}
          hint="Letters of Intent issued"
          icon={<Award className="w-4 h-4" />}
          iconVariant="emerald"
          href="/college/results"
        />
        <MetricCard
          label="Average Package (CTC)"
          value={loading ? "..." : metrics?.averagePackage ?? "$138,000"}
          hint="Campus Median: $132,000"
          icon={<Award className="w-4 h-4" />}
          iconVariant="blue"
          href="/college/analytics"
        />
        <MetricCard
          label="Highest Package (Super Dream)"
          value={loading ? "..." : metrics?.highestPackage ?? "$210,000"}
          hint="Stripe / OpenAI AI Research"
          icon={<Sparkles className="w-4 h-4" />}
          iconVariant="purple"
          badge="Dream Tier"
          badgeVariant="purple"
          href="/college/results"
        />
        <MetricCard
          label="Corporate Partners"
          value={loading ? "..." : metrics?.companiesEngaged ?? 0}
          hint="Visiting recruiters"
          icon={<Building2 className="w-4 h-4" />}
          iconVariant="blue"
          href="/college/recruiters"
        />
        <MetricCard
          label="Eligible Candidates"
          value={loading ? "..." : metrics?.eligibleStudents ?? 0}
          hint="Meet 3.5+ CGPA criteria"
          icon={<UserCheck className="w-4 h-4" />}
          iconVariant="emerald"
          badge="Criteria Checked"
          badgeVariant="blue"
          href="/college/eligible-students"
        />
      </div>

      {/* Recruitment Pipeline Funnel */}
      <Card className="p-6 rounded-2xl bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Institutional Recruitment Pipeline Funnel
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time progression of {college?.name || "Stanford"} candidates through multi-stage selection
            </p>
          </div>
          <Link href="/college/applications">
            <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Applications
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">1. Applied</span>
            <div className="my-2">
              <span className="text-2xl font-black text-foreground">{loading ? "..." : pipeline?.applied ?? 0}</span>
              <span className="text-xs text-muted-foreground ml-1">candidatures</span>
            </div>
            <div className="w-full bg-blue-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-full" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">2. Reviewing</span>
            <div className="my-2">
              <span className="text-2xl font-black text-foreground">{loading ? "..." : pipeline?.underReview ?? 0}</span>
              <span className="text-xs text-muted-foreground ml-1">candidates</span>
            </div>
            <div className="w-full bg-amber-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full w-[85%]" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">3. Assessment</span>
            <div className="my-2">
              <span className="text-2xl font-black text-foreground">{loading ? "..." : pipeline?.assessment ?? 0}</span>
              <span className="text-xs text-muted-foreground ml-1">taking test</span>
            </div>
            <div className="w-full bg-purple-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full w-[65%]" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">4. Interview</span>
            <div className="my-2">
              <span className="text-2xl font-black text-foreground">{loading ? "..." : pipeline?.interview ?? 0}</span>
              <span className="text-xs text-muted-foreground ml-1">in rounds</span>
            </div>
            <div className="w-full bg-indigo-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-[45%]" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">5. Selected</span>
            <div className="my-2">
              <span className="text-2xl font-black text-foreground">{loading ? "..." : pipeline?.offered ?? 0}</span>
              <span className="text-xs text-muted-foreground ml-1">cleared</span>
            </div>
            <div className="w-full bg-emerald-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-[35%]" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">6. Placed</span>
            <div className="my-2">
              <span className="text-2xl font-black text-foreground">{loading ? "..." : pipeline?.placed ?? 0}</span>
              <span className="text-xs text-muted-foreground ml-1">offers signed</span>
            </div>
            <div className="w-full bg-teal-500/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full w-[30%]" />
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Section: Active Campus Drives & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campus Drives (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Active Campus Recruitment Drives
            </h2>
            <Link href="/college/placement-drives" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View All Drives &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading recruitment drives...</div>
            ) : data?.recentDrives && data.recentDrives.length > 0 ? (
              data.recentDrives.map((drive) => (
                <Card
                  key={drive.id}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-muted border border-border/80 flex items-center justify-center font-bold text-foreground overflow-hidden shrink-0">
                      {drive.companyLogo ? (
                        <img src={drive.companyLogo} alt={drive.company} className="w-full h-full object-cover" />
                      ) : (
                        drive.company.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{drive.title}</h3>
                        <Badge variant="blue" className="text-[10px]">
                          {drive.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {drive.company} &bull; {drive.department} &bull; {drive.location}
                      </p>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                        Compensation: {drive.salaryStipend || "Competitive"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link href={`/college/eligible-students?driveId=${drive.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        View Eligible ({drive.participatingStudentsCount || 0})
                      </Button>
                    </Link>
                    <Link href={`/college/placement-drives`}>
                      <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center text-xs text-muted-foreground rounded-2xl">
                No active recruitment drives at this moment.
              </Card>
            )}
          </div>
        </div>

        {/* Upcoming Interviews & Career DNA preview (1 col) */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Upcoming Interviews
              </h2>
              <Link href="/college/interviews" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Schedule
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading interviews...</div>
              ) : data?.upcomingInterviews && data.upcomingInterviews.length > 0 ? (
                data.upcomingInterviews.map((interview) => (
                  <Card key={interview.id} className="p-3.5 rounded-xl bg-card border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{interview.candidateName}</span>
                      <Badge variant="purple" className="text-[10px]">
                        {interview.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{interview.driveTitle}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-blue-500" /> {interview.date}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-amber-500" /> {interview.time}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-xs text-muted-foreground rounded-xl">
                  No upcoming interviews scheduled today.
                </Card>
              )}
            </div>
          </div>

          {/* Quick Institutional Actions */}
          <Card className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Dna className="w-4 h-4 text-purple-500" />
              Career DNA Skill Intelligence
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluate real skill distribution across departments and identify candidate readiness tiers.
            </p>
            <Link href="/college/career-dna" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-center">
                Explore Institutional Career DNA
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
