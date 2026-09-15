"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { normalizeVerificationStatus } from "@/lib/student-access-policy";

interface CareerDNALockOverlayProps {
  className?: string;
}

export function CareerDNALockOverlay({ className = "" }: CareerDNALockOverlayProps) {
  const router = useRouter();
  const { user, resetVerificationForResubmission } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const status = normalizeVerificationStatus((user as any)?.verificationStatus);

  const handleRetry = async () => {
    setIsResetting(true);
    try {
      if (resetVerificationForResubmission) {
        await resetVerificationForResubmission();
      }
      router.push("/dashboard/documents");
    } catch {
      router.push("/dashboard/documents");
    } finally {
      setIsResetting(false);
    }
  };

  const handleViewStatus = () => {
    router.push("/dashboard/documents");
  };

  // Status-specific content mapping strictly as required in Section 5
  let title = "Career DNA Locked";
  let message = "Complete student verification to unlock your Career DNA.";
  let badgeVariant: "blue" | "amber" | "rose" | "purple" = "blue";
  let badgeText = "VERIFICATION REQUIRED";
  let showViewStatus = true;
  let showRetry = false;
  let isPrimaryRetry = false;

  switch (status) {
    case "PROCESSING":
      title = "Career DNA Locked";
      message =
        "Your student verification is currently being processed. Career DNA will unlock automatically once verification is complete.";
      badgeVariant = "blue";
      badgeText = "PROCESSING";
      showViewStatus = true;
      showRetry = false;
      break;

    case "MANUAL_REVIEW_REQUESTED":
      title = "Career DNA Locked";
      message =
        "Your student verification is currently under manual review. Career DNA will automatically unlock once your verification is approved.";
      badgeVariant = "amber";
      badgeText = "UNDER MANUAL REVIEW";
      showViewStatus = true;
      showRetry = false;
      break;

    case "UNDER_REVIEW":
      title = "Career DNA Locked";
      message =
        "Your student verification is being reviewed by a StudentHub verification officer. Career DNA will automatically unlock once verification is approved.";
      badgeVariant = "purple";
      badgeText = "OFFICER REVIEW IN PROGRESS";
      showViewStatus = true;
      showRetry = false;
      break;

    case "VERIFICATION_FAILED":
      title = "Career DNA Locked";
      message =
        "Your document could not be verified automatically. Complete student verification to unlock your Career DNA.";
      badgeVariant = "rose";
      badgeText = "VERIFICATION FAILED";
      showViewStatus = true;
      showRetry = true;
      break;

    case "REJECTED":
      title = "Career DNA Locked";
      message =
        "Your student verification was not approved. Complete verification again to unlock your Career DNA.";
      badgeVariant = "rose";
      badgeText = "VERIFICATION REJECTED";
      showViewStatus = false;
      showRetry = true;
      isPrimaryRetry = true;
      break;

    default: // UNVERIFIED / not_submitted
      title = "Career DNA Locked";
      message =
        "Your student verification is required to unlock Career DNA. Submit your verification document to get verified.";
      badgeVariant = "blue";
      badgeText = "VERIFICATION REQUIRED";
      showViewStatus = true;
      showRetry = false;
      break;
  }

  return (
    <div
      role="dialog"
      aria-label="Career DNA Locked"
      aria-modal="true"
      className={`absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 dark:bg-slate-950/85 backdrop-blur-xs transition-all duration-300 ${className}`}
    >
      <div className="relative max-w-md w-full rounded-2xl sm:rounded-3xl border border-blue-500/30 dark:border-blue-500/20 bg-card/95 p-6 sm:p-8 text-center shadow-2xl shadow-blue-500/10 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background behind modal */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-sky-500/15 to-indigo-500/20 rounded-3xl blur-xl -z-10 pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-sky-500/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-sky-400 mx-auto shadow-md shadow-blue-500/10">
          <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        {/* Badge */}
        <div>
          <Badge
            variant={badgeVariant}
            size="sm"
            className="font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5"
          >
            🔒 {badgeText}
          </Badge>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {showViewStatus && (
            <Button
              variant={isPrimaryRetry ? "outline" : "primary"}
              size="sm"
              onClick={handleViewStatus}
              className={`w-full sm:w-auto text-xs font-bold ${
                !isPrimaryRetry
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  : ""
              }`}
            >
              View Verification Status <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}

          {showRetry && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRetry}
              disabled={isResetting}
              className="w-full sm:w-auto text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 mr-1.5 ${isResetting ? "animate-spin" : ""}`}
              />
              {isResetting ? "Preparing..." : "Try Verification Again"}
            </Button>
          )}
        </div>

        {/* Reassurance Footer */}
        <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
          <span>
            Career DNA will automatically unlock once your verification is approved.
          </span>
        </div>
      </div>
    </div>
  );
}
