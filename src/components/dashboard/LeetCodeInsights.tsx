"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Trophy,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LeetCodeConnection, LeetCodeDNA } from "@/types";

interface LeetCodeInsightsProps {
  userId: string;
  onSyncClick?: () => void;
  isSyncingManual?: boolean;
}

export function LeetCodeInsights({
  userId,
  onSyncClick,
  isSyncingManual,
}: LeetCodeInsightsProps) {
  const [connection, setConnection] = useState<LeetCodeConnection | null>(null);
  const [dna, setDna] = useState<LeetCodeDNA | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeetCodeStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/integrations/leetcode/status?userId=${encodeURIComponent(userId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.connected && data.connection) {
          setConnection(data.connection);
          setDna(data.dna);
        } else {
          setConnection(null);
          setDna(null);
        }
      }
    } catch {
      console.warn("Failed to fetch LeetCode status");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLeetCodeStatus();
  }, [fetchLeetCodeStatus]);

  if (isLoading || !connection || connection.status !== "VERIFIED") return null;

  const totalSolved = connection.totalProblemsSolved || 0;
  const easy = connection.easySolved || 0;
  const medium = connection.mediumSolved || 0;
  const hard = connection.hardSolved || 0;
  const totalForBar = Math.max(totalSolved, 1);

  const easyPct = Math.round((easy / totalForBar) * 100);
  const mediumPct = Math.round((medium / totalForBar) * 100);
  const hardPct = Math.round((hard / totalForBar) * 100);

  return (
    <Card
      hoverEffect
      className="p-6 border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 dark:to-amber-950/20 space-y-6 shadow-md"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                LeetCode Problem-Solving Intelligence
              </h3>
              <Badge variant="amber" size="sm" className="font-semibold text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" /> Verified Public API Data
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Connected as{" "}
              <strong className="text-amber-600 dark:text-amber-400">
                @{connection.leetcodeId}
              </strong>
              . Algorithmic problem metrics &amp; contest rating.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onSyncClick && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onSyncClick}
              disabled={isSyncingManual || connection.syncStatus === "SYNCING"}
            >
              {isSyncingManual || connection.syncStatus === "SYNCING" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Sync Now
                </>
              )}
            </Button>
          )}

          <a
            href={`https://leetcode.com/${connection.leetcodeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
          >
            View LeetCode Profile <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sync Failure Banner if sync failed */}
      {connection.syncStatus === "FAILED" && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {connection.error || "Sync failed. Try again."} (Previous valid statistics have been preserved.)
          </span>
        </div>
      )}

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Score & Rating Card */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
              LeetCode DNA Score
            </span>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-amber-500/10 border-4 border-amber-500 flex flex-col items-center justify-center text-center shrink-0 shadow-md shadow-amber-500/10">
                <span className="text-2xl font-extrabold text-foreground">
                  {dna?.score || 75}
                </span>
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  / 100
                </span>
              </div>
              <div className="space-y-1">
                <Badge variant="amber" size="sm" className="font-bold text-xs capitalize">
                  {connection.contestRank || "Active Solver"}
                </Badge>
                <div className="text-xs text-muted-foreground pt-0.5">
                  Contest Rating:{" "}
                  <strong className="text-foreground">
                    {connection.contestRating > 0 ? connection.contestRating : "Unavailable"}
                  </strong>
                </div>
                <div className="text-[11px] text-muted-foreground pt-0.5">
                  Global Rank:{" "}
                  <strong className="text-foreground">
                    {connection.ranking > 0
                      ? `#${connection.ranking.toLocaleString()}`
                      : "Unavailable"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-xs">
            <div className="p-2 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Total Solved</span>
              <span className="font-bold text-foreground text-sm">{totalSolved}</span>
            </div>
            <div className="p-2 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Rated Contests</span>
              <span className="font-bold text-foreground text-sm">
                {connection.contestsCount > 0 ? connection.contestsCount : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Difficulty Breakdown */}
        <div className="md:col-span-8 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Solved Problem Difficulty Breakdown</span>
              <span className="text-muted-foreground text-[10px] font-normal">
                {totalSolved} Total Solved
              </span>
            </h4>

            {/* 3 Difficulty Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Easy */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Easy</span>
                  <span className="font-extrabold text-foreground text-sm">{easy}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${easyPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground block">{easyPct}% of solved</span>
              </div>

              {/* Medium */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Medium</span>
                  <span className="font-extrabold text-foreground text-sm">{medium}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${mediumPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground block">{mediumPct}% of solved</span>
              </div>

              {/* Hard */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-rose-600 dark:text-rose-400 font-bold">Hard</span>
                  <span className="font-extrabold text-foreground text-sm">{hard}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${hardPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground block">{hardPct}% of solved</span>
              </div>
            </div>
          </div>

          {/* Strengths & Career DNA Evidence */}
          {dna && dna.strengths && dna.strengths.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Algorithmic Strengths in Career DNA
              </h4>
              <div className="space-y-1.5">
                {dna.strengths.map((st, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
