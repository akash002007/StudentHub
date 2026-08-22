"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  X,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface ConnectCodeforcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export type VerificationState =
  | "IDLE"
  | "VERIFYING"
  | "VERIFIED"
  | "FAILED"
  | "TEMPORARY_ERROR";

export function ConnectCodeforcesModal({
  isOpen,
  onClose,
  onSuccess,
}: ConnectCodeforcesModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [handleInput, setHandleInput] = useState("");
  const [activeHandle, setActiveHandle] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const [isSubmittingHandle, setIsSubmittingHandle] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState>("IDLE");
  const verificationStateRef = useRef<VerificationState>("IDLE");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRetryable, setIsRetryable] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const updateVerificationState = (state: VerificationState) => {
    verificationStateRef.current = state;
    setVerificationState(state);
  };

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to clear any running polling / timer loops
  const cleanupTimers = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Reset modal state when opened / closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setHandleInput("");
      setActiveHandle("");
      setVerificationToken("");
      setExpiresAt(null);
      updateVerificationState("IDLE");
      setVerificationMessage("");
      setErrorMessage("");
      setIsRetryable(false);
    } else {
      cleanupTimers();
    }
    return () => cleanupTimers();
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Submit Handle & Get Single-Use Challenge Token
  const handleConnectStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsRetryable(false);

    const trimmed = handleInput.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your Codeforces handle.");
      return;
    }

    if (!user) {
      toastError("Session expired. Please sign in again.");
      return;
    }

    setIsSubmittingHandle(true);

    try {
      const res = await fetch("/api/integrations/codeforces/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, handle: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setErrorMessage("Session expired. Please sign in again.");
        return;
      }

      if (res.ok && data.success) {
        setActiveHandle(data.handle);
        setVerificationToken(data.verificationToken);
        setExpiresAt(data.expiresAt);
        setStep(2);
      } else {
        setErrorMessage(
          data.error || "Codeforces profile not found. Please check your handle."
        );
      }
    } catch {
      setErrorMessage("Network error connecting to Codeforces. Please try again.");
    } finally {
      setIsSubmittingHandle(false);
    }
  };

  // Step 2: Verify Ownership Token against Live Codeforces API
  const handleVerifyOwnership = async () => {
    if (!user || !activeHandle || verificationStateRef.current === "VERIFYING") return;

    cleanupTimers();
    setErrorMessage("");
    setIsRetryable(false);
    updateVerificationState("VERIFYING");
    setVerificationMessage("Checking your Codeforces profile...");

    abortControllerRef.current = new AbortController();

    // 45s safety timeout for long operations
    timeoutRef.current = setTimeout(() => {
      if (verificationStateRef.current === "VERIFYING") {
        cleanupTimers();
        updateVerificationState("TEMPORARY_ERROR");
        setIsRetryable(true);
        setErrorMessage("Verification is taking longer than expected. Please try again.");
      }
    }, 45000);

    try {
      const res = await fetch("/api/integrations/codeforces/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, handle: activeHandle }),
        signal: abortControllerRef.current.signal,
      });

      const data = await res.json().catch(() => ({}));

      cleanupTimers();

      // CASE F: StudentHub Authentication genuinely missing (HTTP 401)
      if (res.status === 401) {
        updateVerificationState("FAILED");
        setErrorMessage("Session expired. Please sign in again.");
        return;
      }

      // CASE A: Verified
      if (res.ok && data.success && data.status === "VERIFIED") {
        updateVerificationState("VERIFIED");
        success(`Codeforces handle @${activeHandle} verified & connected!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
        return;
      }

      // CASE C & D: Temporary error (504, 502, 503, 408, 429)
      if (
        res.status === 504 ||
        res.status === 502 ||
        res.status === 503 ||
        res.status === 408 ||
        res.status === 429 ||
        data.status === "TEMPORARY_ERROR"
      ) {
        updateVerificationState("TEMPORARY_ERROR");
        setIsRetryable(true);
        setErrorMessage(
          data.error || "Codeforces is taking longer than expected. Please try again."
        );
        return;
      }

      // CASE B: Verification code genuinely not found or expired (400, 404, status FAILED)
      updateVerificationState("FAILED");
      setIsRetryable(false);
      setErrorMessage(
        data.error ||
          "Verification code was not found on your Codeforces profile. Please save the profile changes and try again."
      );
    } catch (err: any) {
      cleanupTimers();
      if (err?.name === "AbortError") {
        updateVerificationState("TEMPORARY_ERROR");
        setIsRetryable(true);
        setErrorMessage("Verification is taking longer than expected. Please try again.");
      } else {
        updateVerificationState("TEMPORARY_ERROR");
        setIsRetryable(true);
        setErrorMessage("Network error checking Codeforces. Please try again.");
      }
    }
  };

  const handleCopyToken = () => {
    if (verificationToken) {
      navigator.clipboard.writeText(verificationToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const isVerifying = verificationState === "VERIFYING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={() => {
            cleanupTimers();
            onClose();
          }}
          disabled={isSubmittingHandle || isVerifying}
          className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">Connect Codeforces</h2>
              <Badge variant="rose" size="sm" className="text-[10px]">
                Step {step} of 2
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {step === 1
                ? "Enter your Codeforces handle to begin ownership verification."
                : `Verify that you own Codeforces handle @${activeHandle}.`}
            </p>
          </div>
        </div>

        {/* STEP 1: Handle Entry */}
        {step === 1 && (
          <form onSubmit={handleConnectStart} className="space-y-4">
            <Input
              label="Codeforces Handle"
              value={handleInput}
              onChange={(e) => {
                setHandleInput(e.target.value);
                setErrorMessage("");
              }}
              placeholder="e.g. tourist, benq, or profile URL"
              helperText="We only use publicly available Codeforces data (no API key or password required)."
              disabled={isSubmittingHandle}
            />

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmittingHandle}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={!handleInput.trim() || isSubmittingHandle}
                className="text-xs font-bold"
              >
                {isSubmittingHandle ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Checking Handle...
                  </>
                ) : (
                  "Continue to Verification →"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Account Ownership Verification Challenge */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-500" /> Your Single-Use Verification Token
                </span>
                <span className="text-[10px] text-muted-foreground dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" /> Expires in 15m
                </span>
              </div>

              {/* Copyable Token Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-card dark:bg-[#161924] border border-rose-500/30">
                <code className="text-sm font-extrabold text-rose-600 dark:text-rose-400 tracking-wider font-mono">
                  {verificationToken}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToken}
                  className="h-7 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Token
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Verification Instructions */}
            <div className="p-4 rounded-2xl bg-muted/50 dark:bg-[#161924] border border-border/80 text-xs space-y-2">
              <h4 className="font-bold text-foreground dark:text-slate-100">Verification Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground dark:text-slate-300 leading-relaxed">
                <li>
                  Open your Codeforces profile settings:{" "}
                  <a
                    href="https://codeforces.com/settings/general"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 dark:text-rose-400 hover:underline font-semibold inline-flex items-center gap-0.5"
                  >
                    codeforces.com/settings <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  Set your <strong className="text-foreground dark:text-slate-100">First Name</strong> or <strong className="text-foreground dark:text-slate-100">Organization</strong> to:{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted/80 dark:bg-slate-800 border border-border/50 font-mono font-extrabold text-rose-600 dark:text-rose-400">
                    {verificationToken}
                  </code>
                </li>
                <li>Save profile changes on Codeforces and click <strong>Verify Ownership</strong> below.</li>
              </ol>
            </div>

            {/* In-Flight Verification Status Banner */}
            {isVerifying && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-500" />
                <span>{verificationMessage || "Checking your Codeforces profile..."}</span>
              </div>
            )}

            {/* Temporary Error Notice (Retryable) */}
            {verificationState === "TEMPORARY_ERROR" && errorMessage && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-800 dark:text-amber-200">Temporary Response Delay</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Actual Failure Notice */}
            {verificationState === "FAILED" && errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  cleanupTimers();
                  setStep(1);
                  setVerificationState("IDLE");
                  setErrorMessage("");
                }}
                disabled={isVerifying}
                className="text-xs text-muted-foreground dark:text-slate-400"
              >
                &larr; Change Handle
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    cleanupTimers();
                    onClose();
                  }}
                  disabled={isVerifying}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleVerifyOwnership}
                  disabled={isVerifying}
                  className="text-xs font-bold"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Verifying your Codeforces account...
                    </>
                  ) : isRetryable ? (
                    "Retry Verification"
                  ) : (
                    "Verify Ownership"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
