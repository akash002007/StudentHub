"use client";

import React from "react";
import { CheckCircle2, Trophy, Compass, Sparkles, Laptop, FileText, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function CareerDevSection() {
  const steps = [
    {
      number: "01",
      title: "Build a Proof-of-Work Profile",
      description: "Link real projects, hackathon achievements, and verified skills instead of sending identical PDF resumes.",
      icon: <Laptop className="w-5 h-5 text-purple-500" />,
    },
    {
      number: "02",
      title: "Match With Verified Companies",
      description: "Receive targeted internship recommendations with transparent match explanations and direct recruiter visibility.",
      icon: <Sparkles className="w-5 h-5 text-blue-500" />,
    },
    {
      number: "03",
      title: "Track Applications & Ace Interviews",
      description: "Manage interview timelines, assessment links, and get peer advice from alumni who already cracked top offers.",
      icon: <Trophy className="w-5 h-5 text-emerald-500" />,
    },
  ];

  return (
    <section id="career" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="gradient" size="md" className="mb-3">
            Career Acceleration
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            From First-Year Student to Top-Tier Engineer
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            StudentHub replaces cold outreach and confusing job portals with a clear, guided roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-extrabold text-muted-foreground/30 font-mono">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>Phase {step.number} Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
