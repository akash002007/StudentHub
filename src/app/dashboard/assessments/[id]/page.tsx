"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Building2,
  ArrowLeft,
  ArrowRight,
  Shield,
  Camera,
  Mic,
  Monitor,
  Maximize2,
  Award,
  Layers,
  Info,
  Check,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";

export default function StudentAssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { error: toastError } = useToast();

  const [assessment, setAssessment] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [resolvedParams.id]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/student/assessments/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data.assessment);
        setAttempt(data.attempt);
      } else {
        toastError("Assessment not found or unauthorized.");
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to load assessment details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRole="student">
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Loading assessment details...</p>
        </div>
      </RoleGuard>
    );
  }

  if (!assessment) {
    return (
      <RoleGuard allowedRole="student">
        <Card className="p-12 text-center max-w-xl mx-auto border-border bg-card">
          <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-foreground">Assessment Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            The assessment you requested could not be located or has expired.
          </p>
          <Link href="/dashboard/assessments">
            <Button variant="outline" size="sm">
              Back to Assessments
            </Button>
          </Link>
        </Card>
      </RoleGuard>
    );
  }

  const isProctored = assessment.mode === "PROCTORED";
  const isCompleted = attempt?.status === "SUBMITTED" || attempt?.status === "AUTO_SUBMITTED";
  const isActive = attempt?.status === "ACTIVE";
  const isTerminated = attempt?.status === "TERMINATED";
  const pConfig = assessment.proctoringConfig || {};
  const cRules = assessment.candidateRules || {};

  return (
    <RoleGuard allowedRole="student">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard/assessments">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Assessments
            </Button>
          </Link>

          <Badge
            variant={isProctored ? "purple" : "secondary"}
            size="sm"
            className="font-bold gap-1 px-3 py-1 text-xs"
          >
            {isProctored ? <Shield className="w-3.5 h-3.5" /> : null}
            {isProctored ? "Proctored Examination" : "Standard Quiz"}
          </Badge>
        </div>

        {/* Hero Card */}
        <Card className="p-6 sm:p-8 border-border bg-card shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>{assessment.companyName || "StudentHub Partner"}</span>
                <span>•</span>
                <span>{assessment.driveTitle || "Recruitment Drive"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {assessment.title}
              </h1>
              {assessment.description && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  {assessment.description}
                </p>
              )}
            </div>

            {/* Status Pill */}
            <div className="shrink-0">
              {isCompleted ? (
                <Badge variant={attempt?.passed ? "emerald" : "rose"} size="md" className="font-bold">
                  {attempt?.passed ? "Passed ✓" : "Evaluated"}
                </Badge>
              ) : isActive ? (
                <Badge variant="blue" size="md" className="font-bold animate-pulse">
                  In Progress
                </Badge>
              ) : isTerminated ? (
                <Badge variant="rose" size="md" className="font-bold">
                  Terminated
                </Badge>
              ) : (
                <Badge variant="lavender" size="md" className="font-bold">
                  Ready to Take
                </Badge>
              )}
            </div>
          </div>

          {/* Key Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/80">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Duration
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                {assessment.durationMinutes} Minutes
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                Questions
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                {assessment.questionCount || assessment.questions?.length || 0} Questions
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Total Marks
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                {assessment.totalMarks} Points
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Passing Mark
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                {assessment.passingMarks} ({assessment.passingPercentage}%)
              </p>
            </div>
          </div>
        </Card>

        {/* Previous Result Summary if completed */}
        {isCompleted && (
          <Card className="p-6 border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-sm text-foreground">Your Recorded Result</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Submitted on {new Date(attempt?.submittedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-3xl font-extrabold text-foreground">
                {attempt?.totalScore} <span className="text-sm font-semibold text-muted-foreground">/ {assessment.totalMarks} pts</span>
              </span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ({attempt?.percentage}%)
              </span>
              <Badge variant={attempt?.passed ? "emerald" : "rose"} size="sm" className="font-bold ml-auto">
                {attempt?.passed ? "PASSED" : "NOT PASSED"}
              </Badge>
            </div>
          </Card>
        )}

        {/* Instructions & Guidelines */}
        <Card className="p-6 border-border bg-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-foreground">Assessment Instructions</h3>
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
            {assessment.instructions ? (
              <p className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-foreground whitespace-pre-line">
                {assessment.instructions}
              </p>
            ) : (
              <p>Please read all questions carefully before submitting your final responses.</p>
            )}

            <ul className="list-disc list-inside space-y-1 pt-1 text-muted-foreground">
              <li>Once you click Start, the server countdown timer will begin immediately.</li>
              <li>Your responses are automatically synced to the server in real time.</li>
              <li>You can navigate back and forth between questions before submitting.</li>
              {assessment.negativeMarkingEnabled && (
                <li className="text-rose-500 font-medium">Negative marking is enabled for incorrect answers on this assessment.</li>
              )}
            </ul>
          </div>
        </Card>

        {/* Mandatory Proctoring Hardware & Environment Requirements */}
        {isProctored && (
          <Card className="p-6 border-border bg-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-sm text-foreground">Proctoring & Hardware Prerequisites</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Before commencing this assessment, you will complete an automated Environment Readiness Check. Please ensure you have:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-xs min-w-0">
                  <p className="font-bold text-foreground">Webcam Stream</p>
                  <p className="text-[11px] text-muted-foreground">Active camera permission required</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="text-xs min-w-0">
                  <p className="font-bold text-foreground">Microphone Audio</p>
                  <p className="text-[11px] text-muted-foreground">Continuous audio monitoring</p>
                </div>
              </div>

              {pConfig.entireScreenRequired && (
                <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-foreground">Entire Desktop Screen Share</p>
                    <p className="text-[11px] text-muted-foreground">Must share entire screen, not tab</p>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div className="text-xs min-w-0">
                  <p className="font-bold text-foreground">Fullscreen Environment</p>
                  <p className="text-[11px] text-muted-foreground">Exiting fullscreen flags an integrity event</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <strong>Integrity Notice:</strong> Tab switching, minimizing browser windows, or disconnecting media feeds triggers automated server warnings and will terminate the test upon exceeding configured violation thresholds.
            </div>
          </Card>
        )}

        {/* Bottom Actions CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link href="/dashboard/assessments">
            <Button variant="outline" size="md">
              Back to Assessments
            </Button>
          </Link>

          {isCompleted ? (
            <Link href={`/dashboard/assessments/${assessment.id}/result`}>
              <Button
                variant="gradient"
                size="md"
                className="font-bold px-6"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Official Result Breakdown
              </Button>
            </Link>
          ) : isTerminated ? (
            <Link href={`/dashboard/assessments/${assessment.id}/result`}>
              <Button variant="outline" size="md" className="font-bold text-rose-500">
                View Termination Log
              </Button>
            </Link>
          ) : (
            <Link href={`/dashboard/assessments/${assessment.id}/take`}>
              <Button
                variant="gradient"
                size="md"
                className="font-bold px-6"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isActive ? "Resume Active Exam" : "Start Environment Check"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
