"use client";

import React from "react";
import {
  Dna,
  ShieldCheck,
  X,
  Sparkles,
  TrendingUp,
  FolderGit2,
  AlertTriangle,
  ExternalLink,
  Code2,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface RecruiterCareerDNAModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  careerDNA: any;
}

export function RecruiterCareerDNAModal({
  isOpen,
  onClose,
  candidateName,
  careerDNA,
}: RecruiterCareerDNAModalProps) {
  if (!isOpen || !careerDNA) return null;

  const {
    score,
    rating = "Good",
    confidence = 85,
    primaryStrength = "Software Engineering",
    topSkills = [],
    projectsAnalyzed = 0,
    verified = false,
    lastAnalyzedAt,
    summary = "",
    evidences = [],
    featuredProjects = [],
    skillGaps = [],
    dimensions,
  } = careerDNA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">{candidateName}'s Career DNA</h2>
              {verified ? (
                <Badge variant="emerald" size="sm" className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> GitHub Verified
                </Badge>
              ) : (
                <Badge variant="secondary" size="sm">
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Auditable evidence-based technical assessment • Analyzed {projectsAnalyzed} repositories
            </p>
          </div>
        </div>

        {/* Score & Rating Banner */}
        <Card hoverEffect className="p-6 border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-950/20 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 border-4 border-purple-500 flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-2xl font-extrabold text-foreground">{score}</span>
                <span className="text-[9px] font-bold text-purple-500 uppercase">/ 100</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block">Career DNA Score</span>
                <Badge variant="emerald" size="sm" className="font-bold text-xs mt-1">
                  {rating}
                </Badge>
              </div>
            </div>

            {/* Confidence & Projects */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Analysis Confidence:</span>
                <span className="font-bold text-emerald-500">{confidence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Projects Analyzed:</span>
                <span className="font-bold text-foreground">{projectsAnalyzed} repos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Primary Strength:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400 truncate max-w-[120px]" title={primaryStrength}>
                  {primaryStrength}
                </span>
              </div>
            </div>

            {/* Top Skills */}
            <div className="space-y-1.5 text-xs">
              <span className="text-muted-foreground font-semibold block">Verified Top Skills:</span>
              <div className="flex flex-wrap gap-1">
                {topSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[11px] border border-purple-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* AI Assessment */}
        {summary && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Assessment Summary
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/30 p-3 rounded-2xl border border-border/40">
              "{summary}"
            </p>
          </div>
        )}

        {/* Physical Evidence Items */}
        {evidences && evidences.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-purple-500" /> Physical Repository Evidence
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {evidences.map((ev: any) => (
                <div key={ev.id} className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span className="truncate">{ev.repositoryName}</span>
                    <span className="text-[10px] text-purple-500 font-semibold">{ev.type}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{ev.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Areas to Improve (Skill Gaps) */}
        {skillGaps && skillGaps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Development Growth Opportunities
            </h4>
            <div className="space-y-1.5">
              {skillGaps.map((gap: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-medium">
                  • {gap}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {lastAnalyzedAt ? `Last analyzed ${new Date(lastAnalyzedAt).toLocaleDateString()}` : "Verified via GitHub"}
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close View
          </Button>
        </div>
      </div>
    </div>
  );
}
