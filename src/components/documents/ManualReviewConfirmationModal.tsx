"use client";

import React, { useState } from "react";
import { ShieldAlert, UserCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ManualReviewConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName?: string;
  onConfirm: () => Promise<void>;
}

export function ManualReviewConfirmationModal({
  isOpen,
  onClose,
  documentName,
  onConfirm,
}: ManualReviewConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6 text-left py-2">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Manual Review
            </h2>
            {documentName && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {documentName}
              </p>
            )}
          </div>
        </div>

        {/* Informative Explanation (Only shown after choosing Request Manual Review) */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            Your document will be reviewed by a StudentHub verification officer.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You will be notified once the review is completed.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-foreground border-border hover:bg-muted"
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Confirm Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
