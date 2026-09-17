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
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Dna,
  GitPullRequest,
  BarChart3,
  Search,
  ArrowUpRight,
  Download,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlacementIntelligencePayload } from "@/lib/college-intelligence-engine";

export default function CollegePlacementIntelligencePage() {
  const [data, setData] = useState<PlacementIntelligencePayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Dynamic Filter State
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [department, setDepartment] = useState("ALL");
  const [program, setProgram] = useState("ALL");
  const [opportunityType, setOpportunityType] = useState<"ALL" | "FULL_TIME" | "INTERNSHIP">("ALL");
  const [company, setCompany] = useState("ALL");
  const [dateRange, setDateRange] = useState("THIS_YEAR");

  // Interactive Funnel Stage Selection for Dynamic Breakdown
  const [selectedFunnelStageIndex, setSelectedFunnelStageIndex] = useState<number>(2); // Default to "Shortlisted"

  // Placement Trend Metric Toggle
  const [trendMetric, setTrendMetric] = useState<"placed" | "applications" | "interviews" | "internships">("placed");

  // Fetch intelligence data whenever filters change
  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        academicYear,
        department,
        program,
        opportunityType,
        company,
        dateRange,
      });
      const res = await fetch(`/api/college/intelligence?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load placement intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [academicYear, department, program, opportunityType, company, dateRange]);

  const kpis = data?.kpis;
  const funnel = data?.funnel;
  const trends = data?.trends;
  const companies = data?.companyAnalytics || [];
  const departments = data?.departmentAnalytics || [];
  const skills = data?.skillIntelligence;
  const insights = data?.actionableInsights || [];
  const recentActivity = data?.recentActivity || [];

  const selectedFunnelStage = funnel?.stages?.[selectedFunnelStageIndex] || funnel?.stages?.[2];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner & Title */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <BarChart3 className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Institutional Analytics & Outcomes
              </span>
              <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                Live Intelligence
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {data?.college?.name || "Campus"} Placement Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Institutional observer dashboard tracking participation funnels, employer demand, departmental outcomes, and verified skill coverage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/college/reports">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 backdrop-blur-md">
                <Download className="w-3.5 h-3.5" />
                Generate Reports
              </Button>
            </Link>
            <Link href="/college/career-dna">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-lg shadow-indigo-600/30">
                <Dna className="w-3.5 h-3.5" />
                Skill Gap Explorer
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Global Filter Bar */}
      <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dynamic Intelligence Filters</span>
          </div>
          {(department !== "ALL" || program !== "ALL" || opportunityType !== "ALL" || company !== "ALL") && (
            <button
              onClick={() => {
                setDepartment("ALL");
                setProgram("ALL");
                setOpportunityType("ALL");
                setCompany("ALL");
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Academic Year */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full text-xs rounded-xl bg-muted/50 border border-border px-2.5 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="2026-27">2026–27 (Current)</option>
              <option value="2025-26">2025–26</option>
              <option value="2024-25">2024–25</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs rounded-xl bg-muted/50 border border-border px-2.5 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics & Comm</option>
              <option value="Electrical">Electrical Eng</option>
              <option value="Mechanical">Mechanical Eng</option>
              <option value="Civil">Civil Eng</option>
            </select>
          </div>

          {/* Program */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">Program</label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full text-xs rounded-xl bg-muted/50 border border-border px-2.5 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Programs</option>
              <option value="B.Tech">B.Tech / B.E.</option>
              <option value="M.Tech">M.Tech / M.S.</option>
              <option value="MCA">MCA / Computing</option>
            </select>
          </div>

          {/* Opportunity Type */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">Opportunity Type</label>
            <select
              value={opportunityType}
              onChange={(e) => setOpportunityType(e.target.value as any)}
              className="w-full text-xs rounded-xl bg-muted/50 border border-border px-2.5 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Opportunities</option>
              <option value="FULL_TIME">Full-Time Only</option>
              <option value="INTERNSHIP">Internships Only</option>
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">Hiring Partner</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full text-xs rounded-xl bg-muted/50 border border-border px-2.5 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c.company} value={c.company}>{c.company}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full text-xs rounded-xl bg-muted/50 border border-border px-2.5 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="THIS_YEAR">This Academic Year</option>
              <option value="LAST_6_MONTHS">Last 6 Months</option>
              <option value="ALL_TIME">All Time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Total Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {loading ? "..." : (kpis?.totalStudents ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Enrolled Cohort</p>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Active Drives</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {loading ? "..." : (kpis?.activeOpportunities ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Campus Opportunities</p>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Applications</span>
            <GitPullRequest className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {loading ? "..." : (kpis?.applicationsCount ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Participating Pool</p>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {loading ? "..." : (kpis?.shortlistedCount ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {kpis && kpis.applicationsCount > 0 ? `${Math.round((kpis.shortlistedCount / kpis.applicationsCount) * 100)}% ratio` : "—"}
            </p>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Interviews</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {loading ? "..." : (kpis?.interviewsCount ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Rounds Evaluated</p>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Selected</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : (kpis?.selectedCount ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">
              {kpis?.placementRate}% Placement
            </p>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Offers Accepted</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {loading ? "..." : (kpis?.offersAcceptedCount ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">{kpis?.offerAcceptanceRate}% Conversion</p>
          </div>
        </Card>
      </div>

      {/* 4. Placement Funnel & Interactive Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Visual */}
        <Card className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Institutional Recruitment Funnel
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any funnel stage to drill down into departmental distribution and attrition rates.
              </p>
            </div>
            <Badge variant="purple" className="text-[10px] self-start sm:self-auto">
              Interactive Drill-Down
            </Badge>
          </div>

          <div className="space-y-3 pt-2">
            {funnel?.stages.map((stage, idx) => {
              const isSelected = selectedFunnelStageIndex === idx;
              // Colors progressing down the funnel
              const colorSchemes = [
                { bg: "bg-blue-500/10", bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
                { bg: "bg-indigo-500/10", bar: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
                { bg: "bg-cyan-500/10", bar: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400" },
                { bg: "bg-amber-500/10", bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
                { bg: "bg-emerald-500/10", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
                { bg: "bg-purple-500/10", bar: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
              ];
              const scheme = colorSchemes[idx % colorSchemes.length];

              return (
                <div
                  key={stage.stage}
                  onClick={() => setSelectedFunnelStageIndex(idx)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-muted/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500"
                      : "bg-card hover:bg-muted/40 border-border/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground">{stage.count.toLocaleString()}</span>
                      <span className={`text-[10px] font-medium ${scheme.text}`}>{stage.percentage}%</span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
                      style={{ width: `${Math.max(5, stage.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Funnel Stage Department Breakdown */}
        <Card className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Stage Breakdown
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {selectedFunnelStage?.stage || "Selected Stage"}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {selectedFunnelStage?.count.toLocaleString()}
                </span>
                <p className="text-[10px] text-muted-foreground">Candidates</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 mb-4">
              Distribution of candidates in the <strong>{selectedFunnelStage?.stage}</strong> stage across academic faculties:
            </p>

            <div className="space-y-2.5">
              {selectedFunnelStage?.departmentBreakdown && selectedFunnelStage.departmentBreakdown.length > 0 ? (
                selectedFunnelStage.departmentBreakdown.map((dept) => {
                  const pct = selectedFunnelStage.count > 0 ? Math.round((dept.count / selectedFunnelStage.count) * 100) : 0;
                  return (
                    <div key={dept.department} className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
                      <div className="flex items-center justify-between text-xs font-medium mb-1">
                        <span className="truncate pr-2 text-foreground">{dept.department}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{dept.count}</span>
                          <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No departmental records found for this stage.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Aggregated Institutional View</span>
            <Link href="/college/departments" className="text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-0.5">
              View Faculty Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 5. Placement Trends & Velocity */}
      <Card className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Recruitment Velocity & Outcome Trends
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Month-over-month campus recruitment pacing and cumulative placement milestone attainment.
            </p>
          </div>

          {/* Metric Toggle Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60 text-xs">
            <button
              onClick={() => setTrendMetric("placed")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                trendMetric === "placed"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Students Placed
            </button>
            <button
              onClick={() => setTrendMetric("applications")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                trendMetric === "applications"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => setTrendMetric("interviews")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                trendMetric === "interviews"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Interviews
            </button>
            <button
              onClick={() => setTrendMetric("internships")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                trendMetric === "internships"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Internships
            </button>
          </div>
        </div>

        {/* Trend Bar Chart Visualization */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {trends?.dataPoints.map((pt) => {
            const val = pt[trendMetric];
            const maxVal = Math.max(...(trends.dataPoints.map((d) => d[trendMetric]) || [1]));
            const barHeightPct = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;

            return (
              <div key={pt.period} className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between text-center group hover:bg-muted/60 transition-all">
                <span className="text-[11px] font-medium text-muted-foreground">{pt.period}</span>
                
                <div className="my-3 flex items-end justify-center h-28">
                  <div
                    className="w-10 rounded-xl bg-gradient-to-t from-indigo-600 to-purple-500 transition-all duration-500 shadow-md group-hover:scale-105"
                    style={{ height: `${Math.max(12, barHeightPct)}%` }}
                  />
                </div>

                <div>
                  <span className="text-base font-bold text-foreground">{val.toLocaleString()}</span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {pt.placementRate}% Rate
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 6. Company Performance & Department Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Activity Section */}
        <Card className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                Corporate Hiring Partners & Activity
              </h2>
              <Link href="/college/recruiters" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                View All ({companies.length})
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Employer volume, interview engagement, and student selection conversion rates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-[10px] uppercase font-semibold text-muted-foreground">
                  <th className="pb-2">Company</th>
                  <th className="pb-2 text-center">Applied</th>
                  <th className="pb-2 text-center">Interviewed</th>
                  <th className="pb-2 text-center">Selected</th>
                  <th className="pb-2 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {companies.slice(0, 5).map((comp) => (
                  <tr key={comp.company} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center font-bold text-indigo-600 border border-border">
                          {comp.company.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{comp.company}</span>
                          <span className="block text-[10px] text-muted-foreground">{comp.industry || "Enterprise"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{comp.applicationsCount}</td>
                    <td className="py-3 text-center text-muted-foreground">{comp.interviewedCount}</td>
                    <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {comp.selectedCount}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant="purple" className="text-[10px]">
                        {comp.selectionRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/60 flex items-center justify-between">
            <span>Showing top participating employers</span>
            <span>Avg Package: {kpis?.averagePackage}</span>
          </div>
        </Card>

        {/* Department Comparison Section */}
        <Card className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Departmental Benchmarks
              </h2>
              <Link href="/college/departments" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                Deep Dive ({departments.length})
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Comparative cohort outcomes, candidate participation, and top hiring companies by faculty.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-[10px] uppercase font-semibold text-muted-foreground">
                  <th className="pb-2">Department</th>
                  <th className="pb-2 text-center">Eligible</th>
                  <th className="pb-2 text-center">Applied</th>
                  <th className="pb-2 text-center">Selected</th>
                  <th className="pb-2 text-right">Placement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {departments.slice(0, 5).map((dept) => (
                  <tr key={dept.department} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <span className="font-semibold text-foreground block truncate max-w-[140px]">
                        {dept.department}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {dept.topCompanies.slice(0, 2).join(", ")}
                      </span>
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{dept.eligibleCount}</td>
                    <td className="py-3 text-center text-muted-foreground">{dept.appliedCount}</td>
                    <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {dept.selectedCount}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {dept.placementRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/60 flex items-center justify-between">
            <span>Verified institutional records</span>
            <Link href="/college/results" className="text-indigo-600 hover:text-indigo-500 font-medium">
              View Merit Offers &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* 7. Standout Feature: Career DNA & Skill Intelligence (Demand vs Coverage Gap) */}
      <Card className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <Dna className="w-4 h-4" />
              <span>Career DNA Institutional Intelligence</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
              Recruiter Skill Demand vs. Student Career DNA Coverage
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
              Real-time gap analysis comparing required competencies across active recruitment drives against student talent signals verified in Career DNA.
            </p>
          </div>

          <Link href="/college/career-dna">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              Curriculum Insights
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Skill Gap Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {skills?.topDemandSkills.slice(0, 5).map((sk) => (
            <div
              key={sk.skill}
              className={`p-4 rounded-2xl border transition-all ${
                sk.isGap
                  ? "bg-rose-500/5 border-rose-500/30 hover:bg-rose-500/10"
                  : "bg-muted/30 border-border/70 hover:bg-muted/60"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-foreground">{sk.skill}</span>
                {sk.isGap ? (
                  <Badge variant="rose" className="text-[9px] px-1.5 py-0.5">
                    Deficit Gap
                  </Badge>
                ) : (
                  <Badge variant="emerald" className="text-[9px] px-1.5 py-0.5">
                    Aligned
                  </Badge>
                )}
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Recruiter Demand</span>
                    <span className="font-bold text-foreground">{sk.opportunityDemandCount} Drives</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(100, sk.opportunityDemandCount * 18)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Student Coverage</span>
                    <span className={`font-bold ${sk.isGap ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {sk.studentCoveragePercentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sk.isGap ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${sk.studentCoveragePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skill Gap Alert Note */}
        {skills?.criticalGaps && skills.criticalGaps.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Actionable Curriculum Recommendation:</span>
              <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                High recruiter demand observed for{" "}
                <strong>{skills.criticalGaps.map((g) => g.skill).join(", ")}</strong>, but relatively few students currently possess verified project evidence or skill assessments in their Career DNA profile. Recommend targeted workshops.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* 8. Actionable Insights & Recent Informational Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actionable Insights */}
        <Card className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Automated Institutional Insights
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Algorithmically detected trends and changes derived from real campus recruitment and application data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ins.type === "POSITIVE" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {ins.type === "WARNING" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                    {ins.type === "OPPORTUNITY" && <Sparkles className="w-4 h-4 text-indigo-500" />}
                    {ins.type === "INFO" && <Building2 className="w-4 h-4 text-blue-500" />}
                    <span className="text-xs font-bold text-foreground">{ins.title}</span>
                  </div>
                  {ins.impactScore && (
                    <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                      {ins.impactScore} Score
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ins.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Informational Activity Timeline */}
        <Card className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Placement Feed
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Observer feed of verified recruitment milestones.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {recentActivity.map((act) => (
              <div key={act.id} className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  {act.type === "SELECTION" ? "🎉" : act.type === "SHORTLIST" ? "📋" : "💼"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">{act.company}</span>
                    <span className="text-[10px] text-muted-foreground">{act.timestamp}</span>
                  </div>
                  <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">{act.action}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{act.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
