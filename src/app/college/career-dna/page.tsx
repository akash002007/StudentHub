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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/dashboard/MetricCard";

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

  const readinessTiers = [
    {
      tier: "Tier 1: Enterprise Super-Ready",
      percentage: "42%",
      count: 5,
      description: "Exceptional code quality, high LeetCode/Codeforces rating, system design proficiency.",
      color: "emerald",
    },
    {
      tier: "Tier 2: Core Production-Ready",
      percentage: "38%",
      count: 4,
      description: "Solid full-stack development, standard DSA competency, ready for immediate client deployments.",
      color: "blue",
    },
    {
      tier: "Tier 3: Emerging / Needs Skill Tuning",
      percentage: "20%",
      count: 2,
      description: "Needs supplementary training on backend scalability, cloud primitives, and unit testing.",
      color: "amber",
    },
  ];

  const topSkills = [
    { name: "TypeScript & React", count: 8, demand: "Very High", match: 96 },
    { name: "Python & PyTorch", count: 6, demand: "Critical (AI/ML)", match: 92 },
    { name: "Node.js & Express", count: 7, demand: "High", match: 88 },
    { name: "PostgreSQL & Prisma ORM", count: 6, demand: "High", match: 85 },
    { name: "Docker & Containerization", count: 5, demand: "Moderate", match: 78 },
    { name: "Distributed Systems & Kafka", count: 4, demand: "Very High", match: 72 },
  ];

  const skillGaps = [
    {
      skill: "System Design & Architecture",
      currentProficiency: "62%",
      requiredProficiency: "85%",
      recommendation: "Introduce capstone architectural mock rounds prior to Stripe & Datadog drives.",
    },
    {
      skill: "Kubernetes & Cloud Infrastructure",
      currentProficiency: "54%",
      requiredProficiency: "75%",
      recommendation: "Activate hands-on AWS/GCP cluster labs in pre-placement bootcamps.",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Dna className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Institutional Career DNA & Skill Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Aggregate analysis of candidate GitHub activity, algorithmic contest ratings, hackathon evidence, and industry benchmark readiness.
        </p>
      </div>

      {/* Readiness Tiers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {readinessTiers.map((t) => (
          <Card key={t.tier} className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t.tier}</span>
                <Badge
                  variant={t.color === "emerald" ? "emerald" : t.color === "blue" ? "blue" : "amber"}
                  className="text-[10px]"
                >
                  {t.percentage} Cohort
                </Badge>
              </div>
              <div className="text-2xl font-black text-foreground">{t.count} Candidates</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
            </div>
            <div className="pt-2 border-t border-border/50 flex justify-end">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                Verified via Career DNA &rarr;
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Two Column Grid: Top Skills & Identified Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Institutional Skills */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Highest Frequency Technical Competencies
            </h2>
            <span className="text-xs text-muted-foreground">Validated Proof</span>
          </div>

          <div className="space-y-3">
            {topSkills.map((sk) => (
              <div key={sk.name} className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">{sk.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Demand: <span className="font-semibold text-purple-600 dark:text-purple-400">{sk.demand}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{sk.match}% Match</span>
                  <div className="text-[10px] text-muted-foreground">{sk.count} Students</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Skill Gap Analysis */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Identified Skill Gaps vs Corporate Benchmarks
            </h2>
            <Badge variant="amber" className="text-[10px]">Intervention Queue</Badge>
          </div>

          <div className="space-y-4">
            {skillGaps.map((gap) => (
              <div key={gap.skill} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{gap.skill}</span>
                  <span className="text-xs text-muted-foreground">
                    Current: <strong className="text-amber-600 dark:text-amber-400">{gap.currentProficiency}</strong> / Target: {gap.requiredProficiency}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Intervention:</strong> {gap.recommendation}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Generate Department Curriculum Alignment
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
