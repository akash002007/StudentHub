"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  HelpCircle,
  Layers,
  Building2,
  Sliders,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  AssessmentQuestion,
  QuestionType,
  QuestionDifficulty,
  QuestionCategory,
  QuestionSource,
} from "@/types";

export default function QuestionBankPage() {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<"company" | "system">("company");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Create/Edit Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<QuestionType>("SINGLE_CHOICE");
  const [options, setOptions] = useState<string[]>(["Option A", "Option B", "Option C", "Option D"]);
  const [correctAnswer, setCorrectAnswer] = useState("Option A");
  const [marks, setMarks] = useState(2);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("MEDIUM");
  const [category, setCategory] = useState<QuestionCategory>("Technical");
  const [topic, setTopic] = useState("General Engineering");
  const [tagsInput, setTagsInput] = useState("TypeScript, React");
  const [explanation, setExplanation] = useState("");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importErrors, setImportErrors] = useState<{ row: number; reason: string }[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const ownerType: QuestionSource = activeTab === "system" ? "SYSTEM" : "COMPANY";
      const res = await fetch(`/api/recruiter/questions?ownerType=${ownerType}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to load question bank.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!qText.trim()) {
      toastError("Please enter question text.");
      return;
    }

    setIsSavingQuestion(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const payload: Partial<AssessmentQuestion> = {
        id: editingQuestionId || undefined,
        questionText: qText,
        type: qType,
        options: qType !== "SHORT_ANSWER" ? options : [],
        correctAnswer,
        marks,
        negativeMarks,
        difficulty,
        category,
        topic,
        tags,
        explanation,
        ownerType: "COMPANY",
      };

      const res = await fetch("/api/recruiter/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success(editingQuestionId ? "Question updated!" : "Question added to your bank!");
        setIsQuestionModalOpen(false);
        resetQuestionForm();
        fetchQuestions();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to save question.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error saving question.");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleArchiveQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to archive this question?")) return;
    try {
      const res = await fetch(`/api/recruiter/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        success("Question archived.");
        fetchQuestions();
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to archive question.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error archiving question.");
    }
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) {
      toastError("Please paste CSV data or JSON array.");
      return;
    }

    setIsImporting(true);
    setImportErrors([]);
    try {
      let rows: any[] = [];
      if (importText.trim().startsWith("[")) {
        rows = JSON.parse(importText);
      } else {
        // Parse CSV format
        const lines = importText.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length >= headers.length) {
            const rowObj: any = {};
            headers.forEach((h, idx) => {
              rowObj[h] = values[idx];
            });
            rows.push(rowObj);
          }
        }
      }

      const res = await fetch("/api/recruiter/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: rows }),
      });

      const data = await res.json();
      if (res.ok) {
        success(`Imported ${data.importedCount} questions successfully!`);
        if (data.rowErrors?.length > 0) {
          setImportErrors(data.rowErrors);
        } else {
          setIsImportModalOpen(false);
          setImportText("");
          fetchQuestions();
        }
      } else {
        toastError(data.error || "Bulk import failed.");
      }
    } catch (err) {
      console.error(err);
      toastError("Invalid format. Please verify JSON or CSV data.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQText("");
    setQType("SINGLE_CHOICE");
    setOptions(["Option A", "Option B", "Option C", "Option D"]);
    setCorrectAnswer("Option A");
    setMarks(2);
    setNegativeMarks(0.5);
    setDifficulty("MEDIUM");
    setCategory("Technical");
    setTopic("General Engineering");
    setTagsInput("");
    setExplanation("");
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
    if (selectedCategory !== "all" && q.category !== selectedCategory) return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.questionText.toLowerCase().includes(query) ||
        q.topic.toLowerCase().includes(query) ||
        q.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assessment Repositories</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Question Bank
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Maintain your company's proprietary technical questions or tap into the vetted StudentHub question catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Bulk Import (CSV/JSON)
            </Button>

            <Button
              variant="gradient"
              size="sm"
              onClick={() => {
                resetQuestionForm();
                setIsQuestionModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              + Create Question
            </Button>
          </div>
        </div>

        {/* Bank Selection Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "company"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>My Question Bank (Company)</span>
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "system"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>StudentHub Verified Bank</span>
          </button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 border-border bg-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, keyword, or tag..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
              />
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Question Types</option>
              <option value="SINGLE_CHOICE">Single Choice</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Total: <strong className="text-foreground">{filteredQuestions.length}</strong> questions available
          </div>
        </Card>

        {/* Question List */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-bold text-base text-foreground">No questions found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {activeTab === "company"
                ? "You haven't created questions for your company bank yet. Create one or bulk import from CSV."
                : "No verified system questions match your filters."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <Card key={q.id} className="p-4 border-border bg-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
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
                    <Badge variant={q.ownerType === "SYSTEM" ? "purple" : "blue"} size="sm">
                      {q.ownerType}
                    </Badge>
                    <span className="font-bold text-foreground">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">
                      {q.marks} Marks {q.negativeMarks > 0 && `(-${q.negativeMarks} Neg)`}
                    </span>

                    {activeTab === "company" && (
                      <button
                        onClick={() => handleArchiveQuestion(q.id)}
                        className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Archive Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-foreground leading-relaxed">{q.questionText}</p>

                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt, idx) => {
                      const isCorrect = Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.includes(opt)
                        : q.correctAnswer === opt;

                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border flex items-center justify-between ${
                            isCorrect
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          <span>
                            <strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong>
                            {opt}
                          </span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.tags && q.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {q.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* CREATE QUESTION MODAL */}
        <Modal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          title="Create New Company Question"
          description="Define technical question, options, correct answers, and scoring."
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Question Text *</label>
              <textarea
                rows={2}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Type the full technical problem statement..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Question Type</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                >
                  <option value="SINGLE_CHOICE">Single Choice (MCQ)</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                />
              </div>
            </div>

            {qType !== "SHORT_ANSWER" ? (
              <div className="space-y-2">
                <label className="font-bold text-foreground">Options</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-4 font-bold">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...options];
                        updated[idx] = e.target.value;
                        setOptions(updated);
                      }}
                      className="flex-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(opt)}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        correctAnswer === opt
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-emerald-500/20"
                      }`}
                    >
                      {correctAnswer === opt ? "Correct ✓" : "Set Correct"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-bold text-foreground">Expected Answer *</label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Marks</label>
                <input
                  type="number"
                  min={1}
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Negative Marks</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsQuestionModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" size="sm" onClick={handleSaveQuestion} disabled={isSavingQuestion}>
                {isSavingQuestion ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* BULK IMPORT MODAL */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Bulk Question Import (CSV / JSON)"
          description="Import multiple questions with row-by-row validation."
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border text-muted-foreground text-[11px] space-y-1">
              <p className="font-bold text-foreground">CSV Template format:</p>
              <code>question,type,option_a,option_b,option_c,option_d,correct_answer,marks,negative_marks,difficulty,topic</code>
            </div>

            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste CSV lines or JSON array here..."
              className="w-full p-3 rounded-xl border border-border bg-card font-mono text-xs text-foreground"
            />

            {importErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-1">
                <p className="font-bold">Validation Errors Detected:</p>
                {importErrors.map((err, idx) => (
                  <p key={idx}>• Row {err.row}: {err.reason}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" size="sm" onClick={handleBulkImport} disabled={isImporting}>
                {isImporting ? "Validating & Importing..." : "Validate & Import"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
