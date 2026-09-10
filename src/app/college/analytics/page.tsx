"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Building2,
  Calendar,
  Sparkles,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default function CollegeAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/college/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const metrics = data?.metrics;
  const departments = data?.departments || [];
  const salaryBrackets = data?.salaryBrackets || [];
  const monthlyTrend = data?.monthlyTrend || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Institutional Placement Analytics & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            In-depth statistical reporting on placement rates, salary distribution brackets, departmental benchmarks, and monthly hiring velocity.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          rightIcon={<Download className="w-3.5 h-3.5" />}
          onClick={() => alert("Exporting Placement Analytics PDF...")}
        >
          Export Annual Report
        </Button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Overall Placement Rate"
          value={loading ? "..." : `${metrics?.placementRate ?? 0}%`}
          hint="Institution-wide average"
          icon={<TrendingUp className="w-4 h-4" />}
          iconVariant="emerald"
        />
        <MetricCard
          label="Median CTC Package"
          value={loading ? "..." : "$132,000"}
          hint="50th percentile offer"
          icon={<Award className="w-4 h-4" />}
          iconVariant="blue"
        />
        <MetricCard
          label="Average CTC Package"
          value={loading ? "..." : metrics?.averagePackage ?? "$138,000"}
          hint="Mean compensation across drives"
          icon={<Award className="w-4 h-4" />}
          iconVariant="purple"
        />
        <MetricCard
          label="Active Corporate Partners"
          value={loading ? "..." : metrics?.companiesEngaged ?? 0}
          hint="Visits this recruitment cycle"
          icon={<Building2 className="w-4 h-4" />}
          iconVariant="amber"
        />
      </div>

      {/* Salary Distribution Brackets & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Brackets */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              Compensation Package Tier Distribution
            </h2>
            <span className="text-xs text-muted-foreground">CTC Brackets</span>
          </div>

          <div className="space-y-4">
            {salaryBrackets.map((sb: any) => (
              <div key={sb.bracket} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">{sb.bracket}</span>
                  <span className="text-muted-foreground font-medium">
                    {sb.count} offers ({sb.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sb.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Recruitment Velocity */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Monthly Placement Activity Velocity
            </h2>
            <span className="text-xs text-muted-foreground">2026 Cycle</span>
          </div>

          <div className="space-y-3">
            {monthlyTrend.map((m: any) => (
              <div key={m.month} className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">{m.month}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {m.drives} Campus Drives &bull; {m.applications} Applications Processed
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="emerald" className="text-[10px]">
                    {m.selections} Hired
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Departmental Comparison Table */}
      <Card className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-500" />
          Departmental Comparative Performance Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Faculty Department</th>
                <th className="py-3 px-4">Enrolled Candidates</th>
                <th className="py-3 px-4">Eligible Students</th>
                <th className="py-3 px-4">Placed Count</th>
                <th className="py-3 px-4">Placement Rate</th>
                <th className="py-3 px-4 text-right">Active Campus Drives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {departments.map((dept: any) => (
                <tr key={dept.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground">{dept.name}</td>
                  <td className="py-3.5 px-4 font-medium text-foreground">{dept.studentCount}</td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-semibold">{dept.eligibleCount}</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{dept.placedCount}</td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{dept.placementRate}%</td>
                  <td className="py-3.5 px-4 text-right font-medium text-muted-foreground">{dept.activeDrivesCount} Drives</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
