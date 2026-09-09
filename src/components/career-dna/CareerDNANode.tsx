"use client";

import React from "react";
import { CareerDNANodeItem } from "./CareerDNAData";
import { Zap } from "lucide-react";

interface CareerDNANodeProps {
  node: CareerDNANodeItem;
  isHovered: boolean;
  isActive: boolean;
  isDimmed: boolean;
  onHover: (nodeId: CareerDNANodeItem["id"] | null) => void;
  onClick: (nodeId: CareerDNANodeItem["id"]) => void;
  reducedMotion?: boolean;
}

export function CareerDNANode({
  node,
  isHovered,
  isActive,
  isDimmed,
  onHover,
  onClick,
  reducedMotion = false,
}: CareerDNANodeProps) {
  const Icon = node.icon;

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto select-none ${
        isDimmed ? "opacity-35 blur-[0.3px]" : "opacity-100"
      }`}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        zIndex: isActive ? 35 : isHovered ? 30 : 20,
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      aria-label={`${node.label}: ${node.valueTitle}. Click to view details.`}
    >
      {/* Interactive Identity Capsule */}
      <div
        className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer backdrop-blur-md transition-all duration-200 ${
          isActive
            ? "scale-108 bg-white dark:bg-slate-900 border-sky-400 dark:border-cyan-400 shadow-xl shadow-sky-500/25 dark:shadow-cyan-500/30 ring-2 ring-sky-400/40 dark:ring-cyan-400/40"
            : isHovered
            ? "scale-105 bg-white/95 dark:bg-slate-900/95 border-sky-400/80 dark:border-cyan-400/80 shadow-md shadow-sky-500/15 dark:shadow-cyan-500/20"
            : "bg-white/85 dark:bg-slate-950/75 border-slate-200/90 dark:border-blue-900/40 hover:border-sky-400/60 dark:hover:border-cyan-400/60 shadow-2xs"
        }`}
      >
        {/* Signal Beacon Dot with Evidence Indicator */}
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {!reducedMotion && (isActive || isHovered) && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                node.verificationStatus === "verified" ? "bg-emerald-400" : "bg-sky-400"
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              node.verificationStatus === "verified" ? "bg-emerald-500" : "bg-sky-500"
            }`}
          />
        </span>

        {/* Node Icon */}
        <Icon
          className={`w-3 h-3 transition-colors duration-200 ${
            isActive || isHovered
              ? "text-sky-600 dark:text-cyan-300"
              : "text-slate-600 dark:text-blue-300/80"
          }`}
        />

        {/* Node Label */}
        <span
          className={`text-[10px] sm:text-[11px] font-semibold tracking-tight transition-colors duration-200 ${
            isActive
              ? "text-slate-950 dark:text-white font-bold"
              : isHovered
              ? "text-slate-900 dark:text-white font-bold"
              : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {node.label}
        </span>

        {/* Micro Signal Strength Tag on Active/Hover */}
        {(isActive || isHovered) && (
          <span className="text-[8.5px] font-bold text-sky-600 dark:text-cyan-400 flex items-center gap-0.5 ml-0.5">
            <Zap className="w-2 h-2" />
            {node.signalStrength}%
          </span>
        )}
      </div>

      {/* Subtle Micro Hint on Hover when not active */}
      {isHovered && !isActive && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[9px] font-medium shadow-md pointer-events-none z-30 animate-in fade-in duration-150">
          Click to inspect evidence
        </div>
      )}
    </div>
  );
}
