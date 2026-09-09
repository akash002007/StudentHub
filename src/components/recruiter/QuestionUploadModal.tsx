"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  Eye,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import {
  ParsedQuestionCandidate,
  QuestionDifficulty,
  QuestionCategory,
  QuestionType,
  AssessmentQuestion,
} from "@/types";

interface QuestionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (importedQuestions: AssessmentQuestion[]) => void;
}

type ReviewFilter = "ALL" | "READY" | "NEEDS_REVIEW" | "DUPLICATES" | "INVALID";

export function QuestionUploadModal({
  isOpen,
  onClose,
  onImportSuccess,
}: QuestionUploadModalProps) {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow step
  const [step, setStep] = useState<"UPLOAD" | "PARSING" | "REVIEW" | "COMPLETED">("UPLOAD");

  // Selected file & drag state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Global extraction defaults
  const [defaults, setDefaults] = useState({
    category: "Technical",
    topic: "General",
    difficulty: "MEDIUM" as QuestionDifficulty,
    marks: 2,
    negativeMarks: 0.5,
  });
  const [showDefaults, setShowDefaults] = useState(false);

  // Parsing result
  const [candidates, setCandidates] = useState<ParsedQuestionCandidate[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [scannedWarning, setScannedWarning] = useState<string | null>(null);
  const [extractionMeta, setExtractionMeta] = useState<{ fileName: string; fileType: string } | null>(null);

  // Review state
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("ALL");
  const [selectedTempIds, setSelectedTempIds] = useState<Set<string>>(new Set());
  const [editingCandidate, setEditingCandidate] = useState<ParsedQuestionCandidate | null>(null);

  // Submitting / Final state
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    importedQuestions: AssessmentQuestion[];
  } | null>(null);

  // Reset modal state
  const handleReset = () => {
    setStep("UPLOAD");
    setSelectedFile(null);
    setCandidates([]);
    setParseWarnings([]);
    setScannedWarning(null);
    setExtractionMeta(null);
    setSelectedTempIds(new Set());
    setEditingCandidate(null);
    setImportResult(null);
    setActiveFilter("ALL");
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".doc"].includes(ext)) {
      toastError("Unsupported format. Please select a .pdf, .docx, or .doc file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toastError("File too large. Maximum supported document size is 25MB.");
      return;
    }
    setSelectedFile(file);
  };

  // Trigger Extraction
  const handleExtractQuestions = async () => {
    if (!selectedFile) return;

    setStep("PARSING");
    setScannedWarning(null);
    setParseWarnings([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("defaultCategory", defaults.category);
      formData.append("defaultTopic", defaults.topic);
      formData.append("defaultDifficulty", defaults.difficulty);
      formData.append("defaultMarks", String(defaults.marks));
      formData.append("defaultNegativeMarks", String(defaults.negativeMarks));

      const res = await fetch("/api/recruiter/questions/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toastError(data.error || "Failed to parse questions from document.");
        setStep("UPLOAD");
        return;
      }

      if (data.isScannedPdf) {
        setScannedWarning(data.scannedWarning);
        setStep("UPLOAD");
        return;
      }

      const extracted: ParsedQuestionCandidate[] = data.questions || [];
      setCandidates(extracted);
      setParseWarnings(data.parseWarnings || []);
      setExtractionMeta({
        fileName: data.fileName,
        fileType: data.fileType,
      });

      // Default select all questions that are READY and not EXACT_DUPLICATE
      const initialSelected = new Set<string>();
      extracted.forEach((c) => {
        if (c.validationStatus === "READY" && c.duplicateStatus !== "EXACT_DUPLICATE") {
          initialSelected.add(c.tempId);
        }
      });
      setSelectedTempIds(initialSelected);

      setStep("REVIEW");
      if (extracted.length === 0) {
        info("No recognizable questions found in the document. Please check the document formatting.");
      } else {
        success(`Successfully extracted ${extracted.length} questions from document!`);
      }
    } catch (err) {
      console.error(err);
      toastError("An error occurred while uploading and parsing the document.");
      setStep("UPLOAD");
    }
  };

  // Filtered Candidates in Review
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (activeFilter === "READY") return c.validationStatus === "READY";
      if (activeFilter === "NEEDS_REVIEW") return c.validationStatus === "NEEDS_REVIEW";
      if (activeFilter === "DUPLICATES") return c.duplicateStatus !== "UNIQUE";
      if (activeFilter === "INVALID") return c.validationStatus === "INVALID";
      return true;
    });
  }, [candidates, activeFilter]);

  // Statistics
  const counts = useMemo(() => {
    let ready = 0;
    let needsReview = 0;
    let duplicates = 0;
    let invalid = 0;

    candidates.forEach((c) => {
      if (c.validationStatus === "READY") ready++;
      if (c.validationStatus === "NEEDS_REVIEW") needsReview++;
      if (c.duplicateStatus !== "UNIQUE") duplicates++;
      if (c.validationStatus === "INVALID") invalid++;
    });

    return { total: candidates.length, ready, needsReview, duplicates, invalid };
  }, [candidates]);

  // Toggle selection
  const toggleSelectCandidate = (tempId: string) => {
    setSelectedTempIds((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedTempIds((prev) => {
      const next = new Set(prev);
      filteredCandidates.forEach((c) => {
        if (c.validationStatus !== "INVALID") {
          next.add(c.tempId);
        }
      });
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedTempIds(new Set());
  };

  const handleSelectReadyOnly = () => {
    const next = new Set<string>();
    candidates.forEach((c) => {
      if (c.validationStatus === "READY" && c.duplicateStatus !== "EXACT_DUPLICATE") {
        next.add(c.tempId);
      }
    });
    setSelectedTempIds(next);
  };

  // Remove Candidate
  const handleRemoveCandidate = (tempId: string) => {
    setCandidates((prev) => prev.filter((c) => c.tempId !== tempId));
    setSelectedTempIds((prev) => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  };

  // Save Candidate Edits
  const handleSaveCandidateEdit = (updated: ParsedQuestionCandidate) => {
    // Re-validate candidate
    const hasText = updated.questionText.trim().length > 5;
    const hasOptions = updated.type === "SHORT_ANSWER" || (updated.options && updated.options.length >= 2);
    const hasAnswer =
      Array.isArray(updated.correctAnswer)
        ? updated.correctAnswer.length > 0
        : Boolean(updated.correctAnswer && String(updated.correctAnswer).trim());

    let status: "READY" | "NEEDS_REVIEW" | "INVALID" = "READY";
    let issues: string[] = [];

    if (!hasText) {
      status = "INVALID";
      issues.push("Question text is too short or missing");
    }
    if (!hasOptions) {
      status = "INVALID";
      issues.push("At least 2 options are required for multiple choice");
    }
    if (!hasAnswer) {
      status = "NEEDS_REVIEW";
      issues.push("Correct answer is not selected");
    }

    const reevaluated: ParsedQuestionCandidate = {
      ...updated,
      validationStatus: status,
      validationIssues: issues,
    };

    setCandidates((prev) => prev.map((c) => (c.tempId === reevaluated.tempId ? reevaluated : c)));

    // Auto-select if newly marked READY
    if (status === "READY" && reevaluated.duplicateStatus !== "EXACT_DUPLICATE") {
      setSelectedTempIds((prev) => new Set(prev).add(reevaluated.tempId));
    }

    setEditingCandidate(null);
    success("Question candidate updated!");
  };

  // Execute Import
  const handleExecuteImport = async () => {
    const toImport = candidates.filter(
      (c) => selectedTempIds.has(c.tempId) && c.validationStatus !== "INVALID"
    );

    if (toImport.length === 0) {
      toastError("No questions selected for import. Please select at least one valid question.");
      return;
    }

    // Check if any selected questions are NEEDS_REVIEW
    const needsReviewSelected = toImport.filter((c) => c.validationStatus === "NEEDS_REVIEW");
    if (needsReviewSelected.length > 0) {
      const proceed = confirm(
        `${needsReviewSelected.length} selected question(s) have missing answers or require review. Would you like to import them anyway?`
      );
      if (!proceed) return;
    }

    setIsSubmittingImport(true);

    try {
      const payload = {
        fileName: extractionMeta?.fileName || selectedFile?.name || "Uploaded Document",
        fileType: extractionMeta?.fileType || "pdf",
        totalDetected: candidates.length,
        duplicateCount: counts.duplicates,
        questions: toImport.map((c) => ({
          questionText: c.questionText,
          type: c.type,
          options: c.options,
          correctAnswer: c.correctAnswer,
          marks: c.marks,
          negativeMarks: c.negativeMarks,
          difficulty: c.difficulty,
          category: c.category,
          topic: c.topic,
          tags: c.tags,
          explanation: c.explanation,
        })),
      };

      const res = await fetch("/api/recruiter/questions/import-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toastError(data.error || "Failed to import questions to Question Bank.");
        return;
      }

      setImportResult({
        importedCount: data.importedCount,
        importedQuestions: data.importedQuestions,
      });
      setStep("COMPLETED");

      if (onImportSuccess) {
        onImportSuccess(data.importedQuestions);
      }
      success(`Successfully imported ${data.importedCount} questions to your Question Bank!`);
    } catch (err) {
      console.error(err);
      toastError("Network error while importing questions.");
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // Direct CTA to Assessment Creator
  const handleCreateAssessmentWithQuestions = () => {
    if (!importResult || !importResult.importedQuestions) return;
    const qids = importResult.importedQuestions.map((q) => q.id).join(",");
    handleModalClose();
    router.push(`/dashboard/recruiter/assessments/new?preselectQuestions=${encodeURIComponent(qids)}`);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        title={
          step === "UPLOAD"
            ? "Upload Questions from Document"
            : step === "PARSING"
            ? "Extracting Questions"
            : step === "REVIEW"
            ? "Review & Validate Extracted Questions"
            : "Import Completed"
        }
        description={
          step === "UPLOAD"
            ? "Upload a PDF or Word document (.docx, .doc) to automatically extract questions, options, answer keys, and explanations."
            : step === "PARSING"
            ? "Analyzing document layout, extracting questions, detecting options, and checking for duplicates..."
            : step === "REVIEW"
            ? `Review and fine-tune questions extracted from ${extractionMeta?.fileName || "your document"} before saving to your Question Bank.`
            : "Your questions have been successfully verified and saved to your company's Question Bank."
        }
        maxWidth="5xl"
      >
        <div className="space-y-6">
          {/* STEP 1: UPLOAD TARGET */}
          {step === "UPLOAD" && (
            <div className="space-y-6">
              {/* Scanned Warning Banner */}
              {scannedWarning && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">Scanned Document Detected</div>
                    <p className="text-xs leading-relaxed">{scannedWarning}</p>
                  </div>
                </div>
              )}

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/10 scale-[0.99]"
                    : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20"
                    : "border-border hover:border-purple-500/50 hover:bg-muted/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-base">{selectedFile.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="emerald">Document Selected</Badge>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-rose-500 underline transition-colors"
                      >
                        Change file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-base">
                        Drag and drop your exam document here
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: <strong className="text-foreground">PDF (.pdf)</strong>,{" "}
                        <strong className="text-foreground">Word (.docx, .doc)</strong> up to 25MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>

              {/* Document Format Guidelines Pill */}
              <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Smart Document Parsing Capabilities</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 pl-6 list-disc">
                  <li>
                    Supports standard question numbers like <code className="text-foreground font-mono">1.</code>,{" "}
                    <code className="text-foreground font-mono">Q1.</code>, or{" "}
                    <code className="text-foreground font-mono">Question 1:</code>
                  </li>
                  <li>
                    Detects options labeled with letters (<code className="text-foreground font-mono">A.</code>,{" "}
                    <code className="text-foreground font-mono">(A)</code>, <code className="text-foreground font-mono">a)</code>) or numbers
                  </li>
                  <li>
                    Captures answers listed inline (<code className="text-foreground font-mono">Answer: B</code>) or in an end-of-document Answer Key (<code className="text-foreground font-mono">1-A, 2-C</code>)
                  </li>
                  <li>Automatically detects explanations, difficulty, topics, and question tags</li>
                </ul>
              </div>

              {/* Extraction Defaults Collapsible */}
              <div className="border border-border/70 rounded-xl overflow-hidden bg-card/50">
                <button
                  type="button"
                  onClick={() => setShowDefaults(!showDefaults)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Default metadata for questions (applied if not specified in file)
                  </span>
                  {showDefaults ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDefaults && (
                  <div className="p-4 pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Category
                      </label>
                      <select
                        value={defaults.category}
                        onChange={(e) => setDefaults({ ...defaults, category: e.target.value })}
                        className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Aptitude">Aptitude</option>
                        <option value="Verbal">Verbal</option>
                        <option value="Domain">Domain Specific</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Topic
                      </label>
                      <input
                        type="text"
                        value={defaults.topic}
                        onChange={(e) => setDefaults({ ...defaults, topic: e.target.value })}
                        placeholder="e.g. Data Structures"
                        className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Difficulty
                      </label>
                      <select
                        value={defaults.difficulty}
                        onChange={(e) =>
                          setDefaults({ ...defaults, difficulty: e.target.value as QuestionDifficulty })
                        }
                        className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Marks
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={defaults.marks}
                        onChange={(e) => setDefaults({ ...defaults, marks: parseFloat(e.target.value) || 2 })}
                        className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Negative Marks
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={defaults.negativeMarks}
                        onChange={(e) =>
                          setDefaults({ ...defaults, negativeMarks: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  disabled={!selectedFile}
                  onClick={handleExtractQuestions}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Parse & Extract Questions
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PARSING LOADER */}
          {step === "PARSING" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-lg text-foreground">Parsing Document Content...</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Reading document structure, separating question stems, matching option keys, and checking duplicate entries against your company&apos;s Question Bank.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT CANDIDATES */}
          {step === "REVIEW" && (
            <div className="space-y-5">
              {/* Statistics & Filter Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeFilter === "ALL"
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({counts.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("READY")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      activeFilter === "READY"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground hover:text-emerald-600"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Ready ({counts.ready})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("NEEDS_REVIEW")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      activeFilter === "NEEDS_REVIEW"
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground hover:text-amber-600"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Needs Review ({counts.needsReview})
                  </button>
                  {counts.duplicates > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter("DUPLICATES")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                        activeFilter === "DUPLICATES"
                          ? "bg-rose-600 text-white"
                          : "bg-muted text-muted-foreground hover:text-rose-600"
                      }`}
                    >
                      Duplicates ({counts.duplicates})
                    </button>
                  )}
                  {counts.invalid > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter("INVALID")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                        activeFilter === "INVALID"
                          ? "bg-red-600 text-white"
                          : "bg-muted text-muted-foreground hover:text-red-600"
                      }`}
                    >
                      Invalid ({counts.invalid})
                    </button>
                  )}
                </div>

                {/* Bulk Select Utilities */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Selected: <strong className="text-foreground">{selectedTempIds.size}</strong> of {counts.total}
                  </span>
                  <div className="h-4 w-px bg-border mx-1" />
                  <button
                    type="button"
                    onClick={handleSelectReadyOnly}
                    className="text-purple-600 dark:text-purple-400 hover:underline text-xs"
                  >
                    Select Ready Only
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-muted-foreground hover:text-foreground hover:underline text-xs"
                  >
                    Select Filtered
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-muted-foreground hover:text-foreground hover:underline text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Parsing Warnings (if any) */}
              {parseWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Extraction Notes:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {parseWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Candidate Question List */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCandidates.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-xs">
                    No questions match the current filter.
                  </div>
                ) : (
                  filteredCandidates.map((candidate, idx) => {
                    const isSelected = selectedTempIds.has(candidate.tempId);
                    const isReady = candidate.validationStatus === "READY";
                    const isNeedsReview = candidate.validationStatus === "NEEDS_REVIEW";
                    const isInvalid = candidate.validationStatus === "INVALID";
                    const isDuplicate = candidate.duplicateStatus !== "UNIQUE";

                    return (
                      <div
                        key={candidate.tempId}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-card border-purple-500/60 shadow-sm"
                            : "bg-card/50 border-border/70 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Checkbox and Question Stem */}
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isInvalid}
                              onChange={() => toggleSelectCandidate(candidate.tempId)}
                              className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-border"
                            />

                            <div className="space-y-2 flex-1">
                              {/* Metadata Badges */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                                  #{candidate.rawIndex || idx + 1}
                                </span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {candidate.type.replace("_", " ")}
                                </Badge>
                                <Badge
                                  variant={
                                    candidate.difficulty === "EASY"
                                      ? "emerald"
                                      : candidate.difficulty === "HARD"
                                      ? "rose"
                                      : "amber"
                                  }
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {candidate.difficulty}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {candidate.marks}M {candidate.negativeMarks ? `(-${candidate.negativeMarks})` : ""}
                                </span>
                                <span className="text-[10px] text-muted-foreground">• {candidate.topic}</span>

                                {/* Status Badges */}
                                {isReady && (
                                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3" /> Ready
                                  </span>
                                )}
                                {isNeedsReview && (
                                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                    <AlertTriangle className="w-3 h-3" /> Needs Review
                                  </span>
                                )}
                                {isInvalid && (
                                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                    <AlertCircle className="w-3 h-3" /> Invalid
                                  </span>
                                )}
                              </div>

                              {/* Duplicate Warning Badge */}
                              {isDuplicate && (
                                <div className="text-[11px] p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-semibold">
                                      {candidate.duplicateStatus === "EXACT_DUPLICATE"
                                        ? "Exact duplicate in Question Bank: "
                                        : "Likely duplicate detected: "}
                                    </span>
                                    {candidate.duplicateReason}
                                  </div>
                                </div>
                              )}

                              {/* Question Text */}
                              <div className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                                {candidate.questionText}
                              </div>

                              {/* Options Rendering */}
                              {candidate.options && candidate.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {candidate.options.map((opt, optIdx) => {
                                    const isCorrect = Array.isArray(candidate.correctAnswer)
                                      ? candidate.correctAnswer.includes(opt)
                                      : candidate.correctAnswer === opt;
                                    const optLabel = String.fromCharCode(65 + optIdx);

                                    return (
                                      <div
                                        key={optIdx}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 border ${
                                          isCorrect
                                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-medium"
                                            : "bg-muted/30 border-border/50 text-muted-foreground"
                                        }`}
                                      >
                                        <span className="font-mono text-[10px] opacity-75">{optLabel}.</span>
                                        <span className="truncate flex-1">{opt}</span>
                                        {isCorrect && <Check className="w-3 h-3 shrink-0" />}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Missing Answer Alert */}
                              {(!candidate.correctAnswer ||
                                (Array.isArray(candidate.correctAnswer) && candidate.correctAnswer.length === 0)) && (
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Correct answer not detected. Click Edit to assign the answer before importing.
                                </div>
                              )}

                              {/* Explanation */}
                              {candidate.explanation && (
                                <div className="text-[11px] text-muted-foreground italic bg-muted/20 p-2 rounded-lg border border-border/40">
                                  <strong>Explanation:</strong> {candidate.explanation}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingCandidate(candidate)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Edit candidate"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCandidate(candidate.tempId)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-muted transition-colors"
                              title="Exclude question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Review Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/80">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("UPLOAD")}
                  className="text-xs"
                >
                  Back to Upload
                </Button>

                <div className="flex items-center gap-2.5">
                  <Button variant="outline" size="sm" onClick={handleModalClose} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    disabled={selectedTempIds.size === 0 || isSubmittingImport}
                    onClick={handleExecuteImport}
                    leftIcon={isSubmittingImport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    {isSubmittingImport
                      ? "Importing Questions..."
                      : `Import ${selectedTempIds.size} Questions to Question Bank`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: COMPLETED SUMMARY & NEXT ACTION */}
          {step === "COMPLETED" && importResult && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-foreground">Import Complete!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Successfully imported <strong className="text-foreground">{importResult.importedCount} questions</strong> from{" "}
                  <code className="font-mono text-purple-600 dark:text-purple-400">{extractionMeta?.fileName}</code> into your company&apos;s verified Question Bank.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/70 max-w-lg mx-auto flex items-center justify-around text-center text-xs">
                <div>
                  <div className="text-lg font-bold text-foreground">{counts.total}</div>
                  <div className="text-muted-foreground text-[10px]">Detected</div>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {importResult.importedCount}
                  </div>
                  <div className="text-muted-foreground text-[10px]">Imported to Bank</div>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {counts.duplicates}
                  </div>
                  <div className="text-muted-foreground text-[10px]">Duplicates Flagged</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleModalClose}
                  className="w-full sm:w-auto"
                >
                  Done • View in Question Bank
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleCreateAssessmentWithQuestions}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Create Assessment With These Questions
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* SUB-MODAL: Inline Question Editor */}
      {editingCandidate && (
        <EditCandidateDialog
          candidate={editingCandidate}
          onSave={handleSaveCandidateEdit}
          onClose={() => setEditingCandidate(null)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Candidate Editor Dialog
// ---------------------------------------------------------------------------
interface EditCandidateDialogProps {
  candidate: ParsedQuestionCandidate;
  onSave: (updated: ParsedQuestionCandidate) => void;
  onClose: () => void;
}

function EditCandidateDialog({ candidate, onSave, onClose }: EditCandidateDialogProps) {
  const [form, setForm] = useState<ParsedQuestionCandidate>({ ...candidate });

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...(form.options || [])];
    next[idx] = val;
    setForm({ ...form, options: next });
  };

  const handleAddOption = () => {
    const next = [...(form.options || []), `Option ${(form.options || []).length + 1}`];
    setForm({ ...form, options: next });
  };

  const handleRemoveOption = (idx: number) => {
    const next = (form.options || []).filter((_, i) => i !== idx);
    setForm({ ...form, options: next });
  };

  const handleSetSingleAnswer = (opt: string) => {
    setForm({ ...form, correctAnswer: opt });
  };

  const handleToggleMultiAnswer = (opt: string) => {
    const current = Array.isArray(form.correctAnswer) ? form.correctAnswer : [form.correctAnswer].filter(Boolean);
    const next = current.includes(opt) ? current.filter((c) => c !== opt) : [...current, opt];
    setForm({ ...form, correctAnswer: next });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Question Candidate"
      description="Update question stem, options, correct answers, or metadata before saving to Question Bank."
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Question Text</label>
          <textarea
            rows={3}
            value={form.questionText}
            onChange={(e) => setForm({ ...form, questionText: e.target.value })}
            className="w-full text-xs rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
          />
        </div>

        {/* Question Type & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Question Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as QuestionType })}
              className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="SINGLE_CHOICE">Single Choice (MCQ)</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice (Multi-Select)</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as QuestionDifficulty })}
              className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Topic</label>
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Options Editor */}
        {form.type !== "SHORT_ANSWER" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Options & Correct Answer Selection
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                + Add Option
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(form.options || []).map((opt, idx) => {
                const isSelected = Array.isArray(form.correctAnswer)
                  ? form.correctAnswer.includes(opt)
                  : form.correctAnswer === opt;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type={form.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                      name="candidate_correct_opt"
                      checked={isSelected}
                      onChange={() => {
                        if (form.type === "MULTIPLE_CHOICE") {
                          handleToggleMultiAnswer(opt);
                        } else {
                          handleSetSingleAnswer(opt);
                        }
                      }}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      title="Set as correct answer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1 rounded text-muted-foreground hover:text-rose-500"
                      title="Remove option"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Select the radio button or checkbox next to an option to designate it as the correct answer.
            </p>
          </div>
        )}

        {/* Short Answer Field */}
        {form.type === "SHORT_ANSWER" && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Correct Answer (Exact match or keyword)
            </label>
            <input
              type="text"
              value={typeof form.correctAnswer === "string" ? form.correctAnswer : ""}
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Marks, Negative Marks & Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Marks</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: parseFloat(e.target.value) || 2 })}
              className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Negative Marks</label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={form.negativeMarks}
              onChange={(e) => setForm({ ...form, negativeMarks: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Explanation / Solution Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={form.explanation || ""}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            placeholder="Provide context or explanation for why the answer is correct."
            className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/80">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => onSave(form)}
            leftIcon={<Check className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Apply Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
