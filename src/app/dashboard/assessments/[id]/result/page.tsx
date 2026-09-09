"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Building2,
  FileText,
  Shield,
  Layers,
  HelpCircle,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";

export default function StudentAssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { error: toastError } = useToast();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [resolvedParams.id]);

  const fetchResult = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/student/assessments/${resolvedParams.id}/result`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const err = await res.json();
        toastError(err.error || "Result not found or not yet released.");
      }
    } catch (err) {
      console.error(err);
      toastError("Failed loading assessment result.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRole="student">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-muted-foreground font-semibold">Retrieving official assessment score...</p>
        </div>
      </RoleGuard>
    );
  }

  if (!data || !data.attempt) {
    return (
      <RoleGuard allowedRole="student">
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <Card className="p-8 border-border bg-card space-y-4 shadow-md rounded-3xl">
            <Award className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Result Not Available</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your assessment result is either pending recruiter evaluation, not yet completed, or configured to be announced with recruitment drive shortlists.
            </p>
            <div className="pt-2">
              <Link href="/dashboard/assessments">
                <Button variant="outline" size="sm">
                  Back to My Assessments
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  const { assessment, attempt, breakdown } = data;
  const isTerminated = attempt.status === "TERMINATED";
  const hasPassed = attempt.passed;
  const durationMins = attempt.durationSecondsTaken
    ? Math.max(1, Math.round(attempt.durationSecondsTaken / 60))
    : null;

  return (
    <RoleGuard allowedRole="student">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard/assessments">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to My Assessments
            </Button>
          </Link>

          <Badge variant={assessment.mode === "PROCTORED" ? "purple" : "outline"} size="sm" className="font-bold">
            {assessment.mode === "PROCTORED" ? "Proctored Examination" : "Standard Assessment"}
          </Badge>
        </div>

        {/* Hero Scorecard */}
        <Card className="p-6 sm:p-8 border-border bg-card shadow-lg rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>{assessment.companyName || "StudentHub Partner"}</span>
                <span>•</span>
                <span>{assessment.driveTitle || "Recruitment Drive"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {assessment.title} — Official Result
              </h1>
              <p className="text-xs text-muted-foreground">
                Evaluated server-side via StudentHub Automated Assessment Engine.
              </p>
            </div>

            <div className="shrink-0">
              {isTerminated ? (
                <Badge variant="rose" size="md" className="font-bold px-4 py-1.5">
                  Terminated
                </Badge>
              ) : hasPassed ? (
                <Badge variant="emerald" size="md" className="font-bold px-4 py-1.5 gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Benchmark Met ✓
                </Badge>
              ) : (
                <Badge variant="rose" size="md" className="font-bold px-4 py-1.5 gap-1.5">
                  <XCircle className="w-4 h-4" /> Benchmark Not Met
                </Badge>
              )}
            </div>
          </div>

          {/* Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Score</span>
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                {attempt.totalScore} <span className="text-sm font-semibold text-muted-foreground">/ {assessment.totalMarks}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Percentage</span>
              <div className="text-2xl sm:text-3xl font-black text-foreground">
                {attempt.percentage}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Passing Mark</span>
              <div className="text-sm sm:text-base font-bold text-foreground pt-1">
                {assessment.passingMarks} ({assessment.passingPercentage}%)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time Taken</span>
              <div className="text-sm sm:text-base font-bold text-foreground pt-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{durationMins ? `${durationMins} mins` : "Completed"}</span>
              </div>
            </div>
          </div>

          {/* Additional Submission Metadata */}
          <div className="p-4 rounded-2xl bg-background border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              <span>Submitted at: </span>
              <strong className="text-foreground">
                {new Date(attempt.submittedAt || Date.now()).toLocaleString()}
              </strong>
            </div>
            <div>
              <span>Integrity Status: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {attempt.violationCount > 0 ? `${attempt.violationCount} Violations Recorded` : "Clean Session ✓"}
              </span>
            </div>
            <div>
              <span>Attempt ID: </span>
              <code className="text-[11px] bg-muted px-2 py-0.5 rounded font-mono">{attempt.id}</code>
            </div>
          </div>
        </Card>

        {/* Detailed Question Review Breakdown */}
        {breakdown && breakdown.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Performance Breakdown</h3>
                <p className="text-xs text-muted-foreground">
                  Review your answers, correct solutions, and score allocations.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-600">
                {breakdown.filter((b: any) => b.isCorrect).length}/{breakdown.length} Correct
              </span>
            </div>

            <div className="space-y-4">
              {breakdown.map((item: any, idx: number) => (
                <Card
                  key={item.questionId}
                  className={`p-5 sm:p-6 border rounded-3xl space-y-3.5 ${
                    item.isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                      : item.isAnswered
                      ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-border/80">
                    <span className="font-black text-foreground">
                      Question {item.orderIndex || idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {item.marksAwarded > 0 ? (
                          <span className="text-emerald-600 font-extrabold">+{item.marksAwarded} Marks</span>
                        ) : item.marksAwarded < 0 ? (
                          <span className="text-rose-500 font-extrabold">{item.marksAwarded} Marks</span>
                        ) : (
                          <span className="text-muted-foreground">0 Marks</span>
                        )}
                      </span>
                      {item.isCorrect ? (
                        <Badge variant="emerald" size="sm" className="font-bold gap-1">
                          <Check className="w-3 h-3" /> Correct
                        </Badge>
                      ) : item.isAnswered ? (
                        <Badge variant="rose" size="sm" className="font-bold gap-1">
                          <X className="w-3 h-3" /> Incorrect
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm">
                          Unanswered
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-bold text-foreground leading-relaxed">
                    {item.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase">Your Answer:</span>
                      <p className="font-semibold text-foreground">
                        {item.candidateAnswer
                          ? Array.isArray(item.candidateAnswer)
                            ? item.candidateAnswer.join(", ")
                            : String(item.candidateAnswer)
                          : "None provided"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase">Expected Solution:</span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.correctAnswer
                          ? Array.isArray(item.correctAnswer)
                            ? item.correctAnswer.join(", ")
                            : String(item.correctAnswer)
                          : "Not disclosed"}
                      </p>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200">
                      <strong>Explanation: </strong>
                      <span>{item.explanation}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-6 border-border bg-card text-center space-y-2 rounded-3xl">
            <Shield className="w-8 h-8 text-muted-foreground/50 mx-auto" />
            <h4 className="font-bold text-sm text-foreground">Detailed Solutions Confidential</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Per recruitment drive integrity policies, question keys and explanations are withheld until the candidate shortlisting phase concludes.
            </p>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <Link href="/dashboard/assessments">
            <Button variant="outline" size="md">
              Back to Assessments Hub
            </Button>
          </Link>

          <Link href="/dashboard/applications">
            <Button variant="gradient" size="md" rightIcon={<Layers className="w-4 h-4" />}>
              View Recruitment Applications
            </Button>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
