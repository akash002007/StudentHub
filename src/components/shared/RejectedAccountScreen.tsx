"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  XCircle,
  AlertOctagon,
  RefreshCw,
  FileText,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { StudentProfile } from "@/types";

export function RejectedAccountScreen() {
  const router = useRouter();
  const { user, resetVerificationForResubmission } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const student = user as StudentProfile | null;
  const rawReason =
    student?.rejectionReason ||
    student?.verificationRequest?.rejectionReason ||
    "The submitted document could not be verified against the provided student information.";

  const handleTryAgain = async () => {
    setIsResetting(true);
    try {
      await resetVerificationForResubmission();
      router.push("/onboarding?step=verification");
    } catch (err) {
      console.error("Failed to reset verification:", err);
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <Card className="w-full max-w-xl p-8 sm:p-10 border-rose-500/40 bg-card/95 backdrop-blur-md shadow-2xl relative overflow-hidden text-center space-y-7">
        {/* Subtle background red glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Big visual failure badge */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-rose-500/15 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
          <XCircle className="w-10 h-10 stroke-[2.2]" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            Verification Decision
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Verification Failed
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your StudentHub verification request was not approved by the verification team.
          </p>
        </div>

        {/* Actual Rejection Reason Box */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-rose-500/30 text-left space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Reason for Rejection
          </div>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {rawReason}
          </p>
        </div>

        {/* Status Explanation */}
        <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5 text-center px-4">
          <p className="font-semibold text-foreground">
            Your StudentHub account features are currently restricted.
          </p>
          <p>
            You can submit a new verification request with a valid document (such as a clear semester fee receipt or official student ID card).
          </p>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            id="try-verification-again-btn"
            variant="gradient"
            size="lg"
            onClick={handleTryAgain}
            disabled={isResetting}
            className="w-full sm:w-auto font-bold px-7 gap-2 shadow-md shadow-rose-500/10"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
            {isResetting ? "Preparing New Attempt..." : "Try Verification Again"}
          </Button>

          <Link href="/dashboard/documents" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full font-semibold gap-2 border-border/70"
            >
              <FileText className="w-4 h-4" />
              View Documents
            </Button>
          </Link>
        </div>

        {/* Note */}
        <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need help? Institutional documents must clearly show your full name and student ID.</span>
        </div>
      </Card>
    </div>
  );
}
