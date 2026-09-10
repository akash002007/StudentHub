"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Grid,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Sliders,
  Shield,
  Clock,
  Award,
  AlertTriangle,
  HelpCircle,
  Upload,
  Layers,
  Building2,
  CheckCircle2,
  Eye,
  Send,
  Calendar,
  AlertCircle,
  Search,
  BookOpen,
  Filter,
  RefreshCw,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  AssessmentQuestion,
  AssessmentRecord,
  RecruitmentDrive,
  QuestionCategory,
  QuestionType,
  QuestionDifficulty,
  AssessmentSection,
  CutoffType,
  MeritCriterion,
  AssessmentCutoffConfig,
  AssessmentMeritConfig,
} from "@/types";

const STEPS = [
  { id: 1, name: "Basic Info", icon: FileText },
  { id: 2, name: "Drive", icon: Building2 },
  { id: 3, name: "Pattern", icon: Sliders },
  { id: 4, name: "Sections", icon: Layers },
  { id: 5, name: "Blueprint", icon: Grid },
  { id: 6, name: "Question Bank", icon: Search },
  { id: 7, name: "Scoring", icon: Award },
  { id: 8, name: "Negative Marking", icon: AlertTriangle },
  { id: 9, name: "Cutoff", icon: Sliders },
  { id: 10, name: "Merit & Ranking", icon: Award },
  { id: 11, name: "Proctoring", icon: Shield },
  { id: 12, name: "Schedule", icon: Calendar },
  { id: 13, name: "Candidate Rules", icon: HelpCircle },
  { id: 14, name: "Preview", icon: Eye },
  { id: 15, name: "Publish", icon: Send },
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const { success, error: toastError, info } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<AssessmentQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  // Form State - Step 1: Basic Info
  const [assessmentId, setAssessmentId] = useState<string>(editId || "");
  const [title, setTitle] = useState("Software Engineer Technical Examination");
  const [description, setDescription] = useState("Formal recruitment examination for assessing algorithmic capabilities, system architecture, and core computer science foundations.");
  const [instructions, setInstructions] = useState(
    "Please ensure your camera, microphone, and entire screen sharing are active. Once initiated, exiting fullscreen or navigating away will log an integrity violation."
  );
  const [category, setCategory] = useState<QuestionCategory>("Technical");
  const [examinationType, setExaminationType] = useState<string>("Technical Examination");

  // Step 2: Recruitment Drive
  const [selectedDriveId, setSelectedDriveId] = useState("");

  // Step 3: Exam Pattern
  const [totalQuestionsPattern, setTotalQuestionsPattern] = useState(50);
  const [totalMarksPattern, setTotalMarksPattern] = useState(100);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [passingPercentage, setPassingPercentage] = useState(40);

  // Step 4: Sections
  const [sections, setSections] = useState<AssessmentSection[]>([
    {
      id: "sec_tech",
      name: "Technical Knowledge",
      description: "Data Structures, Algorithms, and System Architecture",
      totalQuestions: 25,
      totalMarks: 50,
      negativeMarksPerQuestion: 0.33,
      cutoffMarks: 20,
      orderIndex: 1,
      easyCount: 5,
      mediumCount: 15,
      hardCount: 5,
    },
    {
      id: "sec_apt",
      name: "Aptitude & Reasoning",
      description: "Quantitative Aptitude and Logical Analysis",
      totalQuestions: 15,
      totalMarks: 30,
      negativeMarksPerQuestion: 0.33,
      cutoffMarks: 10,
      orderIndex: 2,
      easyCount: 5,
      mediumCount: 8,
      hardCount: 2,
    },
    {
      id: "sec_comm",
      name: "Communication & Domain",
      description: "Domain Acumen, Written Technical Communication",
      totalQuestions: 10,
      totalMarks: 20,
      negativeMarksPerQuestion: 0.33,
      cutoffMarks: 8,
      orderIndex: 3,
      easyCount: 4,
      mediumCount: 4,
      hardCount: 2,
    },
  ]);

  // Step 6: Question Bank & Selected Questions
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionBankTab, setQuestionBankTab] = useState<"all" | "system" | "company" | "recruiter" | "create">("all");
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedSectionForAdd, setSelectedSectionForAdd] = useState("sec_tech");

  // Inline Question Creator
  const [inlineQText, setInlineQText] = useState("");
  const [inlineQType, setInlineQType] = useState<QuestionType>("SINGLE_CHOICE");
  const [inlineOptions, setInlineOptions] = useState<string[]>([
    "Option A",
    "Option B",
    "Option C",
    "Option D",
  ]);
  const [inlineCorrectAnswer, setInlineCorrectAnswer] = useState("Option A");
  const [inlineMarks, setInlineMarks] = useState(2);
  const [inlineNegMarks, setInlineNegMarks] = useState(0.5);
  const [inlineDifficulty, setInlineDifficulty] = useState<QuestionDifficulty>("MEDIUM");
  const [inlineTopic, setInlineTopic] = useState("Software Engineering");
  const [inlineExplanation, setInlineExplanation] = useState("");

  // Step 8: Negative Marking
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(true);
  const [negativeMarkingType, setNegativeMarkingType] = useState<"PERCENTAGE" | "FIXED" | "NONE">("PERCENTAGE");
  const [negativeMarkingRate, setNegativeMarkingRate] = useState(0.33);

  // Step 9: Cutoff Rules
  const [cutoffType, setCutoffType] = useState<CutoffType>("TOP_PERCENTAGE");
  const [cutoffValue, setCutoffValue] = useState(20); // Top 20%
  const [sectionalCutoffEnabled, setSectionalCutoffEnabled] = useState(true);

  // Step 10: Merit & Ranking
  const [primaryCriterion, setPrimaryCriterion] = useState<MeritCriterion>("TOTAL_SCORE");
  const [secondaryCriterion, setSecondaryCriterion] = useState<MeritCriterion>("SECTION_SCORE");
  const [secondarySectionId, setSecondarySectionId] = useState("sec_tech");
  const [tieBreakerRule, setTieBreakerRule] = useState<"SUBMISSION_TIME" | "ACCURACY" | "FEWEST_INCORRECT" | "SECTION_PRIORITY">("SUBMISSION_TIME");

  // Step 11: Proctoring
  const [isProctored, setIsProctored] = useState(true);
  const [cameraRequired, setCameraRequired] = useState(true);
  const [microphoneRequired, setMicrophoneRequired] = useState(true);
  const [entireScreenRequired, setEntireScreenRequired] = useState(true);
  const [fullscreenRequired, setFullscreenRequired] = useState(true);
  const [pauseOnCameraStop, setPauseOnCameraStop] = useState(true);
  const [pauseOnMicrophoneStop, setPauseOnMicrophoneStop] = useState(true);
  const [pauseOnScreenShareStop, setPauseOnScreenShareStop] = useState(true);
  const [maxWindowViolations, setMaxWindowViolations] = useState(2);
  const [maxFullscreenViolations, setMaxFullscreenViolations] = useState(2);
  const [terminateOnViolationLimit, setTerminateOnViolationLimit] = useState(true);

  // Step 12: Schedule
  const [examDate, setExamDate] = useState("");
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("18:00");
  const [lateEntryGraceMinutes, setLateEntryGraceMinutes] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Step 13: Candidate Rules
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);
  const [autoSubmitOnTimeout, setAutoSubmitOnTimeout] = useState(true);
  const [showResultImmediately, setShowResultImmediately] = useState(false);

  // Load drives and questions
  useEffect(() => {
    fetchDrives();
    fetchQuestions();
    if (editId) {
      loadExistingAssessment(editId);
    }
  }, [editId]);

  // Support preselected question IDs passed from Document Question Import
  const preselectParam = searchParams.get("preselectQuestions");
  useEffect(() => {
    if (preselectParam) {
      const ids = preselectParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...ids])));
        info(`Pre-loaded ${ids.length} questions from document import into your assessment!`);
      }
    }
  }, [preselectParam]);

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/recruiter/drives");
      if (res.ok) {
        const data = await res.json();
        const list = data.drives || [];
        setDrives(list);
        if (list.length > 0 && !selectedDriveId) {
          setSelectedDriveId(list[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/recruiter/questions");
      if (res.ok) {
        const data = await res.json();
        setAvailableQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadExistingAssessment = async (id: string) => {
    try {
      const res = await fetch(`/api/recruiter/assessments/${id}`);
      if (res.ok) {
        const data = await res.json();
        const a: AssessmentRecord = data.assessment;
        setTitle(a.title);
        setDescription(a.description || "");
        setInstructions(a.instructions);
        setSelectedDriveId(a.driveId);
        setCategory(a.category);
        setDurationMinutes(a.durationMinutes);
        setSelectedQuestionIds(a.questionIds || []);
        setIsProctored(a.mode === "PROCTORED");
        if (a.sections && a.sections.length > 0) {
          setSections(a.sections);
        }
        if (a.cutoffConfig) {
          setCutoffType(a.cutoffConfig.cutoffType);
          setCutoffValue(a.cutoffConfig.cutoffValue);
        }
        if (a.meritConfig) {
          setPrimaryCriterion(a.meritConfig.primaryCriterion);
          setSecondaryCriterion(a.meritConfig.secondaryCriterion || "SECTION_SCORE");
          setSecondarySectionId(a.meritConfig.secondarySectionId || "");
          setTieBreakerRule(a.meritConfig.tieBreakerRule || "SUBMISSION_TIME");
        }
        if (a.negativeMarkingRate !== undefined) {
          setNegativeMarkingRate(a.negativeMarkingRate);
        }
        if (a.negativeMarkingType) {
          setNegativeMarkingType(a.negativeMarkingType);
        }
        setNegativeMarkingEnabled(a.negativeMarkingEnabled);
        if (a.proctoringConfig) {
          setCameraRequired(a.proctoringConfig.cameraRequired);
          setMicrophoneRequired(a.proctoringConfig.microphoneRequired);
          setEntireScreenRequired(a.proctoringConfig.entireScreenRequired);
          setFullscreenRequired(a.proctoringConfig.fullscreenRequired);
          setMaxWindowViolations(a.proctoringConfig.maxWindowViolations);
          setMaxFullscreenViolations(a.proctoringConfig.maxFullscreenViolations);
          setTerminateOnViolationLimit(a.proctoringConfig.terminateOnViolationLimit);
        }
        if (a.candidateRules) {
          setRandomizeQuestions(a.candidateRules.randomizeQuestions);
          setRandomizeOptions(a.candidateRules.randomizeOptions);
          setAllowBackNavigation(a.candidateRules.allowBackNavigation);
          setAutoSubmitOnTimeout(a.candidateRules.autoSubmitOnTimeout);
          setShowResultImmediately(a.candidateRules.showResultImmediately);
        }
        setPassingPercentage(a.passingPercentage || 40);
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    }
  };

  // Live Section Totals Calculation
  const sectionTotalQuestions = sections.reduce((sum, s) => sum + s.totalQuestions, 0);
  const sectionTotalMarks = sections.reduce((sum, s) => sum + s.totalMarks, 0);

  // Selected questions calculations
  const selectedQuestions = availableQuestions.filter((q) => selectedQuestionIds.includes(q.id));
  const totalCalculatedMarks = selectedQuestions.length > 0
    ? selectedQuestions.reduce((sum, q) => sum + q.marks, 0)
    : sectionTotalMarks;
  const passingMarks = Math.round((totalCalculatedMarks * passingPercentage) / 100);

  const toggleQuestionSelection = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qid) => qid !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleCreateInlineQuestion = async () => {
    if (!inlineQText.trim()) {
      toastError("Please enter question text.");
      return;
    }

    try {
      const res = await fetch("/api/recruiter/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: inlineQText,
          type: inlineQType,
          options: inlineOptions,
          correctAnswer: inlineCorrectAnswer,
          marks: inlineMarks,
          negativeMarks: inlineNegMarks,
          difficulty: inlineDifficulty,
          category,
          topic: inlineTopic,
          explanation: inlineExplanation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        success("Question added to Question Bank and attached to examination!");
        setAvailableQuestions([data.question, ...availableQuestions]);
        setSelectedQuestionIds([...selectedQuestionIds, data.question.id]);
        setInlineQText("");
        setInlineExplanation("");
        setQuestionBankTab("company");
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to create question.");
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to save question.");
    }
  };

  // Blueprint Generation from Bank
  const handleGenerateFromBlueprint = async () => {
    setIsGeneratingBlueprint(true);
    try {
      const res = await fetch("/api/recruiter/assessments/blueprint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((sec) => ({
            sectionId: sec.id,
            name: sec.name,
            easyCount: sec.easyCount || 0,
            mediumCount: sec.mediumCount || 0,
            hardCount: sec.hardCount || 0,
            negativeRate: negativeMarkingRate,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const pickedIds = data.snapshots.map((s: any) => s.originalQuestionId);
        setSelectedQuestionIds(pickedIds);
        success(`Blueprint validated! Generated paper with ${pickedIds.length} questions matching blueprint distribution.`);
      } else {
        toastError(data.error || "Blueprint generation failed. Verify question availability.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error generating paper from blueprint.");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toastError("Please enter an assessment title before saving.");
      return;
    }
    if (!selectedDriveId) {
      toastError("Please select a recruitment drive.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<AssessmentRecord> = {
        id: assessmentId || undefined,
        title,
        description,
        instructions,
        driveId: selectedDriveId,
        category,
        durationMinutes,
        mode: isProctored ? "PROCTORED" : "STANDARD",
        sections,
        cutoffConfig: {
          cutoffType,
          cutoffValue,
          sectionalCutoffs: sections.map((s) => ({ sectionId: s.id, minMarks: s.cutoffMarks || 0 })),
        },
        meritConfig: {
          primaryCriterion,
          secondaryCriterion,
          secondarySectionId,
          tieBreakerRule,
        },
        negativeMarkingEnabled,
        negativeMarkingRate,
        negativeMarkingType,
        examinationType,
        proctoringConfig: {
          cameraRequired,
          microphoneRequired,
          entireScreenRequired,
          fullscreenRequired,
          pauseOnCameraStop,
          pauseOnMicrophoneStop,
          pauseOnScreenShareStop,
          maxWindowViolations,
          maxFullscreenViolations,
          terminateOnViolationLimit,
        },
        candidateRules: {
          attemptsAllowed: maxAttempts,
          randomizeQuestions,
          randomizeOptions,
          allowBackNavigation,
          autoSubmitOnTimeout,
          showResultImmediately,
        },
        schedule: {
          examDate,
          windowStart,
          windowEnd,
          lateEntryGraceMinutes,
          maxAttempts,
        },
        totalMarks: sectionTotalMarks || totalCalculatedMarks,
        passingMarks,
        passingPercentage,
        questionIds: selectedQuestionIds,
        status: "DRAFT",
      };

      const res = await fetch("/api/recruiter/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setAssessmentId(data.assessment.id);
        success("Examination draft saved successfully!");
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to save draft.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error saving assessment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishAssessment = async () => {
    if (selectedQuestionIds.length === 0) {
      toastError("Cannot publish examination without questions. Generate blueprint or select questions.");
      setCurrentStep(5);
      return;
    }

    setIsPublishing(true);
    try {
      // 1. Save draft configuration first
      const saveRes = await fetch("/api/recruiter/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assessmentId || undefined,
          title,
          description,
          instructions,
          driveId: selectedDriveId,
          category,
          durationMinutes,
          mode: isProctored ? "PROCTORED" : "STANDARD",
          sections,
          cutoffConfig: {
            cutoffType,
            cutoffValue,
            sectionalCutoffs: sections.map((s) => ({ sectionId: s.id, minMarks: s.cutoffMarks || 0 })),
          },
          meritConfig: {
            primaryCriterion,
            secondaryCriterion,
            secondarySectionId,
            tieBreakerRule,
          },
          negativeMarkingEnabled,
          negativeMarkingRate,
          negativeMarkingType,
          examinationType,
          proctoringConfig: {
            cameraRequired,
            microphoneRequired,
            entireScreenRequired,
            fullscreenRequired,
            pauseOnCameraStop,
            pauseOnMicrophoneStop,
            pauseOnScreenShareStop,
            maxWindowViolations,
            maxFullscreenViolations,
            terminateOnViolationLimit,
          },
          candidateRules: {
            attemptsAllowed: maxAttempts,
            randomizeQuestions,
            randomizeOptions,
            allowBackNavigation,
            autoSubmitOnTimeout,
            showResultImmediately,
          },
          schedule: {
            examDate,
            windowStart,
            windowEnd,
            lateEntryGraceMinutes,
            maxAttempts,
          },
          totalMarks: sectionTotalMarks || totalCalculatedMarks,
          passingMarks,
          passingPercentage,
          questionIds: selectedQuestionIds,
          status: "DRAFT",
        }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || "Failed to save configuration prior to publishing.");
      }

      const saveData = await saveRes.json();
      const targetId = saveData.assessment.id;

      // 2. Formally publish and lock version
      const pubRes = await fetch(`/api/recruiter/assessments/${targetId}/publish`, {
        method: "POST",
      });

      if (pubRes.ok) {
        success("Examination published and locked! Now active for candidate assignment.");
        router.push(`/dashboard/recruiter/assessments/${targetId}`);
      } else {
        const err = await pubRes.json();
        toastError(err.error || "Failed to publish assessment.");
      }
    } catch (err: any) {
      console.error(err);
      toastError(err.message || "Failed to publish assessment.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Readiness Checklist Items
  const checklist = [
    { label: "Recruitment Drive selected", valid: !!selectedDriveId },
    { label: "Paper pattern & duration defined", valid: durationMinutes > 0 && totalMarksPattern > 0 },
    { label: "Sections defined & totals balanced", valid: sections.length > 0 && sectionTotalQuestions > 0 },
    { label: "Question Blueprint configured", valid: sections.every((s) => (s.easyCount || 0) + (s.mediumCount || 0) + (s.hardCount || 0) === s.totalQuestions) },
    { label: "Questions selected or generated", valid: selectedQuestionIds.length > 0 },
    { label: "Negative marking rules configured", valid: !negativeMarkingEnabled || negativeMarkingRate > 0 },
    { label: "Passing benchmark configured", valid: passingPercentage > 0 },
    { label: "Shortlisting Cutoff policy defined", valid: !!cutoffType && cutoffValue > 0 },
    { label: "Merit ranking & tie-break configured", valid: !!primaryCriterion && !!tieBreakerRule },
    { label: "Proctoring & violation limits set", valid: !isProctored || (cameraRequired && fullscreenRequired) },
    { label: "Examination schedule configured", valid: durationMinutes >= 15 },
    { label: "Candidate rules established", valid: maxAttempts >= 1 },
  ];
  const allChecksPass = checklist.every((c) => c.valid);

  const selectedDrive = drives.find((d) => d.id === selectedDriveId);

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/recruiter/assessments"
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {title || "New Recruitment Examination"}
                  </h1>
                  <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200">
                    RPSC EXAM BLUEPRINT
                  </Badge>
                  <Badge variant="outline" className="text-xs text-neutral-500">
                    DRAFT (v1)
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Structured Paper Pattern • Blueprint Distribution • Controlled Merit & Cutoff
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="text-xs font-semibold"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                size="sm"
                onClick={handlePublishAssessment}
                disabled={isPublishing || selectedQuestionIds.length === 0}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isPublishing ? "Publishing..." : "Publish Examination"}
              </Button>
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="max-w-7xl mx-auto mt-4 overflow-x-auto pb-1 scrollbar-thin">
            <div className="flex items-center gap-1.5 min-w-max">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = currentStep === s.id;
                const isPast = currentStep > s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary-600 text-white shadow-sm font-semibold"
                        : isPast
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isActive
                          ? "bg-white text-primary-600 font-bold"
                          : isPast
                          ? "bg-emerald-500 text-white"
                          : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                      }`}
                    >
                      {isPast ? <Check className="w-2.5 h-2.5" /> : s.id}
                    </span>
                    <span>{s.name}</span>
                    {idx < STEPS.length - 1 && (
                      <span className="text-neutral-300 dark:text-neutral-700 ml-1">/</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Step Workspace */}
            <div className="lg:col-span-3 space-y-6">
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 1: Examination Basic Details</h2>
                    <p className="text-xs text-neutral-500">Provide official identity and scope for this recruitment examination.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Examination Name *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Senior Backend Engineer Technical Examination"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                          Examination Type
                        </label>
                        <select
                          value={examinationType}
                          onChange={(e) => setExaminationType(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Screening Test">Screening Test</option>
                          <option value="Technical Examination">Technical Examination</option>
                          <option value="Aptitude Examination">Aptitude Examination</option>
                          <option value="Final Assessment">Final Assessment</option>
                          <option value="Custom">Custom Assessment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                          Assessment Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Technical">Technical</option>
                          <option value="Aptitude">Aptitude</option>
                          <option value="Communication">Communication</option>
                          <option value="Domain">Domain Knowledge</option>
                          <option value="General">General Knowledge</option>
                          <option value="Mixed">Mixed Disciplines</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Examination Description
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief overview of evaluation scope, covered syllabus, and competency requirements."
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Candidate Examination Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 2: Recruitment Drive */}
              {currentStep === 2 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 2: Link Recruitment Drive</h2>
                    <p className="text-xs text-neutral-500">Attach this examination to an active campus or lateral hiring drive.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Target Recruitment Drive *
                      </label>
                      <select
                        value={selectedDriveId}
                        onChange={(e) => setSelectedDriveId(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                      >
                        <option value="" disabled>Select a Recruitment Drive</option>
                        {drives.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title} ({(d as any).companyName || d.company}) — {d.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDrive && (
                      <div className="p-4 rounded-xl border border-primary-100 dark:border-primary-950/60 bg-primary-50/40 dark:bg-primary-950/20 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedDrive.title}</span>
                          <Badge variant="outline" className="bg-white dark:bg-neutral-900 text-primary-600 border-primary-200">
                            {selectedDrive.status}
                          </Badge>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400">{selectedDrive.description}</p>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-primary-100 dark:border-primary-900/40 font-mono text-[11px]">
                          <div>Positions: <span className="font-bold">{(selectedDrive as any).vacancies || (selectedDrive as any).totalPositions || 5}</span></div>
                          <div>Role: <span className="font-bold">{(selectedDrive as any).jobType || (selectedDrive as any).roleTitle || "Full-time"}</span></div>
                          <div>Drive ID: <span className="text-neutral-500">{selectedDrive.id}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* STEP 3: Exam Pattern */}
              {currentStep === 3 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 3: Examination Pattern Specification</h2>
                    <p className="text-xs text-neutral-500">Define the global structure, total marks, paper duration, and passing threshold.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Total Questions Target
                      </label>
                      <input
                        type="number"
                        value={totalQuestionsPattern}
                        onChange={(e) => setTotalQuestionsPattern(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Total Maximum Marks
                      </label>
                      <input
                        type="number"
                        value={totalMarksPattern}
                        onChange={(e) => setTotalMarksPattern(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Examination Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Minimum Passing Benchmark (%)
                      </label>
                      <input
                        type="number"
                        value={passingPercentage}
                        onChange={(e) => setPassingPercentage(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                      />
                      <span className="text-[11px] text-neutral-400">Qualifying threshold required to be considered on merit list.</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Current Pattern Summary:</span>
                      <p className="text-neutral-500">{totalQuestionsPattern} Questions • {totalMarksPattern} Marks • {durationMinutes} Mins • Passing at {passingPercentage}% ({Math.round((totalMarksPattern * passingPercentage) / 100)} marks)</p>
                    </div>
                    <Badge variant="outline" className="text-primary-600 border-primary-200 bg-white dark:bg-neutral-800">
                      Balanced
                    </Badge>
                  </div>
                </Card>
              )}

              {/* STEP 4: Sections Builder */}
              {currentStep === 4 && (
                <Card className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 4: Section Structure & Allocation</h2>
                      <p className="text-xs text-neutral-500">Create examination sections, assign marks, negative rates, and sectional cutoffs.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newId = `sec_${Date.now()}`;
                        setSections([
                          ...sections,
                          {
                            id: newId,
                            name: `Section ${sections.length + 1}`,
                            totalQuestions: 10,
                            totalMarks: 20,
                            negativeMarksPerQuestion: 0.33,
                            cutoffMarks: 8,
                            orderIndex: sections.length + 1,
                            easyCount: 3,
                            mediumCount: 5,
                            hardCount: 2,
                          },
                        ]);
                      }}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={sec.name}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].name = e.target.value;
                                setSections(copy);
                              }}
                              className="font-semibold text-sm bg-transparent border-b border-dashed border-neutral-300 dark:border-neutral-700 px-1 focus:outline-none focus:border-primary-500"
                            />
                          </div>

                          {sections.length > 1 && (
                            <button
                              onClick={() => setSections(sections.filter((s) => s.id !== sec.id))}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] text-neutral-500 block mb-1">Questions</label>
                            <input
                              type="number"
                              value={sec.totalQuestions}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].totalQuestions = parseInt(e.target.value) || 0;
                                setSections(copy);
                              }}
                              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-neutral-500 block mb-1">Max Marks</label>
                            <input
                              type="number"
                              value={sec.totalMarks}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].totalMarks = parseInt(e.target.value) || 0;
                                setSections(copy);
                              }}
                              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-neutral-500 block mb-1">Neg / Wrong</label>
                            <input
                              type="number"
                              step="0.01"
                              value={sec.negativeMarksPerQuestion}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].negativeMarksPerQuestion = parseFloat(e.target.value) || 0;
                                setSections(copy);
                              }}
                              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-neutral-500 block mb-1">Section Cutoff</label>
                            <input
                              type="number"
                              value={sec.cutoffMarks || 0}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].cutoffMarks = parseInt(e.target.value) || 0;
                                setSections(copy);
                              }}
                              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section Balancer Alert */}
                  <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                    sectionTotalQuestions === totalQuestionsPattern && sectionTotalMarks === totalMarksPattern
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-800 dark:text-amber-300"
                  }`}>
                    <div>
                      <span className="font-semibold">Section Consistency Status: </span>
                      {sectionTotalQuestions === totalQuestionsPattern && sectionTotalMarks === totalMarksPattern ? (
                        <span>Perfect alignment ({sectionTotalQuestions} questions / {sectionTotalMarks} marks).</span>
                      ) : (
                        <span>
                          Sections have {sectionTotalQuestions}/{totalQuestionsPattern} questions and {sectionTotalMarks}/{totalMarksPattern} marks.
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className={sectionTotalQuestions === totalQuestionsPattern ? "border-emerald-300 text-emerald-700" : "border-amber-300 text-amber-700"}>
                      {sectionTotalQuestions === totalQuestionsPattern ? "VERIFIED" : "MISALIGNED"}
                    </Badge>
                  </div>
                </Card>
              )}

              {/* STEP 5: Question Blueprint */}
              {currentStep === 5 && (
                <Card className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 5: Question Paper Blueprint</h2>
                      <p className="text-xs text-neutral-500">Configure Easy, Medium, and Hard question distributions per section.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleGenerateFromBlueprint}
                      disabled={isGeneratingBlueprint}
                      className="text-xs bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGeneratingBlueprint ? "animate-spin" : ""}`} />
                      {isGeneratingBlueprint ? "Validating & Generating..." : "Generate Paper from Blueprint"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {sections.map((sec, idx) => (
                      <div key={sec.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{sec.name} ({sec.totalQuestions} Questions)</span>
                          <span className="text-xs text-neutral-500">
                            Allocated: {(sec.easyCount || 0) + (sec.mediumCount || 0) + (sec.hardCount || 0)} / {sec.totalQuestions}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <label className="text-[11px] text-emerald-600 font-semibold block mb-1">Easy Questions</label>
                            <input
                              type="number"
                              value={sec.easyCount || 0}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].easyCount = parseInt(e.target.value) || 0;
                                setSections(copy);
                              }}
                              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-amber-600 font-semibold block mb-1">Medium Questions</label>
                            <input
                              type="number"
                              value={sec.mediumCount || 0}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].mediumCount = parseInt(e.target.value) || 0;
                                setSections(copy);
                              }}
                              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-rose-600 font-semibold block mb-1">Hard Questions</label>
                            <input
                              type="number"
                              value={sec.hardCount || 0}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[idx].hardCount = parseInt(e.target.value) || 0;
                                setSections(copy);
                              }}
                              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold">Blueprint Pool Validation Policy: </span>
                        The backend verifies Question Bank pools before paper generation. If matching pools have fewer questions than your blueprint requires, generation will prevent publishing with an explanatory error.
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 6: Question Bank */}
              {currentStep === 6 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 6: Question Bank & Selection</h2>
                    <p className="text-xs text-neutral-500">
                      Search, preview, and attach questions from StudentHub System Bank, Company Bank, or create custom questions.
                    </p>
                  </div>

                  {/* Question Bank Tabs */}
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      {[
                        { key: "all", label: "All Questions" },
                        { key: "system", label: "StudentHub System" },
                        { key: "company", label: "Company Bank" },
                        { key: "recruiter", label: "My Questions" },
                        { key: "create", label: "+ Add Question" },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setQuestionBankTab(t.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            questionBankTab === t.key
                              ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 font-semibold"
                              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs text-neutral-500 font-mono">
                      Selected: {selectedQuestionIds.length} questions
                    </span>
                  </div>

                  {questionBankTab === "create" ? (
                    /* Inline Question Form */
                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4 text-xs">
                      <h3 className="font-bold text-sm">Add Question to Recruiter Bank</h3>
                      <div>
                        <label className="font-semibold block mb-1">Question Text</label>
                        <textarea
                          rows={2}
                          value={inlineQText}
                          onChange={(e) => setInlineQText(e.target.value)}
                          placeholder="e.g. In Postgres, what is the default transaction isolation level?"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="font-semibold block mb-1">Type</label>
                          <select
                            value={inlineQType}
                            onChange={(e) => setInlineQType(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                          >
                            <option value="SINGLE_CHOICE">Single Choice</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="TRUE_FALSE">True/False</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Difficulty</label>
                          <select
                            value={inlineDifficulty}
                            onChange={(e) => setInlineDifficulty(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                          >
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Marks (+ / -)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={inlineMarks}
                              onChange={(e) => setInlineMarks(parseInt(e.target.value) || 1)}
                              className="w-1/2 px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                            />
                            <input
                              type="number"
                              step="0.1"
                              value={inlineNegMarks}
                              onChange={(e) => setInlineNegMarks(parseFloat(e.target.value) || 0)}
                              className="w-1/2 px-2.5 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                            />
                          </div>
                        </div>
                      </div>

                      <Button size="sm" onClick={handleCreateInlineQuestion} className="bg-primary-600 text-white">
                        Save to Question Bank
                      </Button>
                    </div>
                  ) : (
                    /* Question List */
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search questions by keyword, topic, or tag..."
                          value={pickerSearch}
                          onChange={(e) => setPickerSearch(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                        />
                      </div>

                      {availableQuestions
                        .filter((q) => {
                          if (questionBankTab === "system" && q.ownerType !== "SYSTEM") return false;
                          if (questionBankTab === "company" && q.ownerType !== "COMPANY") return false;
                          if (questionBankTab === "recruiter" && q.ownerType !== "RECRUITER") return false;
                          if (pickerSearch) {
                            const query = pickerSearch.toLowerCase();
                            return (
                              q.questionText.toLowerCase().includes(query) ||
                              (q.topic && q.topic.toLowerCase().includes(query))
                            );
                          }
                          return true;
                        })
                        .map((q) => {
                          const isSelected = selectedQuestionIds.includes(q.id);
                          return (
                            <div
                              key={q.id}
                              onClick={() => toggleQuestionSelection(q.id)}
                              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? "border-primary-500 bg-primary-50/20 dark:bg-primary-950/20"
                                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px]">
                                      {q.ownerType === "SYSTEM" ? "StudentHub" : q.ownerType}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${
                                        q.difficulty === "HARD"
                                          ? "text-rose-600 border-rose-200"
                                          : q.difficulty === "MEDIUM"
                                          ? "text-amber-600 border-amber-200"
                                          : "text-emerald-600 border-emerald-200"
                                      }`}
                                    >
                                      {q.difficulty}
                                    </Badge>
                                    <span className="font-mono text-neutral-400">+{q.marks} / -{q.negativeMarks}</span>
                                  </div>
                                  <p className="font-medium text-neutral-900 dark:text-neutral-100">{q.questionText}</p>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 mt-1"
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </Card>
              )}

              {/* STEP 7: Scoring */}
              {currentStep === 7 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 7: Scoring Architecture</h2>
                    <p className="text-xs text-neutral-500">Configure question-level and sectional evaluation dynamics.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                      <span className="text-neutral-500 text-xs block mb-1">Max Paper Score</span>
                      <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">{sectionTotalMarks} Marks</span>
                    </div>
                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                      <span className="text-neutral-500 text-xs block mb-1">Passing Benchmark</span>
                      <span className="text-2xl font-bold font-mono text-emerald-600">{passingMarks} Marks ({passingPercentage}%)</span>
                    </div>
                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                      <span className="text-neutral-500 text-xs block mb-1">Sections</span>
                      <span className="text-2xl font-bold font-mono text-primary-600">{sections.length} Active</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Section Scoring Distribution:</h3>
                    {sections.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
                        <span className="font-semibold">{s.name}</span>
                        <div className="flex items-center gap-4 font-mono text-neutral-500">
                          <span>{s.totalQuestions} Questions</span>
                          <span>{s.totalMarks} Marks</span>
                          <span>Cutoff: {s.cutoffMarks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* STEP 8: Negative Marking */}
              {currentStep === 8 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 8: Negative Marking Configuration</h2>
                    <p className="text-xs text-neutral-500">Penalize speculative guessing in formal recruitment examinations.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <span className="font-semibold text-sm block">Enable Negative Marking</span>
                        <span className="text-xs text-neutral-500">Deduct marks for incorrect answers. Unanswered questions award 0.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={negativeMarkingEnabled}
                        onChange={(e) => setNegativeMarkingEnabled(e.target.checked)}
                        className="w-5 h-5 rounded text-primary-600"
                      />
                    </div>

                    {negativeMarkingEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold block mb-1">Negative Marking Type</label>
                          <select
                            value={negativeMarkingType}
                            onChange={(e) => setNegativeMarkingType(e.target.value as any)}
                            className="w-full px-3.5 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                          >
                            <option value="PERCENTAGE">Percentage of Question Marks (RPSC Standard)</option>
                            <option value="FIXED">Fixed Marks Deduction</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold block mb-1">
                            {negativeMarkingType === "PERCENTAGE" ? "Negative Deduction Rate (0.33 = 1/3rd)" : "Fixed Deduction per Question"}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={negativeMarkingRate}
                            onChange={(e) => setNegativeMarkingRate(parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">Evaluation Formula Preview: </span>
                      Correct Answer = <span className="font-mono font-bold">+Marks</span> •
                      Wrong Answer = <span className="font-mono font-bold">-{negativeMarkingEnabled ? `${negativeMarkingRate} × Marks` : "0"}</span> •
                      Unanswered = <span className="font-mono font-bold">0 Marks</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 9: Cutoff Rules */}
              {currentStep === 9 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 9: Shortlisting Cutoff Specification</h2>
                    <p className="text-xs text-neutral-500">
                      Differentiate between basic qualifying benchmark and shortlist cutoff for selection pipeline.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold block mb-1.5">Cutoff Rule Type *</label>
                        <select
                          value={cutoffType}
                          onChange={(e) => setCutoffType(e.target.value as CutoffType)}
                          className="w-full px-3.5 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                        >
                          <option value="TOP_PERCENTAGE">Top Percentage (e.g. Top 20% on Merit)</option>
                          <option value="TOP_N">Top N Candidates (e.g. Top 50)</option>
                          <option value="FIXED_SCORE">Fixed Absolute Score Cutoff</option>
                          <option value="PERCENTAGE">Percentage Benchmark Cutoff</option>
                          <option value="SECTIONAL">Sectional Thresholds Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold block mb-1.5">
                          Cutoff Threshold Value {cutoffType === "TOP_PERCENTAGE" || cutoffType === "PERCENTAGE" ? "(%)" : ""}
                        </label>
                        <input
                          type="number"
                          value={cutoffValue}
                          onChange={(e) => setCutoffValue(parseInt(e.target.value) || 0)}
                          className="w-full px-3.5 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Rule Explanation:</span>
                      <p className="text-neutral-500">
                        {cutoffType === "TOP_PERCENTAGE" && `Candidates who pass minimum ${passingPercentage}% benchmark will be ranked, and the top ${cutoffValue}% will clear the shortlisting cutoff.`}
                        {cutoffType === "TOP_N" && `The top ${cutoffValue} highest scoring candidates who meet passing benchmark will clear the shortlisting cutoff.`}
                        {cutoffType === "FIXED_SCORE" && `Candidates scoring ${cutoffValue} or higher will clear the shortlisting cutoff.`}
                        {cutoffType === "PERCENTAGE" && `Candidates scoring ${cutoffValue}% or higher will clear the shortlisting cutoff.`}
                        {cutoffType === "SECTIONAL" && `Candidates must clear all individual sectional cutoffs to be shortlisted.`}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 10: Merit & Ranking */}
              {currentStep === 10 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 10: Merit & Tie-Breaking Policy</h2>
                    <p className="text-xs text-neutral-500">Configure how candidates are sorted and how identical scores are resolved.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1.5">Primary Ranking Metric</label>
                      <select
                        value={primaryCriterion}
                        onChange={(e) => setPrimaryCriterion(e.target.value as any)}
                        className="w-full px-3.5 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                      >
                        <option value="TOTAL_SCORE">Total Examination Score (Highest First)</option>
                        <option value="ACCURACY">Candidate Accuracy Ratio</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1.5">Secondary Section Criterion</label>
                      <select
                        value={secondarySectionId}
                        onChange={(e) => setSecondarySectionId(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                      >
                        {sections.map((s) => (
                          <option key={s.id} value={s.id}>
                            Section Score: {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1.5">Final Tie-Breaker Rule</label>
                      <select
                        value={tieBreakerRule}
                        onChange={(e) => setTieBreakerRule(e.target.value as any)}
                        className="w-full px-3.5 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                      >
                        <option value="SUBMISSION_TIME">Earlier Submission Timestamp (RPSC Standard)</option>
                        <option value="FEWEST_INCORRECT">Fewest Negative/Incorrect Answers</option>
                        <option value="ACCURACY">Higher Question Accuracy</option>
                      </select>
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 11: Proctoring */}
              {currentStep === 11 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 11: Proctoring & Integrity Architecture</h2>
                    <p className="text-xs text-neutral-500">Configure real-time monitoring and configurable violation thresholds.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <span className="font-semibold text-sm block">Proctored Examination Mode</span>
                        <span className="text-xs text-neutral-500">Requires camera, microphone, and full-screen enforcement.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isProctored}
                        onChange={(e) => setIsProctored(e.target.checked)}
                        className="w-5 h-5 rounded text-primary-600"
                      />
                    </div>

                    {isProctored && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <label className="flex items-center gap-2 p-3 border rounded-lg">
                            <input type="checkbox" checked={cameraRequired} onChange={(e) => setCameraRequired(e.target.checked)} />
                            <span>Camera Required</span>
                          </label>
                          <label className="flex items-center gap-2 p-3 border rounded-lg">
                            <input type="checkbox" checked={microphoneRequired} onChange={(e) => setMicrophoneRequired(e.target.checked)} />
                            <span>Microphone Required</span>
                          </label>
                          <label className="flex items-center gap-2 p-3 border rounded-lg">
                            <input type="checkbox" checked={entireScreenRequired} onChange={(e) => setEntireScreenRequired(e.target.checked)} />
                            <span>Entire Screen Required</span>
                          </label>
                          <label className="flex items-center gap-2 p-3 border rounded-lg">
                            <input type="checkbox" checked={fullscreenRequired} onChange={(e) => setFullscreenRequired(e.target.checked)} />
                            <span>Fullscreen Required</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="text-xs font-semibold block mb-1">Max Tab/Window Violations</label>
                            <input
                              type="number"
                              value={maxWindowViolations}
                              onChange={(e) => setMaxWindowViolations(parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold block mb-1">Max Fullscreen Exits</label>
                            <input
                              type="number"
                              value={maxFullscreenViolations}
                              onChange={(e) => setMaxFullscreenViolations(parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-1.5 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* STEP 12: Schedule */}
              {currentStep === 12 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 12: Examination Schedule & Entry Window</h2>
                    <p className="text-xs text-neutral-500">Specify controlled examination window, duration, and late entry policy.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-semibold block mb-1">Examination Date</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Late Entry Grace Period (Minutes)</label>
                      <input
                        type="number"
                        value={lateEntryGraceMinutes}
                        onChange={(e) => setLateEntryGraceMinutes(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Entry Window Start (Time)</label>
                      <input
                        type="time"
                        value={windowStart}
                        onChange={(e) => setWindowStart(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Entry Window End (Time)</label>
                      <input
                        type="time"
                        value={windowEnd}
                        onChange={(e) => setWindowEnd(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 13: Candidate Rules */}
              {currentStep === 13 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 13: Candidate Rules & Security</h2>
                    <p className="text-xs text-neutral-500">Control paper stability, randomization, and score visibility.</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <label className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <span className="font-semibold block">Randomize Question Sequence</span>
                        <span className="text-neutral-500">Stable per attempt; candidate paper sequence will not change on refresh.</span>
                      </div>
                      <input type="checkbox" checked={randomizeQuestions} onChange={(e) => setRandomizeQuestions(e.target.checked)} />
                    </label>
                    <label className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <span className="font-semibold block">Randomize Option Order</span>
                        <span className="text-neutral-500">Shuffles MCQ choices per candidate session.</span>
                      </div>
                      <input type="checkbox" checked={randomizeOptions} onChange={(e) => setRandomizeOptions(e.target.checked)} />
                    </label>
                    <label className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <span className="font-semibold block">Allow Back Navigation Across Questions</span>
                        <span className="text-neutral-500">Enables candidates to review and revise previously answered questions.</span>
                      </div>
                      <input type="checkbox" checked={allowBackNavigation} onChange={(e) => setAllowBackNavigation(e.target.checked)} />
                    </label>
                    <label className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <span className="font-semibold block">Auto-Submit on Duration Expiry</span>
                        <span className="text-neutral-500">Automatically finalizes attempt when timer hits 0.</span>
                      </div>
                      <input type="checkbox" checked={autoSubmitOnTimeout} onChange={(e) => setAutoSubmitOnTimeout(e.target.checked)} />
                    </label>
                  </div>
                </Card>
              )}

              {/* STEP 14: Preview */}
              {currentStep === 14 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 14: Examination Preview</h2>
                    <p className="text-xs text-neutral-500">Comprehensive paper pattern blueprint review prior to formal publish.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <span className="text-xs text-neutral-400 font-mono">STUDENTHUB OFFICIAL RECRUITMENT EXAMINATION</span>
                        <h3 className="text-lg font-bold">{title}</h3>
                      </div>
                      <Badge className="bg-primary-600 text-white border-none">{examinationType}</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-neutral-300">
                      <div>Total Questions: <span className="text-white font-bold">{selectedQuestionIds.length || sectionTotalQuestions}</span></div>
                      <div>Total Marks: <span className="text-white font-bold">{sectionTotalMarks}</span></div>
                      <div>Duration: <span className="text-white font-bold">{durationMinutes} Mins</span></div>
                      <div>Negative Rate: <span className="text-white font-bold">-{negativeMarkingRate}x</span></div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                      <span className="font-semibold text-neutral-400">Sections Blueprint:</span>
                      {sections.map((s, i) => (
                        <div key={s.id} className="flex justify-between items-center text-neutral-300">
                          <span>{i + 1}. {s.name}</span>
                          <span className="font-mono text-neutral-400">
                            {s.totalQuestions} Questions ({s.easyCount || 0}E / {s.mediumCount || 0}M / {s.hardCount || 0}H) • {s.totalMarks} Marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 15: Publish */}
              {currentStep === 15 && (
                <Card className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Step 15: Readiness Checklist & Publish</h2>
                    <p className="text-xs text-neutral-500">Ensure all mandatory requirements are validated before examination goes live.</p>
                  </div>

                  <div className="space-y-2.5">
                    {checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                          item.valid
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <Badge variant="outline" className={item.valid ? "border-emerald-300 text-emerald-700" : "border-rose-300 text-rose-700"}>
                          {item.valid ? "READY" : "INCOMPLETE"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                      Save as Draft
                    </Button>
                    <Button
                      onClick={handlePublishAssessment}
                      disabled={isPublishing || !allChecksPass}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      {isPublishing ? "Publishing Examination..." : "Publish & Lock Version"}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous Step
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Step {currentStep} of {STEPS.length}</span>
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
                    disabled={currentStep === STEPS.length}
                    className="text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 text-white"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Exam Blueprint Summary Panel (Right Column) */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4 space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Exam Blueprint
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    v1 DRAFT
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Drive:</span>
                    <span className="font-semibold text-right truncate max-w-[120px]">{selectedDrive?.title || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Type:</span>
                    <span className="font-semibold">{examinationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Duration:</span>
                    <span className="font-mono font-semibold">{durationMinutes} Mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Sections:</span>
                    <span className="font-mono font-semibold">{sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total Marks:</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">{sectionTotalMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Passing:</span>
                    <span className="font-mono font-semibold text-emerald-600">{passingMarks} Marks ({passingPercentage}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Cutoff:</span>
                    <span className="font-mono font-semibold text-primary-600">{cutoffType} ({cutoffValue}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Negative Rate:</span>
                    <span className="font-mono font-semibold text-rose-600">-{negativeMarkingRate}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Questions:</span>
                    <span className="font-mono font-semibold">{selectedQuestionIds.length} attached</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Proctoring:</span>
                    <span className="font-semibold">{isProctored ? "Proctored (Active)" : "Standard"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-500 block">Section Breakdown:</span>
                  {sections.map((sec, idx) => (
                    <div key={sec.id} className="text-[11px] flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span className="truncate max-w-[130px]">{idx + 1}. {sec.name}</span>
                      <span className="font-mono">{sec.totalMarks}M</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
