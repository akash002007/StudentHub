"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users2,
  GitPullRequest,
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  PieChart,
  Eye,
  GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";

export default function RecruiterAnalyticsPage() {
  const { recruiterInternships, recruiterApplicants } = useData();
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("30d");

  const totalViews = recruiterInternships.reduce((acc, curr) => acc + curr.viewsCount, 0);
  const totalApps = recruiterInternships.reduce((acc, curr) => acc + curr.applicationsCount, 0);
  const conversionRate = totalViews > 0 ? ((totalApps / totalViews) * 100).toFixed(1) : "0.0";

  const funnelStages = [
    { label: "Total Views", count: totalViews, pct: 100, color: "bg-blue-600" },
    { label: "Applications Received", count: totalApps, pct: 28, color: "bg-indigo-600" },
    { label: "Shortlisted", count: 21, pct: 11, color: "bg-purple-600" },
    { label: "Interviews Scheduled", count: 8, pct: 4.2, color: "bg-amber-600" },
    { label: "Offers Extended", count: 4, pct: 2.1, color: "bg-emerald-600" },
  ];

  const topColleges = [
    { name: "Stanford University", count: 42, pct: 22 },
    { name: "UC Berkeley", count: 38, pct: 20 },
    { name: "Carnegie Mellon University", count: 29, pct: 15 },
    { name: "MIT", count: 26, pct: 13.5 },
    { name: "University of Washington", count: 22, pct: 11.5 },
    { name: "Georgia Tech", count: 18, pct: 9.5 },
  ];

  const topSkills = [
    { skill: "TypeScript / React", frequency: 86 },
    { skill: "Python / PyTorch", frequency: 74 },
    { skill: "Go / Distributed Systems", frequency: 58 },
    { skill: "Docker / Kubernetes", frequency: 49 },
    { skill: "Rust", frequency: 32 },
    { skill: "Figma / UI Design", frequency: 28 },
  ];

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hiring Insights</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Recruitment Analytics
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor talent conversion rates, application funnels, and university pipelines.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border">
            {(["30d", "90d", "all"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === r
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "30d" ? "Last 30 Days" : r === "90d" ? "Last Quarter" : "All Cohorts"}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Listing Views
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {totalViews}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">+18.4%</span> vs last cohort
            </p>
          </Card>

          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Application Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {conversionRate}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Views to submitted applicants
            </p>
          </Card>

          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interview Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              12.4%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">8 candidates</span> in final rounds
            </p>
          </Card>

          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Offer Acceptance
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              85.0%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Acceptance on extended offers
            </p>
          </Card>
        </div>

        {/* Funnel & Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Funnel Progress (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 border-border/80 bg-card space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Hiring Conversion Funnel
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pipeline attrition from job view to accepted summer offer
                  </p>
                </div>
                <Badge variant="purple" size="sm">
                  Summer 2026
                </Badge>
              </div>

              <div className="space-y-4 pt-2">
                {funnelStages.map((stage) => (
                  <div key={stage.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{stage.count} candidates</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          {stage.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                        style={{ width: `${Math.max(stage.pct, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Top Source Universities (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Top Source Campuses
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Colleges generating highest candidate volume
                  </p>
                </div>
                <GraduationCap className="w-4 h-4 text-purple-500" />
              </div>

              <div className="space-y-3 pt-1">
                {topColleges.map((college) => (
                  <div key={college.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground truncate mr-2">
                        {college.name}
                      </span>
                      <span className="text-muted-foreground shrink-0 font-medium">
                        {college.count} apps ({college.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                        style={{ width: `${college.pct * 3.5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Listing-by-Listing Performance Table */}
        <Card className="p-6 border-border/80 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Performance by Role
              </h3>
              <p className="text-xs text-muted-foreground">
                Comparative metrics across all active and past listings
              </p>
            </div>
            <Link href="/dashboard/recruiter/internships">
              <Button variant="ghost" size="sm">
                Manage Roles
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="pb-3 font-semibold">Position Title</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Views</th>
                  <th className="pb-3 font-semibold">Applications</th>
                  <th className="pb-3 font-semibold">Shortlisted</th>
                  <th className="pb-3 font-semibold">Conversion</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {recruiterInternships.map((intern) => {
                  const roleConv =
                    intern.viewsCount > 0
                      ? ((intern.applicationsCount / intern.viewsCount) * 100).toFixed(1)
                      : "0";
                  return (
                    <tr key={intern.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-foreground">
                        {intern.title}
                      </td>
                      <td className="py-3.5 pr-4">
                        <Badge
                          variant={
                            intern.status === "Active"
                              ? "emerald"
                              : intern.status === "Paused"
                              ? "purple"
                              : "rose"
                          }
                          size="sm"
                        >
                          {intern.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 pr-4 text-foreground">{intern.viewsCount}</td>
                      <td className="py-3.5 pr-4 text-foreground">{intern.applicationsCount}</td>
                      <td className="py-3.5 pr-4 text-purple-600 dark:text-purple-400 font-bold">
                        {intern.shortlistedCount}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-foreground">
                        {roleConv}%
                      </td>
                      <td className="py-3.5 text-right">
                        <Link href={`/dashboard/recruiter/applications`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View Applicants &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
