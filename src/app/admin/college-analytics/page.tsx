"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  Award,
  Download,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default function AdminCollegeAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/admin/college-analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load institutional analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const pMetrics = data?.platformMetrics;
  const comparisons: any[] = data?.collegeComparisons || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Cross-Institutional Placement Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Macro-level campus benchmarks comparing student enrollment, placement velocity, and corporate partner engagements.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          rightIcon={<Download className="w-3.5 h-3.5" />}
          onClick={() => alert("Downloading Institutional Ecosystem Benchmark Report...")}
        >
          Export Cross-Campus Benchmarks
        </Button>
      </div>

      {/* High-Level Platform Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Total Affiliated Campuses"
          value={loading ? "..." : pMetrics?.totalColleges ?? 6}
          hint={`${pMetrics?.activeColleges ?? 5} Active Campuses`}
          icon={<Building2 className="w-4 h-4" />}
          iconVariant="purple"
        />
        <MetricCard
          label="Total Student Body"
          value={loading ? "..." : pMetrics?.totalStudentsAcrossColleges ?? 32}
          hint="Enrolled candidates in network"
          icon={<Users className="w-4 h-4" />}
          iconVariant="blue"
        />
        <MetricCard
          label="Platform Placement Rate"
          value={loading ? "..." : `${pMetrics?.averagePlacementRate ?? 74}%`}
          hint={`${pMetrics?.totalPlacedAcrossColleges ?? 24} total selections`}
          icon={<TrendingUp className="w-4 h-4" />}
          iconVariant="emerald"
        />
        <MetricCard
          label="Corporate Engagements"
          value={loading ? "..." : pMetrics?.totalParticipationsAcrossColleges ?? 18}
          hint="Campus hiring drives held"
          icon={<Award className="w-4 h-4" />}
          iconVariant="amber"
        />
      </div>

      {/* Comparison Table */}
      <Card className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-500" />
            Institutional Performance Comparison
          </h2>
          <span className="text-xs text-muted-foreground">{comparisons.length} Affiliated Universities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">University</th>
                <th className="py-3 px-4">Campus Location</th>
                <th className="py-3 px-4">Enrolled Candidates</th>
                <th className="py-3 px-4">Placement Rate</th>
                <th className="py-3 px-4">Average Package</th>
                <th className="py-3 px-4">Top Package</th>
                <th className="py-3 px-4">Active Drives</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Loading comparative analytics...
                  </td>
                </tr>
              ) : comparisons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No institutional comparison data available.
                  </td>
                </tr>
              ) : (
                comparisons.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground font-semibold text-purple-600 dark:text-purple-400">
                        {c.code}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {c.location}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {c.enrolledStudents} students
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {c.placementRate}%
                      </span>{" "}
                      <span className="text-[11px] text-muted-foreground">({c.placedStudents} placed)</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {c.averagePackage}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">
                      {c.highestPackage}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-muted-foreground">
                      {c.activeDrives} drives
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/college/dashboard?collegeId=${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600">
                          Inspect Campus <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
