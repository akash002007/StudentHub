"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Code2,
  Award,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CodeforcesConnection, CodeforcesDNA } from "@/types";

interface CodeforcesInsightsProps {
  userId: string;
  onSyncClick?: () => void;
  isSyncingManual?: boolean;
}

export function CodeforcesInsights({ userId, onSyncClick, isSyncingManual }: CodeforcesInsightsProps) {
  const [connection, setConnection] = useState<CodeforcesConnection | null>(null);
  const [dna, setDna] = useState<CodeforcesDNA | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCodeforcesStatus = async () => {
    try {
      const res = await fetch(`/api/integrations/codeforces/status?userId=${encodeURIComponent(userId)}`);
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
      console.warn("Failed to fetch Codeforces status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCodeforcesStatus();
  }, [userId]);

  if (isLoading || !connection || connection.status !== "VERIFIED") return null;

  const difficultyBrackets = connection.difficultyDistribution || {
    "800-999": 0,
    "1000-1199": 0,
    "1200-1399": 0,
    "1400-1599": 0,
    "1600-1799": 0,
    "1800+": 0,
  };

  const totalBracketSolved = Object.values(difficultyBrackets).reduce((a, b) => a + b, 0) || 1;

  return (
    <Card hoverEffect className="p-6 border-rose-500/20 bg-gradient-to-br from-card via-card to-rose-500/5 dark:to-rose-950/20 space-y-6 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground tracking-tight">Codeforces Competitive Intelligence</h3>
              <Badge variant="rose" size="sm" className="font-semibold text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" /> Verified Public API Data
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Connected as <strong className="text-rose-600 dark:text-rose-400">@{connection.handle}</strong>. Solved problem analysis and rating progression.
            </p>
          </div>
        </div>

        <a
          href={`https://codeforces.com/profile/${connection.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0"
        >
          View Codeforces Profile <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Score & Rating Card */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block">
              Codeforces DNA Score
            </span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border-4 border-rose-500 flex flex-col items-center justify-center text-center shrink-0 shadow-md shadow-rose-500/10">
                <span className="text-2xl font-extrabold text-foreground">{dna?.score || 72}</span>
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">/ 100</span>
              </div>
              <div className="space-y-1">
                <Badge variant="rose" size="sm" className="font-bold text-xs capitalize">
                  {connection.rank}
                </Badge>
                <div className="text-xs text-muted-foreground pt-0.5">
                  Rating: <strong className="text-foreground">{connection.rating}</strong> (Max: {connection.maxRating})
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                  <TrendingUp className="w-3 h-3" /> {connection.ratingTrend} Trend
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-xs">
            <div className="p-2 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Solved Problems</span>
              <span className="font-bold text-foreground text-sm">{connection.solvedProblemsCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Rated Contests</span>
              <span className="font-bold text-foreground text-sm">{connection.contestsCount}</span>
            </div>
          </div>
        </div>

        {/* Middle: Difficulty Distribution */}
        <div className="md:col-span-8 space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Solved Problem Difficulty Distribution</span>
              <span className="text-muted-foreground text-[10px] font-normal">{connection.solvedProblemsCount} Total Accepted</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(difficultyBrackets).map(([bracket, count]) => {
                const pct = Math.round((count / totalBracketSolved) * 100);
                return (
                  <div key={bracket} className="p-3 rounded-xl bg-card border border-border/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-muted-foreground text-[11px]">{bracket}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold">{count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strongest Tags */}
          {connection.strongestTags && connection.strongestTags.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Top Algorithm Tags</h4>
              <div className="flex flex-wrap gap-2">
                {connection.strongestTags.map((t) => (
                  <span
                    key={t.tag}
                    className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="capitalize">{t.tag}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({t.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
