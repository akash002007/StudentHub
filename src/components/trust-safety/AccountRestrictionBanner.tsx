"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AccountRestrictionBannerProps {
  status?: "RESTRICTED" | "SUSPENDED" | "BANNED" | "WARNING" | string;
  reason?: string;
  expiresAt?: string;
  className?: string;
}

export function AccountRestrictionBanner({
  status,
  reason,
  expiresAt,
  className,
}: AccountRestrictionBannerProps) {
  if (!status || status === "ACTIVE" || status === "VERIFIED") return null;

  const isBanned = status === "BANNED";
  const isSuspended = status === "SUSPENDED";
  const isRestricted = status === "RESTRICTED";

  return (
    <div
      className={cn(
        "rounded-2xl p-4 border flex items-start gap-3.5 mb-6 shadow-sm backdrop-blur-md transition-all",
        isBanned || isSuspended
          ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
          : "bg-amber-500/10 border-amber-500/30 text-amber-200",
        className
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          isBanned || isSuspended
            ? "bg-rose-500/20 text-rose-400"
            : "bg-amber-500/20 text-amber-400"
        )}
      >
        <ShieldAlert className="w-5 h-5" />
      </div>

      <div className="space-y-1 flex-1 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide">
            {isBanned
              ? "Account Permanently Suspended"
              : isSuspended
              ? "Account Temporarily Suspended"
              : isRestricted
              ? "Account Functionality Temporarily Restricted"
              : "Platform Notice"}
          </span>
          {status && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 border border-white/20">
              {status}
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed text-slate-300">
          {reason
            ? reason
            : "Some account functionality has been temporarily restricted while our Trust & Safety team reviews a reported platform policy issue."}
        </p>

        {expiresAt && (
          <p className="text-[11px] text-slate-400">
            Restriction active until: {new Date(expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
