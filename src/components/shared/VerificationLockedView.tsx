"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ShieldAlert,
  Clock,
  RefreshCw,
  ArrowRight,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { StudentProfile } from "@/types";
import { normalizeVerificationStatus } from "@/lib/student-access-policy";

interface VerificationLockedViewProps {
  featureTitle: string; // e.g., "Career DNA", "Connected Accounts", "Internship Applications"
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function VerificationLockedView({
  featureTitle,
  description,
  icon: FeatureIcon,
}: VerificationLockedViewProps) {
  const router = useRouter();
  const { user, resetVerificationForResubmission } = useAuth();
  const student = user as StudentProfile | null;

  const rawStatus = student?.verificationStatus || "not_submitted";
  const normStatus = normalizeVerificationStatus(rawStatus);
  const rejectionReason =
    student?.rejectionReason ||
    student?.verificationRequest?.rejectionReason ||
    "The submitted document could not be verified against the provided student information.";

  const handleTryAgain = async () => {
    await resetVerificationForResubmission();
    router.push("/onboarding?step=verification");
  };

  // 1. REJECTED STATE (Section 25, 26)
  if (normStatus === "REJECTED") {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <Card className="p-8 sm:p-10 border-rose-500/30 bg-rose-500/5 backdrop-blur-xs text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              <span>🔒</span> {featureTitle} Locked
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Student verification is required to access your {featureTitle}.
              Your verification was not approved.
            </p>
          </div>

          {/* Actual Rejection Reason */}
          <div className="p-4 sm:p-5 rounded-xl bg-card border border-rose-500/30 text-left max-w-lg mx-auto shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs uppercase tracking-wider mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Verification Decision Reason</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              &ldquo;{rejectionReason}&rdquo;
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleTryAgain}
              className="w-full sm:w-auto font-semibold gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Verification Again
            </Button>
            <Link href="/dashboard/documents" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full font-medium">
                View Submitted Documents
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 2. MANUAL REVIEW REQUESTED / UNDER REVIEW STATE (Section 4, 5, 25, 26)
  if (normStatus === "MANUAL_REVIEW_REQUESTED" || normStatus === "UNDER_REVIEW") {
    const isUnderReview = normStatus === "UNDER_REVIEW";

    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <Card className="p-8 sm:p-10 border-amber-500/30 bg-amber-500/5 backdrop-blur-xs text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              <span>🔒</span> {featureTitle} Locked
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Your {featureTitle} is temporarily locked while your student verification is under review.
              It will be automatically unlocked once your verification is approved.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-card border border-amber-500/30 text-left max-w-lg mx-auto shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current Review Status:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                {isUnderReview ? "Under Manual Review" : "Manual Review Requested"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Reviewer:</span>
              <span className="font-medium text-foreground">
                CommandSkill Verification Officer
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding?step=overview" className="w-full sm:w-auto">
              <Button variant="gradient" size="lg" className="w-full font-semibold gap-2">
                <FileCheck className="w-4 h-4" />
                View Verification Status
              </Button>
            </Link>
            <Link href="/dashboard/documents" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full font-medium">
                Document Details
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 3. UNVERIFIED / FAILED (Default)
  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <Card className="p-8 sm:p-10 border-blue-500/30 bg-blue-500/5 backdrop-blur-xs text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
            <span>🔒</span> {featureTitle} Locked
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description ||
              `Student verification is required to access your ${featureTitle}. Please complete primary document verification to unlock full access.`}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/onboarding?step=verification" className="w-full sm:w-auto">
            <Button variant="gradient" size="lg" className="w-full font-semibold gap-2">
              <ShieldAlert className="w-4 h-4" />
              Verify Account
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
