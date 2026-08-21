"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dna,
  Sparkles,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  Github,
  CheckCircle2,
  ArrowUpRight,
  Code2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CareerDNASummaryData {
  connected: boolean;
  exists: boolean;
  score?: number;
  scoreLabel?: string;
  analysisConfidence?: number;
  trend?: string | null;
  projectsAnalyzed?: number;
  primaryStrength?: string;
  topSkills?: string[];
  assessment?: string;
  evidence?: Array<{
    projectName: string;
    skills: string[];
    description: string;
    repositoryUrl: string;
  }>;
  recommendations?: Array<{
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  isStale?: boolean;
  lastAnalyzedAt?: string;
  message?: string;
}

interface CareerDNASummaryCardProps {
  userId?: string;
}

export function CareerDNASummaryCard({ userId }: CareerDNASummaryCardProps) {
  const router = useRouter();
  const [data, setData] = useState<CareerDNASummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/career-dna/summary?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json: CareerDNASummaryData = await res.json();
        setData(json);
      }
    } catch {
      console.warn("Failed to fetch Career DNA summary");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleReanalyze = async () => {
    if (!userId) return;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/integrations/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setTimeout(() => {
          fetchSummary();
          setIsRefreshing(false);
        }, 2000);
      } else {
        setIsRefreshing(false);
      }
    } catch {
      setIsRefreshing(false);
    }
  };

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <Card className="p-6 border-border/80 bg-card space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-muted rounded-md" />
              <div className="w-48 h-3 bg-muted/60 rounded-md" />
            </div>
          </div>
          <div className="w-24 h-6 bg-muted rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
          <div className="w-24 h-24 rounded-full bg-muted mx-auto" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-muted rounded-md" />
            <div className="w-full h-12 bg-muted/60 rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-muted rounded-md" />
            <div className="w-full h-12 bg-muted/60 rounded-md" />
          </div>
        </div>
      </Card>
    );
  }

  // 2. EMPTY STATE: GITHUB NOT CONNECTED
  if (!data || !data.connected) {
    return (
      <Card hoverEffect className="p-6 border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Dna className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Unlock your Career DNA</h2>
              <Badge variant="purple" size="sm" className="font-semibold">
                <Sparkles className="w-3 h-3 mr-1" /> Powered by GitHub AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Connect your GitHub account to automatically extract project intelligence, analyze skills, and build your evidence-based Career DNA profile.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/dashboard/connected-accounts")}
          className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shrink-0"
        >
          <Github className="w-4 h-4 mr-2" /> Connect GitHub &rarr;
        </Button>
      </Card>
    );
  }

  // 3. CONNECTED BUT DATA PENDING / ZERO DATA
  if (!data.exists) {
    return (
      <Card hoverEffect className="p-6 border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border/60 flex items-center justify-center text-purple-500 shrink-0">
            <Dna className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Career DNA Analysis Pending</h2>
            <p className="text-xs text-muted-foreground">
              Your GitHub repositories are linked. Click below to analyze your project code evidence.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReanalyze}
          disabled={isRefreshing}
          className="text-xs font-semibold shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Analyzing..." : "Analyze Career DNA"}
        </Button>
      </Card>
    );
  }

  // 4. FULL CONNECTED SUMMARY VIEW
  const {
    score = 0,
    scoreLabel = "Good",
    analysisConfidence = 85,
    trend,
    projectsAnalyzed = 0,
    primaryStrength = "Software Engineering",
    topSkills = [],
    assessment = "",
    evidence = [],
    recommendations = [],
    isStale = false,
    lastAnalyzedAt,
  } = data;

  const timeAgoStr = lastAnalyzedAt
    ? `Last analyzed ${new Date(lastAnalyzedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Recently analyzed";

  return (
    <Card hoverEffect className="p-6 border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-950/15 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Career DNA</h2>
              <Badge variant="purple" size="sm" className="font-semibold text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" /> Powered by GitHub AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered analysis of your projects, skills, and GitHub activity.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/career-dna"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
        >
          View Full Career DNA <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* STALE DATA BANNER */}
      {isStale && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4 text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>GitHub data updated — Career DNA needs a refresh.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            disabled={isRefreshing}
            className="text-[11px] h-7 border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Re-analyzing..." : "Re-analyze Career DNA"}
          </Button>
        </div>
      )}

      {/* Main Grid: Score (Left) + Insights & Assessment (Middle) + Next Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Score Meter */}
        <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
          <div className="space-y-3 text-center sm:text-left">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
              Career Score
            </span>

            <div className="flex items-center justify-center sm:justify-start gap-4">
              <div className="relative w-20 h-20 rounded-full bg-purple-500/10 border-4 border-purple-500 flex flex-col items-center justify-center text-center shrink-0 shadow-md shadow-purple-500/10">
                <span className="text-2xl font-extrabold text-foreground">{score}</span>
                <span className="text-[9px] font-bold text-purple-500 uppercase">/ 100</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm" className="font-bold text-xs">
                    {scoreLabel}
                  </Badge>
                  {trend && (
                    <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {trend}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Confidence rating: <span className="font-bold text-foreground">{analysisConfidence}%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-xs">
            <div className="p-2 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Projects Analyzed</span>
              <span className="font-bold text-foreground text-sm">{projectsAnalyzed}</span>
            </div>
            <div className="p-2 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Primary Strength</span>
              <span className="font-semibold text-foreground text-xs truncate block" title={primaryStrength}>
                {primaryStrength}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Column: AI Assessment & Evidence */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Assessment */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Assessment
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {assessment}
            </p>
          </div>

          {/* Top Evidence Items */}
          {evidence && evidence.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Physical Evidence
                </span>
                <Link
                  href="/dashboard/career-dna"
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                >
                  View all evidence &rarr;
                </Link>
              </div>

              <div className="space-y-2">
                {evidence.slice(0, 2).map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span className="flex items-center gap-1.5 truncate">
                        <FolderGit2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{ev.projectName}</span>
                      </span>
                      <div className="flex gap-1 shrink-0">
                        {ev.skills.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Next Best Actions */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Next Best Actions
            </h4>

            <div className="space-y-2">
              {recommendations && recommendations.length > 0 ? (
                recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-2.5 rounded-xl bg-card border border-border/60 text-xs space-y-1 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-[11px]">{rec.title}</span>
                      <Badge variant={rec.priority === "high" ? "rose" : "amber"} size="sm" className="text-[9px] uppercase px-1.5 py-0">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{rec.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No immediate gaps detected.</p>
              )}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/40">
            <span>{timeAgoStr}</span>
            <Link
              href="/dashboard/career-dna"
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              View Full Career DNA &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
