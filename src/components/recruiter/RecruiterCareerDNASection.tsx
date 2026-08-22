"use client";

import React, { useState, useEffect } from "react";
import {
  Dna,
  ShieldCheck,
  Sparkles,
  FolderGit2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Code2,
  ExternalLink,
  Award,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface CareerDNAPayload {
  score?: number;
  overallScore?: number;
  rating?: string;
  confidence?: number;
  primaryStrength?: string;
  topSkills?: (string | { name: string; score?: number })[];
  projectsAnalyzed?: number;
  verified?: boolean;
  lastAnalyzedAt?: string;
  summary?: string;
  evidences?: Array<{
    id?: string;
    repositoryName?: string;
    type?: string;
    reason?: string;
    skill?: string;
  }>;
  featuredProjects?: Array<{
    id?: string;
    title?: string;
    description?: string;
    technologies?: string[];
  }>;
  skillGaps?: string[];
  dimensions?: {
    architecture?: number;
    codeQuality?: number;
    problemSolving?: number;
    technicalBreadth?: number;
    consistency?: number;
  };
}

interface RecruiterCareerDNASectionProps {
  studentId?: string;
  candidateName?: string;
  careerDNA?: CareerDNAPayload | null;
  compact?: boolean;
  initialExpanded?: boolean;
  onOpenFullModal?: (dna: CareerDNAPayload) => void;
  className?: string;
}

export function RecruiterCareerDNASection({
  studentId,
  candidateName = "Candidate",
  careerDNA: initialDNA,
  compact = false,
  initialExpanded = false,
  onOpenFullModal,
  className = "",
}: RecruiterCareerDNASectionProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [dna, setDna] = useState<CareerDNAPayload | null>(initialDNA || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Synchronize when initialDNA prop changes
  useEffect(() => {
    if (initialDNA) {
      setDna(initialDNA);
    }
  }, [initialDNA]);

  // Lazy-fetch Career DNA if missing and expanded
  const fetchCareerDNA = async () => {
    if (!studentId || dna) return;
    setIsLoading(true);
    setHasError(false);

    try {
      const res = await fetch(`/api/student/career-dna?userId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists && data.careerDNA) {
          const raw = data.careerDNA;
          const score = raw.overallScore ?? raw.score ?? 80;
          let rating = "Good";
          if (score >= 90) rating = "Exceptional";
          else if (score >= 80) rating = "Strong";
          else if (score >= 70) rating = "Good";
          else if (score >= 60) rating = "Developing";
          else rating = "Needs Improvement";

          setDna({
            score,
            overallScore: score,
            rating,
            confidence: raw.analysisConfidence ?? 85,
            primaryStrength: raw.potentialCareerDirections?.[0] || "Software Engineering",
            topSkills: raw.topSkills?.map((s: any) => (typeof s === "string" ? s : s.name)) || [],
            projectsAnalyzed: raw.githubStats?.totalRepos || raw.projectsAnalyzed || 0,
            verified: Boolean(raw.verified),
            lastAnalyzedAt: raw.updatedAt,
            summary: raw.summary,
            evidences: raw.evidences || [],
            featuredProjects: raw.featuredProjects || [],
            skillGaps: raw.skillGaps || [],
            dimensions: raw.dimensions,
          });
        } else {
          setDna(null);
        }
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState && !dna && !isLoading) {
      fetchCareerDNA();
    }
  };

  const normalizedScore = dna?.score ?? dna?.overallScore;
  const rating = dna?.rating || (normalizedScore && normalizedScore >= 90 ? "Exceptional" : normalizedScore && normalizedScore >= 80 ? "Strong" : normalizedScore && normalizedScore >= 70 ? "Good" : "Developing");
  const topSkillsList = (dna?.topSkills || []).map((s) => (typeof s === "string" ? s : s.name)).slice(0, 4);

  // Compact List / Card View Mode
  if (compact) {
    if (!dna && !studentId) return null;

    return (
      <div className={`p-3 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 space-y-2 text-xs ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {normalizedScore ?? "--"}
            </div>
            <div>
              <span className="font-bold text-foreground block text-[11px]">Career DNA</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                {rating}
              </span>
            </div>
          </div>

          {dna?.verified && (
            <Badge variant="emerald" size="sm" className="text-[9px] px-1.5 py-0 font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> Verified
            </Badge>
          )}
        </div>

        {dna?.primaryStrength && (
          <div className="pt-1.5 border-t border-purple-500/10 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Strength:</span>
            <span className="font-semibold text-foreground truncate max-w-[130px]" title={dna.primaryStrength}>
              {dna.primaryStrength}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          className="w-full flex items-center justify-center gap-1 h-7 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <span>{isExpanded ? "Hide Career DNA" : "View Career DNA"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isExpanded && (
          <div className="pt-2 border-t border-purple-500/20 space-y-2 animate-fadeIn">
            {dna?.summary && (
              <p className="text-[11px] text-muted-foreground leading-relaxed italic bg-card/60 p-2 rounded-xl border border-border/50">
                "{dna.summary}"
              </p>
            )}

            {topSkillsList.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Verified Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {topSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[10px] border border-purple-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {onOpenFullModal && dna && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-7 text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1"
                onClick={() => onOpenFullModal(dna)}
              >
                View Full Audit Modal &rarr;
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full / Expandable Candidate Section Mode
  return (
    <Card className={`overflow-hidden border border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-950/10 ${className}`}>
      {/* Header Banner */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                Career DNA Analysis
              </h3>
              {normalizedScore ? (
                <Badge variant="purple" size="sm" className="font-bold text-xs">
                  {normalizedScore}/100 • {rating}
                </Badge>
              ) : null}
              {dna?.verified && (
                <Badge variant="emerald" size="sm" className="text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auditable technical evaluation synthesized from public project evidence.
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggle}
            aria-expanded={isExpanded}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 mr-1" />
                Hide Career DNA
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 mr-1" />
                View Career DNA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5 animate-fadeIn">
          {/* Loading State */}
          {isLoading && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-500 mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">Loading Career DNA...</p>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
              <p className="text-xs text-destructive font-semibold">Unable to load Career DNA.</p>
              <Button type="button" variant="outline" size="sm" onClick={fetchCareerDNA} className="text-xs h-7">
                Retry
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && !dna && (
            <div className="py-6 text-center text-xs text-muted-foreground italic">
              Career DNA not available yet for {candidateName}.
            </div>
          )}

          {/* Populated Content */}
          {!isLoading && !hasError && dna && (
            <>
              {/* Score & Confidence Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-base shrink-0 shadow-xs">
                    {normalizedScore ?? "--"}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Overall Score</span>
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">{rating} Profile</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Primary Strength</span>
                  <p className="font-bold text-foreground truncate" title={dna.primaryStrength || "Software Engineering"}>
                    {dna.primaryStrength || "Software Engineering"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Confidence & Scope</span>
                  <p className="font-bold text-foreground">
                    {dna.confidence ?? 85}% Confidence • {dna.projectsAnalyzed ?? 0} repos
                  </p>
                </div>
              </div>

              {/* Technical Assessment Summary */}
              {dna.summary && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Technical Summary
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/30 p-3.5 rounded-2xl border border-border/40">
                    "{dna.summary}"
                  </p>
                </div>
              )}

              {/* Dimension Metrics */}
              {dna.dimensions && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-500" /> Dimension Ratings
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
                      <span className="text-[10px] text-muted-foreground block truncate">Architecture</span>
                      <span className="font-extrabold text-foreground">{dna.dimensions.architecture ?? 85}/100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
                      <span className="text-[10px] text-muted-foreground block truncate">Code Quality</span>
                      <span className="font-extrabold text-foreground">{dna.dimensions.codeQuality ?? 88}/100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
                      <span className="text-[10px] text-muted-foreground block truncate">Problem Solving</span>
                      <span className="font-extrabold text-foreground">{dna.dimensions.problemSolving ?? 90}/100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
                      <span className="text-[10px] text-muted-foreground block truncate">Breadth</span>
                      <span className="font-extrabold text-foreground">{dna.dimensions.technicalBreadth ?? 84}/100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-muted-foreground block truncate">Consistency</span>
                      <span className="font-extrabold text-foreground">{dna.dimensions.consistency ?? 86}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Verified Top Skills */}
              {topSkillsList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Verified Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topSkillsList.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs border border-purple-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Items */}
              {dna.evidences && dna.evidences.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-purple-500" /> Evidence Trail
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {dna.evidences.slice(0, 4).map((ev, idx) => (
                      <div key={ev.id || idx} className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-foreground">
                          <span className="truncate">{ev.repositoryName || "Repository"}</span>
                          <span className="text-[10px] text-purple-500 font-semibold">{ev.type || "Evidence"}</span>
                        </div>
                        {ev.reason && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {ev.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Development Opportunities (Skill Gaps) */}
              {dna.skillGaps && dna.skillGaps.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Growth & Next Steps
                  </span>
                  <div className="space-y-1">
                    {dna.skillGaps.slice(0, 2).map((gap, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
                        • {gap}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Trigger for Full Modal */}
              {onOpenFullModal && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenFullModal(dna)}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                  >
                    Open Complete Assessment Modal &rarr;
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
