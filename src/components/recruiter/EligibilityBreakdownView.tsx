"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EligibilityEvaluationResult } from "@/types";

interface EligibilityBreakdownViewProps {
  eligibility: EligibilityEvaluationResult;
  candidateName?: string;
  showScore?: boolean;
}

export function EligibilityBreakdownView({
  eligibility,
  candidateName,
  showScore = true,
}: EligibilityBreakdownViewProps) {
  if (!eligibility || !eligibility.criteria) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-muted-foreground">
        Eligibility evaluation not available for this profile.
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (eligibility.status) {
      case "ELIGIBLE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Eligible
          </span>
        );
      case "REQUIRES_MANUAL_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Manual Review Required
          </span>
        );
      case "NOT_ELIGIBLE":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Eligibility Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              Structured Criteria Evaluation
              {getStatusBadge()}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {eligibility.passedCount} of {eligibility.totalCount} parameters satisfied
            </p>
          </div>
        </div>

        {showScore && (
          <div className="text-right">
            <div className="text-lg font-extrabold text-foreground">
              {eligibility.score}%
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Match Index
            </div>
          </div>
        )}
      </div>

      {/* Itemized Criteria List */}
      <div className="space-y-2">
        {eligibility.criteria.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border text-xs transition-all ${
              item.passed
                ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40"
                : item.isMissingInfo
                ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/40"
                : "bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/60 dark:border-rose-900/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : item.isMissingInfo ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-foreground">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {item.details || (item.passed ? "Passed" : "Criteria not met")}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    item.passed
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                      : item.isMissingInfo
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                      : "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {item.passed ? "PASS" : item.isMissingInfo ? "REVIEW" : "FAIL"}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground">Required: </span>
                <span className="font-medium text-foreground">{item.required}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Candidate: </span>
                <span className="font-medium text-foreground">{item.candidateValue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
