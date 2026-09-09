"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Sparkles,
  Building2,
  AlertCircle,
  GraduationCap,
  Users2,
  Calendar,
  Layers,
  FileText,
  ShieldCheck,
  Award,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Send,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  RecruitmentDrive,
  RecruitmentStage,
  EligibilityEvaluationResult,
  RecruitmentApplication,
} from "@/types";

export default function StudentDriveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const [drive, setDrive] = useState<RecruitmentDrive | null>(null);
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [userApplication, setUserApplication] = useState<RecruitmentApplication | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityEvaluationResult | null>(null);
  const [studentProfileSummary, setStudentProfileSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    fetchDriveDetails();
  }, [resolvedParams.id]);

  const fetchDriveDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/student/drives/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setDrive(data.drive);
        setStages(data.drive.stages || []);
        setUserApplication(data.userApplication);
        setEligibility(data.eligibility);
        setStudentProfileSummary(data.studentProfileSummary);
      } else {
        toastError("Drive not found.");
      }
    } catch (err) {
      console.error("Failed to load drive details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/student/drives/${resolvedParams.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: candidateNotes }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmittedApplicationId(data.application?.id || "APP-SUCCESS");
        setUserApplication(data.application);
        success("Application submitted successfully!");
      } else {
        toastError(data.error || "Failed to submit application.");
      }
    } catch (err) {
      toastError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRole="student">
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Loading recruitment drive details...</p>
        </div>
      </RoleGuard>
    );
  }

  if (!drive) {
    return (
      <RoleGuard allowedRole="student">
        <div className="py-16 text-center space-y-4">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Recruitment Drive Not Found</h2>
          <Link href="/dashboard/drives">
            <Button variant="gradient" size="sm">
              Back to Recruitment Drives
            </Button>
          </Link>
        </div>
      </RoleGuard>
    );
  }

  const isEligible = eligibility?.status === "ELIGIBLE";
  const isApplied = !!userApplication;
  const isProfileComplete =
    studentProfileSummary?.degree &&
    studentProfileSummary?.graduationYear &&
    studentProfileSummary?.cgpa;

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Back Link & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/drives"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recruitment Drives</span>
          </Link>

          {isApplied && (
            <Link href="/dashboard/applications">
              <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                Track in My Applications
              </Button>
            </Link>
          )}
        </div>

        {/* Top Header Card */}
        <Card className="p-6 sm:p-8 border-border bg-card shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border overflow-hidden shrink-0 p-1.5 flex items-center justify-center">
                {drive.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={drive.companyLogo}
                    alt={drive.company}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {drive.company}
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-xs text-muted-foreground font-medium">{drive.department}</span>
                  {isApplied && (
                    <Badge variant="emerald" size="sm" className="font-bold ml-1">
                      Applied ({userApplication?.id})
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {drive.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {drive.position}
                </p>
              </div>
            </div>

            {/* Application CTA Header Block */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {isApplied ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">
                      Application Active
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Stage: {userApplication?.currentStageName}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  variant={isEligible ? "gradient" : "outline"}
                  size="lg"
                  onClick={() => setIsApplyModalOpen(true)}
                  disabled={drive.status === "CLOSED" || drive.status === "RESULTS_PUBLISHED"}
                  className="font-bold"
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Apply for Recruitment
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/80">
            <div className="p-3 rounded-xl bg-muted/40 text-xs">
              <span className="text-muted-foreground block text-[11px]">Salary / Stipend</span>
              <strong className="text-foreground text-sm font-bold text-blue-600 dark:text-blue-400">
                {drive.salaryStipend}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 text-xs">
              <span className="text-muted-foreground block text-[11px]">Location & Mode</span>
              <strong className="text-foreground text-xs font-semibold flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                {drive.location} ({drive.workMode})
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 text-xs">
              <span className="text-muted-foreground block text-[11px]">Employment Type</span>
              <strong className="text-foreground text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                {drive.employmentType.replace("_", " ")}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 text-xs">
              <span className="text-muted-foreground block text-[11px]">Application Deadline</span>
              <strong className="text-foreground text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {new Date(drive.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
            </div>
          </div>
        </Card>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Job Description & Selection Process */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview & Description */}
            <Card className="p-6 border-border bg-card space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Role Overview & Responsibilities
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {drive.description}
              </p>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Required Technical Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {drive.eligibilityCriteria.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Selection Process Stages */}
            <Card className="p-6 border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Selection Pipeline & Stages
                </h2>
                <span className="text-xs text-muted-foreground font-medium">
                  {stages.length} Structured Rounds
                </span>
              </div>

              <div className="space-y-3">
                {stages.map((stage, idx) => {
                  const isCurrent = userApplication?.currentStageId === stage.id;
                  return (
                    <div
                      key={stage.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? "bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20"
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-foreground text-background font-extrabold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                                {stage.name}
                              </h4>
                              {isCurrent && (
                                <Badge variant="purple" size="sm" className="font-bold">
                                  Your Current Stage
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {stage.description}
                            </p>
                          </div>
                        </div>

                        <Badge variant="outline" size="sm" className="shrink-0 text-[10px] uppercase font-bold">
                          {stage.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Eligibility Checker & Profile Readiness */}
          <div className="lg:col-span-4 space-y-6">
            {/* Interactive Eligibility Checker Card */}
            <Card className="p-5 border-border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Eligibility Verification
                </h3>

                {isEligible ? (
                  <Badge variant="emerald" size="sm" className="font-bold">
                    Eligible ({eligibility?.score}%)
                  </Badge>
                ) : (
                  <Badge variant="rose" size="sm" className="font-bold">
                    Not Eligible
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Evaluated deterministically against your verified student profile data.
              </p>

              {/* Itemized Criteria List */}
              <div className="space-y-2.5 pt-2 border-t border-border/80">
                {eligibility?.criteria.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{item.name}</span>
                      {item.passed ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Met
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Not Met
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-muted-foreground flex justify-between gap-2">
                      <span>Required: <strong>{item.required}</strong></span>
                      <span className="truncate">Your: <strong>{item.candidateValue}</strong></span>
                    </div>

                    <p className="text-[10px] text-muted-foreground/80 leading-snug pt-0.5">
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>

              {/* Profile Completion Callout if missing fields */}
              {!isProfileComplete && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Profile Incomplete</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Ensure Degree, CGPA, and Graduation Year are entered before submitting.
                  </p>
                  <Link href="/dashboard/profile" className="inline-block">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Update Profile
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Required Documents Checklist */}
            <Card className="p-5 border-border bg-card space-y-3.5">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Required Application Documents
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-medium text-foreground">Verified Student Profile</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-medium text-foreground">Academic Transcript / CGPA</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-medium text-foreground">Primary Resume Document</span>
                  {studentProfileSummary?.hasResume ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Link href="/dashboard/profile" className="text-blue-600 font-bold hover:underline">
                      Upload Resume &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Application Confirmation Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => {
            if (!isSubmitting) setIsApplyModalOpen(false);
          }}
          title={submittedApplicationId ? "Application Confirmed" : "Submit Recruitment Application"}
          description={
            submittedApplicationId
              ? "Your application has been registered in the recruitment database."
              : `Review and confirm your application for ${drive.title} at ${drive.company}.`
          }
        >
          {submittedApplicationId ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce-short">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-foreground">
                  Application Submitted Successfully
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your application has been recorded in the central recruitment repository.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs space-y-1.5 text-left max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application ID:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                    {submittedApplicationId}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <strong className="text-foreground">{drive.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <strong className="text-foreground">{drive.company}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Application Submitted
                  </strong>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Link href="/dashboard/applications">
                  <Button variant="gradient" size="sm">
                    View in My Applications &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Application Package Summary
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your verified academic profile, Career DNA, skills snapshot, and resume will be securely transmitted to the recruitment evaluation team.
                </p>
                <div className="pt-2 text-[11px] text-muted-foreground space-y-1">
                  <div>• Degree: <strong>{studentProfileSummary?.degree || "Not Set"}</strong></div>
                  <div>• CGPA: <strong>{studentProfileSummary?.cgpa || "Not Set"}</strong></div>
                  <div>• Cohort: <strong>{studentProfileSummary?.graduationYear || "Not Set"}</strong></div>
                </div>
              </div>

              {!isEligible && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Note: Your profile does not fully meet all recommended criteria. The application may be routed to manual screening.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Optional Note or Portfolio Link to Recruiter:
                </label>
                <textarea
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="Share any relevant projects, publications, or notes..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleApplySubmit}
                  disabled={isSubmitting}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Submit Application"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleGuard>
  );
}
