"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import { ReportModal } from "./ReportModal";
import { TrustSafetyEntityType } from "@/types";
import { cn } from "@/lib/utils";

export interface ReportButtonProps {
  entityType: TrustSafetyEntityType;
  targetId: string;
  targetTitle: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reportedCompanyId?: string;
  reportedCompanyName?: string;
  reportedOpportunityId?: string;
  reportedContentId?: string;
  variant?: "button" | "icon" | "menu-item" | "subtle";
  label?: string;
  className?: string;
}

export function ReportButton({
  entityType,
  targetId,
  targetTitle,
  reportedUserId,
  reportedUserName,
  reportedCompanyId,
  reportedCompanyName,
  reportedOpportunityId,
  reportedContentId,
  variant = "subtle",
  label = "Report",
  className,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "button" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all duration-200",
            className
          )}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {variant === "icon" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title={`Report this ${entityType.toLowerCase()}`}
          className={cn(
            "p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all",
            className
          )}
        >
          <Flag className="w-4 h-4" />
        </button>
      )}

      {variant === "menu-item" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left",
            className
          )}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {variant === "subtle" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors py-1 px-1.5 rounded hover:bg-rose-500/5",
            className
          )}
        >
          <Flag className="w-3 h-3" />
          <span>{label}</span>
        </button>
      )}

      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        entityType={entityType}
        targetId={targetId}
        targetTitle={targetTitle}
        reportedUserId={reportedUserId}
        reportedUserName={reportedUserName}
        reportedCompanyId={reportedCompanyId}
        reportedCompanyName={reportedCompanyName}
        reportedOpportunityId={reportedOpportunityId}
        reportedContentId={reportedContentId}
      />
    </>
  );
}
