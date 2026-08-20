"use client";

import React from "react";
import Link from "next/link";
import { Clock, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StudentProfile } from "@/types";
import { Button } from "@/components/ui/Button";

export function VerificationBanner() {
  const { user, role } = useAuth();

  if (role !== "student" || !user) return null;

  const student = user as StudentProfile;
  const status = student.verificationStatus || "not_submitted";
  const request = student.verificationRequest;

  if (status === "approved") {
    return null;
  }

  if (status === "pending") {
    return (
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pending Manual Review
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 font-medium">
                {request?.verificationType === "payment_receipt"
                  ? "Semester Fee Receipt"
                  : "Student ID Card"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Your student verification document is awaiting review by the StudentHub administration team.
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted: {request?.submittedAt || "Recently"} • Document:{" "}
              <span className="font-medium text-foreground">{request?.documentName || "Uploaded File"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link href="/onboarding?step=verification" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto text-xs bg-card hover:bg-muted border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Review Status
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Verification Rejected
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Reason: {request?.rejectionReason || "Uploaded document is invalid or expired."}
            </p>
            <p className="text-xs text-muted-foreground">
              Please submit a valid semester fee receipt or clear student ID card to unlock your verified badge.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link href="/onboarding?step=verification" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="gradient"
              className="w-full sm:w-auto text-xs font-semibold"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Resubmit Document
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
