"use client";

import React, { useState } from "react";
import {
  Github,
  FolderGit2,
  BookOpen,
  Award,
  Code2,
  Trophy,
  Briefcase,
  Globe,
  Sparkles,
  Dna,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function CareerDNAVisualization() {
  const [activeStep, setActiveStep] = useState<number>(2); // Default selected evidence step

  const steps = [
    { label: "REAL WORK", icon: FolderGit2 },
    { label: "EVIDENCE", icon: ShieldCheck },
    { label: "CAREER DNA", icon: Dna },
    { label: "CAREER SCORE", icon: Trophy },
    { label: "BETTER MATCH", icon: Sparkles },
  ];

  const evidenceSources = [
    { id: "github", label: "GitHub Repositories", icon: Github, active: true, tag: "Connected" },
    { id: "projects", label: "Project Intelligence", icon: FolderGit2, active: true, tag: "Analyzed" },
    { id: "coursework", label: "Academic Coursework", icon: BookOpen, active: false, tag: "Coming Next" },
    { id: "certifications", label: "Verified Certifications", icon: Award, active: false, tag: "Planned" },
    { id: "coding", label: "LeetCode & Codeforces", icon: Code2, active: false, tag: "Coming Next" },
    { id: "hackathons", label: "Hackathon Builds", icon: Trophy, active: false, tag: "Planned" },
    { id: "internships", label: "Work & Internships", icon: Briefcase, active: false, tag: "Planned" },
    { id: "portfolio", label: "Portfolio Assets", icon: Globe, active: false, tag: "Planned" },
  ];

  return (
    <div className="space-y-8">
      {/* 5-Step Visual Flow Header */}
      <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs max-w-4xl mx-auto overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px] gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = idx <= activeStep;
            return (
              <React.Fragment key={step.label}>
                <button
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
                    isCurrent
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <span className="text-muted-foreground text-xs font-bold">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Verified Evidence Sources */}
        <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-1">
              Step 1 &amp; 2 • Work &amp; Evidence Sources
            </span>
            <h3 className="text-base font-bold text-foreground">Multi-Source Evidence Pipeline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select an evidence source to preview verified technical signals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            {evidenceSources.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                    source.active
                      ? "bg-purple-500/10 border-purple-500/30 text-foreground shadow-xs"
                      : "bg-card/50 border-border/40 text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${source.active ? "bg-purple-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-foreground">{source.label}</span>
                  </div>
                  <Badge variant={source.active ? "emerald" : "secondary"} size="sm" className="text-[10px]">
                    {source.tag}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Career DNA AI Processing Layer */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-purple-950/20 via-card to-card border border-purple-500/20 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/5 blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 relative z-10 shadow-lg shadow-purple-500/10 animate-pulse">
            <Dna className="w-8 h-8" />
          </div>

          <div className="space-y-1 relative z-10">
            <Badge variant="purple" size="sm" className="font-semibold text-[10px]">
              <Zap className="w-3 h-3 mr-1" /> Deterministic Intelligence
            </Badge>
            <h4 className="text-sm font-bold text-foreground pt-1">Career DNA AI Engine</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs">
              Analyzing verified code evidence, repo topics, languages &amp; architecture...
            </p>
          </div>

          <div className="w-full space-y-2 relative z-10 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Code Evidence Weight:</span>
              <span className="font-bold text-emerald-500">1.0 (Strong)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Scoring Model:</span>
              <span className="font-bold text-foreground">Deterministic v1.0</span>
            </div>
          </div>
        </div>

        {/* Right Column: Career DNA Profile Result */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-xs text-foreground">Verified Career DNA Result</span>
              </div>
              <Badge variant="purple" size="sm" className="font-semibold">
                Student Profile
              </Badge>
            </div>

            {/* Score & Rating */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div>
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">Career Score</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-foreground">84</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="emerald" size="sm" className="font-bold text-xs">
                  Strong Candidate
                </Badge>
                <span className="text-[10px] text-muted-foreground block mt-1">95% Confidence</span>
              </div>
            </div>

            {/* Primary Strength */}
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground font-semibold">Primary Demonstrated Strength:</span>
              <p className="font-bold text-purple-600 dark:text-purple-400">Full-Stack Web Development</p>
            </div>

            {/* Verified Skills */}
            <div className="space-y-1.5 text-xs">
              <span className="text-muted-foreground font-semibold block">Verified Skills Evidence:</span>
              <div className="flex flex-wrap gap-1">
                {["TypeScript", "React", "Next.js", "Python", "PostgreSQL"].map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-muted text-foreground font-semibold text-[11px] border border-border/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Next Best Action */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-500">Next Best Action:</span>
              <p className="text-[11px]">Add automated testing (Jest) &amp; CI/CD evidence to boost engineering score.</p>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/40">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Evidence Audit Trail Verified
            </span>
            <span className="font-semibold text-purple-500">StudentHub Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
