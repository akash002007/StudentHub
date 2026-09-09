"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { CareerDNANodeItem } from "./CareerDNAData";

interface CareerDNAInsightCardProps {
  node: CareerDNANodeItem | null;
  onClose: () => void;
  reducedMotion?: boolean;
}

export function CareerDNAInsightCard({
  node,
  onClose,
  reducedMotion = false,
}: CareerDNAInsightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  const Icon = node.icon;

  // On desktop: if the node is on the right (x > 60), dock the panel on the left.
  // Otherwise, dock the panel on the right side of the visualization.
  // This guarantees zero collision with the inspected node and zero clipping!
  const isRightAnchored = node.x <= 60;

  return (
    <>
      {/* 1. Transparent backdrop catcher for outside click dismissal */}
      <div
        className="absolute inset-0 z-40 bg-slate-950/20 dark:bg-black/35 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Responsive Career DNA Insight Panel */}
      <div
        ref={cardRef}
        className={`z-50 w-[94%] sm:w-84 max-h-[92%] p-4 rounded-2xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-border/90 shadow-2xl shadow-blue-500/15 dark:shadow-cyan-500/20 flex flex-col justify-between space-y-3 transition-all duration-200 fixed bottom-3 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:bottom-auto sm:fixed-none sm:absolute ${
          isRightAnchored ? "sm:right-3.5 sm:left-auto" : "sm:left-3.5 sm:right-auto"
        } sm:top-3.5 sm:bottom-3.5 overflow-y-auto ${
          reducedMotion ? "" : "animate-in fade-in zoom-in-95 duration-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`${node.category} Insight Panel`}
      >
        {/* Header: Category Badge + Verification Signal + Close */}
        <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-sky-600 dark:text-cyan-400 uppercase block">
                {node.category}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground flex items-center gap-1">
                {node.verificationStatus === "verified" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {node.verificationSource}
                  </span>
                ) : node.verificationStatus === "self-reported" ? (
                  <span className="text-blue-500 dark:text-sky-300 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> {node.verificationSource}
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> {node.verificationSource}
                  </span>
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close insight panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Signal Strength Progress Meter */}
        <div className="space-y-1 shrink-0">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-sky-500" /> Evidence Signal
            </span>
            <span className="text-foreground">{node.signalStrength}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.max(12, node.signalStrength)}%` }}
            />
          </div>
        </div>

        {/* Title & Description Body */}
        <div className="space-y-1 my-auto">
          <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
            {node.valueTitle}
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {node.valueDescription}
          </p>
        </div>

        {/* Key Detected Skills / Technologies / Milestones */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-border/40 shrink-0">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-300 text-[10px] font-medium border border-blue-500/20 dark:border-cyan-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Link Footer */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between shrink-0">
          <Link
            href={node.actionHref}
            className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 group"
          >
            {node.actionLabel}
          </Link>
          <span className="text-[9px] text-muted-foreground">Esc to close</span>
        </div>
      </div>
    </>
  );
}

// Alias export for semantic consistency
export const CareerDNAInsightPanel = CareerDNAInsightCard;
