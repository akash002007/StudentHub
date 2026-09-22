"use client";

import React from "react";
import { Dna } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { CareerDNAVisualization } from "./CareerDNAVisualization";
import { CareerDNACapabilities } from "./CareerDNACapabilities";
import { CareerDNAComparison } from "./CareerDNAComparison";
import { CareerDNAEcosystem } from "./CareerDNAEcosystem";
import { CareerDNAValueProps } from "./CareerDNAValueProps";
import { CareerDNACTA } from "./CareerDNACTA";

export function CareerDNASection() {
  return (
    <section id="career-dna-hero" className="py-16 sm:py-24 border-t border-border/60 bg-background relative overflow-hidden">
      {/* Subtle Career DNA Intelligence Background */}
      <AtmosphericBackground
        variant="career-dna"
        showPattern={true}
        showNetwork={true}
        className="absolute inset-0 h-full -z-10"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 max-w-6xl relative z-10">
        {/* Section Hero Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4 relative">
          {/* Subtle light bloom directly behind the Intelligence Layer heading */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-500/[0.09] via-cyan-400/[0.07] to-indigo-500/[0.06] dark:bg-blue-500/[0.07] blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Abstract Knowledge Graph Constellation (Intelligence Pipeline) */}
          <svg
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-[850px] h-[260px] pointer-events-none opacity-[0.35] dark:opacity-[0.25] -z-10 hidden sm:block"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 850 260"
            fill="none"
          >
            {/* Central Intelligence Node Hub */}
            <circle cx="425" cy="130" r="28" fill="#2563eb" fillOpacity="0.08" />
            <circle cx="425" cy="130" r="14" fill="#2563eb" fillOpacity="0.2" />
            <circle cx="425" cy="130" r="5" fill="#2563eb" />

            {/* Evidence Satellite Nodes & Connectors */}
            {/* 1. Projects Node */}
            <line x1="425" y1="130" x2="200" y2="60" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx="200" cy="60" r="4" fill="#0ea5e9" />
            <text x="140" y="64" fill="#0284c7" fontSize="11" fontWeight="600" fontFamily="sans-serif">Projects</text>

            {/* 2. GitHub Node */}
            <line x1="425" y1="130" x2="160" y2="150" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx="160" cy="150" r="3.5" fill="#2563eb" />
            <text x="105" y="154" fill="#0284c7" fontSize="11" fontWeight="600" fontFamily="sans-serif">GitHub</text>

            {/* 3. Skills Node */}
            <line x1="425" y1="130" x2="230" y2="210" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx="230" cy="210" r="4" fill="#06b6d4" />
            <text x="185" y="228" fill="#0284c7" fontSize="11" fontWeight="600" fontFamily="sans-serif">Skills</text>

            {/* 4. Education Node */}
            <line x1="425" y1="130" x2="650" y2="60" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx="650" cy="60" r="4" fill="#8b5cf6" />
            <text x="665" y="64" fill="#7c3aed" fontSize="11" fontWeight="600" fontFamily="sans-serif">Education</text>

            {/* 5. Certifications Node */}
            <line x1="425" y1="130" x2="690" y2="150" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx="690" cy="150" r="3.5" fill="#06b6d4" />
            <text x="705" y="154" fill="#0891b2" fontSize="11" fontWeight="600" fontFamily="sans-serif">Certifications</text>

            {/* 6. Achievements Node */}
            <line x1="425" y1="130" x2="620" y2="210" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx="620" cy="210" r="4" fill="#2563eb" />
            <text x="635" y="228" fill="#2563eb" fontSize="11" fontWeight="600" fontFamily="sans-serif">Achievements</text>
          </svg>

          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/85 dark:bg-card/60 backdrop-blur-md border border-blue-500/25 shadow-xs text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              <Dna className="w-3.5 h-3.5 text-blue-500" />
              <span>THE INTELLIGENCE LAYER</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Your career profile, <span className="text-gradient">built from what you actually do.</span>
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            <p>
              Career DNA AI analyzes your projects, repositories, technical skills, coursework, certifications, coding activity, and other verified career signals to build a continuously evolving picture of your capabilities.
            </p>
            <p>
              Instead of relying only on what you claim on a resume, CommandSkill evaluates real evidence of your work to generate a personalized Career Score, identify your strongest skills, uncover gaps, and recommend the next steps that can make you a stronger candidate.
            </p>
          </div>

          {/* Value Proposition Pipeline Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">DATA</span>
            <span className="text-muted-foreground font-mono">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">EVIDENCE</span>
            <span className="text-muted-foreground font-mono">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">CAREER DNA</span>
            <span className="text-muted-foreground font-mono">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">CAREER SCORE</span>
            <span className="text-muted-foreground font-mono">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">BETTER MATCH</span>
          </div>
        </div>

        {/* 1. Primary Interactive Product Visualization */}
        <CareerDNAVisualization />

        {/* 2. Core Capabilities Grid */}
        <CareerDNACapabilities />

        {/* 3. Resumes vs Career DNA Comparison */}
        <CareerDNAComparison />

        {/* 4. Evidence Ecosystem (Active vs Planned Integrations) */}
        <CareerDNAEcosystem />

        {/* 5. Student & Recruiter Value Props */}
        <CareerDNAValueProps />

        {/* 6. Closing Hero CTA */}
        <CareerDNACTA />
      </div>
    </section>
  );
}
