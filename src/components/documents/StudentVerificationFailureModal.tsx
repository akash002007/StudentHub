"use client";

import React from "react";
import { AlertTriangle, RefreshCw, UserCheck, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface StudentVerificationFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName?: string;
  failureReason?: string;
  onUploadAgain: () => void;
  onRequestManualReview: () => void;
}

export function StudentVerificationFailureModal({
  isOpen,
  onClose,
  documentName,
  failureReason,
  onUploadAgain,
  onRequestManualReview,
}: StudentVerificationFailureModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6 text-left py-2">
        {/* Header with Icon */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              ⚠ Verification Unsuccessful
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              We couldn&apos;t verify your document automatically.
            </p>
          </div>
        </div>

        {/* Reason Container */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Reason
          </span>
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {failureReason || "Student ID could not be clearly detected from the document."}
          </p>
          {documentName && (
            <p className="text-[11px] text-muted-foreground pt-1">
              File: <span className="font-mono text-foreground/80">{documentName}</span>
            </p>
          )}
        </div>

        {/* Action Prompt */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-semibold text-foreground block">
            What would you like to do?
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onUploadAgain}
              className="w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-foreground border-border hover:bg-muted"
            >
              <RefreshCw className="w-4 h-4 text-blue-500" />
              Upload Again
            </Button>

            <Button
              onClick={onRequestManualReview}
              className="w-full flex items-center justify-center gap-2 py-2.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserCheck className="w-4 h-4" />
              Request Manual Review
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
