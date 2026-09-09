"use client";

import React from "react";
import { Dna, Sparkles } from "lucide-react";

interface CareerDNACoreProps {
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  reducedMotion?: boolean;
}

export function CareerDNACore({
  isHovered,
  onHover,
  onClick,
  reducedMotion = false,
}: CareerDNACoreProps) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto select-none"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Career DNA Core — Your Professional Identity Anchor"
    >
      {/* Concentric Rotating Orbital Rings */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: "160px", height: "160px" }}
      >
        {/* Inner Ring */}
        <div
          className={`absolute inset-2.5 rounded-full border border-sky-400/25 dark:border-cyan-400/25 border-dashed ${
            reducedMotion ? "" : "animate-[spin_40s_linear_infinite]"
          }`}
        />
        {/* Outer Ring */}
        <div
          className={`absolute inset-0 rounded-full border border-indigo-400/15 dark:border-blue-500/15 ${
            reducedMotion ? "" : "animate-[spin_60s_linear_infinite_reverse]"
          }`}
        />
      </div>

      {/* Center Soft-Glass Identity Capsule */}
      <div
        className={`group relative flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg ${
          isHovered
            ? "scale-105 bg-white/95 dark:bg-slate-900/95 border-sky-400 dark:border-cyan-400 shadow-2xl shadow-sky-500/25 dark:shadow-cyan-500/30 ring-2 ring-sky-400/25"
            : "bg-white/90 dark:bg-slate-950/85 border-slate-200/90 dark:border-blue-900/50 hover:border-sky-400 dark:hover:border-cyan-400 shadow-sky-500/10 dark:shadow-cyan-500/10"
        }`}
      >
        {/* Soft Radial Breathing Glow */}
        <div
          className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-sky-400/25 via-indigo-500/25 to-cyan-400/25 blur-md pointer-events-none transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-40"
          }`}
        />

        {/* DNA Helix Icon with gentle pulse */}
        <div className="relative flex items-center justify-center mb-1">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors duration-200 ${
              isHovered
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400"
            }`}
          >
            <Dna
              className={`w-4 h-4 ${
                reducedMotion ? "" : "animate-[pulse_3s_ease-in-out_infinite]"
              }`}
            />
          </div>
        </div>

        {/* Title: CAREER DNA */}
        <div className="relative flex flex-col items-center text-center">
          <span className="text-[11px] sm:text-xs font-black tracking-widest text-slate-900 dark:text-white uppercase flex items-center gap-1">
            CAREER DNA
            <Sparkles className="w-2.5 h-2.5 text-sky-500 dark:text-cyan-400" />
          </span>
          <span className="text-[8px] font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-widest mt-0.5">
            Your Professional Identity
          </span>
        </div>
      </div>
    </div>
  );
}
