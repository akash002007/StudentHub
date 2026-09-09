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
  History,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Hash,
  Sliders,
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
  QuestionObjection,
  AssessmentAuthorization,
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
    "overview" | "blueprint" | "questions" | "candidates" | "results" | "merit" | "objections" | "analytics" | "integrity" | "versions"
  >(initialTab as any);

  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [integrityEvents, setIntegrityEvents] = useState<AssessmentIntegrityEvent[]>([]);
  const [driveApplications, setDriveApplications] = useState<RecruitmentApplication[]>([]);
  const [meritData, setMeritData] = useState<{
    meritList: AssessmentAttempt[];
    totalQualified: number;
    totalAppeared: number;
  }>({ meritList: [], totalQualified: 0, totalAppeared: 0 });
  const [objections, setObjections] = useState<QuestionObjection[]>([]);
  const [authorizations, setAuthorizations] = useState<AssessmentAuthorization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assign Candidate Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Merit Selection & Bulk Shortlist
  const [selectedMeritCandidateIds, setSelectedMeritCandidateIds] = useState<string[]>([]);
  const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);
  const [meritFilter, setMeritFilter] = useState<"ALL" | "QUALIFIED" | "SHORTLISTED" | "PENDING">("ALL");

  // Objection Resolution Modal
  const [selectedObjection, setSelectedObjection] = useState<QuestionObjection | null>(null);
  const [objectionResolutionNotes, setObjectionResolutionNotes] = useState("");
  const [isResolvingObjection, setIsResolvingObjection] = useState(false);

  // Re-evaluation Modal
  const [isReevalModalOpen, setIsReevalModalOpen] = useState(false);
  const [reevalQuestionId, setReevalQuestionId] = useState("");
  const [reevalCorrectAnswer, setReevalCorrectAnswer] = useState("");
  const [isReevaluating, setIsReevaluating] = useState(false);

  // Candidate Result Detail Drawer/Modal
  const [selectedAttemptForDetail, setSelectedAttemptForDetail] = useState<AssessmentAttempt | null>(null);

  useEffect(() => {
    fetchAssessmentWorkspace();
  }, [resolvedParams.id]);

  const fetchAssessmentWorkspace = async () => {
    setIsLoading(true);
    try {
      const [assRes, resRes, analRes, integRes, meritRes, objRes, authRes] = await Promise.all([
        fetch(`/api/recruiter/assessments/${resolvedParams.id}`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/results`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/analytics`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/integrity`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/merit`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/objections`),
        fetch(`/api/recruiter/assessments/${resolvedParams.id}/authorizations`),
      ]);

      if (assRes.ok) {
        const assData = await assRes.json();
        setAssessment(assData.assessment);

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
      if (meritRes.ok) {
        const mData = await meritRes.json();
        setMeritData({
          meritList: mData.meritList || [],
          totalQualified: mData.totalQualified || 0,
          totalAppeared: mData.totalAppeared || 0,
        });
      }
      if (objRes.ok) {
        const oData = await objRes.json();
        setObjections(oData.objections || []);
      }
      if (authRes.ok) {
        const aData = await authRes.json();
        setAuthorizations(aData.authorizations || []);
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to load examination workspace.");
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
        success(`Assigned ${data.assignedCount} candidate authorizations generated!`);
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

  const handleBulkMeritAction = async (action: "SHORTLIST" | "REJECT" | "MOVE_TO_INTERVIEW") => {
    if (selectedMeritCandidateIds.length === 0) {
      toastError("Please select candidate(s) from the Merit List.");
      return;
    }

    setIsBulkActionRunning(true);
    try {
      const res = await fetch(`/api/recruiter/assessments/${resolvedParams.id}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateIds: selectedMeritCandidateIds,
          action,
          notes: `Bulk ${action} executed from RPSC Merit Workspace`,
        }),
      });

      if (res.ok) {
        success(`Updated ${selectedMeritCandidateIds.length} candidate(s) to ${action}!`);
        setSelectedMeritCandidateIds([]);
        fetchAssessmentWorkspace();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to apply merit action.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error applying action.");
    } finally {
      setIsBulkActionRunning(false);
    }
  };

  const handleCreateNewVersion = async () => {
    try {
      const res = await fetch(`/api/recruiter/assessments/${resolvedParams.id}/version`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        success(`Created mutable Version ${data.newAssessment.version}! Existing attempts remain locked to Version ${assessment?.version || 1}.`);
        window.location.href = `/dashboard/recruiter/assessments/${data.newAssessment.id}`;
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to create new version.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error creating new version.");
    }
  };

  const handleResolveObjection = async (status: "ACCEPTED" | "REJECTED") => {
    if (!selectedObjection) return;
    setIsResolvingObjection(true);
    try {
      const res = await fetch(`/api/recruiter/assessments/${resolvedParams.id}/objections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectionId: selectedObjection.id,
          status,
          resolutionNotes: objectionResolutionNotes,
        }),
      });

      if (res.ok) {
        success(`Objection marked as ${status}!`);
        setSelectedObjection(null);
        setObjectionResolutionNotes("");
        fetchAssessmentWorkspace();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to resolve objection.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error resolving objection.");
    } finally {
      setIsResolvingObjection(false);
    }
  };

  const handleExecuteReevaluation = async () => {
    if (!reevalQuestionId || !reevalCorrectAnswer.trim()) {
      toastError("Please select a question and specify the corrected answer key.");
      return;
    }

    setIsReevaluating(true);
    try {
      const res = await fetch(`/api/recruiter/assessments/${resolvedParams.id}/reevaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updatedAnswerKeys: {
            [reevalQuestionId]: reevalCorrectAnswer.trim(),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        success(`Re-evaluated ${data.reevaluatedCount} attempts! Merit ranks and cutoff qualification recalculated.`);
        setIsReevalModalOpen(false);
        setReevalQuestionId("");
        setReevalCorrectAnswer("");
        fetchAssessmentWorkspace();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to re-evaluate assessment.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error re-evaluating assessment.");
    } finally {
      setIsReevaluating(false);
    }
  };

  if (isLoading || !assessment) {
    return (
      <RoleGuard allowedRole="recruiter">
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-neutral-500">Loading formal examination workspace...</p>
        </div>
      </RoleGuard>
    );
  }

  const isProctored = assessment.mode === "PROCTORED";
  const snapshots = assessment.questionSnapshots || [];

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4">
        {/* Top Breadcrumb & Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/recruiter/assessments">
                <Button variant="ghost" size="sm" className="p-1.5 h-auto text-neutral-500">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {assessment.title}
              </h1>

              <Badge variant="outline" className="text-xs font-mono font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 border-primary-200">
                v{assessment.version || 1} {assessment.isVersionLocked ? "LOCKED" : "DRAFT"}
              </Badge>

              {isProctored ? (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200 gap-1 font-bold">
                  <Shield className="w-3 h-3" /> Proctored
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-neutral-500">
                  Standard
                </Badge>
              )}

              <Badge
                variant="outline"
                className={`text-xs font-bold ${
                  assessment.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : assessment.status === "DRAFT"
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-blue-50 text-blue-600 border-blue-200"
                }`}
              >
                {assessment.status}
              </Badge>
            </div>

            <p className="text-xs text-neutral-500">
              Drive: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{assessment.driveTitle}</span> •
              {assessment.sections?.length || 1} Sections • {snapshots.length} Questions • {assessment.totalMarks} Total Marks • {assessment.durationMinutes} Mins
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssignModalOpen(true)}
              className="text-xs font-semibold"
            >
              <Users className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
              Assign Candidates
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewVersion}
              className="text-xs font-semibold"
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              New Version
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReevalModalOpen(true)}
              className="text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Re-evaluate
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto scrollbar-thin pb-1">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "blueprint", label: "Blueprint & Pattern", icon: Sliders },
            { id: "merit", label: `Merit List (${meritData.meritList.length})`, icon: Award },
            { id: "candidates", label: `Authorizations (${authorizations.length || assessment.assignedCandidateIds.length})`, icon: Users },
            { id: "questions", label: `Questions (${snapshots.length})`, icon: Sparkles },
            { id: "results", label: `Results (${attempts.length})`, icon: CheckCircle2 },
            { id: "objections", label: `Objections (${objections.length})`, icon: HelpCircle },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "integrity", label: `Integrity (${integrityEvents.length})`, icon: Shield },
            { id: "versions", label: "Versioning & Audit", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-b-2 border-primary-600 text-primary-600 font-bold bg-primary-50/20 dark:bg-primary-950/20"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-[11px] text-neutral-500 block">Assigned Candidates</span>
                <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                  {authorizations.length || assessment.assignedCandidateIds.length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-[11px] text-neutral-500 block">Appeared / Submitted</span>
                <span className="text-xl font-bold font-mono text-primary-600">{summary?.completedCount || 0}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-[11px] text-neutral-500 block">Passed Benchmark</span>
                <span className="text-xl font-bold font-mono text-emerald-600">{summary?.passedCount || 0}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-[11px] text-neutral-500 block">Shortlist Qualified</span>
                <span className="text-xl font-bold font-mono text-purple-600">{meritData.totalQualified}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-[11px] text-neutral-500 block">Average Score</span>
                <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">{summary?.averageScore || 0}M</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-[11px] text-neutral-500 block">Integrity Reviews</span>
                <span className="text-xl font-bold font-mono text-amber-600">{summary?.reviewIntegrityCount || 0}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 space-y-3">
                <h3 className="font-bold text-sm">Examination Parameters</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">Category & Type:</span>
                    <span className="font-semibold">{assessment.category} • {assessment.examinationType || "Technical Examination"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">Duration:</span>
                    <span className="font-mono">{assessment.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">Total Marks:</span>
                    <span className="font-mono">{assessment.totalMarks} Marks</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">Negative Marking:</span>
                    <span className="font-mono text-rose-600">
                      {assessment.negativeMarkingEnabled ? `-${assessment.negativeMarkingRate || 0.33}x per incorrect` : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">Passing Criteria:</span>
                    <span className="font-mono text-emerald-600">{assessment.passingMarks} Marks ({assessment.passingPercentage}%)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Shortlisting Cutoff Policy:</span>
                    <span className="font-mono text-purple-600">
                      {assessment.cutoffConfig?.cutoffType || "TOP_PERCENTAGE"} ({assessment.cutoffConfig?.cutoffValue || 20}%)
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <h3 className="font-bold text-sm">Section Breakdown</h3>
                <div className="space-y-2">
                  {(assessment.sections || []).map((s, i) => (
                    <div key={s.id} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-semibold">{i + 1}. {s.name}</span>
                        <p className="text-[11px] text-neutral-400 font-mono">Cutoff: {s.cutoffMarks || 0}M • Neg: -{s.negativeMarksPerQuestion}M</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold">{s.totalQuestions} Questions</span>
                        <span className="text-neutral-400 block">{s.totalMarks} Marks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: BLUEPRINT & PATTERN */}
        {activeTab === "blueprint" && (
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div>
                  <h2 className="text-base font-bold">Official Question Paper Blueprint</h2>
                  <p className="text-xs text-neutral-500">Formal specifications for examination generation and difficulty distribution.</p>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-primary-600">
                  Version {assessment.version || 1} Specification
                </Badge>
              </div>

              <div className="space-y-4">
                {(assessment.sections || []).map((sec, idx) => (
                  <div key={sec.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        Section {idx + 1}: {sec.name}
                      </span>
                      <span className="font-mono text-neutral-500">
                        {sec.totalQuestions} Questions • {sec.totalMarks} Marks • Section Cutoff: {sec.cutoffMarks}M
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                        <span className="text-[10px] font-semibold text-emerald-700 block">Easy Pool</span>
                        <span className="text-sm font-bold font-mono text-emerald-800">{sec.easyCount || 0} Questions</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                        <span className="text-[10px] font-semibold text-amber-700 block">Medium Pool</span>
                        <span className="text-sm font-bold font-mono text-amber-800">{sec.mediumCount || 0} Questions</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                        <span className="text-[10px] font-semibold text-rose-700 block">Hard Pool</span>
                        <span className="text-sm font-bold font-mono text-rose-800">{sec.hardCount || 0} Questions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold">Merit Ranking & Tie-Break Policy</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 border rounded-xl">
                  <span className="text-neutral-500 block text-[10px] uppercase">Primary Metric</span>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{assessment.meritConfig?.primaryCriterion || "TOTAL_SCORE"}</span>
                </div>
                <div className="p-3 border rounded-xl">
                  <span className="text-neutral-500 block text-[10px] uppercase">Secondary Metric</span>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{assessment.meritConfig?.secondaryCriterion || "SECTION_SCORE"}</span>
                </div>
                <div className="p-3 border rounded-xl">
                  <span className="text-neutral-500 block text-[10px] uppercase">Final Tie-Breaker</span>
                  <span className="font-bold text-sm text-emerald-600">{assessment.meritConfig?.tieBreakerRule || "SUBMISSION_TIME"}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: MERIT LIST (RPSC-STYLE) */}
        {activeTab === "merit" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold">Official Examination Merit List</h2>
                <p className="text-xs text-neutral-500">
                  Calculated based on multi-tier merit ranking, negative marking, and shortlisting cutoffs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkMeritAction("SHORTLIST")}
                  disabled={selectedMeritCandidateIds.length === 0 || isBulkActionRunning}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" /> Shortlist ({selectedMeritCandidateIds.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkMeritAction("MOVE_TO_INTERVIEW")}
                  disabled={selectedMeritCandidateIds.length === 0 || isBulkActionRunning}
                  className="text-xs font-semibold text-primary-600 border-primary-200"
                >
                  <Briefcase className="w-3.5 h-3.5 mr-1" /> Move to Interview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkMeritAction("REJECT")}
                  disabled={selectedMeritCandidateIds.length === 0 || isBulkActionRunning}
                  className="text-xs font-semibold text-rose-600 border-rose-200"
                >
                  <UserX className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
              </div>
            </div>

            {/* Merit Table */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 font-semibold text-neutral-600 dark:text-neutral-300">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedMeritCandidateIds.length > 0 &&
                          selectedMeritCandidateIds.length === meritData.meritList.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMeritCandidateIds(meritData.meritList.map((m) => m.studentId));
                          } else {
                            setSelectedMeritCandidateIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="py-3 px-3 w-16">Rank</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-3 font-mono">Score</th>
                    <th className="py-3 px-3 font-mono">%</th>
                    <th className="py-3 px-4">Section Scores</th>
                    <th className="py-3 px-3">Passing</th>
                    <th className="py-3 px-3">Cutoff</th>
                    <th className="py-3 px-3">Integrity</th>
                    <th className="py-3 px-3">Shortlist Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {meritData.meritList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-neutral-500">
                        No candidates have submitted attempts for this examination yet.
                      </td>
                    </tr>
                  ) : (
                    meritData.meritList.map((att) => {
                      const isSelected = selectedMeritCandidateIds.includes(att.studentId);
                      return (
                        <tr
                          key={att.id}
                          className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors ${
                            isSelected ? "bg-primary-50/20 dark:bg-primary-950/20" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedMeritCandidateIds(
                                    selectedMeritCandidateIds.filter((id) => id !== att.studentId)
                                  );
                                } else {
                                  setSelectedMeritCandidateIds([...selectedMeritCandidateIds, att.studentId]);
                                }
                              }}
                            />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-sm">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                              att.meritRank === 1
                                ? "bg-amber-100 text-amber-800 font-extrabold"
                                : att.meritRank === 2
                                ? "bg-neutral-200 text-neutral-800 font-bold"
                                : att.meritRank === 3
                                ? "bg-amber-50 text-amber-700"
                                : "text-neutral-500"
                            }`}>
                              #{att.meritRank}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-neutral-900 dark:text-white">{att.studentName}</div>
                            <span className="text-[10px] text-neutral-400 font-mono">{att.applicationId}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">{att.totalScore}M</td>
                          <td className="py-3 px-3 font-mono">{att.percentage}%</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {Object.values(att.sectionScores || {}).map((sec) => (
                                <span
                                  key={sec.sectionId}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                    sec.passed
                                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700"
                                      : "bg-rose-50 dark:bg-rose-950 text-rose-700"
                                  }`}
                                  title={`${sec.sectionName}: ${sec.score}/${sec.maxMarks}`}
                                >
                                  {sec.sectionName.slice(0, 4)}: {sec.score}M
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                att.passed ? "border-emerald-300 text-emerald-700" : "border-rose-300 text-rose-700"
                              }`}
                            >
                              {att.passed ? "PASSED" : "FAILED"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                att.cutoffCleared
                                  ? "border-purple-300 bg-purple-50 text-purple-700"
                                  : "border-neutral-300 text-neutral-500"
                              }`}
                            >
                              {att.cutoffCleared ? "QUALIFIED" : "NOT MET"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                att.integrityStatus === "CLEAN"
                                  ? "border-emerald-300 text-emerald-700"
                                  : att.integrityStatus === "REVIEW"
                                  ? "border-amber-300 text-amber-700"
                                  : "border-rose-300 text-rose-700"
                              }`}
                            >
                              {att.integrityStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold">
                            <span className={att.shortlistStatus === "SHORTLISTED" ? "text-emerald-600" : "text-neutral-500"}>
                              {att.shortlistStatus || "PENDING"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CANDIDATE AUTHORIZATIONS */}
        {activeTab === "candidates" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div>
                <h2 className="text-sm font-bold">Candidate Examination Authorizations</h2>
                <p className="text-xs text-neutral-500">
                  Authorizations provide verified entry tokens and eligibility limits to assigned candidates.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsAssignModalOpen(true)} className="text-xs bg-primary-600 text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> Assign Candidates
              </Button>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 font-semibold">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-3 font-mono">Application ID</th>
                    <th className="py-3 px-3 font-mono">Exam Window</th>
                    <th className="py-3 px-3 font-mono">Duration</th>
                    <th className="py-3 px-3">Attempts</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {authorizations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-neutral-500">
                        No candidate authorizations generated yet. Click "Assign Candidates" above.
                      </td>
                    </tr>
                  ) : (
                    authorizations.map((auth) => (
                      <tr key={auth.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold">{auth.candidateName}</div>
                          <span className="text-[10px] text-neutral-400">{auth.candidateEmail}</span>
                        </td>
                        <td className="py-3 px-3 font-mono">{auth.applicationId}</td>
                        <td className="py-3 px-3 font-mono">{auth.examDate} ({auth.examWindowStart} - {auth.examWindowEnd})</td>
                        <td className="py-3 px-3 font-mono">{auth.durationMinutes} mins</td>
                        <td className="py-3 px-3 font-mono">{auth.attemptsUsed} / {auth.maxAttempts}</td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              auth.status === "AUTHORIZED"
                                ? "border-emerald-300 text-emerald-700 bg-emerald-50/50"
                                : auth.status === "USED"
                                ? "border-blue-300 text-blue-700 bg-blue-50/50"
                                : "border-neutral-300 text-neutral-500"
                            }`}
                          >
                            {auth.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: QUESTIONS */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold">Question Paper Roster ({snapshots.length} Questions)</h2>
                <p className="text-xs text-neutral-500">Verified snapshots locked to this examination version.</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                Total Marks: {assessment.totalMarks}
              </Badge>
            </div>

            <div className="space-y-3">
              {snapshots.map((snap, idx) => (
                <div key={snap.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {snap.sectionName || "Core"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          snap.difficulty === "HARD"
                            ? "text-rose-600 border-rose-200"
                            : snap.difficulty === "MEDIUM"
                            ? "text-amber-600 border-amber-200"
                            : "text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {snap.difficulty}
                      </Badge>
                      <span className="font-mono text-neutral-400">+{snap.marks} / -{snap.negativeMarks}</span>
                    </div>

                    <span className="text-[10px] text-neutral-400 font-mono">ID: {snap.id}</span>
                  </div>

                  <p className="font-medium text-sm text-neutral-900 dark:text-white pt-1">{snap.questionText}</p>

                  {snap.options && snap.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {snap.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border text-xs ${
                            String(snap.correctAnswer).trim().toLowerCase() === String(opt).trim().toLowerCase()
                              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-800 font-semibold"
                              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          <span className="font-mono mr-1.5">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: RESULTS */}
        {activeTab === "results" && (
          <div className="space-y-4">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-neutral-50 dark:bg-neutral-800/50 font-semibold text-neutral-600 dark:text-neutral-300">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-3 font-mono">Score</th>
                    <th className="py-3 px-3 font-mono">%</th>
                    <th className="py-3 px-3">Result</th>
                    <th className="py-3 px-3">Integrity</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-500">
                        No attempts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-semibold">{att.studentName}</td>
                        <td className="py-3 px-3 font-mono font-bold">{att.totalScore} / {att.maxScore}</td>
                        <td className="py-3 px-3 font-mono">{att.percentage}%</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={att.passed ? "text-emerald-600 border-emerald-300" : "text-rose-600 border-rose-300"}>
                            {att.passed ? "PASSED" : "FAILED"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={att.integrityStatus === "CLEAN" ? "text-emerald-600 border-emerald-300" : "text-amber-600 border-amber-300"}>
                            {att.integrityStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono">{Math.round((att.durationSecondsTaken || 0) / 60)} mins</td>
                        <td className="py-3 px-3 text-neutral-500 font-mono">
                          {att.submittedAt ? new Date(att.submittedAt).toLocaleTimeString() : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: OBJECTIONS & RE-EVALUATION */}
        {activeTab === "objections" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div>
                <h2 className="text-sm font-bold">Candidate Question Objections</h2>
                <p className="text-xs text-neutral-500">
                  Review formal challenges regarding question ambiguity or answer keys. Accepted challenges can trigger re-evaluation.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsReevalModalOpen(true)} className="text-xs bg-blue-600 text-white">
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-evaluate Assessment
              </Button>
            </div>

            <div className="space-y-3">
              {objections.length === 0 ? (
                <Card className="p-8 text-center text-xs text-neutral-500">
                  No question objections have been logged for this examination.
                </Card>
              ) : (
                objections.map((obj) => (
                  <div key={obj.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {obj.objectionType}
                        </Badge>
                        <span className="font-bold text-neutral-900 dark:text-white">By {obj.candidateName}</span>
                        <span className="text-neutral-400 font-mono">Question: {obj.questionId}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            obj.status === "ACCEPTED"
                              ? "text-emerald-600 border-emerald-300"
                              : obj.status === "REJECTED"
                              ? "text-rose-600 border-rose-300"
                              : "text-amber-600 border-amber-300"
                          }
                        >
                          {obj.status}
                        </Badge>

                        {obj.status === "SUBMITTED" && (
                          <Button size="sm" variant="outline" onClick={() => setSelectedObjection(obj)} className="text-[11px] h-7">
                            Resolve Objection
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-300">{obj.description}</p>
                    {obj.proposedAnswer && (
                      <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-800 font-mono text-[11px]">
                        Proposed Answer Key: <span className="font-bold text-primary-600">{obj.proposedAnswer}</span>
                      </div>
                    )}
                    {obj.resolutionNotes && (
                      <p className="text-[11px] text-neutral-500 italic">Resolution Note: {obj.resolutionNotes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 8: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 space-y-3">
                <h3 className="font-bold text-sm">Hardest Questions (Lowest Accuracy)</h3>
                <div className="space-y-2 text-xs">
                  {(analytics?.hardestQuestions || []).map((q: any, i: number) => (
                    <div key={q.questionId} className="flex items-center justify-between p-2.5 rounded-lg border">
                      <div className="truncate max-w-[280px]">
                        <span className="font-semibold block truncate">{i + 1}. {q.questionText}</span>
                        <span className="text-neutral-400 text-[10px]">{q.topic} • {q.difficulty}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-600">{q.accuracy}% Accuracy</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <h3 className="font-bold text-sm">Candidate Score Distribution</h3>
                <div className="space-y-2 text-xs">
                  {(analytics?.scoreDistribution || []).map((b: any) => (
                    <div key={b.range} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{b.range}</span>
                        <span className="font-mono font-bold">{b.count} candidates</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, b.count * 20)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 9: INTEGRITY TIMELINE */}
        {activeTab === "integrity" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-bold mb-3">Integrity Event Log ({integrityEvents.length} Signals)</h2>
              <div className="space-y-2">
                {integrityEvents.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">No integrity violations recorded.</p>
                ) : (
                  integrityEvents.map((evt) => (
                    <div key={evt.id} className="flex items-center justify-between p-3 rounded-lg border text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{evt.candidateName}</span>
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                            {evt.eventType}
                          </Badge>
                        </div>
                        <span className="text-neutral-400 text-[11px]">{evt.metadata?.reason || "System signal recorded"}</span>
                      </div>
                      <span className="font-mono text-neutral-400 text-[11px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 10: VERSIONING & AUDIT */}
        {activeTab === "versions" && (
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-sm font-bold">Formal Examination Version Control</h2>
                  <p className="text-xs text-neutral-500">
                    Published examinations are permanently immutable to preserve academic and hiring integrity.
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-emerald-600 border-emerald-300">
                  Version {assessment.version || 1} Active
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border text-xs space-y-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Immutability Guarantee:</span>
                <p className="text-neutral-500">
                  Attempt scores, timestamps, and section breakdowns are mathematically bound to this version. To alter questions, marking rules, or cutoffs, create a subsequent version (e.g. Version {(assessment.version || 1) + 1}).
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={handleCreateNewVersion} className="text-xs bg-amber-600 text-white font-semibold">
                    <History className="w-3.5 h-3.5 mr-1" /> Create Version {(assessment.version || 1) + 1}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Assign Candidates Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Candidates to ${assessment.title}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-500">
              Select eligible candidates from drive <span className="font-semibold">{assessment.driveTitle}</span>. Authorizations will be generated immediately.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
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
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                      isSelected ? "border-primary-500 bg-primary-50/20" : "border-neutral-200"
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{app.studentName}</span>
                      <span className="text-[10px] text-neutral-400">{app.id} • {app.studentEmail}</span>
                    </div>
                    <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded text-primary-600" />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAssignCandidates}
                disabled={isAssigning || selectedCandidateIds.length === 0}
                className="bg-primary-600 text-white font-semibold"
              >
                {isAssigning ? "Assigning..." : `Authorize ${selectedCandidateIds.length} Candidate(s)`}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Objection Resolution Modal */}
        <Modal
          isOpen={!!selectedObjection}
          onClose={() => setSelectedObjection(null)}
          title="Resolve Question Objection"
        >
          {selectedObjection && (
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold block mb-1">Objection Summary:</span>
                <p className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border text-neutral-700 dark:text-neutral-300">
                  {selectedObjection.description}
                </p>
              </div>

              <div>
                <label className="font-semibold block mb-1">Official Resolution Notes:</label>
                <textarea
                  rows={3}
                  value={objectionResolutionNotes}
                  onChange={(e) => setObjectionResolutionNotes(e.target.value)}
                  placeholder="Explain rationale for acceptance or dismissal of this challenge..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolveObjection("REJECTED")}
                  disabled={isResolvingObjection}
                  className="text-rose-600 border-rose-200"
                >
                  Dismiss / Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleResolveObjection("ACCEPTED")}
                  disabled={isResolvingObjection}
                  className="bg-emerald-600 text-white font-semibold"
                >
                  Accept & Mark for Re-evaluation
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Re-evaluation Modal */}
        <Modal
          isOpen={isReevalModalOpen}
          onClose={() => setIsReevalModalOpen(false)}
          title="Automated Examination Re-Evaluation"
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-500">
              When an answer key is revised following an accepted objection, all candidate attempts will be re-evaluated and merit ranks recalculated without manual score tampering.
            </p>

            <div>
              <label className="font-semibold block mb-1">Select Question to Correct:</label>
              <select
                value={reevalQuestionId}
                onChange={(e) => setReevalQuestionId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800"
              >
                <option value="">Choose Question...</option>
                {snapshots.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    Q{i + 1}: {s.questionText.slice(0, 60)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Corrected Answer Key:</label>
              <input
                type="text"
                value={reevalCorrectAnswer}
                onChange={(e) => setReevalCorrectAnswer(e.target.value)}
                placeholder="Enter corrected option string or value..."
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setIsReevalModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteReevaluation}
                disabled={isReevaluating || !reevalQuestionId || !reevalCorrectAnswer}
                className="bg-blue-600 text-white font-semibold"
              >
                {isReevaluating ? "Re-scoring..." : "Execute Re-Evaluation"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
