"use client";

import React from "react";
import { Sparkles, Dna } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CareerDNAVisualization } from "./CareerDNAVisualization";
import { CareerDNACapabilities } from "./CareerDNACapabilities";
import { CareerDNAComparison } from "./CareerDNAComparison";
import { CareerDNAEcosystem } from "./CareerDNAEcosystem";
import { CareerDNAValueProps } from "./CareerDNAValueProps";
import { CareerDNACTA } from "./CareerDNACTA";

export function CareerDNASection() {
  return (
    <section id="career-dna-hero" className="py-16 sm:py-24 border-t border-border/60 bg-gradient-to-b from-background via-purple-950/10 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 max-w-6xl">
        {/* Section Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="purple" size="sm" className="font-semibold tracking-wider uppercase px-3 py-1">
              <Dna className="w-3.5 h-3.5 mr-1 text-purple-500" />
              THE INTELLIGENCE LAYER
            </Badge>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Your career profile, <span className="text-gradient">built from what you actually do.</span>
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Career DNA AI analyzes your projects, repositories, technical skills, coursework, certifications, coding activity, and other verified career signals to build a continuously evolving picture of your capabilities.
            </p>
            <p>
              Instead of relying only on what you claim on a resume, StudentHub evaluates real evidence of your work to generate a personalized Career Score, identify your strongest skills, uncover gaps, and recommend the next steps that can make you a stronger candidate.
            </p>
          </div>

          <div className="pt-2 text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400 tracking-wide uppercase">
            "Your work becomes your proof. Your proof becomes your Career DNA."
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
