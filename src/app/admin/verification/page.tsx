"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  VerificationFilters,
  VerificationFiltersState,
  VerificationTable,
  ConfirmationModal,
  RejectModal,
} from "@/components/admin/verification";
import { EmptyState } from "@/components/admin/common";
import { VerificationRequest } from "@/types";
import { useToast } from "@/context/ToastContext";

const initialFilters: VerificationFiltersState = {
  search: "",
  status: "All",
  method: "All",
  risk: "All",
  sort: "Newest",
};

export default function VerificationQueuePage() {
  const [filters, setFilters] = useState<VerificationFiltersState>(initialFilters);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReqForApprove, setSelectedReqForApprove] = useState<VerificationRequest | null>(null);
  const [selectedReqForReject, setSelectedReqForReject] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { success, error: toastError } = useToast();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.status !== "All") params.append("status", filters.status);
      if (filters.method !== "All") params.append("method", filters.method);
      if (filters.risk !== "All") params.append("risk", filters.risk);
      if (filters.sort) params.append("sort", filters.sort);

      const res = await fetch(`/api/admin/verification?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.warn("Failed to fetch verification queue:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleQuickApprove = async () => {
    if (!selectedReqForApprove) return;
    try {
      const res = await fetch(`/api/admin/verification/${encodeURIComponent(selectedReqForApprove.verificationId)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName: "Priya Menon", adminNotes: "Fast-track approved from admin queue." }),
      });
      if (res.ok) {
        success(`Approved ${selectedReqForApprove.student.fullName}! Student is now verified.`);
        setSelectedReqForApprove(null);
        fetchRequests();
      } else {
        toastError("Failed to approve request");
      }
    } catch {
      toastError("Error connecting to server API");
    }
  };

  const handleQuickReject = async () => {
    if (!selectedReqForReject) return;
    if (!rejectReason.trim()) {
      toastError("Please provide a rejection reason.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/verification/${encodeURIComponent(selectedReqForReject.verificationId)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim(), adminName: "Priya Menon" }),
      });
      if (res.ok) {
        toastError(`Rejected ${selectedReqForReject.student.fullName}. Notification sent.`);
        setSelectedReqForReject(null);
        setRejectReason("");
        fetchRequests();
      } else {
        toastError("Failed to reject request");
      }
    } catch {
      toastError("Error connecting to server API");
    }
  };

  const handleExportCSV = () => {
    const headers = "Verification ID,Student,College,Degree,Method,Status,Risk,Submitted\n";
    const rows = requests
      .map(
        (r) =>
          `"${r.verificationId}","${r.student.fullName}","${r.student.college}","${r.student.degree}","${r.verificationMethod}","${r.status}","${r.riskLevel}","${r.submittedAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `studenthub_verification_queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Verification queue exported as CSV.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {isLoading ? "Refreshing queue..." : `${requests.length} verification requests in database`}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchRequests()} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <VerificationFilters filters={filters} onChange={setFilters} />

      {requests.length ? (
        <VerificationTable
          rows={requests}
          onApproveClick={(req) => setSelectedReqForApprove(req)}
          onRejectClick={(req) => setSelectedReqForReject(req)}
        />
      ) : (
        <EmptyState
          title="No pending verifications"
          description="All verification requests in this filter have been processed or none were found."
          actionLabel="Reset Filters"
          onAction={() => setFilters(initialFilters)}
        />
      )}

      {/* Confirmation Modal for Quick Approve */}
      <ConfirmationModal
        isOpen={!!selectedReqForApprove}
        title={`Approve ${selectedReqForApprove?.student.fullName}?`}
        description={`This will verify ${selectedReqForApprove?.student.fullName}'s StudentHub account, award the Verified Student badge, and grant full candidate access.`}
        actionLabel="Approve Student"
        onCancel={() => setSelectedReqForApprove(null)}
        onConfirm={handleQuickApprove}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={!!selectedReqForReject}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={() => {
          setSelectedReqForReject(null);
          setRejectReason("");
        }}
        onConfirm={handleQuickReject}
      />
    </div>
  );
}
