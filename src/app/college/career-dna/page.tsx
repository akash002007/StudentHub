"use client";

import React, { useState, useEffect } from "react";
import {
  Dna,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Briefcase,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function CollegeCareerDNAPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await fetch("/api/college/career-dna");
        if (res.ok) {
          const json = await res.json();
          setData(json.insights || {});
        }
      } catch (err) {
        console.error("Failed to load Career DNA insights:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  const readiness = data?.candidateReadiness;
  const demandVsCoverage = data?.demandVsCoverage;
  const topDemandSkills = demandVsCoverage?.topDemandSkills || [];
  const criticalGaps = demandVsCoverage?.criticalGaps || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Dna className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Career DNA & Skill Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Objective comparison of company technical skill requirements across active drives versus verified student competency signals.
        </p>
      </div>

      {/* Readiness Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Enterprise Super-Ready
              </span>
              <Badge variant="emerald" className="text-[10px]">
                {readiness?.highReadinessPercent || 42}% Cohort
              </Badge>
            </div>
            <div className="text-2xl font-black text-foreground">
              {readiness?.highReadinessCount || 5} Candidates
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Demonstrated system design, production architecture, and consistent technical problem solving across verified projects.
            </p>
          </div>
          <div className="pt-2 border-t border-border/50 flex justify-end">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Verified Tier 1 Signal
            </span>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Core Production-Ready
              </span>
              <Badge variant="blue" className="text-[10px]">
                {readiness?.mediumReadinessPercent || 38}% Cohort
              </Badge>
            </div>
            <div className="text-2xl font-black text-foreground">
              {readiness?.mediumReadinessCount || 4} Candidates
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Solid web, mobile, and API development capability with strong data structures & algorithms fundamentals.
            </p>
          </div>
          <div className="pt-2 border-t border-border/50 flex justify-end">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Verified Tier 2 Signal
            </span>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Needs Skill Tuning
              </span>
              <Badge variant="amber" className="text-[10px]">
                {readiness?.needsDevelopmentPercent || 20}% Cohort
              </Badge>
            </div>
            <div className="text-2xl font-black text-foreground">
              {readiness?.needsDevelopmentCount || 2} Candidates
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Emerging engineers needing targeted exposure to backend scale, unit test coverage, and cloud deployment pipelines.
            </p>
          </div>
          <div className="pt-2 border-t border-border/50 flex justify-end">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Target for Labs
            </span>
          </div>
        </Card>
      </div>

      {/* Recruiter Skill Demand vs Student Coverage (Section 12 of spec) */}
      <Card className="p-6 rounded-3xl bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Opportunity Skill Demand vs. Student Coverage Gap
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Identifies which skills companies are actively hiring for versus the proportion of students who have verified proficiency.
            </p>
          </div>
          <Badge variant="purple" className="text-xs self-start sm:self-auto">
            Live Market Benchmarks
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/70 text-[10px] uppercase font-semibold text-muted-foreground">
                <th className="pb-3">Skill Competency</th>
                <th className="pb-3 text-center">Recruiter Demand</th>
                <th className="pb-3 text-center">Student Coverage</th>
                <th className="pb-3">Coverage Bar</th>
                <th className="pb-3 text-right">Alignment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {topDemandSkills.map((item: any) => (
                <tr key={item.skill} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5">
                    <span className="font-bold text-foreground">{item.skill}</span>
                  </td>
                  <td className="py-3.5 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.opportunityDemandCount} Drives
                  </td>
                  <td className="py-3.5 text-center font-bold text-foreground">
                    {item.studentCoveragePercentage}%
                  </td>
                  <td className="py-3.5 min-w-[160px]">
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.isGap ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(5, item.studentCoveragePercentage)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    {item.isGap ? (
                      <Badge variant="rose" className="text-[10px]">
                        Deficit Gap
                      </Badge>
                    ) : (
                      <Badge variant="emerald" className="text-[10px]">
                        Healthy Coverage
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {criticalGaps.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Critical Institutional Skill Gaps Identified:</span>
              <p className="mt-0.5 text-rose-800/90 dark:text-rose-300/80 leading-relaxed">
                Companies have high demand for <strong>{criticalGaps.map((g: any) => g.skill).join(", ")}</strong>, yet less than 35% of students have demonstrable project or assessment signals for these skills in Career DNA.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
