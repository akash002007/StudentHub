"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Shield,
  Clock,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  Eye,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  UserCheck,
  UserX,
  Calendar,
  Layers,
  Building2,
  Lock,
  Briefcase,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  AssessmentRecord,
  AssessmentAttempt,
  AssessmentIntegrityEvent,
  RecruitmentApplication,
} from "@/types";

export default function AssessmentWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<
    "overview" | "questions" | "candidates" | "results" | "analytics" | "integrity"
  >(initialTab as any);

  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [integrityEvents, setIntegrityEvents] = useState<AssessmentIntegrityEvent[]>([]);
  const [driveApplications, setDriveApplications] = useState<RecruitmentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assign Candidate Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Candidate Result Detail Drawer/Modal
  const [selectedAttemptForDetail, setSelectedAttemptForDetail] = useState<AssessmentAttempt | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessmentWorkspace();
  }, [resolvedParams.id]);

  const fetchAssessmentWorkspace = async () => {
    setIsLoading(true);
    try {
      const [assRes, resRes, analRes, integRes] = await Promise.all([
        fetch(`/api/recruiter/assessments/${resolvedParams.id}`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/results`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/analytics`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/integrity`),
      ]);

      if (assRes.ok) {
        const assData = await assRes.json();
        setAssessment(assData.assessment);

        // Fetch drive applications for assigning
        if (assData.assessment?.driveId) {
          fetchDriveApplications(assData.assessment.driveId);
        }
      }
      if (resRes.ok) {
        const resData = await resRes.json();
        setAttempts(resData.attempts || []);
        setSummary(resData.summary);
      }
      if (analRes.ok) {
        const analData = await analRes.json();
        setAnalytics(analData.analytics);
      }
      if (integRes.ok) {
        const integData = await integRes.json();
        setIntegrityEvents(integData.events || []);
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to load assessment workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDriveApplications = async (driveId: string) => {
    try {
      const res = await fetch(`/api/recruiter/applications?driveId=${driveId}`);
      if (res.ok) {
        const data = await res.json();
        setDriveApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignCandidates = async () => {
    if (selectedCandidateIds.length === 0) {
      toastError("Please select at least one candidate to assign.");
      return;
    }

    setIsAssigning(true);
    try {
      const res = await fetch(`/api/recruiter/assessments/${resolvedParams.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateIds: selectedCandidateIds }),
      });

      if (res.ok) {
        const data = await res.json();
        success(`Assigned ${data.assignedCount} candidates to ${assessment?.title}!`);
        setIsAssignModalOpen(false);
        setSelectedCandidateIds([]);
        fetchAssessmentWorkspace();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to assign candidates.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error assigning candidates.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCandidateStageAction = async (
    applicationId: string,
    action: "SHORTLIST" | "REJECT" | "MOVE_TO_INTERVIEW"
  ) => {
    setIsActionSubmitting(true);
    try {
      const res = await fetch(
        `/api/recruiter/assessments/${resolvedParams.id}/candidates/${applicationId}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            note: `Action performed from Assessment Workspace results table.`,
          }),
        }
      );

      if (res.ok) {
        success(`Successfully updated candidate status (${action})!`);
        setSelectedAttemptForDetail(null);
        fetchAssessmentWorkspace();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to execute stage action.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error executing action.");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  if (isLoading || !assessment) {
    return (
      <RoleGuard allowedRole="recruiter">
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Loading assessment workspace...</p>
        </div>
      </RoleGuard>
    );
  }

  const isProctored = assessment.mode === "PROCTORED";
  const snapshots = assessment.questionSnapshots || [];

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/recruiter/assessments">
                <Button variant="ghost" size="sm" className="p-1.5 h-auto text-muted-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {assessment.title}
              </h1>

              {isProctored ? (
                <Badge variant="purple" size="sm" className="gap-1 font-bold">
                  <Shield className="w-3 h-3" /> Proctored
                </Badge>
              ) : (
                <Badge variant="blue" size="sm">
                  Standard
                </Badge>
              )}

              <Badge
                variant={
                  assessment.status === "ACTIVE"
                    ? "emerald"
                    : assessment.status === "DRAFT"
                    ? "lavender"
                    : "blue"
                }
                size="sm"
                className="font-bold uppercase"
              >
                {assessment.status}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-purple-500" />
              <span>
                Drive: <strong>{assessment.driveTitle}</strong> ({assessment.companyName})
              </span>
              <span>•</span>
              <span>Duration: {assessment.durationMinutes} mins</span>
              <span>•</span>
              <span>{snapshots.length} Snapshotted Questions</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsAssignModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Assign Candidates
            </Button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "questions", label: `Questions (${snapshots.length})`, icon: Sparkles },
            { id: "candidates", label: `Candidates (${assessment.assignedCandidateIds?.length || 0})`, icon: Users },
            { id: "results", label: `Results (${attempts.length})`, icon: Award },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "integrity", label: `Integrity (${integrityEvents.length})`, icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  isActive
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 border-border bg-card lg:col-span-2 space-y-5">
              <div>
                <h3 className="text-base font-bold text-foreground">Assessment Configuration</h3>
                <p className="text-xs text-muted-foreground">Detailed parameters and execution policies.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="font-bold text-muted-foreground">Category</p>
                  <p className="text-sm font-extrabold text-foreground mt-0.5">{assessment.category}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="font-bold text-muted-foreground">Total Marks</p>
                  <p className="text-sm font-extrabold text-foreground mt-0.5">{assessment.totalMarks} pts</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="font-bold text-muted-foreground">Passing Benchmark</p>
                  <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                    {assessment.passingMarks} pts ({assessment.passingPercentage}%)
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="font-bold text-muted-foreground">Duration</p>
                  <p className="text-sm font-extrabold text-foreground mt-0.5">{assessment.durationMinutes} Minutes</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="font-bold text-muted-foreground">Negative Marking</p>
                  <p className="text-sm font-extrabold text-amber-500 mt-0.5">
                    {assessment.negativeMarkingEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="font-bold text-muted-foreground">Question Snapshot</p>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {snapshots.length > 0 ? "Version Locked ✓" : "Pending"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-foreground">Candidate Instructions:</p>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-muted-foreground leading-relaxed">
                  {assessment.instructions}
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border bg-card space-y-4">
              <h3 className="text-base font-bold text-foreground">Proctoring Enforcement</h3>

              {isProctored ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-medium">Webcam Video Track</span>
                    <Badge variant="emerald" size="sm">Mandatory</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-medium">Microphone Audio</span>
                    <Badge variant="emerald" size="sm">Mandatory</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-medium">Entire Desktop Display</span>
                    <Badge variant="emerald" size="sm">Mandatory</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-medium">Fullscreen Lock</span>
                    <Badge variant="emerald" size="sm">Mandatory</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-medium">Max Tab/Window Violations</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {assessment.proctoringConfig?.maxWindowViolations || 2} Allowed
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                    <span className="font-medium">Auto-Termination Limit</span>
                    <Badge variant="rose" size="sm">Strict Limit Active</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Standard mode does not enforce hardware proctoring.</p>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: QUESTIONS SNAPSHOT */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Immutable Question Snapshots</h3>
                <p className="text-xs text-muted-foreground">
                  Questions are sealed into an immutable version snapshot for this assessment attempt.
                </p>
              </div>
              <Badge variant="purple" size="sm" className="gap-1 font-bold">
                <Lock className="w-3 h-3" /> Sealed Version
              </Badge>
            </div>

            <div className="space-y-3">
              {snapshots.map((q, idx) => (
                <Card key={q.id} className="p-4 border-border bg-card space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">Question {idx + 1}</span>
                      <Badge variant="outline" size="sm">
                        {q.type}
                      </Badge>
                      <Badge
                        variant={q.source === "SYSTEM" ? "purple" : "blue"}
                        size="sm"
                        className="font-bold"
                      >
                        {q.source}
                      </Badge>
                      <span className="text-muted-foreground font-semibold">{q.topic}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{q.marks} Marks</span>
                      {q.negativeMarks > 0 && <span className="text-rose-500">(-{q.negativeMarks})</span>}
                    </div>
                  </div>

                  <p className="text-sm font-bold text-foreground">{q.questionText}</p>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.includes(opt)
                          : q.correctAnswer === opt;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border flex items-center justify-between ${
                              isCorrect
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            <span>
                              <strong className="mr-2">{String.fromCharCode(65 + oIdx)}.</strong>
                              {opt}
                            </span>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/50">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CANDIDATES */}
        {activeTab === "candidates" && (
          <Card className="p-5 border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Assigned Candidates</h3>
                <p className="text-xs text-muted-foreground">
                  Candidates authorized to sit for this proctored assessment.
                </p>
              </div>

              <Button variant="gradient" size="sm" onClick={() => setIsAssignModalOpen(true)}>
                + Assign More Candidates
              </Button>
            </div>

            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background">
              {(assessment.assignedCandidateIds || []).map((cid) => {
                const app = driveApplications.find((a) => a.id === cid || a.studentId === cid);
                const att = attempts.find((a) => a.studentId === cid || a.applicationId === cid);

                return (
                  <div key={cid} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center">
                        {app ? app.studentName.charAt(0) : "C"}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{app ? app.studentName : cid}</p>
                        <p className="text-muted-foreground">{app?.university || "Enrolled Student"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          att?.status === "SUBMITTED" || att?.status === "AUTO_SUBMITTED"
                            ? "emerald"
                            : att?.status === "ACTIVE"
                            ? "purple"
                            : att?.status === "TERMINATED"
                            ? "rose"
                            : "outline"
                        }
                        size="sm"
                      >
                        {att ? att.status : "NOT_STARTED"}
                      </Badge>

                      {att && att.totalScore !== undefined && (
                        <span className="font-bold text-foreground">
                          Score: {att.totalScore}/{assessment.totalMarks}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* TAB 4: RESULTS ROSTER */}
        {activeTab === "results" && (
          <div className="space-y-4">
            {/* Overview Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 border-border bg-card text-center">
                <p className="text-xs text-muted-foreground font-semibold">Total Attempted</p>
                <p className="text-2xl font-extrabold text-foreground mt-1">{summary?.startedCount || 0}</p>
              </Card>
              <Card className="p-4 border-border bg-card text-center">
                <p className="text-xs text-muted-foreground font-semibold">Passed Benchmark</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {summary?.passedCount || 0}
                </p>
              </Card>
              <Card className="p-4 border-border bg-card text-center">
                <p className="text-xs text-muted-foreground font-semibold">Below Benchmark</p>
                <p className="text-2xl font-extrabold text-rose-500 mt-1">{summary?.failedCount || 0}</p>
              </Card>
              <Card className="p-4 border-border bg-card text-center">
                <p className="text-xs text-muted-foreground font-semibold">Average Score</p>
                <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  {summary?.averageScore || 0} pts
                </p>
              </Card>
            </div>

            {/* Results Table */}
            <Card className="p-5 border-border bg-card space-y-3">
              <h3 className="text-base font-bold text-foreground">Candidate Examination Roster</h3>

              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Result</th>
                      <th className="p-3">Integrity Verdict</th>
                      <th className="p-3">Time Taken</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attempts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                          No candidate attempts recorded yet.
                        </td>
                      </tr>
                    ) : (
                      attempts.map((att) => (
                        <tr key={att.id} className="hover:bg-muted/30">
                          <td className="p-3">
                            <p className="font-bold text-foreground">{att.studentName}</p>
                            <p className="text-[11px] text-muted-foreground">{att.studentEmail}</p>
                          </td>
                          <td className="p-3 font-extrabold text-foreground">
                            {att.totalScore} / {att.maxScore}
                          </td>
                          <td className="p-3 font-bold text-foreground">{att.percentage}%</td>
                          <td className="p-3">
                            <Badge variant={att.passed ? "emerald" : "rose"} size="sm" className="font-bold">
                              {att.passed ? "PASSED" : "FAILED"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                att.integrityStatus === "CLEAN"
                                  ? "emerald"
                                  : att.integrityStatus === "REVIEW"
                                  ? "lavender"
                                  : "rose"
                              }
                              size="sm"
                              className="font-bold"
                            >
                              {att.integrityStatus === "CLEAN"
                                ? "✓ Clean"
                                : att.integrityStatus === "REVIEW"
                                ? `⚠ Review (${att.violationCount})`
                                : "✕ Terminated"}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {att.durationSecondsTaken
                              ? `${Math.round(att.durationSecondsTaken / 60)} mins`
                              : "N/A"}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAttemptForDetail(att)}
                            >
                              Inspect & Action
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 border-border bg-card space-y-4">
              <h3 className="text-base font-bold text-foreground">Hardest Questions (Lowest Accuracy)</h3>
              <div className="space-y-3 text-xs">
                {analytics?.hardestQuestions && analytics.hardestQuestions.length > 0 ? (
                  analytics.hardestQuestions.map((hq: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-purple-600 dark:text-purple-400">Topic: {hq.topic}</span>
                        <span className="text-rose-500">{hq.accuracy}% Accuracy</span>
                      </div>
                      <p className="font-medium text-foreground">{hq.questionText}</p>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>Attempts: {hq.attemptedCount}</span>
                        <span>Correct: {hq.correctCount}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No attempt data available yet for analytics.</p>
                )}
              </div>
            </Card>

            <Card className="p-5 border-border bg-card space-y-4">
              <h3 className="text-base font-bold text-foreground">Score Distribution</h3>
              <div className="space-y-3">
                {analytics?.scoreDistribution?.map((bucket: any, idx: number) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-muted-foreground">
                      <span>{bucket.range}</span>
                      <span>{bucket.count} Candidates</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all"
                        style={{
                          width: `${
                            analytics.totalAttempts > 0
                              ? (bucket.count / analytics.totalAttempts) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 6: INTEGRITY TIMELINE */}
        {activeTab === "integrity" && (
          <Card className="p-5 border-border bg-card space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Proctoring Integrity Event Log</h3>
              <p className="text-xs text-muted-foreground">
                Recorded browser integrity signals and automated violation actions.
              </p>
            </div>

            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background text-xs">
              {integrityEvents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No integrity violations logged for this assessment session.
                </div>
              ) : (
                integrityEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{evt.candidateName}</span>
                        <Badge
                          variant={
                            evt.severity === "CRITICAL"
                              ? "rose"
                              : evt.severity === "HIGH"
                              ? "rose"
                              : "lavender"
                          }
                          size="sm"
                        >
                          {evt.eventType}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{evt.metadata?.reason || "Signal registered by browser"}</p>
                    </div>

                    <div>
                      <Badge
                        variant={
                          evt.actionTaken === "TERMINATE"
                            ? "rose"
                            : evt.actionTaken === "FINAL_WARNING"
                            ? "rose"
                            : "purple"
                        }
                        size="sm"
                        className="font-bold"
                      >
                        Action: {evt.actionTaken}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* ASSIGN CANDIDATES MODAL */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Candidates from Drive Pipeline"
          description={`Assign eligible applicants from ${assessment.driveTitle} to this assessment.`}
        >
          <div className="space-y-4 text-xs">
            <div className="max-h-72 overflow-y-auto divide-y divide-border border border-border rounded-xl bg-card">
              {driveApplications.map((app) => {
                const isSelected = selectedCandidateIds.includes(app.id);

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCandidateIds(selectedCandidateIds.filter((id) => id !== app.id));
                      } else {
                        setSelectedCandidateIds([...selectedCandidateIds, app.id]);
                      }
                    }}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? "bg-purple-500/10" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <div>
                        <p className="font-bold text-foreground">{app.studentName}</p>
                        <p className="text-muted-foreground">
                          {app.university} • CGPA: {app.cgpa}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" size="sm">
                      {app.status}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-bold text-foreground">
                {selectedCandidateIds.length} Candidate(s) selected
              </span>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleAssignCandidates}
                  disabled={isAssigning || selectedCandidateIds.length === 0}
                >
                  {isAssigning ? "Assigning..." : "Confirm & Assign"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* CANDIDATE RESULT DETAIL & STAGE ACTION MODAL */}
        <Modal
          isOpen={!!selectedAttemptForDetail}
          onClose={() => setSelectedAttemptForDetail(null)}
          title={`Candidate Performance Review: ${selectedAttemptForDetail?.studentName}`}
          description={`Evaluation results and recruitment pipeline progression.`}
        >
          {selectedAttemptForDetail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                <div>
                  <span className="text-muted-foreground">Final Score:</span>
                  <p className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                    {selectedAttemptForDetail.totalScore} / {selectedAttemptForDetail.maxScore} (
                    {selectedAttemptForDetail.percentage}%)
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Result Status:</span>
                  <p className="text-base font-extrabold text-foreground mt-0.5">
                    {selectedAttemptForDetail.passed ? "CLEARED BENCHMARK ✓" : "DID NOT MEET BENCHMARK"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Integrity Verdict:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {selectedAttemptForDetail.integrityStatus} ({selectedAttemptForDetail.violationCount} Violations)
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted At:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {new Date(selectedAttemptForDetail.submittedAt || "").toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stage Progression CTAs */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2.5">
                <h4 className="font-bold text-sm text-foreground">Recruitment Pipeline Actions:</h4>
                <p className="text-muted-foreground">
                  Update this candidate's application in the recruitment drive pipeline.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    variant="gradient"
                    size="sm"
                    disabled={isActionSubmitting}
                    onClick={() =>
                      handleCandidateStageAction(
                        selectedAttemptForDetail.applicationId,
                        "MOVE_TO_INTERVIEW"
                      )
                    }
                    leftIcon={<Calendar className="w-4 h-4" />}
                  >
                    Move to Interview Round
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isActionSubmitting}
                    onClick={() =>
                      handleCandidateStageAction(selectedAttemptForDetail.applicationId, "SHORTLIST")
                    }
                    leftIcon={<UserCheck className="w-4 h-4 text-emerald-600" />}
                  >
                    Shortlist Candidate
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isActionSubmitting}
                    className="text-rose-500 hover:bg-rose-500/10"
                    onClick={() =>
                      handleCandidateStageAction(selectedAttemptForDetail.applicationId, "REJECT")
                    }
                    leftIcon={<UserX className="w-4 h-4" />}
                  >
                    Reject Candidate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleGuard>
  );
}
