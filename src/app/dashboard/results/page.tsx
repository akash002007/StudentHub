"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

interface StudentResultItem {
  resultId: string;
  driveId: string;
  driveTitle: string;
  company: string;
  companyLogo?: string;
  position?: string;
  salaryStipend?: string;
  publishedAt: string;
  selectionStatus: "SELECTED" | "WAITLISTED" | "REJECTED";
  rank: number;
  finalScore: number;
  assessmentScore: number;
  interviewScore: number;
  notes?: string;
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<StudentResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error("Failed to load results:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Official Outcomes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recruitment Results & Merit
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Review published selection rosters, final merit scores, rank standings, and official recruitment outcomes.
            </p>
          </div>

          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
              My Applications
            </Button>
          </Link>
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading recruitment results...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <Award className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-foreground">No published results yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Results are released once recruiters conclude all interview evaluations and lock the official selection roster.
            </p>
            <Link href="/dashboard/applications" className="inline-block mt-4">
              <Button variant="gradient" size="sm">
                Check Application Pipeline
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {results.map((res) => {
              const isSelected = res.selectionStatus === "SELECTED";
              const isWaitlisted = res.selectionStatus === "WAITLISTED";

              return (
                <Card
                  key={res.resultId}
                  className={`p-6 sm:p-8 border rounded-3xl transition-all ${
                    isSelected
                      ? "bg-gradient-to-br from-emerald-500/10 via-card to-blue-500/10 border-emerald-500/40 shadow-sm"
                      : isWaitlisted
                      ? "bg-gradient-to-br from-blue-700 to-blue-800 via-card to-blue-500/10 border-blue-500/40 shadow-sm"
                      : "bg-card border-border shadow-xs"
                  }`}
                >
                  <div className="space-y-6">
                    {/* Top Outcome Announcement */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                            isSelected
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                              : isWaitlisted
                              ? "bg-gradient-to-br from-blue-700 to-blue-800 to-blue-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Award className="w-7 h-7" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              {res.company}
                            </span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-xs text-muted-foreground">
                              Published:{" "}
                              {new Date(res.publishedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                            {isSelected
                              ? "🎉 Congratulations! You are Selected"
                              : isWaitlisted
                              ? "Status: Placed on Official Waitlist"
                              : "Outcome: Not Selected"}
                          </h2>

                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                            {res.driveTitle} ({res.position || "Position"})
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="self-start sm:self-auto shrink-0">
                        {isSelected ? (
                          <Badge variant="emerald" size="lg" className="font-extrabold text-xs px-3.5 py-1">
                            SELECTED
                          </Badge>
                        ) : isWaitlisted ? (
                          <Badge variant="purple" size="lg" className="font-extrabold text-xs px-3.5 py-1">
                            WAITLISTED (#{res.rank})
                          </Badge>
                        ) : (
                          <Badge variant="rose" size="lg" className="font-bold text-xs px-3.5 py-1">
                            NOT SELECTED
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Explanatory Message */}
                    <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {isSelected ? (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                          We are pleased to inform you that following your outstanding performance across the technical assessment and engineering interview rounds, you have been selected for this position. The company onboarding team will reach out with the formal letter and joining details.
                        </div>
                      ) : isWaitlisted ? (
                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200">
                          You are currently placed on the official waitlist (Merit Rank #{res.rank}). If primary selected candidates decline or additional vacancies become available, offers will be extended strictly in order of merit rank.
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border text-muted-foreground">
                          Thank you for your time and dedication throughout the recruitment process. While your application was not selected for this particular drive, we encourage you to explore other matching opportunities on StudentHub.
                        </div>
                      )}
                    </div>

                    {/* Merit Scores & Ranking Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-xs">
                        <span className="text-muted-foreground block text-[11px]">Assessment Score</span>
                        <strong className="text-base font-extrabold text-foreground">
                          {res.assessmentScore} / 100
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-xs">
                        <span className="text-muted-foreground block text-[11px]">Interview Score</span>
                        <strong className="text-base font-extrabold text-foreground">
                          {res.interviewScore} / 100
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-xs">
                        <span className="text-muted-foreground block text-[11px]">Final Merit Score</span>
                        <strong className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                          {res.finalScore} / 100
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-xs">
                        <span className="text-muted-foreground block text-[11px]">Merit Rank</span>
                        <strong className="text-base font-extrabold text-foreground">
                          #{res.rank}
                        </strong>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
