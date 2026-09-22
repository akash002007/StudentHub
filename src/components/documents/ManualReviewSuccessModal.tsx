"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ManualReviewSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName?: string;
}

export function ManualReviewSuccessModal({
  isOpen,
  onClose,
  documentName,
}: ManualReviewSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6 text-center py-4">
        {/* Success Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Title & Body */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            ✓ Review Requested
          </h2>
          <p className="text-sm font-medium text-foreground max-w-sm mx-auto leading-relaxed">
            Your document has been submitted for manual verification.
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            A CommandSkill verification officer will review your document. You will be notified when the review is completed.
          </p>
          {documentName && (
            <p className="text-[11px] font-mono text-muted-foreground pt-1">
              {documentName}
            </p>
          )}
        </div>

        {/* Done Button */}
        <div className="pt-2">
          <Button
            onClick={onClose}
            className="w-full max-w-[200px] mx-auto py-2.5 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
