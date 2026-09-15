"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AtmosphericVariant =
  | "hero"
  | "intelligence"
  | "career-dna"
  | "mesh"
  | "minimal"
  | "dashboard"
  | "recruitment";

export interface AtmosphericBackgroundProps {
  variant?: AtmosphericVariant;
  className?: string;
  showPattern?: boolean;
  showNetwork?: boolean;
  showRings?: boolean;
  children?: React.ReactNode;
}

export function AtmosphericBackground({
  variant = "minimal",
  className,
  showPattern = true,
  showNetwork = true,
  showRings = false,
  children,
}: AtmosphericBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden w-full", className)}>
      {/* Visual Layer 1: Huge Ambient Light Sources (500px - 1200px extending beyond viewport) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        {/* Global base light blooms for all atmospheric variants */}
        {variant !== "minimal" && (
          <>
            {/* Top-Left: Large Soft Blue Glow */}
            <div className="absolute -top-[15%] -left-[10%] w-[700px] sm:w-[950px] h-[600px] sm:h-[800px] bg-blue-500/[0.075] dark:bg-blue-500/[0.08] blur-[150px] rounded-full animate-ambient-slow" />

            {/* Top-Right: Large Soft Cyan Glow */}
            <div className="absolute -top-[10%] -right-[12%] w-[650px] sm:w-[850px] h-[550px] sm:h-[750px] bg-cyan-400/[0.065] dark:bg-cyan-400/[0.06] blur-[140px] rounded-full animate-pulse-glow" />

            {/* Center: Very Subtle Indigo / Violet Atmospheric Aura */}
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[500px] sm:h-[650px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.05] blur-[160px] rounded-full" />

            {/* Bottom: Faint Blue Ambient Glow */}
            <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[800px] sm:w-[1100px] h-[450px] sm:h-[600px] bg-blue-600/[0.05] dark:bg-blue-600/[0.06] blur-[160px] rounded-full" />
          </>
        )}

        {/* Specialized Section Accents */}
        {variant === "hero" && (
          <>
            {/* Direct Headline Light Focus */}
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-r from-blue-500/[0.09] via-cyan-400/[0.08] to-indigo-500/[0.06] blur-[120px] rounded-full animate-pulse-glow" />
            {/* Secondary Accent Ribbon */}
            <div className="absolute top-[40%] right-[8%] w-[450px] h-[350px] bg-cyan-400/[0.05] blur-[110px] rounded-full" />
          </>
        )}

        {variant === "intelligence" && (
          <>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-blue-600/[0.08] via-cyan-500/[0.06] to-transparent blur-[140px] rounded-full animate-ambient-slow" />
            <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/[0.045] blur-[120px] rounded-full" />
          </>
        )}

        {variant === "career-dna" && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[580px] bg-gradient-to-r from-blue-600/[0.07] via-cyan-400/[0.06] to-indigo-600/[0.05] dark:from-blue-500/[0.09] dark:to-indigo-500/[0.07] blur-[150px] rounded-full animate-pulse-glow" />
          </>
        )}

        {variant === "recruitment" && (
          <>
            <div className="absolute top-10 left-1/4 w-[600px] h-[400px] bg-blue-500/[0.04] blur-[130px] rounded-full" />
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-cyan-500/[0.035] blur-[120px] rounded-full" />
          </>
        )}

        {variant === "dashboard" && (
          <>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[280px] bg-gradient-to-b from-blue-500/[0.06] via-cyan-400/[0.03] to-transparent blur-[90px] rounded-full" />
            <div className="absolute top-[30%] right-0 w-[500px] h-[400px] bg-blue-500/[0.035] blur-[120px] rounded-full" />
          </>
        )}

        {/* Visual Layer 2: Subtle Technical Grid/Dot Matrix (28px spacing at 3.5% opacity) */}
        {showPattern && (
          <div
            className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Visual Layer 3: Floating Abstract Shapes & Translucent Rings */}
        {(showRings || variant === "hero" || variant === "career-dna") && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Translucent ambient ring top-right */}
            <div className="absolute -top-24 right-[-5%] w-[450px] h-[450px] rounded-full border border-blue-500/10 dark:border-blue-400/10 [mask-image:radial-gradient(ellipse_at_center,transparent_45%,black_70%)] animate-ambient-slow" />
            {/* Translucent ambient ring bottom-left */}
            <div className="absolute bottom-[10%] -left-[8%] w-[550px] h-[550px] rounded-full border border-cyan-400/10 dark:border-cyan-400/10 [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black_75%)]" />
          </div>
        )}

        {/* Visual Layer 4: Abstract Career DNA & Connected Intelligence Network Architecture */}
        {showNetwork && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.42] dark:opacity-[0.3]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1440 700"
            fill="none"
          >
            <defs>
              <linearGradient id="dnaGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.0" />
                <stop offset="25%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="65%" stopColor="#0ea5e9" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="dnaGradSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.0" />
                <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.38" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="dnaGradTertiary" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.0" />
                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Flowing Wave Strand 1 (Major Intelligence Path) */}
            <path
              d="M-80,240 C180,110 460,340 740,210 C1020,80 1280,310 1520,190"
              stroke="url(#dnaGradPrimary)"
              strokeWidth="1.4"
              strokeDasharray="4 8"
              fill="none"
            />

            {/* Flowing Wave Strand 2 (Counter-Oscillating DNA Strand) */}
            <path
              d="M-80,310 C220,380 500,160 780,290 C1060,420 1300,180 1520,290"
              stroke="url(#dnaGradSecondary)"
              strokeWidth="1.2"
              fill="none"
            />

            {/* Wave Strand 3 (Gentle Horizon Intelligence Wave) */}
            <path
              d="M-60,420 C320,340 680,480 1020,390 C1240,330 1380,450 1520,410"
              stroke="url(#dnaGradTertiary)"
              strokeWidth="1"
              strokeDasharray="3 6"
              fill="none"
            />

            {/* Network Rungs / Cross-Connecting Signal Bridges */}
            <path
              d="M310,185 L350,335 M520,270 L540,190 M740,210 L780,290 M940,140 L970,360 M1130,225 L1170,285"
              stroke="url(#dnaGradPrimary)"
              strokeWidth="0.9"
              strokeDasharray="2 4"
            />

            {/* Branching Knowledge Node Paths */}
            <path
              d="M310,185 C360,130 420,140 460,110 M780,290 C840,340 900,320 950,370 M1130,225 C1180,180 1240,190 1290,160"
              stroke="url(#dnaGradSecondary)"
              strokeWidth="0.8"
              strokeDasharray="2 5"
            />

            {/* Glowing Micro-Node Points with Radial Highlight */}
            <circle cx="310" cy="185" r="3.5" fill="#2563eb" fillOpacity="0.55" />
            <circle cx="310" cy="185" r="7" stroke="#2563eb" strokeOpacity="0.2" strokeWidth="1" />

            <circle cx="350" cy="335" r="3" fill="#0ea5e9" fillOpacity="0.5" />
            <circle cx="460" cy="110" r="2.5" fill="#8b5cf6" fillOpacity="0.45" />

            <circle cx="740" cy="210" r="4" fill="#3b82f6" fillOpacity="0.6" />
            <circle cx="740" cy="210" r="9" stroke="#3b82f6" strokeOpacity="0.25" strokeWidth="1" />

            <circle cx="780" cy="290" r="3.5" fill="#8b5cf6" fillOpacity="0.5" />
            <circle cx="950" cy="370" r="2.5" fill="#06b6d4" fillOpacity="0.45" />

            <circle cx="1130" cy="225" r="3.5" fill="#06b6d4" fillOpacity="0.55" />
            <circle cx="1130" cy="225" r="8" stroke="#06b6d4" strokeOpacity="0.2" strokeWidth="1" />

            <circle cx="1170" cy="285" r="3" fill="#2563eb" fillOpacity="0.45" />
            <circle cx="1290" cy="160" r="2.5" fill="#3b82f6" fillOpacity="0.4" />
          </svg>
        )}
      </div>

      {children}
    </div>
  );
}
