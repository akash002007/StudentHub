"use client";

import React from "react";
import {
  Briefcase,
  Users2,
  GitPullRequest,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

/* -------------------------------------------------------------------------- */
/* Feature Cards Configuration                                                */
/* -------------------------------------------------------------------------- */

const features = [
  {
    id: "internships",
    icon: <Briefcase className="w-5 h-5" />,
    badge: "Smart Discovery",
    title: "Curated Student Internships",
    description:
      "Explore verified software engineering, AI/ML, product design, and data internships with transparent stipends, clear deadlines, and zero ghost jobs.",
    highlight: "Matching scores tailored to your projects and skills",
    accent: {
      glow: "from-blue-500/12 via-cyan-400/8 to-transparent",
      surfaceHover: "group-hover:from-blue-500/[0.04] group-hover:to-cyan-500/[0.03]",
      borderHover: "group-hover:border-blue-500/40",
      iconBox:
        "bg-blue-500/[0.08] dark:bg-blue-500/15 border-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:border-blue-500/40 group-hover:shadow-[0_0_16px_rgba(37,99,235,0.18)]",
      badge:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 shadow-2xs",
      divider: "via-blue-500/25",
    },
  },
  {
    id: "pipeline",
    icon: <GitPullRequest className="w-5 h-5" />,
    badge: "Pipeline Management",
    title: "Application Pipeline Tracker",
    description:
      "A clean Kanban & table tracker that follows your journey from Applied to Interview to Offer. Keep notes, log test dates, and never miss an interview.",
    highlight: "6 distinct stages with automatic timeline updates",
    accent: {
      glow: "from-blue-500/12 via-indigo-500/8 to-transparent",
      surfaceHover: "group-hover:from-blue-500/[0.04] group-hover:to-indigo-500/[0.03]",
      borderHover: "group-hover:border-indigo-500/40",
      iconBox:
        "bg-indigo-500/[0.08] dark:bg-indigo-500/15 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-500/40 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.18)]",
      badge:
        "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 shadow-2xs",
      divider: "via-indigo-500/25",
    },
  },
  {
    id: "communities",
    icon: <Users2 className="w-5 h-5" />,
    badge: "Peer Networking",
    title: "Developer & Campus Communities",
    description:
      "Join specialized hubs for AI/ML, DSA preparation, Web3, and Student Founders. Share project insights, mock interviews, and find hackathon teammates.",
    highlight: "Over 500+ active student peer groups",
    accent: {
      glow: "from-cyan-500/12 via-emerald-500/8 to-transparent",
      surfaceHover: "group-hover:from-cyan-500/[0.04] group-hover:to-emerald-500/[0.03]",
      borderHover: "group-hover:border-emerald-500/40",
      iconBox:
        "bg-emerald-500/[0.08] dark:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.18)]",
      badge:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 shadow-2xs",
      divider: "via-emerald-500/25",
    },
  },
  {
    id: "profile",
    icon: <GraduationCap className="w-5 h-5" />,
    badge: "Verified Identity",
    title: "Proof-of-Work Student Profile",
    description:
      "Move beyond static PDFs. Showcase live demos, hackathon awards, verified certifications, and technical projects that recruiters actually care about.",
    highlight: "Designed specifically for university talent",
    accent: {
      glow: "from-blue-500/12 via-purple-500/8 to-transparent",
      surfaceHover: "group-hover:from-blue-500/[0.04] group-hover:to-purple-500/[0.03]",
      borderHover: "group-hover:border-purple-500/40",
      iconBox:
        "bg-purple-500/[0.08] dark:bg-purple-500/15 border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:border-purple-500/40 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.18)]",
      badge:
        "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25 shadow-2xs",
      divider: "via-purple-500/25",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Main Features Grid Component                                               */
/* -------------------------------------------------------------------------- */

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="py-20 sm:py-28 bg-[#fafbff] dark:bg-[#090a0f] border-y border-border/60 relative overflow-hidden"
    >
      {/* Visual Layer 1: Ambient Light Blooms (Landing Page Signature Style) */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-blue-500/[0.06] dark:bg-blue-500/[0.08] blur-[150px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-[550px] h-[350px] bg-cyan-400/[0.045] dark:bg-cyan-400/[0.06] blur-[140px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] bg-indigo-500/[0.03] dark:bg-indigo-500/[0.04] blur-[160px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Visual Layer 2: Subtle Technical Grid/Dot Matrix (28px spacing) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] dark:opacity-[0.045] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Visual Layer 3: Faint Abstract Network Constellation (Atmospheric Depth) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.25] dark:opacity-[0.18] -z-10"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.35">
          <line x1="12%" y1="20%" x2="48%" y2="24%" />
          <line x1="48%" y1="24%" x2="86%" y2="18%" />
          <line x1="12%" y1="20%" x2="22%" y2="55%" />
          <line x1="22%" y1="55%" x2="50%" y2="60%" />
          <line x1="50%" y1="60%" x2="82%" y2="52%" />
          <line x1="22%" y1="55%" x2="16%" y2="85%" />
          <line x1="50%" y1="60%" x2="50%" y2="88%" />
          <line x1="82%" y1="52%" x2="85%" y2="85%" />
        </g>
        <circle cx="12%" cy="20%" r="3.5" fill="#2563eb" fillOpacity="0.6" />
        <circle cx="48%" cy="24%" r="4" fill="#0ea5e9" fillOpacity="0.7" />
        <circle cx="86%" cy="18%" r="3.5" fill="#6366f1" fillOpacity="0.6" />
        <circle cx="22%" cy="55%" r="3.5" fill="#06b6d4" fillOpacity="0.6" />
        <circle cx="50%" cy="60%" r="4" fill="#3b82f6" fillOpacity="0.7" />
        <circle cx="82%" cy="52%" r="3.5" fill="#10b981" fillOpacity="0.6" />
        <circle cx="16%" cy="85%" r="3.5" fill="#8b5cf6" fillOpacity="0.6" />
        <circle cx="50%" cy="88%" r="4" fill="#0284c7" fillOpacity="0.6" />
        <circle cx="85%" cy="85%" r="3.5" fill="#059669" fillOpacity="0.6" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <Badge variant="purple" size="md" className="mb-3">
            Core Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything You Need To Launch Your Career
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Built from first principles to replace outdated job boards with a focused, high-signal student professional ecosystem.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((f) => (
            <div
              key={f.id}
              className="group relative rounded-2xl sm:rounded-3xl transition-all duration-300 ease-out hover:-translate-y-1"
            >
              {/* Card Ambient Glow Layer (Low opacity at rest, becomes softly stronger on hover) */}
              <div
                className={`absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${f.accent.glow} opacity-30 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none`}
                aria-hidden="true"
              />

              {/* Card Surface */}
              <div
                className={`relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 dark:border-border/70 ${f.accent.borderHover} bg-white/95 dark:bg-card/90 backdrop-blur-md bg-gradient-to-br from-white via-white to-transparent dark:from-card dark:via-card dark:to-transparent ${f.accent.surfaceHover} p-7 sm:p-8 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03),0_1px_2px_-1px_rgba(15,23,42,0.02)] group-hover:shadow-[0_16px_36px_-8px_rgba(37,99,235,0.09),0_6px_16px_-4px_rgba(15,23,42,0.03)] dark:group-hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.5)] transition-all duration-300`}
              >
                <div>
                  {/* Top: Icon + Category Capability Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-all duration-300 group-hover:scale-105 ${f.accent.iconBox}`}
                    >
                      {f.icon}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border backdrop-blur-xs transition-all duration-300 group-hover:brightness-105 ${f.accent.badge}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                      {f.badge}
                    </span>
                  </div>

                  {/* Middle: Title + Description */}
                  <h3 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-2.5 transition-colors duration-200">
                    {f.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed font-normal">
                    {f.description}
                  </p>
                </div>

                {/* Bottom: Soft Gradient Divider + Key Benefit */}
                <div>
                  <div
                    className={`h-px w-full bg-gradient-to-r from-transparent ${f.accent.divider} to-transparent my-5`}
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f.highlight}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
