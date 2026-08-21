"use client";

import React from "react";
import {
  Github,
  FolderGit2,
  Code2,
  BookOpen,
  Award,
  Trophy,
  Briefcase,
  Globe,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function CareerDNAEcosystem() {
  const activeSources = [
    { name: "GitHub Repositories", icon: Github, description: "Synchronized public code, languages, and activity" },
    { name: "Project Intelligence", icon: FolderGit2, description: "Automated extraction of architecture & project complexity" },
    { name: "Skill Intelligence", icon: Code2, description: "Normalized competency scoring across verified tech stacks" },
  ];

  const plannedSources = [
    { name: "LeetCode & Codeforces", icon: Code2, badge: "Coming Next", description: "Competitive programming ranks and problem solving" },
    { name: "Hugging Face AI", icon: Globe, badge: "Coming Next", description: "Open-source AI models, spaces, and ML benchmarks" },
    { name: "Coursework & Transcripts", icon: BookOpen, badge: "Planned", description: "Verified university courses & academic achievements" },
    { name: "Certifications", icon: Award, badge: "Planned", description: "Industry certifications (AWS, Google, Meta, Microsoft)" },
    { name: "Hackathons", icon: Trophy, badge: "Planned", description: "Verified hackathon placements and prototype builds" },
    { name: "Work & Internships", icon: Briefcase, badge: "Planned", description: "Verified recruiter recommendations and internship history" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" /> Career DNA Evidence Ecosystem
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Continuously aggregating verified signals across your entire developer footprint.
        </p>
      </div>

      {/* Active Integrations Grid */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">
          Active Evidence Integrations (Live)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeSources.map((source) => {
            const Icon = source.icon;
            return (
              <Card key={source.name} hoverEffect className="p-4 border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                    <Icon className="w-4 h-4 text-emerald-500" />
                    <span>{source.name}</span>
                  </div>
                  <Badge variant="emerald" size="sm" className="text-[9px]">
                    Active
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{source.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Planned Integrations Grid */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          Upcoming Evidence Sources
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {plannedSources.map((source) => {
            const Icon = source.icon;
            return (
              <Card key={source.name} hoverEffect className="p-4 border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <Icon className="w-4 h-4 text-purple-500" />
                    <span>{source.name}</span>
                  </div>
                  <Badge variant="secondary" size="sm" className="text-[9px]">
                    {source.badge}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{source.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
