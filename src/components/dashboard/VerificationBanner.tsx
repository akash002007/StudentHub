"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
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

  if (status === "needs_information") {
    return (
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-950 dark:text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Additional Information Required
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 font-medium">
                Action Required
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {request?.adminNotes || "Admin has requested additional information to complete your verification."}
            </p>
            <p className="text-xs text-muted-foreground">
              Verification ID: <span className="font-semibold text-foreground">{request?.verificationId || request?.id || "VER-CURRENT"}</span> • Please upload the requested documentation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link href="/onboarding?step=verification" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="gradient"
              className="w-full sm:w-auto text-xs font-semibold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Update Verification
            </Button>
          </Link>
        </div>
      </div>
    );
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
                Pending Review
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 font-medium">
                {request?.verificationType === "payment_receipt"
                  ? "Semester Fee Receipt"
                  : request?.verificationType === "student_id_card"
                  ? "Student ID Card"
                  : "Institutional Verification"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Your verification request has been submitted. Our team will review your information.
            </p>
            <p className="text-xs text-muted-foreground">
              Verification ID: <span className="font-semibold text-foreground">{request?.verificationId || request?.id || "VER-2026-004812"}</span> • Submitted: {request?.submittedAt || "Recently"} • Document:{" "}
              <span className="font-medium text-foreground">{request?.documentName || "Uploaded Receipt"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link href="/onboarding?step=overview" className="w-full sm:w-auto">
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
              Reason: {request?.rejectionReason || "Uploaded document was unreadable, expired, or could not be verified."}
            </p>
            <p className="text-xs text-muted-foreground">
              Please correct your document or provide an updated semester fee receipt to regain verified access.
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
              Resubmit Verification
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "not_submitted") {
    return (
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Pending Verification
            </span>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Your StudentHub account is awaiting verification.
            </p>
            <p className="text-xs text-muted-foreground">
              Submit your college fee receipt or university ID card to unlock verified internship access and fast-track recruiter applications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link href="/onboarding?step=verification" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="gradient"
              className="w-full sm:w-auto text-xs font-semibold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Start Verification
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
