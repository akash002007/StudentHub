"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Building2,
  ChevronRight,
  Award,
  HelpCircle,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { CandidateAssessmentRecord } from "@/types";

interface EnrichedAssessment extends CandidateAssessmentRecord {
  driveTitle?: string;
  company?: string;
  companyLogo?: string;
}

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<EnrichedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessmentForModal, setSelectedAssessmentForModal] =
    useState<EnrichedAssessment | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/assessments");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      }
    } catch (err) {
      console.error("Failed to load assessments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assessment Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recruitment Assessments
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Review assigned technical assessments, coding tests, duration limits, and verified evaluation scores.
            </p>
          </div>

          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
              My Applications
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading recruitment assessments...</p>
          </div>
        ) : assessments.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-foreground">No assessments scheduled</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You do not have any pending or completed assessments. When recruiters shortlist your application for a test round, it will appear here.
            </p>
            <Link href="/dashboard/drives" className="inline-block mt-4">
              <Button variant="gradient" size="sm">
                Explore Recruitment Drives
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {assessments.map((ass) => {
              const isEvaluated = ass.candidateScore !== undefined;
              const hasPassed = ass.passed;

              return (
                <Card
                  key={ass.id}
                  hoverEffect
                  className="p-5 border-border bg-card space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border p-1 overflow-hidden shrink-0 flex items-center justify-center">
                          {ass.companyLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ass.companyLogo}
                              alt={ass.company || "Company"}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                            {ass.assessmentName}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate font-medium">
                            {ass.driveTitle} ({ass.company})
                          </p>
                        </div>
                      </div>

                      {isEvaluated ? (
                        hasPassed ? (
                          <Badge variant="emerald" size="sm" className="font-bold shrink-0">
                            Cleared ✓
                          </Badge>
                        ) : (
                          <Badge variant="rose" size="sm" className="font-bold shrink-0">
                            Evaluated
                          </Badge>
                        )
                      ) : (
                        <Badge variant="purple" size="sm" className="font-bold shrink-0">
                          Upcoming Test
                        </Badge>
                      )}
                    </div>

                    {/* Test Info Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {ass.date} {ass.time ? `• ${ass.time}` : ""}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        Duration: {ass.duration || "90 mins"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-semibold">
                        Passing Score: {ass.passingScore}/{ass.maxScore}
                      </span>
                    </div>

                    {/* Instructions preview */}
                    {ass.instructions && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 bg-muted/40 p-2.5 rounded-xl border border-border/60">
                        {ass.instructions}
                      </p>
                    )}

                    {/* Score summary if evaluated */}
                    {isEvaluated && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Your Score:
                        </span>
                        <strong className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                          {ass.candidateScore} / {ass.maxScore}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Footer CTA */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      {isEvaluated ? "Evaluation Finalized" : "Instructions Ready"}
                    </span>

                    <Button
                      variant={isEvaluated ? "outline" : "gradient"}
                      size="sm"
                      onClick={() => setSelectedAssessmentForModal(ass)}
                    >
                      {isEvaluated ? "View Evaluation" : "View Test Instructions"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Assessment Details Modal */}
        <Modal
          isOpen={!!selectedAssessmentForModal}
          onClose={() => setSelectedAssessmentForModal(null)}
          title={selectedAssessmentForModal?.assessmentName || "Assessment Details"}
          description={selectedAssessmentForModal?.driveTitle}
        >
          {selectedAssessmentForModal && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Schedule:</span>
                  <strong className="text-foreground">
                    {selectedAssessmentForModal.date} {selectedAssessmentForModal.time ? `at ${selectedAssessmentForModal.time}` : ""}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allocated Duration:</span>
                  <strong className="text-foreground">
                    {selectedAssessmentForModal.duration || "90 minutes"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maximum Score:</span>
                  <strong className="text-foreground">{selectedAssessmentForModal.maxScore} Points</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passing Benchmark:</span>
                  <strong className="text-foreground">{selectedAssessmentForModal.passingScore} Points</strong>
                </div>

                {selectedAssessmentForModal.candidateScore !== undefined && (
                  <div className="flex justify-between pt-2 border-t border-border/60 font-bold">
                    <span className="text-blue-600 dark:text-blue-400">Recorded Score:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {selectedAssessmentForModal.candidateScore} / {selectedAssessmentForModal.maxScore} (
                      {selectedAssessmentForModal.passed ? "PASSED" : "NOT MET"})
                    </span>
                  </div>
                )}
              </div>

              {selectedAssessmentForModal.instructions && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Instructions & Guidelines:
                  </label>
                  <p className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground leading-relaxed">
                    {selectedAssessmentForModal.instructions}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border flex justify-end">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setSelectedAssessmentForModal(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleGuard>
  );
}
