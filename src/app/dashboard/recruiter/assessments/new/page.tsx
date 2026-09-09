"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Sparkles,
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
} from "@/types";

const STEPS = [
  { id: 1, name: "Basic Info", icon: FileText },
  { id: 2, name: "Settings", icon: Sliders },
  { id: 3, name: "Questions", icon: Sparkles },
  { id: 4, name: "Scoring", icon: Award },
  { id: 5, name: "Proctoring", icon: Shield },
  { id: 6, name: "Candidate Rules", icon: HelpCircle },
  { id: 7, name: "Preview", icon: Eye },
  { id: 8, name: "Publish", icon: Send },
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

  // Form State
  const [assessmentId, setAssessmentId] = useState<string>(editId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState(
    "Please ensure your camera, microphone, and full screen sharing are turned on before beginning. Do not switch tabs or exit fullscreen during the examination."
  );
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [category, setCategory] = useState<QuestionCategory>("Technical");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Settings
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);
  const [autoSubmitOnTimeout, setAutoSubmitOnTimeout] = useState(true);
  const [showResultImmediately, setShowResultImmediately] = useState(true);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(true);

  // Questions Selected
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionBankTab, setQuestionBankTab] = useState<"system" | "company" | "create">("system");

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
  const [inlineTopic, setInlineTopic] = useState("Core Engineering");
  const [inlineExplanation, setInlineExplanation] = useState("");

  // Scoring
  const [passingPercentage, setPassingPercentage] = useState(60);

  // Proctoring
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

  // Load drives and questions
  useEffect(() => {
    fetchDrives();
    fetchQuestions();
    if (editId) {
      loadExistingAssessment(editId);
    }
  }, [editId]);

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
        setPassingPercentage(a.passingPercentage || 60);
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    }
  };

  // Calculate totals
  const selectedQuestions = availableQuestions.filter((q) => selectedQuestionIds.includes(q.id));
  const totalCalculatedMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
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
        success("Question created and added to assessment!");
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
          attemptsAllowed,
          randomizeQuestions,
          randomizeOptions,
          allowBackNavigation,
          autoSubmitOnTimeout,
          showResultImmediately,
        },
        totalMarks: totalCalculatedMarks,
        passingMarks,
        passingPercentage,
        negativeMarkingEnabled,
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
        success("Assessment draft saved successfully!");
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
      toastError("Cannot publish assessment without questions. Please select at least one question.");
      setCurrentStep(3);
      return;
    }

    setIsPublishing(true);
    try {
      // 1. First ensure current configuration is saved
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
            attemptsAllowed,
            randomizeQuestions,
            randomizeOptions,
            allowBackNavigation,
            autoSubmitOnTimeout,
            showResultImmediately,
          },
          totalMarks: totalCalculatedMarks,
          passingMarks,
          passingPercentage,
          negativeMarkingEnabled,
          questionIds: selectedQuestionIds,
          status: "DRAFT",
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        toastError(saveData.error || "Failed to save assessment before publishing.");
        setIsPublishing(false);
        return;
      }

      const activeId = saveData.assessment.id;

      // 2. Snapshot questions and publish
      const pubRes = await fetch(`/api/recruiter/assessments/${activeId}/publish`, {
        method: "POST",
      });

      if (pubRes.ok) {
        success("Assessment published successfully! Questions are locked and candidates can now be evaluated.");
        router.push(`/dashboard/recruiter/assessments/${activeId}`);
      } else {
        const err = await pubRes.json();
        toastError(err.error || "Failed to publish assessment.");
      }
    } catch (err) {
      console.error(err);
      toastError("An unexpected error occurred during publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/recruiter/assessments">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Assessments
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {editId ? "Edit Assessment Draft" : "Assessment Builder"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Step {currentStep} of 8: {STEPS[currentStep - 1].name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving || !title}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            {currentStep < 8 ? (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={handlePublishAssessment}
                disabled={isPublishing}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isPublishing ? "Publishing..." : "Confirm & Publish"}
              </Button>
            )}
          </div>
        </div>

        {/* Step Indicator Bar */}
        <Card className="p-3 border-border bg-card overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : isCompleted
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <span>{step.name}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Live Summary Bar */}
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs flex flex-wrap items-center justify-between gap-3 font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-foreground font-bold">
              {title || "Untitled Assessment"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-purple-600 dark:text-purple-400">
              {selectedQuestions.length} Questions Selected
            </span>
            <span className="text-muted-foreground">•</span>
            <span>Duration: {durationMinutes} mins</span>
            <span className="text-muted-foreground">•</span>
            <span>Total: {totalCalculatedMarks} Marks</span>
          </div>

          <div>
            {isProctored ? (
              <Badge variant="purple" size="sm" className="gap-1 font-bold">
                <Shield className="w-3 h-3" /> Proctored Mode Active
              </Badge>
            ) : (
              <Badge variant="blue" size="sm">
                Standard Mode
              </Badge>
            )}
          </div>
        </div>

        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="p-6 border-border bg-card space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Step 1: Basic Information</h2>
              <p className="text-xs text-muted-foreground">
                Set the foundational identity, duration, and target recruitment drive for this test.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Assessment Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Core Algorithms & Distributed Systems Test"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Associated Recruitment Drive *
                </label>
                <select
                  value={selectedDriveId}
                  onChange={(e) => setSelectedDriveId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none"
                >
                  <option value="">Select a recruitment drive...</option>
                  {drives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Assessment Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none"
                >
                  <option value="Technical">Technical</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Communication">Communication</option>
                  <option value="Domain">Domain</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Allocated Duration (Minutes) *
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary shown to candidates and evaluation roster"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Candidate Examination Instructions
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </Card>
        )}

        {/* STEP 2: Assessment Settings */}
        {currentStep === 2 && (
          <Card className="p-6 border-border bg-card space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Step 2: Assessment Settings</h2>
              <p className="text-xs text-muted-foreground">
                Configure randomization, navigation constraints, timeout triggers, and instant result visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Negative Marking</h4>
                  <p className="text-xs text-muted-foreground">Deduct configured negative marks for incorrect objective answers</p>
                </div>
                <input
                  type="checkbox"
                  checked={negativeMarkingEnabled}
                  onChange={(e) => setNegativeMarkingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Randomize Questions</h4>
                  <p className="text-xs text-muted-foreground">Generate deterministic randomized question order per attempt</p>
                </div>
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Allow Back Navigation</h4>
                  <p className="text-xs text-muted-foreground">Permit candidates to return to previous questions and change answers</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowBackNavigation}
                  onChange={(e) => setAllowBackNavigation(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Auto-Submit on Timeout</h4>
                  <p className="text-xs text-muted-foreground">Authoritatively submit exam when server timer expires</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSubmitOnTimeout}
                  onChange={(e) => setAutoSubmitOnTimeout(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Show Results Immediately</h4>
                  <p className="text-xs text-muted-foreground">Allow candidates to view score & evaluated review upon submission</p>
                </div>
                <input
                  type="checkbox"
                  checked={showResultImmediately}
                  onChange={(e) => setShowResultImmediately(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Attempts Allowed</h4>
                  <p className="text-xs text-muted-foreground">Strictly limits maximum attempts candidate can perform</p>
                </div>
                <span className="font-bold text-sm text-foreground px-3 py-1 bg-muted rounded-lg">1 Attempt</span>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: Question Bank & Selection */}
        {currentStep === 3 && (
          <Card className="p-6 border-border bg-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Step 3: Question Bank & Selection</h2>
                <p className="text-xs text-muted-foreground">
                  Combine verified StudentHub System questions with your own Company questions or create inline questions.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl">
                <button
                  onClick={() => setQuestionBankTab("system")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    questionBankTab === "system" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  StudentHub Bank
                </button>
                <button
                  onClick={() => setQuestionBankTab("company")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    questionBankTab === "company" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  My Question Bank
                </button>
                <button
                  onClick={() => setQuestionBankTab("create")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    questionBankTab === "create" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  + Create New
                </button>
              </div>
            </div>

            {/* Questions Picker */}
            {questionBankTab !== "create" ? (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>
                    Showing {questionBankTab === "system" ? "Verified StudentHub Questions" : "Company Questions"}
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {selectedQuestionIds.length} Selected
                  </span>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-96 overflow-y-auto bg-background">
                  {availableQuestions
                    .filter((q) => (questionBankTab === "system" ? q.ownerType === "SYSTEM" : q.ownerType !== "SYSTEM"))
                    .map((q) => {
                      const isSelected = selectedQuestionIds.includes(q.id);

                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestionSelection(q.id)}
                          className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                            isSelected ? "bg-purple-500/10 dark:bg-purple-950/30" : "hover:bg-muted/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-purple-600 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" size="sm">
                                {q.type}
                              </Badge>
                              <Badge
                                variant={
                                  q.difficulty === "EASY"
                                    ? "emerald"
                                    : q.difficulty === "MEDIUM"
                                    ? "blue"
                                    : "rose"
                                }
                                size="sm"
                              >
                                {q.difficulty}
                              </Badge>
                              <span className="text-xs font-semibold text-muted-foreground">{q.topic}</span>
                              <span className="text-xs text-muted-foreground ml-auto font-bold text-foreground">
                                {q.marks} Marks
                              </span>
                            </div>
                            <p className="text-xs font-medium text-foreground leading-relaxed">{q.questionText}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              /* Inline Question Creator */
              <div className="p-4 rounded-xl border border-border bg-background space-y-4">
                <h4 className="font-bold text-sm text-foreground">Create Question Directly in Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-foreground">Question Text *</label>
                    <input
                      type="text"
                      value={inlineQText}
                      onChange={(e) => setInlineQText(e.target.value)}
                      placeholder="e.g. What HTTP method is typically used to update a resource idempotently?"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Question Type</label>
                    <select
                      value={inlineQType}
                      onChange={(e) => setInlineQType(e.target.value as QuestionType)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground"
                    >
                      <option value="SINGLE_CHOICE">Single Choice (MCQ)</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Topic</label>
                    <input
                      type="text"
                      value={inlineTopic}
                      onChange={(e) => setInlineTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground"
                    />
                  </div>

                  {inlineQType !== "SHORT_ANSWER" && (
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-foreground">Options</label>
                      {inlineOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-5 text-xs font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...inlineOptions];
                              updated[idx] = e.target.value;
                              setInlineOptions(updated);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => setInlineCorrectAnswer(opt)}
                            className={`px-2 py-1 rounded text-[11px] font-bold ${
                              inlineCorrectAnswer === opt
                                ? "bg-emerald-500 text-white"
                                : "bg-muted text-muted-foreground hover:bg-emerald-500/20"
                            }`}
                          >
                            {inlineCorrectAnswer === opt ? "Correct ✓" : "Set Correct"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {inlineQType === "SHORT_ANSWER" && (
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-foreground">Expected Correct Answer *</label>
                      <input
                        type="text"
                        value={inlineCorrectAnswer}
                        onChange={(e) => setInlineCorrectAnswer(e.target.value)}
                        placeholder="Target exact keyword/text"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Marks</label>
                    <input
                      type="number"
                      min={1}
                      value={inlineMarks}
                      onChange={(e) => setInlineMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Negative Marks</label>
                    <input
                      type="number"
                      min={0}
                      step={0.25}
                      value={inlineNegMarks}
                      onChange={(e) => setInlineNegMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="gradient" size="sm" onClick={handleCreateInlineQuestion}>
                    Save Question to Assessment
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* STEP 4: Scoring */}
        {currentStep === 4 && (
          <Card className="p-6 border-border bg-card space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Step 4: Scoring Configuration</h2>
              <p className="text-xs text-muted-foreground">
                Set benchmarks, passing percentage, and review the cumulative scoring breakdown.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl border border-border bg-background text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase">Total Marks</p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{totalCalculatedMarks} pts</p>
                <p className="text-[11px] text-muted-foreground mt-1">Sum of all {selectedQuestions.length} selected questions</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase">Passing Benchmark</p>
                <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{passingMarks} pts</p>
                <p className="text-[11px] text-muted-foreground mt-1">Based on {passingPercentage}% requirement</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase">Negative Marking</p>
                <p className="text-3xl font-extrabold text-amber-500 mt-1">{negativeMarkingEnabled ? "ENABLED" : "DISABLED"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Configured per question</p>
              </div>

              <div className="md:col-span-3 space-y-2 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="flex justify-between text-xs font-bold">
                  <span>Passing Percentage: {passingPercentage}%</span>
                  <span>Benchmark: {passingMarks} / {totalCalculatedMarks} Marks</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={95}
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </Card>
        )}

        {/* STEP 5: Proctoring */}
        {currentStep === 5 && (
          <Card className="p-6 border-border bg-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Step 5: Proctoring & Integrity Engine</h2>
                <p className="text-xs text-muted-foreground">
                  Configure browser permission verifications and strictness thresholds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Proctored Mode:</span>
                <button
                  type="button"
                  onClick={() => setIsProctored(!isProctored)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isProctored
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isProctored ? "STRICT PROCTORED [ON]" : "STANDARD [OFF]"}
                </button>
              </div>
            </div>

            {isProctored ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Webcam Stream Required</h4>
                      <p className="text-xs text-muted-foreground">Live camera video track must remain active</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={cameraRequired}
                      onChange={(e) => setCameraRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Microphone Audio Required</h4>
                      <p className="text-xs text-muted-foreground">Microphone audio track monitoring active</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={microphoneRequired}
                      onChange={(e) => setMicrophoneRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Entire Desktop Screen Share</h4>
                      <p className="text-xs text-muted-foreground">Candidate must share entire display, not single tab</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={entireScreenRequired}
                      onChange={(e) => setEntireScreenRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Fullscreen Enforcement</h4>
                      <p className="text-xs text-muted-foreground">Exam will pause if candidate exits fullscreen</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={fullscreenRequired}
                      onChange={(e) => setFullscreenRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                    <label className="text-xs font-bold text-foreground">Max Allowed Window / Tab Violations</label>
                    <select
                      value={maxWindowViolations}
                      onChange={(e) => setMaxWindowViolations(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                    >
                      <option value={1}>1 Violation (Strict)</option>
                      <option value={2}>2 Violations (Recommended)</option>
                      <option value={3}>3 Violations (Lenient)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Auto-Terminate on Limit</h4>
                      <p className="text-xs text-muted-foreground">Immediately terminate attempt when violation limit reached</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={terminateOnViolationLimit}
                      onChange={(e) => setTerminateOnViolationLimit(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Integrity Signal Disclosure:</strong> Web browsers cannot detect third-party OS background apps directly. Violations are triggered via standard Page Visibility, focus/blur, and WebRTC track interruption signals.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Standard mode does not require media stream hardware checks.</p>
            )}
          </Card>
        )}

        {/* STEP 6: Candidate Rules */}
        {currentStep === 6 && (
          <Card className="p-6 border-border bg-card space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Step 6: Candidate Rules & Environment Verification</h2>
              <p className="text-xs text-muted-foreground">
                Review the rules and hardware requirements presented to candidates before they can launch the exam.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                <h4 className="font-bold text-sm text-foreground">Hardware & Network Pre-Flight Checklist:</h4>
                <ul className="space-y-1.5 text-muted-foreground list-disc pl-4">
                  <li><strong>Webcam:</strong> Must have functional video track and clear illumination.</li>
                  <li><strong>Microphone:</strong> Audio input stream must register audio activity.</li>
                  <li><strong>Screen Capture:</strong> Candidate must share their entire monitor display.</li>
                  <li><strong>Fullscreen:</strong> Assessment interface will lock to full viewport before start.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                <h4 className="font-bold text-sm text-foreground">Integrity Escalation Matrix:</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">Violation 1</p>
                    <p className="text-[11px] text-muted-foreground">Yellow Warning Alert</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="font-bold text-orange-600 dark:text-orange-400">Violation 2</p>
                    <p className="text-[11px] text-muted-foreground">Final Red Warning</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <p className="font-bold text-rose-600 dark:text-rose-400">Violation 3</p>
                    <p className="text-[11px] text-muted-foreground">Automatic Termination</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 7: Interactive Preview */}
        {currentStep === 7 && (
          <Card className="p-6 border-border bg-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Step 7: Interactive Recruiter Preview</h2>
                <p className="text-xs text-muted-foreground">
                  Experience how your questions and options will render inside the student examination room.
                </p>
              </div>

              <Badge variant="purple" size="sm">
                Recruiter Preview Mode
              </Badge>
            </div>

            {selectedQuestions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No questions selected. Go to Step 3 to add questions.</p>
            ) : (
              <div className="space-y-4">
                {selectedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-border bg-background space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">Question {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">
                          {q.type}
                        </Badge>
                        <span className="font-bold text-foreground">{q.marks} Marks</span>
                        {negativeMarkingEnabled && q.negativeMarks > 0 && (
                          <span className="text-rose-500">(-{q.negativeMarks} Neg)</span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-bold text-foreground">{q.questionText}</p>

                    {q.options && q.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.includes(opt)
                            : q.correctAnswer === opt;

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                                  : "border-border bg-card text-muted-foreground"
                              }`}
                            >
                              <span>
                                <strong className="mr-2">{String.fromCharCode(65 + oIdx)}.</strong>
                                {opt}
                              </span>
                              {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground italic">
                        Expected Answer: {String(q.correctAnswer)}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60 text-[11px] text-muted-foreground">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* STEP 8: Publish */}
        {currentStep === 8 && (
          <Card className="p-8 border-border bg-card text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
              <Send className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-extrabold text-foreground">Ready to Publish Assessment?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Publishing will freeze all {selectedQuestions.length} questions into an immutable version snapshot. Future edits in the question bank will not affect active examination attempts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border max-w-md mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assessment Title:</span>
                <strong className="text-foreground">{title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <strong className="text-foreground">{durationMinutes} Minutes</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions Snapshot:</span>
                <strong className="text-foreground">{selectedQuestions.length} Questions</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passing Score:</span>
                <strong className="text-foreground">{passingMarks} / {totalCalculatedMarks} pts ({passingPercentage}%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proctoring Mode:</span>
                <strong className="text-foreground">{isProctored ? "Strict Proctored" : "Standard"}</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setCurrentStep(7)}>
                Review Questions
              </Button>
              <Button
                variant="gradient"
                size="md"
                onClick={handlePublishAssessment}
                disabled={isPublishing}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isPublishing ? "Freezing & Publishing..." : "Confirm & Publish Assessment"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
