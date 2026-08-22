"use client";

import React, { useState, useEffect } from "react";
import {
  Code,
  X,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface ConnectLeetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConnectLeetCodeModal({
  isOpen,
  onClose,
  onSuccess,
}: ConnectLeetCodeModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [leetcodeIdInput, setLeetcodeIdInput] = useState("");
  const [activeLeetCodeId, setActiveLeetCodeId] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLeetcodeIdInput("");
      setActiveLeetCodeId("");
      setVerificationToken("");
      setExpiresAt(null);
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Submit LeetCode ID & Generate Verification Code
  const handleConnectStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmed = leetcodeIdInput.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your LeetCode ID.");
      return;
    }

    if (!user) {
      toastError("Session expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/integrations/leetcode/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, leetcodeId: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setActiveLeetCodeId(data.leetcodeId);
        setVerificationToken(data.verificationToken);
        setExpiresAt(data.expiresAt);
        setStep(2);
      } else {
        setErrorMessage(data?.error || "LeetCode account not found. Please check your LeetCode ID.");
      }
    } catch {
      setErrorMessage("Network error connecting to LeetCode. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Ownership Code against Public LeetCode Profile
  const handleVerifyOwnership = async () => {
    if (!user || !activeLeetCodeId) return;
    setErrorMessage("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/integrations/leetcode/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, leetcodeId: activeLeetCodeId }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        success(`LeetCode account @${activeLeetCodeId} verified & connected!`);
        setIsVerifying(false);
        onSuccess();
        onClose();
      } else {
        setErrorMessage(
          data?.error ||
            "Verification code was not found on your public LeetCode profile. Make sure the code is saved in your 'About Me' / summary and try again."
        );
      }
    } catch {
      setErrorMessage("Network error verifying LeetCode ownership. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyToken = () => {
    if (verificationToken) {
      navigator.clipboard.writeText(verificationToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting || isVerifying}
          className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">Connect Account</h2>
              <Badge variant="amber" size="sm" className="text-[10px]">
                Step {step} of 2
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {step === 1
                ? "Enter your LeetCode ID to begin ownership verification."
                : "Verify your LeetCode account."}
            </p>
          </div>
        </div>

        {/* STEP 1: LeetCode ID Entry */}
        {step === 1 && (
          <form onSubmit={handleConnectStart} className="space-y-4">
            <Input
              label="LEETCODE ID"
              value={leetcodeIdInput}
              onChange={(e) => {
                setLeetcodeIdInput(e.target.value);
                setErrorMessage("");
              }}
              placeholder="Enter your LeetCode ID"
              helperText="We only use publicly available LeetCode data (no password or session cookie required)."
              disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!leetcodeIdInput.trim() || isSubmitting}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Checking ID...
                  </>
                ) : (
                  "Continue to Verification →"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Account Ownership Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" /> Your Single-Use Verification Code
                </span>
                <span className="text-[10px] text-muted-foreground dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Expires in 15m
                </span>
              </div>

              {/* Copyable Code Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-card dark:bg-[#161924] border border-amber-500/30">
                <code className="text-sm font-extrabold text-amber-600 dark:text-amber-400 tracking-wider font-mono">
                  {verificationToken}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToken}
                  className="h-7 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Code
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
                  Open your LeetCode profile settings:{" "}
                  <a
                    href="https://leetcode.com/profile/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 hover:underline font-semibold inline-flex items-center gap-0.5"
                  >
                    leetcode.com/profile <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  Paste the verification code into your <strong className="text-foreground dark:text-slate-100">About Me</strong> or <strong className="text-foreground dark:text-slate-100">Summary</strong> section: <code className="px-1.5 py-0.5 rounded bg-muted/80 dark:bg-slate-800 border border-border/50 font-mono font-extrabold text-amber-600 dark:text-amber-400">{verificationToken}</code>
                </li>
                <li>Save your profile changes on LeetCode and click <strong>Verify</strong> below.</li>
              </ol>
            </div>

            {errorMessage && (
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
                onClick={() => setStep(1)}
                disabled={isVerifying}
                className="text-xs text-muted-foreground dark:text-slate-400"
              >
                &larr; Change LeetCode ID
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isVerifying}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleVerifyOwnership}
                  disabled={isVerifying}
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify"
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
