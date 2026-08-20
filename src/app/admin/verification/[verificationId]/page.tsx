"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import {
  AcademicInfoCard,
  ConfirmationModal,
  DecisionPanel,
  DocumentViewer,
  DuplicateAccountsCard,
  RejectModal,
  RequestInfoModal,
  StudentProfileCard,
  VerificationChecklist,
  VerificationMethodCard,
  VerificationTimeline,
} from "@/components/admin/verification";
import { EmptyState, SkeletonLoader } from "@/components/admin/common";
import { Button } from "@/components/ui/Button";
import { VerificationChecklistItem, VerificationRequest } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function VerificationReviewPage({
  params,
}: {
  params: { verificationId: string };
}) {
  const router = useRouter();
  const rawId = decodeURIComponent(params.verificationId);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [checks, setChecks] = useState<VerificationChecklistItem[]>([]);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);

  const [rejectReason, setRejectReason] = useState("");
  const [requestMessage, setRequestMessage] = useState(
    "Please provide a clearer, official copy of your latest college semester fee receipt showing your name and college details."
  );
  const [requirements, setRequirements] = useState<string[]>(["Updated fee receipt"]);
  const { success, error: toastError, info } = useToast();

  const fetchRequestData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/verification/${encodeURIComponent(rawId)}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setChecks(data.request.checklist || []);
      } else {
        setRequest(null);
      }
    } catch (err) {
      console.warn("Failed to fetch verification request:", err);
    } finally {
      setIsLoading(false);
    }
  }, [rawId]);

  useEffect(() => {
    fetchRequestData();
  }, [fetchRequestData]);

  const handleChecklistUpdate = async (id: string, state: VerificationChecklistItem["state"]) => {
    const updatedChecks = checks.map((item) => (item.id === id ? { ...item, state } : item));
    setChecks(updatedChecks);

    try {
      await fetch(`/api/admin/verification/${encodeURIComponent(rawId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: updatedChecks }),
      });
      info(`Checklist item updated to ${state}`);
    } catch (err) {
      console.warn("Checklist save error:", err);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/verification/${encodeURIComponent(rawId)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminName: "Priya Menon",
          adminNotes: "Approved student for verified StudentHub access.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setChecks(data.request.checklist || []);
        setIsApproveOpen(false);
        success(`Student ${data.request?.student?.fullName || ""} verified successfully!`);
      } else {
        toastError("Failed to approve verification request.");
      }
    } catch {
      toastError("Error connecting to server API.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toastError("Please provide a rejection reason.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/verification/${encodeURIComponent(rawId)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: rejectReason.trim(),
          adminName: "Priya Menon",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setIsRejectOpen(false);
        toastError(`Verification rejected for ${data.request?.student?.fullName}.`);
      } else {
        toastError("Failed to reject verification request.");
      }
    } catch {
      toastError("Error connecting to server API.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!requestMessage.trim()) {
      toastError("Please enter a message explaining what information is needed.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/admin/verification/${encodeURIComponent(rawId)}/request-information`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requirements,
            message: requestMessage.trim(),
            adminName: "Priya Menon",
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setIsRequestInfoOpen(false);
        info("Information request sent to student.");
      } else {
        toastError("Failed to send information request.");
      }
    } catch {
      toastError("Error connecting to server API.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader className="h-10 w-36" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 space-y-4">
            <SkeletonLoader className="h-64 w-full" />
            <SkeletonLoader className="h-48 w-full" />
          </div>
          <div className="xl:col-span-4 space-y-4">
            <SkeletonLoader className="h-80 w-full" />
            <SkeletonLoader className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <EmptyState
        title="Verification request not found"
        description={`The verification ID "${rawId}" does not exist or may have been removed.`}
        actionLabel="Back to Queue"
        onAction={() => router.push("/admin/verification")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin/verification" className="inline-flex">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Queue
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequestData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
          <Link href={`/admin/students/${request.studentId}`}>
            <Button variant="outline" size="sm">
              View Student Dossier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left main dossier area */}
        <div className="xl:col-span-8 space-y-4">
          <StudentProfileCard request={request} />
          <VerificationMethodCard request={request} />
          <AcademicInfoCard request={request} />
          <DocumentViewer request={request} />
          <DuplicateAccountsCard request={request} />
          <VerificationTimeline request={request} />
        </div>

        {/* Right decision & checklist sidebar */}
        <div className="xl:col-span-4 space-y-4">
          <VerificationChecklist items={checks} onUpdate={handleChecklistUpdate} />

          <DecisionPanel
            status={request.status}
            onApprove={() => setIsApproveOpen(true)}
            onReject={() => setIsRejectOpen(true)}
            onRequestInfo={() => setIsRequestInfoOpen(true)}
          />
        </div>
      </div>

      {/* Confirmation Modal for Approve */}
      <ConfirmationModal
        isOpen={isApproveOpen}
        title="Approve this student for verified StudentHub access?"
        description={`This will set ${request.student.fullName}'s account to VERIFIED, unlock verified-only features (internship applications, communities, messaging), and send a live verification notification.`}
        actionLabel="Approve Student"
        onCancel={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectOpen}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={() => {
          setIsRejectOpen(false);
          setRejectReason("");
        }}
        onConfirm={handleReject}
      />

      {/* Request More Information Modal */}
      <RequestInfoModal
        isOpen={isRequestInfoOpen}
        message={requestMessage}
        requirements={requirements}
        onMessageChange={setRequestMessage}
        onToggleRequirement={(value) => {
          setRequirements((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
          );
        }}
        onCancel={() => setIsRequestInfoOpen(false)}
        onConfirm={handleRequestInfo}
      />
    </div>
  );
}
