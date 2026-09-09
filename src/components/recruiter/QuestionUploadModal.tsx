"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { QuestionDifficulty, AssessmentQuestion } from "@/types";

interface QuestionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (result: {
    importedCount: number;
    totalDetected: number;
    needsReviewCount: number;
    duplicateCount: number;
    importedQuestions?: AssessmentQuestion[];
  }) => void;
}

export function QuestionUploadModal({
  isOpen,
  onClose,
  onImportSuccess,
}: QuestionUploadModalProps) {
  const { success, error: toastError, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Selected file & drag state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Global extraction defaults
  const [defaults, setDefaults] = useState({
    category: "Technical",
    topic: "General",
    difficulty: "MEDIUM" as QuestionDifficulty,
    marks: 2,
    negativeMarks: 0.5,
  });
  const [showDefaults, setShowDefaults] = useState(false);

  // Reset modal state
  const handleReset = () => {
    isProcessingRef.current = false;
    setIsProcessing(false);
    setSelectedFile(null);
    setIsDragging(false);
    setErrorMessage(null);
    setShowDefaults(false);
  };

  const handleModalClose = () => {
    if (isProcessing) return; // Prevent closing while upload is active
    handleReset();
    onClose();
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    if (isProcessing) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isProcessing) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isProcessing) return;
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".doc"].includes(ext)) {
      setErrorMessage("Unsupported format. Please select a .pdf, .docx, or .doc file.");
      toastError("Unsupported format. Please select a .pdf, .docx, or .doc file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File too large. Maximum supported document size is 25MB.");
      toastError("File too large. Maximum supported document size is 25MB.");
      return;
    }
    setSelectedFile(file);
  };

  // Main Action: Parse, Extract, and Import Questions
  const handleExtractQuestions = async () => {
    // 1. Guard against duplicate clicks & empty file
    if (!selectedFile || isProcessing || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    setErrorMessage(null);

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
        // Map HTTP status codes to clean user-facing explanations
        let errorText = data.error;
        if (!errorText) {
          if (res.status === 401) {
            errorText = "Your session has expired. Please sign in again.";
          } else if (res.status === 403) {
            errorText = "You do not have permission to import questions.";
          } else if (res.status === 413) {
            errorText = "This document is too large. Maximum supported size is 25MB.";
          } else if (res.status === 422) {
            errorText = "We could not identify valid questions in this document. Please check the file formatting.";
          } else {
            errorText = "Something went wrong while processing the document. Please try again.";
          }
        }

        setErrorMessage(errorText);
        toastError(`✕ Question import failed: ${errorText}`);
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // 2. Success: Close modal, reset state, notify parent to refetch, and show toast
      isProcessingRef.current = false;
      setIsProcessing(false);
      handleReset();
      onClose();

      // Trigger parent to refetch Question Bank
      if (onImportSuccess) {
        onImportSuccess(data);
      }

      // Show toast notification AFTER modal has completely closed
      setTimeout(() => {
        const importedCount = data.importedCount || 0;
        const needsReviewCount = data.needsReviewCount || 0;

        if (needsReviewCount > 0) {
          info(
            `✓ Document processed: ${importedCount} questions imported. ${needsReviewCount} questions require review.`
          );
        } else {
          success(
            `✓ Questions imported successfully: ${importedCount} questions were added to your Question Bank.`
          );
        }
      }, 150);
    } catch (err: any) {
      console.error("[QuestionUploadModal] Extraction error:", err);
      const networkErrorMsg =
        "Network connection error. Please check your connection and try again.";
      setErrorMessage(networkErrorMsg);
      toastError(`✕ Question import failed: ${networkErrorMsg}`);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Upload Questions from Document"
      description="Upload a PDF or Word document (.docx, .doc) to automatically extract questions, options, answer keys, and explanations directly into your Question Bank."
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Error Banner if processing failed */}
        {errorMessage && !isProcessing && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Import Could Not Be Completed</div>
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

        {/* Processing State Indicator */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3.5 text-purple-700 dark:text-purple-300 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin shrink-0 text-purple-600 dark:text-purple-400" />
            <div className="space-y-0.5 text-xs">
              <div className="font-semibold text-sm text-foreground">
                Parsing document...
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Extracting questions and answer keys, validating entries, and saving to your Question Bank. Please wait.
              </p>
            </div>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isProcessing) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all duration-200 ${
            isProcessing
              ? "opacity-60 cursor-not-allowed border-border"
              : isDragging
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
            disabled={isProcessing}
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
                {!isProcessing && (
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
                )}
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
                disabled={isProcessing}
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
        <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Smart Document Parsing Capabilities</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc text-[11px]">
            <li>
              Detects standard question numbering like <code className="text-foreground font-mono">1.</code>,{" "}
              <code className="text-foreground font-mono">Q1.</code>, or{" "}
              <code className="text-foreground font-mono">Question 1:</code>
            </li>
            <li>
              Extracts options (<code className="text-foreground font-mono">A.</code>,{" "}
              <code className="text-foreground font-mono">(A)</code>, <code className="text-foreground font-mono">a)</code>) and answers (<code className="text-foreground font-mono">Answer: B</code> or trailing Answer Keys)
            </li>
            <li>Detects topics, explanations, and prevents duplicate questions in your Question Bank</li>
          </ul>
        </div>

        {/* Extraction Defaults Collapsible */}
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card/50">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setShowDefaults(!showDefaults)}
            className="w-full px-4 py-2.5 text-left flex items-center justify-between text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
          <Button
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            onClick={handleModalClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="sm"
            disabled={!selectedFile || isProcessing}
            onClick={handleExtractQuestions}
            leftIcon={
              isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )
            }
            className="text-xs font-semibold"
          >
            {isProcessing ? "Parsing & Extracting..." : "Parse & Extract Questions"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
