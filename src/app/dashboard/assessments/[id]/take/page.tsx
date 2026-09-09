"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Camera,
  Mic,
  Monitor,
  Maximize2,
  Wifi,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
  Sparkles,
  HelpCircle,
  Award,
  ChevronRight,
  ExternalLink,
  Volume2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  AssessmentAttempt,
  AssessmentSnapshotQuestion,
  IntegrityEventType,
} from "@/types";

export default function CandidateTakeAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const [assessment, setAssessment] = useState<any>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Environment Check State
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [screenReady, setScreenReady] = useState(false);
  const [fullscreenReady, setFullscreenReady] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Exam Execution State
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | "ERROR">("SAVED");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Warning & Termination Modal
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  // Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post Submission Result
  const [submissionResult, setSubmissionResult] = useState<AssessmentAttempt | null>(null);

  useEffect(() => {
    fetchAssessmentInfo();
    return () => {
      // Cleanup media streams on unmount
      if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
      if (screenStream) screenStream.getTracks().forEach((t) => t.stop());
    };
  }, [resolvedParams.id]);

  // Server Countdown Timer
  useEffect(() => {
    if (!isExamActive || !attempt?.expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(attempt.expiresAt!).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingSeconds(diff);

      if (diff === 0) {
        clearInterval(interval);
        handleAutoSubmitTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, attempt?.expiresAt]);

  // Integrity Signal Listeners
  useEffect(() => {
    if (!isExamActive || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logIntegritySignal("TAB_SWITCH", "Candidate switched tabs or minimized window");
      }
    };

    const handleBlur = () => {
      logIntegritySignal("WINDOW_BLUR", "Assessment window lost focus");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logIntegritySignal("FULLSCREEN_EXIT", "Candidate exited fullscreen mode");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isExamActive, isTerminated, attempt?.id]);

  const fetchAssessmentInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/student/assessments/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data.assessment);

        if (data.attempt) {
          setAttempt(data.attempt);
          if (data.attempt.answers) {
            const loadedAns: Record<string, any> = {};
            Object.values(data.attempt.answers).forEach((a: any) => {
              loadedAns[a.questionId] = a.answer;
            });
            setAnswers(loadedAns);
          }

          if (data.attempt.status === "ACTIVE") {
            setIsExamActive(true);
            const now = Date.now();
            const expires = new Date(data.attempt.expiresAt).getTime();
            setRemainingSeconds(Math.max(0, Math.floor((expires - now) / 1000)));
          } else if (data.attempt.status === "SUBMITTED" || data.attempt.status === "AUTO_SUBMITTED") {
            setSubmissionResult(data.attempt);
          } else if (data.attempt.status === "TERMINATED") {
            setIsTerminated(true);
            setTerminationReason(data.attempt.terminationReason || "Violation limit reached.");
          }
        }
      } else {
        toastError("Assessment not found or unauthorized.");
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to load assessment.");
    } finally {
      setIsLoading(false);
    }
  };

  // Environment Check Handlers
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setCameraReady(true);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      // Track interruption listener
      stream.getVideoTracks()[0].onended = () => {
        setCameraReady(false);
        logIntegritySignal("CAMERA_STOPPED", "Camera stream interrupted");
      };
    } catch (err) {
      toastError("Camera permission denied. Please allow camera access.");
    }
  };

  const requestMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicReady(true);
      stream.getAudioTracks()[0].onended = () => {
        setMicReady(false);
        logIntegritySignal("MICROPHONE_STOPPED", "Microphone stream interrupted");
      };
    } catch (err) {
      toastError("Microphone permission denied. Please allow microphone access.");
    }
  };

  const requestScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setScreenStream(stream);
      setScreenReady(true);

      stream.getVideoTracks()[0].onended = () => {
        setScreenReady(false);
        logIntegritySignal("SCREEN_SHARE_STOPPED", "Screen sharing stream ended");
      };
    } catch (err) {
      toastError("Screen sharing permission denied. Entire display must be shared.");
    }
  };

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenReady(true);
    } catch (err) {
      setFullscreenReady(true); // fallback if browser denies full screen request
    }
  };

  const isEnvironmentReady =
    (!assessment?.proctoringConfig?.cameraRequired || cameraReady) &&
    (!assessment?.proctoringConfig?.microphoneRequired || micReady) &&
    (!assessment?.proctoringConfig?.entireScreenRequired || screenReady) &&
    consentGiven;

  const handleStartExam = async () => {
    if (!isEnvironmentReady) {
      toastError("Please complete all mandatory hardware checks and accept terms.");
      return;
    }

    try {
      await requestFullscreen();

      const res = await fetch(`/api/student/assessments/${resolvedParams.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setAttempt(data.attempt);
        setIsExamActive(true);
        const now = Date.now();
        const expires = new Date(data.attempt.expiresAt).getTime();
        setRemainingSeconds(Math.max(0, Math.floor((expires - now) / 1000)));
        success("Examination initialized. Your timer has started.");
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to start assessment.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error starting assessment session.");
    }
  };

  const handleSelectAnswer = async (questionId: string, value: any) => {
    if (!attempt || !isExamActive || isTerminated) return;

    // Optimistic update
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);
    setSaveStatus("SAVING");

    try {
      const res = await fetch(`/api/student/assessments/${resolvedParams.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          questionId,
          answer: value,
        }),
      });

      if (res.ok) {
        setSaveStatus("SAVED");
      } else {
        setSaveStatus("ERROR");
      }
    } catch {
      setSaveStatus("ERROR");
    }
  };

  const logIntegritySignal = async (eventType: IntegrityEventType, reason: string) => {
    if (!attempt || !isExamActive || isTerminated) return;

    try {
      const res = await fetch(`/api/student/assessments/${resolvedParams.id}/integrity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          eventType,
          severity: "HIGH",
          metadata: { reason },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setViolationCount(data.violationCount);

        if (data.actionTaken === "TERMINATE" || data.attemptStatus === "TERMINATED") {
          setIsTerminated(true);
          setIsExamActive(false);
          setTerminationReason("Assessment terminated due to repeated proctoring violations.");
        } else if (data.actionTaken === "WARNING" || data.actionTaken === "FINAL_WARNING") {
          setWarningMessage(
            `${data.actionTaken === "FINAL_WARNING" ? "FINAL WARNING" : "INTEGRITY WARNING"}: ${reason}. Violation ${data.violationCount} recorded.`
          );
        }
      }
    } catch (err) {
      console.error("Failed to log integrity event:", err);
    }
  };

  const handleSubmitExam = async () => {
    if (!attempt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/student/assessments/${resolvedParams.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissionResult(data.attempt);
        setIsExamActive(false);
        setIsSubmitModalOpen(false);
        success("Assessment submitted and evaluated successfully!");

        // Release streams
        if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
        if (screenStream) screenStream.getTracks().forEach((t) => t.stop());
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to submit assessment.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error during assessment submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmitTimeout = async () => {
    if (!attempt || submissionResult) return;
    try {
      const res = await fetch(`/api/student/assessments/${resolvedParams.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, isAutoTimeout: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissionResult(data.attempt);
        setIsExamActive(false);
        info("Time expired! Your assessment was automatically evaluated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !assessment) {
    return (
      <RoleGuard allowedRole="student">
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Preparing proctored exam environment...</p>
        </div>
      </RoleGuard>
    );
  }

  const questions: AssessmentSnapshotQuestion[] = assessment.questions || [];
  const currentQ = questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <RoleGuard allowedRole="student">
      <div className="max-w-6xl mx-auto pb-16">
        {/* POST-SUBMISSION / EVALUATION SCREEN */}
        {submissionResult ? (
          <Card className="p-8 border-border bg-card max-w-2xl mx-auto text-center space-y-6">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
                submissionResult.passed
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
              }`}
            >
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-foreground">Assessment Submitted Successfully</h2>
              <p className="text-xs text-muted-foreground">
                Your answers and proctoring integrity events have been securely finalized on the server.
              </p>
            </div>

            {assessment.candidateRules?.showResultImmediately ? (
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground">Recorded Score:</span>
                  <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                    {submissionResult.totalScore} / {submissionResult.maxScore}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground">Percentage:</span>
                  <span className="font-extrabold text-foreground">{submissionResult.percentage}%</span>
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                  <span className="font-bold text-muted-foreground">Passing Benchmark:</span>
                  <Badge variant={submissionResult.passed ? "emerald" : "rose"} size="sm" className="font-bold">
                    {submissionResult.passed ? "BENCHMARK MET ✓" : "DID NOT MEET BENCHMARK"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300">
                The recruiter has configured results to be announced after the recruitment drive closing date.
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <Link href="/dashboard/assessments">
                <Button variant="gradient" size="md">
                  Back to Assessments Hub
                </Button>
              </Link>
            </div>
          </Card>
        ) : isTerminated ? (
          /* TERMINATION SCREEN */
          <Card className="p-8 border-rose-500/40 bg-card max-w-xl mx-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-extrabold text-foreground">Assessment Session Terminated</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {terminationReason ||
                "This assessment was terminated by the proctoring engine due to repeated browser integrity violations."}
            </p>

            <Link href="/dashboard/assessments">
              <Button variant="outline" size="sm">
                Return to Assessments Hub
              </Button>
            </Link>
          </Card>
        ) : !isExamActive ? (
          /* STEP 1: PRE-FLIGHT ENVIRONMENT & CONSENT CHECK */
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/assessments">
                <Button variant="ghost" size="sm" className="p-1.5 h-auto">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">{assessment.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {assessment.companyName} • {assessment.durationMinutes} Minutes • {questions.length} Questions
                </p>
              </div>
            </div>

            <Card className="p-6 border-border bg-card space-y-6">
              <div>
                <h3 className="text-base font-bold text-foreground">Hardware & Proctoring Pre-Flight Check</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This examination operates under strict proctoring verification. Verify your devices before starting.
                </p>
              </div>

              {/* Hardware Verifications */}
              <div className="space-y-3">
                {/* Camera */}
                <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Webcam Stream</h4>
                      <p className="text-xs text-muted-foreground">Video track must remain active</p>
                    </div>
                  </div>

                  {cameraReady ? (
                    <Badge variant="emerald" size="sm" className="gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> Ready
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={requestCamera}>
                      Enable Camera
                    </Button>
                  )}
                </div>

                {/* Microphone */}
                <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Microphone Audio</h4>
                      <p className="text-xs text-muted-foreground">Audio levels monitored</p>
                    </div>
                  </div>

                  {micReady ? (
                    <Badge variant="emerald" size="sm" className="gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> Ready
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={requestMicrophone}>
                      Enable Mic
                    </Button>
                  )}
                </div>

                {/* Screen Share */}
                {assessment.proctoringConfig?.entireScreenRequired && (
                  <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Entire Desktop Screen Share</h4>
                        <p className="text-xs text-muted-foreground">Entire display must be shared</p>
                      </div>
                    </div>

                    {screenReady ? (
                      <Badge variant="emerald" size="sm" className="gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Ready
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={requestScreenShare}>
                        Share Screen
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Video Preview if active */}
              {cameraReady && (
                <div className="w-48 h-32 rounded-xl bg-black overflow-hidden border border-border mx-auto relative">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-bold">
                    Webcam Active
                  </span>
                </div>
              )}

              {/* Privacy & Integrity Consent Notice */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 space-y-2">
                <h4 className="font-bold text-sm">Privacy, Hardware & Integrity Consent Declaration</h4>
                <p className="leading-relaxed">
                  By starting this test, you consent to automated browser signal monitoring (Page Visibility, window focus, fullscreen enforcement) and active camera/screen track status monitoring during this examination. Exiting fullscreen or navigating to other tabs will record an integrity event.
                </p>
                <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span>I acknowledge and agree to the examination integrity policies.</span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="gradient"
                  size="md"
                  disabled={!isEnvironmentReady}
                  onClick={handleStartExam}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Examination
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* STEP 2: DISTRACTION-FREE EXAMINATION ROOM */
          <div className="space-y-4">
            {/* Top Exam Status Bar */}
            <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between gap-4 sticky top-16 z-30">
              <div className="flex items-center gap-3">
                <Badge variant="purple" size="sm" className="gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Proctoring Active
                </Badge>
                <h2 className="text-sm font-extrabold text-foreground truncate max-w-xs sm:max-w-md">
                  {assessment.title}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {/* Save status */}
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {saveStatus === "SAVING" ? "Saving answer..." : "All changes saved ✓"}
                </span>

                {/* Server countdown timer */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-extrabold ${
                    remainingSeconds < 300
                      ? "bg-rose-500/20 text-rose-600 border border-rose-500/30 animate-pulse"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(remainingSeconds)}</span>
                </div>

                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(true)}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit Exam
                </Button>
              </div>
            </div>

            {/* Warning Banner if violation triggered */}
            {warningMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center justify-between gap-3 font-bold animate-bounce">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{warningMessage}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setWarningMessage(null)}>
                  Dismiss
                </Button>
              </div>
            )}

            {/* Main Question & Navigation Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* Question Main Area */}
              <Card className="p-6 border-border bg-card lg:col-span-3 space-y-6 flex flex-col justify-between min-h-[480px]">
                {currentQ && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-border">
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">
                        Question {currentQIndex + 1} of {questions.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{currentQ.marks} Marks</span>
                        {currentQ.negativeMarks > 0 && (
                          <span className="text-rose-500">(-{currentQ.negativeMarks} Neg)</span>
                        )}
                        <label className="flex items-center gap-1 cursor-pointer ml-3 font-medium text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={Boolean(markedForReview[currentQ.id])}
                            onChange={(e) =>
                              setMarkedForReview({
                                ...markedForReview,
                                [currentQ.id]: e.target.checked,
                              })
                            }
                            className="w-3.5 h-3.5 rounded text-purple-600"
                          />
                          <span>Mark for review</span>
                        </label>
                      </div>
                    </div>

                    <p className="text-base font-bold text-foreground leading-relaxed">
                      {currentQ.questionText}
                    </p>

                    {/* Options / Answer Input */}
                    {currentQ.type === "SHORT_ANSWER" ? (
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Type your answer:
                        </label>
                        <input
                          type="text"
                          value={answers[currentQ.id] || ""}
                          onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                          placeholder="Enter concise answer here..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2.5 pt-2">
                        {currentQ.options?.map((opt, oIdx) => {
                          const isMulti = currentQ.type === "MULTIPLE_CHOICE";
                          const currentVal = answers[currentQ.id];
                          const isSelected = isMulti
                            ? Array.isArray(currentVal) && currentVal.includes(opt)
                            : currentVal === opt;

                          return (
                            <div
                              key={oIdx}
                              onClick={() => {
                                if (isMulti) {
                                  const existingArr: string[] = Array.isArray(currentVal) ? [...currentVal] : [];
                                  if (existingArr.includes(opt)) {
                                    handleSelectAnswer(
                                      currentQ.id,
                                      existingArr.filter((item) => item !== opt)
                                    );
                                  } else {
                                    handleSelectAnswer(currentQ.id, [...existingArr, opt]);
                                  }
                                } else {
                                  handleSelectAnswer(currentQ.id, opt);
                                }
                              }}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isSelected
                                  ? "border-purple-600 bg-purple-500/10 text-purple-900 dark:text-purple-100 font-bold shadow-sm"
                                  : "border-border bg-background hover:bg-muted/40 text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="text-xs sm:text-sm">{opt}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAnswer(currentQ.id, "")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear Choice
                  </Button>

                  {currentQIndex < questions.length - 1 ? (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => setIsSubmitModalOpen(true)}
                    >
                      Review & Submit
                    </Button>
                  )}
                </div>
              </Card>

              {/* Right Sidebar: Palette Navigator */}
              <Card className="p-4 border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Question Palette
                  </h4>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {answeredCount}/{questions.length} Answered
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(answers[q.id]);
                    const isReview = Boolean(markedForReview[q.id]);
                    const isCurrent = currentQIndex === idx;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                          isCurrent
                            ? "ring-2 ring-purple-600 font-extrabold scale-105"
                            : ""
                        } ${
                          isReview
                            ? "bg-amber-500/20 text-amber-600 border border-amber-500/40"
                            : isAnswered
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-3 border-t border-border text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-muted shrink-0" />
                    <span>Unanswered ({questions.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500 shrink-0" />
                    <span>Marked for Review ({Object.values(markedForReview).filter(Boolean).length})</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SUBMISSION CONFIRMATION MODAL */}
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Final Assessment Submission"
          description="Please review your progress before sealing your responses."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <strong className="text-foreground">{questions.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Answered:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{answeredCount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unanswered:</span>
                <strong className="text-rose-500">{questions.length - answeredCount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marked for Review:</span>
                <strong className="text-amber-500">
                  {Object.values(markedForReview).filter(Boolean).length}
                </strong>
              </div>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Once submitted, your answers will be authoritatively locked and evaluated against the question key. You cannot return or alter answers.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsSubmitModalOpen(false)}>
                Return to Exam
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleSubmitExam}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Finalizing & Submitting..." : "Confirm & Submit Now"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
