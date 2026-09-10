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
  onImportSuccess?: (result: any) => void;
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
  const isProcessingRef = useRef<boolean>(false);

  // Flow step
  const [step, setStep] = useState<"UPLOAD" | "PARSING" | "REVIEW" | "COMPLETED">("UPLOAD");

  // Selected file & drag state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

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
    isProcessingRef.current = false;
    setStep("UPLOAD");
    setSelectedFile(null);
    setIsDragging(false);
    setErrorMessage(null);
    setErrorCode(null);
    setShowDefaults(false);
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
    if (step === "PARSING" || isSubmittingImport) return;
    handleReset();
    onClose();
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    if (step === "PARSING") return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (step === "PARSING") return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (step === "PARSING") return;
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step === "PARSING") return;
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setErrorCode(null);
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".doc"].includes(ext)) {
      const msg = "Unsupported format. Please select a .pdf, .docx, or .doc file.";
      setErrorMessage(msg);
      setErrorCode("INVALID_FILE");
      toastError(msg);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      const msg = "File too large. Maximum supported document size is 25MB.";
      setErrorMessage(msg);
      setErrorCode("FILE_TOO_LARGE");
      toastError(msg);
      return;
    }
    setSelectedFile(file);
  };

  // Main Action: Parse & Extract Questions into Review Workspace
  const handleExtractQuestions = async () => {
    if (!selectedFile || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setStep("PARSING");
    setScannedWarning(null);
    setParseWarnings([]);
    setErrorMessage(null);
    setErrorCode(null);

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

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok || !data.success) {
        let errorText = data.error;
        const code = data.code || (res.status === 401 ? "UNAUTHORIZED" : "UNKNOWN_ERROR");

        if (!errorText) {
          if (res.status === 401) {
            errorText = "Your session has expired. Please sign in again.";
          } else if (res.status === 403) {
            errorText = "You do not have permission to import questions.";
          } else if (res.status === 413) {
            errorText = "This document is too large. Maximum supported size is 25MB.";
          } else if (code === "NO_TEXT_FOUND") {
            errorText = "No selectable text found in this document. If this is a scanned PDF, OCR is required.";
          } else if (code === "QUESTION_EXTRACTION_FAILED") {
            errorText = "We could not identify valid questions in this document. Please check the numbering format.";
          } else {
            errorText = "Failed to parse questions from document. Please verify the document format.";
          }
        }

        setErrorMessage(errorText);
        setErrorCode(code);
        toastError(`✕ ${errorText}`);
        isProcessingRef.current = false;
        setStep("UPLOAD");
        return;
      }

      if (data.isScannedPdf) {
        const msg = data.error || "This document appears to be a scanned image or protected PDF with no selectable text.";
        setScannedWarning(msg);
        setErrorMessage(msg);
        setErrorCode("NO_TEXT_FOUND");
        isProcessingRef.current = false;
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

      // Default select all questions that are READY or not EXACT_DUPLICATE
      const initialSelected = new Set<string>();
      extracted.forEach((c) => {
        if (c.validationStatus !== "INVALID" && c.duplicateStatus !== "EXACT_DUPLICATE") {
          initialSelected.add(c.tempId);
        }
      });
      setSelectedTempIds(initialSelected);

      isProcessingRef.current = false;
      setStep("REVIEW");

      if (extracted.length === 0) {
        info("No recognizable questions found in the document. Please check the document formatting.");
      } else {
        success(`Successfully extracted ${extracted.length} question(s) from document!`);
      }
    } catch (err: any) {
      console.error("[QuestionUploadModal] Extraction error:", err);
      const networkMsg = "Network connection error while uploading and parsing document.";
      setErrorMessage(networkMsg);
      setErrorCode("NETWORK_ERROR");
      toastError(`✕ ${networkMsg}`);
      isProcessingRef.current = false;
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
    const hasText = updated.questionText.trim().length > 5;
    const hasOptions =
      updated.type === "SHORT_ANSWER" || (updated.options && updated.options.length >= 2);
    const hasAnswer =
      Array.isArray(updated.correctAnswer)
        ? updated.correctAnswer.length > 0
        : Boolean(updated.correctAnswer && String(updated.correctAnswer).trim());

    let status: "READY" | "NEEDS_REVIEW" | "INVALID" = "READY";
    const issues: string[] = [];

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
        importedQuestions: data.importedQuestions || [],
      });
      setStep("COMPLETED");

      if (onImportSuccess) {
        onImportSuccess(data);
      }
      success(`Successfully imported ${data.importedCount} questions to your Question Bank!`);
    } catch (err) {
      console.error("[QuestionUploadModal] Import error:", err);
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
        maxWidth={step === "REVIEW" ? "5xl" : "3xl"}
      >
        <div className="space-y-6">
          {/* STEP 1: UPLOAD TARGET */}
          {step === "UPLOAD" && (
            <div className="space-y-5">
              {/* Error Banner if processing failed */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>Import Could Not Be Completed</span>
                        {errorCode && (
                          <Badge variant="rose" size="sm">
                            {errorCode}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExtractQuestions}
                    disabled={!selectedFile}
                    className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium shrink-0 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Scanned Warning Banner */}
              {scannedWarning && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="font-semibold">Scanned Document Detected</div>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{scannedWarning}</p>
                  </div>
                </div>
              )}

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/10 scale-[0.99] cursor-pointer"
                    : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 cursor-pointer"
                    : "border-border hover:border-purple-500/50 hover:bg-muted/40 cursor-pointer"
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
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{selectedFile.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="emerald">Document Selected</Badge>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-rose-500 underline transition-colors ml-1"
                      >
                        Change file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
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
                      className="mt-1 text-xs"
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

              {/* Extraction Capabilities Guideline */}
              <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Smart Document Parsing Capabilities</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc text-[11px]">
                  <li>
                    Detects questions with numbering like <code className="text-foreground font-mono">1.</code>,{" "}
                    <code className="text-foreground font-mono">QUESTION 1</code>, or{" "}
                    <code className="text-foreground font-mono">Q1:</code>
                  </li>
                  <li>
                    Extracts options (<code className="text-foreground font-mono">A)</code>,{" "}
                    <code className="text-foreground font-mono">A.</code>, <code className="text-foreground font-mono">(A)</code>) and answers (<code className="text-foreground font-mono">CORRECT ANSWER: B</code> or <code className="text-foreground font-mono">Answer: B</code>)
                  </li>
                  <li>Extracts explanations, topics, difficulty, and checks for duplicates in your Question Bank</li>
                </ul>
              </div>

              {/* Extraction Defaults Collapsible */}
              <div className="border border-border/70 rounded-xl overflow-hidden bg-card/50">
                <button
                  type="button"
                  onClick={() => setShowDefaults(!showDefaults)}
                  className="w-full px-4 py-2.5 text-left flex items-center justify-between text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
                        placeholder="e.g. Algorithmic Trading"
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
                <Button variant="ghost" size="sm" onClick={handleModalClose} className="text-xs">
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  disabled={!selectedFile}
                  onClick={handleExtractQuestions}
                  leftIcon={<FileText className="w-4 h-4" />}
                  className="text-xs font-semibold"
                >
                  Parse & Extract Questions
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PARSING STATE */}
          {step === "PARSING" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Analyzing Document & Extracting Questions
                </h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Processing <strong className="text-foreground">{selectedFile?.name}</strong>. Extracting text across pages, identifying question stems, options, correct answers, and checking for duplicates.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW WORKSPACE */}
          {step === "REVIEW" && (
            <div className="space-y-5">
              {/* Summary Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-xl bg-card border border-border">
                  <div className="text-[11px] text-muted-foreground">Total Detected</div>
                  <div className="text-lg font-bold text-foreground mt-0.5">{counts.total}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Ready to Import</div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {counts.ready}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">Needs Review</div>
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    {counts.needsReview}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-[11px] text-blue-700 dark:text-blue-400">Duplicates</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                    {counts.duplicates}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-rose-700 dark:text-rose-400">Invalid</div>
                  <div className="text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                    {counts.invalid}
                  </div>
                </div>
              </div>

              {/* Filter Tabs & Bulk Actions Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["ALL", "READY", "NEEDS_REVIEW", "DUPLICATES", "INVALID"] as ReviewFilter[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        activeFilter === f
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {f === "ALL" && `All (${counts.total})`}
                      {f === "READY" && `Ready (${counts.ready})`}
                      {f === "NEEDS_REVIEW" && `Review (${counts.needsReview})`}
                      {f === "DUPLICATES" && `Duplicates (${counts.duplicates})`}
                      {f === "INVALID" && `Invalid (${counts.invalid})`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Select Shown
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={handleSelectReadyOnly}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Select Ready Only
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-muted-foreground hover:text-foreground underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCandidates.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-xs">
                    No questions match the current filter.
                  </div>
                ) : (
                  filteredCandidates.map((c, idx) => {
                    const isSelected = selectedTempIds.has(c.tempId);
                    const isExactDuplicate = c.duplicateStatus === "EXACT_DUPLICATE";
                    const isLikelyDuplicate = c.duplicateStatus === "LIKELY_DUPLICATE";
                    const isInvalid = c.validationStatus === "INVALID";

                    return (
                      <Card
                        key={c.tempId}
                        className={`p-4 transition-all duration-200 ${
                          isSelected
                            ? "border-purple-500/60 bg-purple-500/[0.02] shadow-sm"
                            : "border-border/70 opacity-90"
                        } ${isInvalid ? "border-rose-500/40 bg-rose-500/[0.02]" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isInvalid}
                            onChange={() => toggleSelectCandidate(c.tempId)}
                            className="mt-1 w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500"
                          />

                          {/* Main Question Content */}
                          <div className="flex-1 space-y-2.5 min-w-0">
                            {/* Question Header & Badges */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-foreground">
                                  Q{idx + 1}.
                                </span>
                                <Badge
                                  variant={
                                    c.difficulty === "HARD"
                                      ? "rose"
                                      : c.difficulty === "MEDIUM"
                                      ? "amber"
                                      : "emerald"
                                  }
                                  size="sm"
                                >
                                  {c.difficulty}
                                </Badge>
                                {c.topic && (
                                  <Badge variant="outline" size="sm">
                                    {c.topic}
                                  </Badge>
                                )}
                                {c.category && (
                                  <Badge variant="outline" size="sm">
                                    {c.category}
                                  </Badge>
                                )}
                                <span className="text-[11px] text-muted-foreground">
                                  {c.marks} marks {c.negativeMarks ? `(-${c.negativeMarks})` : ""}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isExactDuplicate && (
                                  <Badge variant="rose" size="sm">
                                    Exact Duplicate
                                  </Badge>
                                )}
                                {isLikelyDuplicate && (
                                  <Badge variant="amber" size="sm">
                                    Similar in Bank
                                  </Badge>
                                )}
                                {c.validationStatus === "READY" && (
                                  <Badge variant="emerald" size="sm">
                                    Ready
                                  </Badge>
                                )}
                                {c.validationStatus === "NEEDS_REVIEW" && (
                                  <Badge variant="amber" size="sm">
                                    Needs Answer
                                  </Badge>
                                )}
                                {isInvalid && (
                                  <Badge variant="rose" size="sm">
                                    Invalid
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Question Stem Text */}
                            <p className="text-xs text-foreground font-medium leading-relaxed whitespace-pre-line">
                              {c.questionText}
                            </p>

                            {/* Options List */}
                            {c.options && c.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {c.options.map((opt, oIdx) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  const isCorrect =
                                    (Array.isArray(c.correctAnswer) && c.correctAnswer.includes(opt)) ||
                                    c.correctAnswer === opt ||
                                    c.correctAnswer === letter;

                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                                        isCorrect
                                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium"
                                          : "border-border/60 bg-muted/20 text-muted-foreground"
                                      }`}
                                    >
                                      <span
                                        className={`font-semibold shrink-0 text-[11px] ${
                                          isCorrect
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {letter})
                                      </span>
                                      <span className="flex-1 text-[11px]">{opt}</span>
                                      {isCorrect && (
                                        <Badge variant="emerald" size="sm" className="shrink-0 text-[9px] py-0 px-1">
                                          Correct
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Explanation Callout */}
                            {c.explanation && (
                              <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
                                <span className="font-semibold text-blue-700 dark:text-blue-400 text-[11px] block mb-0.5">
                                  Explanation:
                                </span>
                                <p className="text-[11px] leading-relaxed">{c.explanation}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                              <button
                                type="button"
                                onClick={() => setEditingCandidate(c)}
                                className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit Question
                              </button>
                              <span className="text-muted-foreground text-xs">•</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCandidate(c.tempId)}
                                className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:underline"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Review Workspace Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/70">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("UPLOAD")}
                  className="text-xs"
                >
                  Back to Upload
                </Button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {selectedTempIds.size} of {candidates.length} selected
                  </span>
                  <Button
                    variant="gradient"
                    size="sm"
                    disabled={selectedTempIds.size === 0 || isSubmittingImport}
                    onClick={handleExecuteImport}
                    leftIcon={
                      isSubmittingImport ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )
                    }
                    className="text-xs font-semibold"
                  >
                    {isSubmittingImport
                      ? "Importing Questions..."
                      : `Import ${selectedTempIds.size} Question${selectedTempIds.size === 1 ? "" : "s"} to Bank`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: COMPLETED STATE */}
          {step === "COMPLETED" && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Questions Successfully Saved!
                </h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  {importResult?.importedCount || selectedTempIds.size} questions from{" "}
                  <strong className="text-foreground">{extractionMeta?.fileName || "your document"}</strong> have been validated and added to your Question Bank.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleModalClose}
                  className="text-xs"
                >
                  View Question Bank
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleCreateAssessmentWithQuestions}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="text-xs font-semibold"
                >
                  Create Assessment with Questions
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* INLINE CANDIDATE EDIT MODAL */}
      {editingCandidate && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCandidate(null)}
          title="Edit Extracted Question"
          description="Modify question text, options, answer key, and marks before importing."
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Question Text
              </label>
              <textarea
                rows={3}
                value={editingCandidate.questionText}
                onChange={(e) =>
                  setEditingCandidate({ ...editingCandidate, questionText: e.target.value })
                }
                className="w-full text-xs rounded-lg border border-border bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Options Editing */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">
                Options & Correct Answer (Select the radio button for the correct answer)
              </label>
              {(editingCandidate.options || []).map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isCorrect =
                  (Array.isArray(editingCandidate.correctAnswer) &&
                    editingCandidate.correctAnswer.includes(opt)) ||
                  editingCandidate.correctAnswer === opt ||
                  editingCandidate.correctAnswer === letter;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswerOption"
                      checked={isCorrect}
                      onChange={() =>
                        setEditingCandidate({ ...editingCandidate, correctAnswer: opt })
                      }
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-xs text-muted-foreground w-5">
                      {letter})
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(editingCandidate.options || [])];
                        newOpts[idx] = e.target.value;
                        const newAns = isCorrect ? e.target.value : editingCandidate.correctAnswer;
                        setEditingCandidate({
                          ...editingCandidate,
                          options: newOpts,
                          correctAnswer: newAns,
                        });
                      }}
                      className="flex-1 text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Explanation Editing */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Explanation
              </label>
              <textarea
                rows={2}
                value={editingCandidate.explanation || ""}
                onChange={(e) =>
                  setEditingCandidate({ ...editingCandidate, explanation: e.target.value })
                }
                placeholder="Optional explanation shown to candidates after assessment..."
                className="w-full text-xs rounded-lg border border-border bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Difficulty
                </label>
                <select
                  value={editingCandidate.difficulty}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      difficulty: e.target.value as QuestionDifficulty,
                    })
                  }
                  className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={editingCandidate.topic || ""}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, topic: e.target.value })
                  }
                  className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editingCandidate.marks}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      marks: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Negative Marks
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={editingCandidate.negativeMarks || 0}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      negativeMarks: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingCandidate(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => handleSaveCandidateEdit(editingCandidate)}
                className="text-xs font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
