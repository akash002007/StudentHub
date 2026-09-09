"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Shield,
  Clock,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sliders,
  ExternalLink,
  Layers,
  Building2,
  Briefcase,
  Play,
  Eye,
  Edit,
  ArrowUpDown,
  Trash2,
  Upload,
  UserCheck,
  BarChart3,
  Check,
  Lock,
  ChevronDown,
  LayoutDashboard,
  HelpCircle,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  AssessmentRecord,
  RecruitmentDrive,
  AssessmentQuestion,
  QuestionType,
  QuestionDifficulty,
  QuestionCategory,
  QuestionSource,
  QuestionImportRecord,
} from "@/types";
import { cn } from "@/lib/utils";
import { QuestionUploadModal } from "@/components/recruiter/QuestionUploadModal";

interface EnrichedAssessment extends AssessmentRecord {
  questionsCount: number;
  candidatesAssignedCount: number;
  completedCount: number;
  averageScore: number;
}

type AssessmentWorkspaceTab = "overview" | "questions" | "candidates" | "results" | "analytics";

function RecruiterAssessmentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const tabParam = searchParams.get("tab") as AssessmentWorkspaceTab | null;
  const [activeTab, setActiveTab] = useState<AssessmentWorkspaceTab>(tabParam || "overview");

  useEffect(() => {
    if (tabParam && ["overview", "questions", "candidates", "results", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: AssessmentWorkspaceTab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", tab);
    router.push(`/dashboard/recruiter/assessments?${newParams.toString()}`);
  };

  // -------------------------------------------------------------------------
  // OVERVIEW STATE
  // -------------------------------------------------------------------------
  const [assessments, setAssessments] = useState<EnrichedAssessment[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);

  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDriveId, setSelectedDriveId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // -------------------------------------------------------------------------
  // QUESTION BANK STATE
  // -------------------------------------------------------------------------
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionSourceFilter, setQuestionSourceFilter] = useState<"ALL" | QuestionSource>("ALL");
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState<string>("ALL");
  const [questionDiffFilter, setQuestionDiffFilter] = useState<string>("ALL");
  const [questionCatFilter, setQuestionCatFilter] = useState<string>("ALL");
  const [questionStatusFilter, setQuestionStatusFilter] = useState<string>("ACTIVE");
  const [questionSortBy, setQuestionSortBy] = useState<"newest" | "marks" | "difficulty">("newest");
  const [questionPage, setQuestionPage] = useState(1);
  const itemsPerPage = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<AssessmentQuestion | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [addToAssessmentTargetQuestion, setAddToAssessmentTargetQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedTargetAssessmentId, setSelectedTargetAssessmentId] = useState<string>("");

  // Document Upload & Import History State
  const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState(false);
  const [isImportHistoryOpen, setIsImportHistoryOpen] = useState(false);
  const [importHistoryList, setImportHistoryList] = useState<QuestionImportRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchImportHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/recruiter/questions/import-history");
      if (res.ok) {
        const data = await res.json();
        setImportHistoryList(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Create/Edit form state
  const [formData, setFormData] = useState({
    questionText: "",
    type: "SINGLE_CHOICE" as QuestionType,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    marks: 2,
    negativeMarks: 0.5,
    difficulty: "MEDIUM" as QuestionDifficulty,
    category: "Technical" as QuestionCategory,
    topic: "Algorithms",
    tags: "JavaScript, Algorithms",
    explanation: "",
    ownerType: "COMPANY" as QuestionSource,
  });
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // -------------------------------------------------------------------------
  // CANDIDATES & RESULTS STATE
  // -------------------------------------------------------------------------
  const [selectedAssessmentForResults, setSelectedAssessmentForResults] = useState<string>("all");
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchAssessments();
    fetchDrives();
    fetchQuestions();
  }, []);

  const fetchAssessments = async () => {
    setIsLoadingAssessments(true);
    try {
      const url = new URL("/api/recruiter/assessments", window.location.origin);
      url.searchParams.set("mode", "configs");
      if (selectedStatus !== "ALL") url.searchParams.set("status", selectedStatus);
      if (selectedDriveId !== "all") url.searchParams.set("driveId", selectedDriveId);
      if (assessmentSearch) url.searchParams.set("search", assessmentSearch);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.configs || []);
      }
    } catch (err) {
      console.error("Failed to load assessments:", err);
      toastError("Failed to fetch assessments.");
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/recruiter/drives");
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const url = new URL("/api/recruiter/questions", window.location.origin);
      if (questionSourceFilter !== "ALL") url.searchParams.set("ownerType", questionSourceFilter);
      if (questionTypeFilter !== "ALL") url.searchParams.set("type", questionTypeFilter);
      if (questionDiffFilter !== "ALL") url.searchParams.set("difficulty", questionDiffFilter);
      if (questionCatFilter !== "ALL") url.searchParams.set("category", questionCatFilter);
      if (questionStatusFilter !== "ALL") url.searchParams.set("status", questionStatusFilter);
      if (questionSearch) url.searchParams.set("search", questionSearch);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
      toastError("Failed to fetch questions.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    setQuestionPage(1);
  }, [
    questionSourceFilter,
    questionTypeFilter,
    questionDiffFilter,
    questionCatFilter,
    questionStatusFilter,
  ]);

  // Load results when results or candidates tab is active
  useEffect(() => {
    if (activeTab === "results" || activeTab === "candidates") {
      fetchAggregatedResults();
    }
  }, [activeTab, assessments, selectedAssessmentForResults]);

  const fetchAggregatedResults = async () => {
    setIsLoadingResults(true);
    try {
      const targetAssessments =
        selectedAssessmentForResults === "all"
          ? assessments
          : assessments.filter((a) => a.id === selectedAssessmentForResults);

      const allAttempts: any[] = [];
      for (const ass of targetAssessments) {
        try {
          const res = await fetch(`/api/recruiter/assessments/${ass.id}/results`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.attempts)) {
              data.attempts.forEach((att: any) => {
                allAttempts.push({
                  ...att,
                  assessmentTitle: ass.title,
                  driveTitle: ass.driveTitle,
                  assessmentMode: ass.mode,
                  passingPercentage: ass.passingPercentage || 60,
                });
              });
            }
          }
        } catch {
          // ignore single failure
        }
      }
      setResultsData(allAttempts);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // -------------------------------------------------------------------------
  // QUESTION HANDLERS
  // -------------------------------------------------------------------------
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: "",
      type: "SINGLE_CHOICE",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      marks: 2,
      negativeMarks: 0.5,
      difficulty: "MEDIUM",
      category: "Technical",
      topic: "Algorithms",
      tags: "Engineering, Logic",
      explanation: "",
      ownerType: "COMPANY",
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (q: AssessmentQuestion) => {
    if (q.ownerType === "SYSTEM") {
      toastError("System bank questions are maintained by StudentHub and cannot be modified.");
      return;
    }
    setEditingQuestion(q);
    setFormData({
      questionText: q.questionText,
      type: q.type,
      options: q.options && q.options.length > 0 ? [...q.options] : ["Option A", "Option B"],
      correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] || "" : q.correctAnswer || "",
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      difficulty: q.difficulty,
      category: q.category,
      topic: q.topic,
      tags: q.tags.join(", "),
      explanation: q.explanation || "",
      ownerType: q.ownerType,
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!formData.questionText.trim()) {
      toastError("Please enter the question text.");
      return;
    }

    setIsSavingQuestion(true);
    try {
      const payload = {
        id: editingQuestion ? editingQuestion.id : undefined,
        questionText: formData.questionText,
        type: formData.type,
        options:
          formData.type === "SINGLE_CHOICE" || formData.type === "MULTIPLE_CHOICE"
            ? formData.options.filter((o) => o.trim().length > 0)
            : formData.type === "TRUE_FALSE"
            ? ["True", "False"]
            : [],
        correctAnswer: formData.correctAnswer,
        marks: Number(formData.marks) || 2,
        negativeMarks: Number(formData.negativeMarks) || 0,
        difficulty: formData.difficulty,
        category: formData.category,
        topic: formData.topic.trim() || "General",
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        explanation: formData.explanation.trim(),
        ownerType: formData.ownerType,
      };

      const url = editingQuestion ? `/api/recruiter/questions/${editingQuestion.id}` : "/api/recruiter/questions";
      const method = editingQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success(editingQuestion ? "Question updated successfully!" : "Question created successfully!");
        setIsCreateModalOpen(false);
        fetchQuestions();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to save question.");
      }
    } catch (err) {
      console.error(err);
      toastError("An error occurred while saving question.");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleArchiveQuestion = async (id: string, q: AssessmentQuestion) => {
    if (q.ownerType === "SYSTEM") {
      toastError("System questions are curated and cannot be archived.");
      return;
    }

    if (!confirm(`Are you sure you want to archive this question?`)) return;

    try {
      const res = await fetch(`/api/recruiter/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        success("Question archived successfully.");
        fetchQuestions();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to archive question.");
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to archive question.");
    }
  };



  const handleAddQuestionToAssessment = async () => {
    if (!selectedTargetAssessmentId) {
      toastError("Please select a target assessment.");
      return;
    }
    if (!addToAssessmentTargetQuestion) return;

    try {
      const targetAss = assessments.find((a) => a.id === selectedTargetAssessmentId);
      if (!targetAss) return;

      if (targetAss.status !== "DRAFT") {
        toastError("Cannot add questions to an assessment that is already published or active.");
        return;
      }

      const updatedQuestionIds = Array.from(
        new Set([...(targetAss.questionIds || []), addToAssessmentTargetQuestion.id])
      );

      const res = await fetch(`/api/recruiter/assessments/${targetAss.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: updatedQuestionIds }),
      });

      if (res.ok) {
        success(`Added "${addToAssessmentTargetQuestion.topic}" to ${targetAss.title}!`);
        setAddToAssessmentTargetQuestion(null);
        fetchAssessments();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to update assessment.");
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to add question to assessment.");
    }
  };

  const handleCandidateStageAction = async (
    assessmentId: string,
    candidateId: string,
    action: "SHORTLIST" | "MOVE_TO_INTERVIEW" | "REJECT"
  ) => {
    try {
      const res = await fetch(`/api/recruiter/assessments/${assessmentId}/candidates/${candidateId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: `Stage action executed from Assessments Workspace.` }),
      });

      if (res.ok) {
        success(`Candidate successfully updated to ${action}!`);
        fetchAggregatedResults();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to update candidate.");
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to perform candidate action.");
    }
  };

  // -------------------------------------------------------------------------
  // FILTERED QUESTIONS & PAGINATION
  // -------------------------------------------------------------------------
  const sortedQuestions = useMemo(() => {
    const list = [...questions];
    if (questionSortBy === "marks") {
      return list.sort((a, b) => b.marks - a.marks);
    }
    if (questionSortBy === "difficulty") {
      const rank: Record<string, number> = { HARD: 3, MEDIUM: 2, EASY: 1 };
      return list.sort((a, b) => (rank[b.difficulty] || 0) - (rank[a.difficulty] || 0));
    }
    return list;
  }, [questions, questionSortBy]);

  const totalQuestionPages = Math.ceil(sortedQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (questionPage - 1) * itemsPerPage;
    return sortedQuestions.slice(start, start + itemsPerPage);
  }, [sortedQuestions, questionPage]);

  // Metrics
  const totalAssessmentsCount = assessments.length;
  const activeAssessmentsCount = assessments.filter((a) => a.status === "ACTIVE").length;
  const totalCompletedCount = assessments.reduce((sum, a) => sum + (a.completedCount || 0), 0);
  const avgScoresList = assessments.filter((a) => a.averageScore > 0);
  const overallAvgScore =
    avgScoresList.length > 0
      ? Math.round((avgScoresList.reduce((sum, a) => sum + a.averageScore, 0) / avgScoresList.length) * 10) / 10
      : 0;

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Top Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Recruitment Workflow • Assessments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Assessments Workspace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Comprehensive test authoring, verified Question Bank, proctored exam oversight, and pipeline progression.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDocUploadModalOpen(true)}
              leftIcon={<Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              className="border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 shadow-2xs font-semibold"
            >
              Upload Questions
            </Button>

            {activeTab === "questions" ? (
              <Button
                variant="gradient"
                size="sm"
                onClick={openCreateModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Question
              </Button>
            ) : (
              <Link href="/dashboard/recruiter/assessments/new">
                <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Create Assessment
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Assessment Module Internal Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => handleTabChange("overview")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "overview"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview
          </button>
          <button
            onClick={() => handleTabChange("questions")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "questions"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Question Bank
            <Badge variant="purple" size="sm" className="text-[10px] px-1.5 py-0 h-4 font-bold">
              {questions.length || "Bank"}
            </Badge>
          </button>
          <Link
            href="/dashboard/recruiter/assessments/new"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-muted-foreground hover:text-foreground"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            Assessment Builder
          </Link>
          <button
            onClick={() => handleTabChange("candidates")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "candidates"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            Assigned Candidates
          </button>
          <button
            onClick={() => handleTabChange("results")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "results"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Results & Merit
          </button>
          <button
            onClick={() => handleTabChange("analytics")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "analytics"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            Analytics
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW                                                           */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Assessments</p>
                    <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalAssessmentsCount}</h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Active Examinations</p>
                    <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activeAssessmentsCount}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Completed Attempts</p>
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      {totalCompletedCount}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Average Score</p>
                    <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                      {overallAvgScore}%
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter & Search Bar */}
            <Card className="p-4 border-border bg-card">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={assessmentSearch}
                    onChange={(e) => setAssessmentSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchAssessments()}
                    placeholder="Search assessments by title, drive, or category..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedDriveId}
                    onChange={(e) => setSelectedDriveId(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Recruitment Drives</option>
                    {drives.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>

                  <Button variant="outline" size="sm" onClick={fetchAssessments}>
                    <Filter className="w-3.5 h-3.5 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
            </Card>

            {/* Assessment Cards Grid */}
            {isLoadingAssessments ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">Loading recruitment assessments...</p>
              </div>
            ) : assessments.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-border bg-muted/20">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">No Assessments Configured</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                  Create a secure proctored test linked to your recruitment drives, or import questions from the Question Bank.
                </p>
                <Link href="/dashboard/recruiter/assessments/new">
                  <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    Create Your First Assessment
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessments.map((a) => (
                  <Card
                    key={a.id}
                    className="p-5 border-border bg-card flex flex-col justify-between hover:border-purple-500/40 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <Badge
                          variant={
                            a.status === "ACTIVE"
                              ? "emerald"
                              : a.status === "DRAFT"
                              ? "blue"
                              : a.status === "COMPLETED"
                              ? "purple"
                              : "secondary"
                          }
                          size="sm"
                          className="font-bold uppercase tracking-wider text-[10px]"
                        >
                          {a.status}
                        </Badge>

                        {a.mode === "PROCTORED" ? (
                          <Badge variant="purple" size="sm" className="gap-1 text-[10px] font-bold">
                            <Shield className="w-3 h-3" />
                            Proctored
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm" className="text-[10px]">
                            Standard
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{a.title}</h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-2">
                        {a.driveTitle || "Recruitment Drive"}
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {a.description || a.instructions || "No description provided."}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Questions</span>
                          <span className="font-bold text-foreground">{a.questionsCount || a.questionIds?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Duration</span>
                          <span className="font-bold text-foreground">{a.durationMinutes} mins</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Assigned</span>
                          <span className="font-bold text-foreground">{a.candidatesAssignedCount || 0} Candidates</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Pass Benchmark</span>
                          <span className="font-bold text-foreground">{a.passingPercentage || 60}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/80 flex items-center justify-between gap-2">
                      <Link href={`/dashboard/recruiter/assessments/${a.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1 text-purple-500" />
                          Workspace
                        </Button>
                      </Link>

                      {a.status === "DRAFT" ? (
                        <Link href={`/dashboard/recruiter/assessments/new?id=${a.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/dashboard/recruiter/assessments/${a.id}?tab=results`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            Results
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: QUESTION BANK                                                      */}
        {/* ========================================================================= */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            {/* Source Overview Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setQuestionSourceFilter("SYSTEM")}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer",
                  questionSourceFilter === "SYSTEM"
                    ? "border-purple-500/80 bg-purple-500/10 shadow-xs"
                    : "border-border bg-card hover:border-border/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold text-xs">
                      SH
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Verified StudentHub Bank</h4>
                      <p className="text-[10px] text-muted-foreground">Curated & Verified by Admin</p>
                    </div>
                  </div>
                  <Badge variant="purple" size="sm" className="text-[10px] font-bold">
                    SYSTEM
                  </Badge>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>Immutable • Read-only to Recruiters</span>
                </div>
              </div>

              <div
                onClick={() => setQuestionSourceFilter("COMPANY")}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer",
                  questionSourceFilter === "COMPANY"
                    ? "border-blue-500/80 bg-blue-500/10 shadow-xs"
                    : "border-border bg-card hover:border-border/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-xs">
                      CO
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Company Question Bank</h4>
                      <p className="text-[10px] text-muted-foreground">Shared Across Your Organization</p>
                    </div>
                  </div>
                  <Badge variant="blue" size="sm" className="text-[10px] font-bold">
                    COMPANY
                  </Badge>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>Shared with company recruiters</span>
                </div>
              </div>

              <div
                onClick={() => setQuestionSourceFilter("RECRUITER")}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer",
                  questionSourceFilter === "RECRUITER"
                    ? "border-emerald-500/80 bg-emerald-500/10 shadow-xs"
                    : "border-border bg-card hover:border-border/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      ME
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">My Questions</h4>
                      <p className="text-[10px] text-muted-foreground">Created by Your Account</p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm" className="text-[10px] font-bold">
                    RECRUITER
                  </Badge>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Private recruiter questions</span>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <Card className="p-4 border-border bg-card space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Search question text, topic, or tags..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Source filter */}
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs font-semibold">
                    {(["ALL", "SYSTEM", "COMPANY", "RECRUITER"] as const).map((src) => (
                      <button
                        key={src}
                        onClick={() => setQuestionSourceFilter(src)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all",
                          questionSourceFilter === src
                            ? "bg-card text-foreground font-bold shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {src === "ALL" ? "All Sources" : src}
                      </button>
                    ))}
                  </div>

                  {/* Import History button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchImportHistory();
                      setIsImportHistoryOpen(true);
                    }}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                    className="text-xs"
                  >
                    Import History
                  </Button>

                  {/* Type filter */}
                  <select
                    value={questionTypeFilter}
                    onChange={(e) => setQuestionTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Types</option>
                    <option value="SINGLE_CHOICE">Single Choice</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                  </select>

                  {/* Difficulty filter */}
                  <select
                    value={questionDiffFilter}
                    onChange={(e) => setQuestionDiffFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>

                  {/* Category filter */}
                  <select
                    value={questionCatFilter}
                    onChange={(e) => setQuestionCatFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Technical">Technical</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Communication">Communication</option>
                    <option value="Domain">Domain</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={questionStatusFilter}
                    onChange={(e) => setQuestionStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="ACTIVE">Active Only</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="ALL">All</option>
                  </select>

                  {/* Sort by */}
                  <select
                    value={questionSortBy}
                    onChange={(e) => setQuestionSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="marks">Sort: Highest Marks</option>
                    <option value="difficulty">Sort: Difficulty</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Questions Table */}
            <Card className="border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Question Repository</h3>
                  <Badge variant="outline" size="sm">
                    {sortedQuestions.length} Questions
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Page {questionPage} of {totalQuestionPages}
                </span>
              </div>

              {isLoadingQuestions ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">Loading questions...</p>
                </div>
              ) : paginatedQuestions.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-foreground font-semibold">No questions match the selected filters.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adjust your filter criteria or click "Create Question" to add one.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {paginatedQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Source badge */}
                          <Badge
                            variant={
                              q.ownerType === "SYSTEM"
                                ? "purple"
                                : q.ownerType === "COMPANY"
                                ? "blue"
                                : "emerald"
                            }
                            size="sm"
                            className="font-bold text-[10px]"
                          >
                            {q.ownerType}
                          </Badge>

                          {/* Type badge */}
                          <Badge variant="outline" size="sm" className="text-[10px]">
                            {q.type.replace("_", " ")}
                          </Badge>

                          {/* Difficulty badge */}
                          <Badge
                            variant={
                              q.difficulty === "EASY"
                                ? "emerald"
                                : q.difficulty === "MEDIUM"
                                ? "blue"
                                : "rose"
                            }
                            size="sm"
                            className="text-[10px]"
                          >
                            {q.difficulty}
                          </Badge>

                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            {q.topic}
                          </span>

                          <span className="text-xs text-muted-foreground">•</span>

                          <span className="text-xs font-bold text-foreground">
                            +{q.marks} / -{q.negativeMarks} Marks
                          </span>

                          {q.isArchived && (
                            <Badge variant="secondary" size="sm" className="text-[10px]">
                              Archived
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-foreground leading-relaxed line-clamp-2">
                          {q.questionText}
                        </p>

                        {q.tags && q.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            <div className="flex flex-wrap gap-1">
                              {q.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewQuestion(q)}
                          className="text-xs px-2.5 h-8"
                          title="Preview question"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-500 mr-1" />
                          Preview
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddToAssessmentTargetQuestion(q)}
                          className="text-xs px-2.5 h-8 text-purple-600"
                          title="Add to an assessment"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Use in Test
                        </Button>

                        {q.ownerType !== "SYSTEM" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(q)}
                              className="h-8 w-8 p-0"
                              title="Edit question"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-500" />
                            </Button>
                            {!q.isArchived && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchiveQuestion(q.id, q)}
                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                title="Archive question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </>
                        ) : (
                          <span
                            className="text-muted-foreground p-1.5"
                            title="System questions cannot be modified"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination controls */}
              {totalQuestionPages > 1 && (
                <div className="p-3.5 border-t border-border/80 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={questionPage === 1}
                    onClick={() => setQuestionPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Page {questionPage} of {totalQuestionPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={questionPage === totalQuestionPages}
                    onClick={() => setQuestionPage((p) => Math.min(totalQuestionPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ASSIGNED CANDIDATES                                                */}
        {/* ========================================================================= */}
        {activeTab === "candidates" && (
          <div className="space-y-6">
            <Card className="p-4 border-border bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Candidate Assignment & Invigilator Feed</h3>
                  <p className="text-xs text-muted-foreground">
                    Live roster of candidates registered across active assessments with real-time attempt statuses.
                  </p>
                </div>
                <select
                  value={selectedAssessmentForResults}
                  onChange={(e) => setSelectedAssessmentForResults(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                >
                  <option value="all">All Assessments</option>
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            <Card className="border-border bg-card overflow-hidden">
              {isLoadingResults ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">Loading candidate roster...</p>
                </div>
              ) : resultsData.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-foreground font-semibold">No candidates have started or completed tests yet.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assign candidates to active assessments using the Assessment Workspace.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Candidate</th>
                        <th className="px-4 py-3">Assessment</th>
                        <th className="px-4 py-3">Drive</th>
                        <th className="px-4 py-3">Mode</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Violations</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {resultsData.map((att) => (
                        <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {att.candidateName || att.candidateId}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{att.assessmentTitle}</td>
                          <td className="px-4 py-3 text-muted-foreground">{att.driveTitle || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge variant={att.assessmentMode === "PROCTORED" ? "purple" : "outline"} size="sm">
                              {att.assessmentMode || "STANDARD"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                att.status === "SUBMITTED"
                                  ? "emerald"
                                  : att.status === "IN_PROGRESS"
                                  ? "blue"
                                  : att.status === "TERMINATED"
                                  ? "rose"
                                  : "secondary"
                              }
                              size="sm"
                              className="font-bold"
                            >
                              {att.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {att.totalScore !== undefined ? `${att.totalScore} pts` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {att.proctoringViolationsCount > 0 ? (
                              <Badge variant="rose" size="sm">
                                {att.proctoringViolationsCount} Violations
                              </Badge>
                            ) : (
                              <Badge variant="emerald" size="sm">
                                Clean
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/dashboard/recruiter/assessments/${att.assessmentConfigId}?tab=results`}>
                              <Button variant="ghost" size="sm" className="text-xs h-7 text-purple-600">
                                View Attempt
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: RESULTS & MERIT                                                    */}
        {/* ========================================================================= */}
        {activeTab === "results" && (
          <div className="space-y-6">
            <Card className="p-4 border-border bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Results & Pipeline Progression</h3>
                  <p className="text-xs text-muted-foreground">
                    Review submitted examination scores and fast-track top scoring candidates to the Interview round.
                  </p>
                </div>
                <select
                  value={selectedAssessmentForResults}
                  onChange={(e) => setSelectedAssessmentForResults(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                >
                  <option value="all">All Assessments</option>
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            <Card className="border-border bg-card overflow-hidden">
              {isLoadingResults ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">Loading test results...</p>
                </div>
              ) : resultsData.filter((r) => r.status === "SUBMITTED" || r.status === "TERMINATED").length === 0 ? (
                <div className="p-12 text-center">
                  <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-foreground font-semibold">No submissions evaluated yet.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed candidate attempts will populate here with scores and percentile rankings.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Candidate</th>
                        <th className="px-4 py-3">Assessment</th>
                        <th className="px-4 py-3">Drive</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Accuracy</th>
                        <th className="px-4 py-3">Benchmark</th>
                        <th className="px-4 py-3">Integrity</th>
                        <th className="px-4 py-3">Stage Progression</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {resultsData
                        .filter((r) => r.status === "SUBMITTED" || r.status === "TERMINATED")
                        .map((att) => (
                          <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-foreground">
                              {att.candidateName || att.candidateId}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{att.assessmentTitle}</td>
                            <td className="px-4 py-3 text-muted-foreground">{att.driveTitle || "—"}</td>
                            <td className="px-4 py-3 font-bold text-foreground">
                              {att.totalScore} pts
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {att.percentageScore !== undefined ? `${att.percentageScore}%` : "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {att.passed ? (
                                <Badge variant="emerald" size="sm" className="font-bold">
                                  CLEARED
                                </Badge>
                              ) : (
                                <Badge variant="rose" size="sm" className="font-bold">
                                  NOT MET
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={att.integrityStatus === "CLEAN" ? "emerald" : "rose"}
                                size="sm"
                              >
                                {att.integrityStatus || "CLEAN"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleCandidateStageAction(
                                      att.assessmentConfigId,
                                      att.candidateId,
                                      "MOVE_TO_INTERVIEW"
                                    )
                                  }
                                  className="text-xs h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 font-bold"
                                >
                                  Interview Round →
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleCandidateStageAction(
                                      att.assessmentConfigId,
                                      att.candidateId,
                                      "REJECT"
                                    )
                                  }
                                  className="text-xs h-7 text-rose-500 hover:text-rose-600"
                                >
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ANALYTICS                                                          */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pass Rate</h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground">
                  {resultsData.length > 0
                    ? `${Math.round(
                        (resultsData.filter((r) => r.passed).length / resultsData.length) * 100
                      )}%`
                    : "0%"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {resultsData.filter((r) => r.passed).length} of {resultsData.length} candidates cleared passing score.
                </p>
              </Card>

              <Card className="p-5 border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Question Bank Depth
                  </h4>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {questions.length}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {questions.filter((q) => q.ownerType === "SYSTEM").length} System +{" "}
                  {questions.filter((q) => q.ownerType === "COMPANY").length} Company +{" "}
                  {questions.filter((q) => q.ownerType === "RECRUITER").length} Recruiter questions.
                </p>
              </Card>

              <Card className="p-5 border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Proctoring Integrity
                  </h4>
                  <Shield className="w-4 h-4 text-rose-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {resultsData.length > 0
                    ? `${Math.round(
                        (resultsData.filter((r) => r.integrityStatus === "CLEAN").length / resultsData.length) *
                          100
                      )}%`
                    : "100%"}
                </h2>
                <p className="text-xs text-muted-foreground">Clean proctoring records across candidates.</p>
              </Card>
            </div>

            {/* Questions by Category Breakdown */}
            <Card className="p-5 border-border bg-card space-y-4">
              <h3 className="text-sm font-bold text-foreground">Question Distribution by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Technical", "Aptitude", "Communication", "Domain"].map((cat) => {
                  const count = questions.filter((q) => q.category === cat).length;
                  const pct = questions.length > 0 ? Math.round((count / questions.length) * 100) : 0;
                  return (
                    <div key={cat} className="p-3.5 rounded-xl border border-border bg-muted/20">
                      <span className="text-xs font-semibold text-muted-foreground block">{cat}</span>
                      <span className="text-xl font-bold text-foreground mt-1 block">{count}</span>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE / EDIT QUESTION                                             */}
        {/* ========================================================================= */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingQuestion ? "Edit Question" : "Create New Question"}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Question Text *
              </label>
              <textarea
                rows={3}
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Type your question prompt here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                >
                  <option value="SINGLE_CHOICE">Single Choice</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Ownership
                </label>
                <select
                  value={formData.ownerType}
                  onChange={(e) => setFormData({ ...formData, ownerType: e.target.value as QuestionSource })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                >
                  <option value="COMPANY">Company Bank</option>
                  <option value="RECRUITER">My Recruiter Questions</option>
                </select>
              </div>
            </div>

            {/* Choice Options for SINGLE / MULTIPLE CHOICE */}
            {(formData.type === "SINGLE_CHOICE" || formData.type === "MULTIPLE_CHOICE") && (
              <div className="space-y-2 pt-2 border-t border-border/80">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Options & Correct Answer
                </label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctAnswer === opt && opt.length > 0}
                      onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx] = e.target.value;
                        setFormData({
                          ...formData,
                          options: newOpts,
                          correctAnswer: formData.correctAnswer === opt ? e.target.value : formData.correctAnswer,
                        });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = formData.options.filter((_, i) => i !== idx);
                          setFormData({
                            ...formData,
                            options: newOpts,
                            correctAnswer: formData.correctAnswer === opt ? newOpts[0] : formData.correctAnswer,
                          });
                        }}
                        className="text-muted-foreground hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {formData.options.length < 6 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        options: [...formData.options, `Option ${String.fromCharCode(65 + formData.options.length)}`],
                      })
                    }
                    className="text-xs text-purple-600"
                  >
                    + Add Another Option
                  </Button>
                )}
              </div>
            )}

            {/* TRUE / FALSE Choice */}
            {formData.type === "TRUE_FALSE" && (
              <div className="space-y-2 pt-2 border-t border-border/80">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Correct Answer
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="tfAnswer"
                      checked={formData.correctAnswer === "True"}
                      onChange={() => setFormData({ ...formData, correctAnswer: "True" })}
                      className="w-4 h-4 text-purple-600"
                    />
                    True
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="tfAnswer"
                      checked={formData.correctAnswer === "False"}
                      onChange={() => setFormData({ ...formData, correctAnswer: "False" })}
                      className="w-4 h-4 text-purple-600"
                    />
                    False
                  </label>
                </div>
              </div>
            )}

            {/* SHORT ANSWER */}
            {formData.type === "SHORT_ANSWER" && (
              <div className="space-y-1 pt-2 border-t border-border/80">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Expected Benchmark Answer / Key Term
                </label>
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  placeholder="e.g. O(log N) or Immutable"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground"
                />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Marks</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Negative Marks</label>
                <input
                  type="number"
                  step="0.25"
                  min={0}
                  max={10}
                  value={formData.negativeMarks}
                  onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as QuestionCategory })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
                >
                  <option value="Technical">Technical</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Communication">Communication</option>
                  <option value="Domain">Domain</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Distributed Systems"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Explanation / Solution Hints (Shown after exam completion)
              </label>
              <textarea
                rows={2}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain why the correct answer is right..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" size="sm" onClick={handleSaveQuestion} isLoading={isSavingQuestion}>
                {editingQuestion ? "Update Question" : "Save to Bank"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL: PREVIEW QUESTION                                                   */}
        {/* ========================================================================= */}
        {previewQuestion && (
          <Modal
            isOpen={Boolean(previewQuestion)}
            onClose={() => setPreviewQuestion(null)}
            title="Question Preview"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
                <Badge
                  variant={
                    previewQuestion.ownerType === "SYSTEM"
                      ? "purple"
                      : previewQuestion.ownerType === "COMPANY"
                      ? "blue"
                      : "emerald"
                  }
                  size="sm"
                  className="font-bold"
                >
                  {previewQuestion.ownerType}
                </Badge>
                <Badge variant="outline" size="sm">
                  {previewQuestion.type}
                </Badge>
                <Badge
                  variant={
                    previewQuestion.difficulty === "EASY"
                      ? "emerald"
                      : previewQuestion.difficulty === "MEDIUM"
                      ? "blue"
                      : "rose"
                  }
                  size="sm"
                >
                  {previewQuestion.difficulty}
                </Badge>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {previewQuestion.topic}
                </span>
                <span className="text-xs text-muted-foreground ml-auto font-bold text-foreground">
                  +{previewQuestion.marks} / -{previewQuestion.negativeMarks} Marks
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  {previewQuestion.questionText}
                </p>
              </div>

              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Options:</span>
                  <div className="space-y-1.5">
                    {previewQuestion.options.map((opt, idx) => {
                      const isCorrect = opt === previewQuestion.correctAnswer;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-2.5 rounded-lg border text-xs flex items-center justify-between",
                            isCorrect
                              ? "border-emerald-500/60 bg-emerald-500/10 text-foreground font-semibold"
                              : "border-border bg-muted/20 text-muted-foreground"
                          )}
                        >
                          <span>
                            {String.fromCharCode(65 + idx)}. {opt}
                          </span>
                          {isCorrect && (
                            <Badge variant="emerald" size="sm" className="gap-1 text-[10px]">
                              <Check className="w-3 h-3" /> Correct Answer
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {previewQuestion.explanation && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                  <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                    Solution & Explanation:
                  </span>
                  <p className="text-foreground leading-relaxed">{previewQuestion.explanation}</p>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setPreviewQuestion(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD QUESTION TO ASSESSMENT                                         */}
        {/* ========================================================================= */}
        {addToAssessmentTargetQuestion && (
          <Modal
            isOpen={Boolean(addToAssessmentTargetQuestion)}
            onClose={() => setAddToAssessmentTargetQuestion(null)}
            title="Add Question to Assessment"
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Select an active draft assessment to attach{" "}
                <strong className="text-foreground">"{addToAssessmentTargetQuestion.topic}"</strong>:
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase">Draft Assessment</label>
                <select
                  value={selectedTargetAssessmentId}
                  onChange={(e) => setSelectedTargetAssessmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                >
                  <option value="">Choose an assessment draft...</option>
                  {assessments
                    .filter((a) => a.status === "DRAFT")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.driveTitle || "Draft"})
                      </option>
                    ))}
                </select>
              </div>

              {assessments.filter((a) => a.status === "DRAFT").length === 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  No draft assessments available. Please create a new draft assessment first.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setAddToAssessmentTargetQuestion(null)}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  disabled={!selectedTargetAssessmentId}
                  onClick={handleAddQuestionToAssessment}
                >
                  Attach Question
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================================= */}
        {/* PDF / WORD QUESTION UPLOAD & PARSER WORKSPACE MODAL                        */}
        {/* ========================================================================= */}
        <QuestionUploadModal
          isOpen={isDocUploadModalOpen}
          onClose={() => setIsDocUploadModalOpen(false)}
          onImportSuccess={(newQuestions) => {
            fetchQuestions();
            if (activeTab !== "questions") {
              // Optionally stay or switch
            }
          }}
        />

        {/* ========================================================================= */}
        {/* DOCUMENT IMPORT HISTORY MODAL                                             */}
        {/* ========================================================================= */}
        <Modal
          isOpen={isImportHistoryOpen}
          onClose={() => setIsImportHistoryOpen(false)}
          title="Document Question Import History"
          description="Audit log of all PDF and Word exam papers imported into your Question Bank."
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {isLoadingHistory ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading import records...
              </div>
            ) : importHistoryList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <div>No document imports recorded yet.</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsImportHistoryOpen(false);
                    setIsDocUploadModalOpen(true);
                  }}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  className="text-xs mt-1"
                >
                  Upload Your First Exam Paper
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {importHistoryList.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs uppercase">
                        {rec.fileType}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{rec.fileName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Imported by {rec.importedBy} • {new Date(rec.importedAt).toLocaleDateString()}{" "}
                          {new Date(rec.importedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="emerald" className="text-[10px]">
                        +{rec.importedCount} Imported
                      </Badge>
                      {rec.duplicateCount && rec.duplicateCount > 0 ? (
                        <Badge variant="outline" className="text-[10px] text-amber-600">
                          {rec.duplicateCount} Dups
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsImportHistoryOpen(false);
                  setIsDocUploadModalOpen(true);
                }}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload New Document
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsImportHistoryOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}

export default function RecruiterAssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Loading assessment workspace...</p>
        </div>
      }
    >
      <RecruiterAssessmentsContent />
    </Suspense>
  );
}
