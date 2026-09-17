"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Clock3,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { AccountRestrictionBanner } from "@/components/trust-safety/AccountRestrictionBanner";

export default function RecruiterTrustSafetyPage() {
  const { user } = useAuth();
  const [activeRestrictions, setActiveRestrictions] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [contentUnderReview, setContentUnderReview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // In this demo environment, recruiter status is derived from user account
  const accountStatus = (user as any)?.status || (user as any)?.accountStatus || "ACTIVE";
  const suspensionReason = (user as any)?.suspensionReason;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Recruiter Trust & Compliance Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review your organization&apos;s standing, policy notices, and opportunity listing integrity
            </p>
          </div>
        </div>

        <Link href="/dashboard/recruiter/drives">
          <Button variant="outline" size="sm" className="text-xs">
            Manage Drives
          </Button>
        </Link>
      </div>

      {/* Account restriction banner if restricted */}
      <AccountRestrictionBanner
        status={accountStatus !== "ACTIVE" ? accountStatus : undefined}
        reason={suspensionReason}
      />

      {/* Standing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Account Status Card */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Account Standing
          </span>
          <div className="flex items-center gap-2">
            {accountStatus === "ACTIVE" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-bold text-white">Good Standing</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-lg font-bold text-amber-300">{accountStatus}</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            All enterprise recruiting capabilities are fully enabled.
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Corporate Verification
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-lg font-bold text-white">Verified Employer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Domain and corporate identity verified by StudentHub Trust Team.
          </p>
        </div>

        {/* Active Policy Notices */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Policy Notices
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">0 Active Notices</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            No active compliance warnings or listing violations.
          </p>
        </div>
      </div>

      {/* Trust & Safety Principles for Employers */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>StudentHub Zero-Abuse Recruitment Standards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 space-y-1">
            <span className="font-bold text-white block">1. Zero Student Financial Liability</span>
            <p className="text-slate-400 leading-relaxed">
              Employers must never solicit application fees, onboarding deposits, training bonds, or equipment charges from student candidates.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 space-y-1">
            <span className="font-bold text-white block">2. Transparent Compensation Brackets</span>
            <p className="text-slate-400 leading-relaxed">
              Internship and job postings must clearly specify monthly stipend or annual salary ranges without hidden performance deductions.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 space-y-1">
            <span className="font-bold text-white block">3. In-Platform Professional Communications</span>
            <p className="text-slate-400 leading-relaxed">
              Recruiter outreach must remain professional. Solicitation of candidate personal social channels or payment apps is strictly prohibited.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 space-y-1">
            <span className="font-bold text-white block">4. Fair Assessment Integrity</span>
            <p className="text-slate-400 leading-relaxed">
              All candidate tests and interviews must assess merit objectively and respect student scheduled academic examinations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
