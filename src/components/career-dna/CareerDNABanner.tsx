"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dna, Github, ArrowRight, RefreshCw, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShinyCTA } from "@/components/ui/ShinyCTA";
import { Badge } from "@/components/ui/Badge";
import { buildCareerDNANodes } from "./CareerDNAData";
import { CareerDNAInteractiveGraph } from "./CareerDNAInteractiveGraph";
import { CareerDNALockOverlay } from "./CareerDNALockOverlay";
import { User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { isStudentVerified } from "@/lib/student-access-policy";

interface CareerDNABannerProps {
  user?: User | null;
  careerDNA?: any | null;
  summaryData?: any | null;
  isPendingAnalysis?: boolean;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  className?: string;
  hideLockOverlay?: boolean;
}

export function CareerDNABanner({
  user: propUser,
  careerDNA,
  summaryData,
  isPendingAnalysis = false,
  onAnalyze,
  isAnalyzing = false,
  className = "",
  hideLockOverlay = false,
}: CareerDNABannerProps) {
  const router = useRouter();
  const auth = useAuth();
  const user = propUser || auth?.user;

  // Authoritative account verification check (Section 1, 14, 15)
  const isVerified = isStudentVerified(user);
  const isLocked = !isVerified;

  // Extract real metrics where available, falling back gracefully to neutral descriptors
  const nodes = useMemo(() => {
    return buildCareerDNANodes({ user, careerDNA, summaryData });
  }, [user, careerDNA, summaryData]);

  return (
    <Card
      className={`relative overflow-hidden p-4 sm:p-5 border-border/80 bg-card shadow-sm space-y-3 sm:space-y-3.5 transition-all duration-300 ${className}`}
    >
      {/* 1. Header Row: Brand Emblem + Title & Subtitle + Optional CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-sky-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0 shadow-2xs">
            <Dna className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>

          <div className="space-y-0.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                Unlock Your Career DNA
              </h2>
              {isLocked ? (
                <Badge
                  variant="rose"
                  size="sm"
                  className="font-bold text-[9px] tracking-wider uppercase px-2 py-0.5"
                >
                  🔒 Restricted
                </Badge>
              ) : (
                <Badge
                  variant="blue"
                  size="sm"
                  className="font-bold text-[9px] tracking-wider uppercase px-2 py-0.5"
                >
                  Living Talent Graph
                </Badge>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              {isLocked
                ? "Your living profile of skills, projects, and strengths is currently locked pending student verification."
                : "Build a living profile of your skills, projects, experience, and strengths — and discover where your career can go next."}
            </p>
          </div>
        </div>

        {/* Action Panel: Connect GitHub or Analyze (Section 7) */}
        <div className="flex flex-col sm:items-end gap-1 shrink-0 self-start sm:self-center">
          {isLocked ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Student verification is required to connect external accounts"
              className="w-full sm:w-auto text-xs opacity-70 cursor-not-allowed border-border/80 text-muted-foreground"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              Verification Required
            </Button>
          ) : isPendingAnalysis ? (
            <ShinyCTA
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto text-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${isAnalyzing ? "animate-spin" : ""}`}
              />
              {isAnalyzing ? "Analyzing..." : "Analyze Career DNA"}
            </ShinyCTA>
          ) : (
            <ShinyCTA
              onClick={() => router.push("/dashboard/connected-accounts")}
              className="w-full sm:w-auto text-xs"
            >
              <Github className="w-3.5 h-3.5 mr-1.5" /> Connect GitHub
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </ShinyCTA>
          )}

          <span className="text-[10px] text-muted-foreground">
            {isLocked
              ? "Verification required to connect GitHub and analyze data."
              : "Enrich your profile with your projects and contributions."}
          </span>
        </div>
      </div>

      {/* 2. Centerpiece: Interactive Career DNA Constellation / Identity Graph (Sections 2, 3, 4, 6, 10) */}
      <div className="relative z-10 rounded-2xl overflow-hidden">
        <div
          className={
            isLocked
              ? "filter blur-[8px] opacity-35 pointer-events-none select-none transition-all duration-300"
              : "transition-all duration-300"
          }
          aria-hidden={isLocked}
          tabIndex={isLocked ? -1 : undefined}
        >
          <CareerDNAInteractiveGraph nodes={nodes} />
        </div>

        {isLocked && !hideLockOverlay && <CareerDNALockOverlay />}
      </div>

      {/* 3. Bottom Value Strip: Concept Flow (Section 8) */}
      <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5 flex-wrap font-medium">
          <span className="font-bold text-foreground">Identity</span>
          <span>&rarr;</span>
          <span className="font-bold text-foreground">Skills</span>
          <span>&rarr;</span>
          <span className="font-bold text-foreground">Projects</span>
          <span>&rarr;</span>
          <span className="font-bold text-foreground">Experience</span>
          <span>&rarr;</span>
          <span className="font-bold text-foreground">Strengths</span>
          <span>&rarr;</span>
          <span className="font-bold text-foreground">Opportunities</span>
        </div>

        {isLocked ? (
          <Link
            href="/dashboard/documents"
            className="text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1 ml-auto text-[10px]"
          >
            <Lock className="w-3 h-3 text-muted-foreground" /> Career DNA Locked
          </Link>
        ) : (
          <Link
            href="/dashboard/career-dna"
            className="text-blue-600 dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-1 ml-auto"
          >
            Explore Full Career DNA <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </Card>
  );
}

