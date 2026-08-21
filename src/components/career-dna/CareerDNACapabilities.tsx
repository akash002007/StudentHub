"use client";

import React from "react";
import {
  Trophy,
  Code2,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export function CareerDNACapabilities() {
  const capabilities = [
    {
      id: "score",
      title: "1. CAREER SCORE",
      icon: Trophy,
      description:
        "A data-driven score representing the strength of your current career profile based on the evidence StudentHub can verify.",
    },
    {
      id: "skill",
      title: "2. SKILL INTELLIGENCE",
      icon: Code2,
      description:
        "Identify the technologies and competencies you demonstrate through your actual projects, repositories, coursework, and career activity.",
    },
    {
      id: "evidence",
      title: "3. EVIDENCE-BASED ASSESSMENT",
      icon: ShieldCheck,
      description:
        "See exactly which projects, repositories, contributions, and achievements support your demonstrated strengths.",
    },
    {
      id: "gaps",
      title: "4. SKILL GAP DETECTION",
      icon: AlertTriangle,
      description:
        "Discover the capabilities you are missing for the roles and career paths you want to pursue.",
    },
    {
      id: "actions",
      title: "5. NEXT BEST ACTIONS",
      icon: ArrowUpRight,
      description:
        "Get practical recommendations on what to build, learn, improve, or verify next.",
    },
    {
      id: "evolving",
      title: "6. EVOLVING CAREER DNA",
      icon: TrendingUp,
      description:
        "Your Career DNA changes as you build, learn, contribute, and accomplish more.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          From scattered achievements to one intelligent career profile.
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          StudentHub transforms unverified resume bullet points into an auditable evidence network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          return (
            <Card
              key={cap.id}
              hoverEffect
              className="p-5 border-border/80 bg-card space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  {cap.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
