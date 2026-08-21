"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Dna,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Code2,
  FileCode,
  History,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CareerDNA, CareerDNAScoreDimensions } from "@/types";

interface CareerDNADisplayProps {
  userId: string;
}

export function CareerDNADisplay({ userId }: CareerDNADisplayProps) {
  const [dna, setDna] = useState<CareerDNA | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCareerDNA = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/career-dna?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.exists && json.careerDNA) {
          setDna(json.careerDNA);
        } else {
          setDna(null);
        }
      }
    } catch {
      console.warn("Failed to fetch Career DNA");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCareerDNA();
  }, [fetchCareerDNA]);

  if (isLoading) {
    return null;
  }

  if (!dna) {
    return null; // Don't render until Career DNA exists
  }

  const {
    overallScore,
    analysisConfidence,
    dimensions,
    dimensionExplanations,
    evidences,
    topSkills,
    summary,
    potentialCareerDirections,
    skillGaps,
    history,
  } = dna;

  const dimensionList: Array<{ key: keyof CareerDNAScoreDimensions; label: string; score: number; weight: string }> = [
    { key: "technicalDepth", label: "Technical Depth", score: dimensions.technicalDepth, weight: "25%" },
    { key: "projectComplexity", label: "Project Complexity", score: dimensions.projectComplexity, weight: "20%" },
    { key: "technicalBreadth", label: "Technical Breadth", score: dimensions.technicalBreadth, weight: "15%" },
    { key: "engineeringQuality", label: "Engineering Quality", score: dimensions.engineeringQuality, weight: "15%" },
    { key: "problemSolving", label: "Problem Solving", score: dimensions.problemSolving, weight: "10%" },
    { key: "projectCompleteness", label: "Project Completeness", score: dimensions.projectCompleteness, weight: "10%" },
    { key: "consistency", label: "Consistency & Cadence", score: dimensions.consistency, weight: "5%" },
  ];

  return (
    <div className="space-y-6 pt-6 border-t border-border/60">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Evidence-Based Career DNA
              <Badge variant="purple" size="sm" className="font-semibold">
                v{dna.scoringVersion || "1.0"}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Calculated deterministically from repository code evidence • AI interpreted
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Deterministic Reproducible Engine</span>
        </div>
      </div>

      {/* Main Score & Confidence Header Card */}
      <Card hoverEffect className="p-6 border-border/80 bg-gradient-to-br from-card via-card to-purple-500/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Overall Score Circle */}
          <div className="flex items-center gap-4 border-r-0 md:border-r border-border/40 pr-0 md:pr-6">
            <div className="relative w-24 h-24 rounded-full bg-purple-500/10 border-4 border-purple-500 flex flex-col items-center justify-center text-center shrink-0 shadow-lg shadow-purple-500/10">
              <span className="text-3xl font-extrabold text-foreground tracking-tight">{overallScore}</span>
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">/ 100</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Career DNA Score</span>
              <h3 className="text-base font-bold text-foreground mt-0.5">Overall Technical Score</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Calculated mathematically across 7 evidence dimensions.
              </p>
            </div>
          </div>

          {/* Analysis Confidence */}
          <div className="flex items-center gap-4 border-r-0 md:border-r border-border/40 pr-0 md:pr-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-xl font-extrabold text-emerald-500">{analysisConfidence}%</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Confidence</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Evidence Quality</span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">Analysis Confidence</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Reflects evidence volume, source diversity, and repository depth.
              </p>
            </div>
          </div>

          {/* AI Interpretation Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500">
              <Sparkles className="w-3.5 h-3.5" /> AI Evidence Interpretation
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "{summary}"
            </p>
          </div>
        </div>

        {/* Historical Progression Timeline */}
        {history && history.length > 0 && (
          <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <History className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-foreground">Score Evolution:</span>
              <div className="flex items-center gap-2">
                {history.map((snap, idx) => (
                  <React.Fragment key={snap.snapshotId}>
                    <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {snap.overallScore}
                    </span>
                    {idx < history.length - 1 && <span className="text-muted-foreground">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">Updated {new Date(dna.updatedAt).toLocaleDateString()}</span>
          </div>
        )}
      </Card>

      {/* 7 Score Dimensions Breakdown Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" /> Score Dimension Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensionList.map((dim) => (
            <Card key={dim.key} hoverEffect className="p-4 border-border/80 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{dim.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Weight: {dim.weight}</span>
                  <Badge variant="emerald" size="sm" className="font-bold">
                    {dim.score} / 100
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  style={{ width: `${dim.score}%` }}
                  className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all duration-500"
                />
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                {dimensionExplanations[dim.key as keyof CareerDNAScoreDimensions] || "Verified from repository evidence."}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Career Directions & Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Potential Career Directions */}
        <Card hoverEffect className="p-5 border-border/80 bg-card space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Evidence-Supported Career Paths
          </h4>
          <p className="text-xs text-muted-foreground">Career trajectories directly matching your technical evidence profile:</p>

          <div className="space-y-2 pt-1">
            {potentialCareerDirections.map((direction) => (
              <div key={direction} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{direction}</span>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              </div>
            ))}
          </div>
        </Card>

        {/* Actionable Skill Gaps */}
        <Card hoverEffect className="p-5 border-border/80 bg-card space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Actionable Growth Areas &amp; Skill Gaps
          </h4>
          <p className="text-xs text-muted-foreground">Areas where additional repository evidence would increase your Career DNA score:</p>

          <div className="space-y-2 pt-1">
            {skillGaps.map((gap) => (
              <div key={gap} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                <span className="font-medium">{gap}</span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-amber-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Physical Evidence Trail */}
      {evidences && evidences.length > 0 && (
        <Card hoverEffect className="p-5 border-border/80 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-500" /> Physical Evidence Trail ({evidences.length})
              </h3>
              <p className="text-xs text-muted-foreground">Every claim is backed by extracted implementation artifacts</p>
            </div>
            <Badge variant="secondary" size="sm">
              Auditable Evidence
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {evidences.slice(0, 8).map((ev) => (
              <div key={ev.id} className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-600 dark:text-purple-400">{ev.type}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    Confidence Math: {Math.round(ev.confidence * 100)}%
                  </span>
                </div>
                <p className="text-foreground leading-relaxed font-medium">{ev.reason}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span>Repo: <span className="font-semibold text-foreground">{ev.repositoryName}</span></span>
                  <span>Source: {ev.source}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
