"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Clock,
  XCircle,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  FileText,
  Search,
  SlidersHorizontal,
  Eye,
  Check,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  VerificationFilters,
  VerificationFiltersState,
  VerificationTable,
  ConfirmationModal,
  RejectModal,
  DocumentComparisonModal,
} from "@/components/admin/verification";
import { EmptyState } from "@/components/admin/common";
import { VerificationRequest, DocumentRecord, DocumentStatus } from "@/types";
import { useToast } from "@/context/ToastContext";

const initialFilters: VerificationFiltersState = {
  search: "",
  status: "All",
  method: "All",
  risk: "All",
  sort: "Newest",
};

interface VerificationMetrics {
  totalDocuments: number;
  autoVerifiedCount: number;
  needsReviewCount: number;
  rejectedCount: number;
  reuploadCount: number;
  expiredCount: number;
  automationRate: number;
}

export default function VerificationCenterPage() {
  const [activeTab, setActiveTab] = useState<"documents" | "accounts">("documents");
  const [filters, setFilters] = useState<VerificationFiltersState>(initialFilters);
  const [docTypeFilter, setDocTypeFilter] = useState<string>("ALL");
  const [docStatusFilter, setDocStatusFilter] = useState<string>("ALL");
  const [docSearch, setDocSearch] = useState("");

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [metrics, setMetrics] = useState<VerificationMetrics>({
    totalDocuments: 2481,
    autoVerifiedCount: 2132,
    needsReviewCount: 247,
    rejectedCount: 102,
    reuploadCount: 45,
    expiredCount: 12,
    automationRate: 85.9,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modals for legacy request quick actions
  const [selectedReqForApprove, setSelectedReqForApprove] = useState<VerificationRequest | null>(null);
  const [selectedReqForReject, setSelectedReqForReject] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal for side-by-side document review
  const [reviewingDoc, setReviewingDoc] = useState<DocumentRecord | null>(null);

  const { success, error: toastError, info } = useToast();

  const fetchQueueData = useCallback(async () => {
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
        if (data.documents) setDocuments(data.documents);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.warn("Failed to fetch verification queue:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !docSearch.trim() ||
        doc.fileName.toLowerCase().includes(docSearch.toLowerCase()) ||
        (doc.studentName && doc.studentName.toLowerCase().includes(docSearch.toLowerCase())) ||
        (doc.collegeName && doc.collegeName.toLowerCase().includes(docSearch.toLowerCase())) ||
        doc.documentType.toLowerCase().includes(docSearch.toLowerCase());

      const matchesType = docTypeFilter === "ALL" || doc.documentType === docTypeFilter;
      const matchesStatus = docStatusFilter === "ALL" || doc.verificationStatus === docStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, docSearch, docTypeFilter, docStatusFilter]);

  // Document action handlers
  const handleApproveDocument = async (doc: DocumentRecord, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE", notes, adminName: "Priya Menon (Admin)" }),
      });
      if (res.ok) {
        success(`Approved ${doc.documentType.replace("_", " ")} for ${doc.studentName}!`);
        fetchQueueData();
      } else {
        toastError("Failed to approve document.");
      }
    } catch {
      toastError("Error connecting to server.");
    }
  };

  const handleRejectDocument = async (doc: DocumentRecord, reason: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason, adminName: "Priya Menon (Admin)" }),
      });
      if (res.ok) {
        toastError(`Rejected ${doc.fileName}. Notification sent to student.`);
        fetchQueueData();
      } else {
        toastError("Failed to reject document.");
      }
    } catch {
      toastError("Error connecting to server.");
    }
  };

  const handleRequestReuploadDocument = async (doc: DocumentRecord, reason: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REQUEST_REUPLOAD", reason, adminName: "Priya Menon (Admin)" }),
      });
      if (res.ok) {
        info(`Re-upload requested for ${doc.fileName}. Student notified.`);
        fetchQueueData();
      } else {
        toastError("Failed to request re-upload.");
      }
    } catch {
      toastError("Error connecting to server.");
    }
  };

  // Legacy request handlers
  const handleQuickApproveRequest = async () => {
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
        fetchQueueData();
      } else {
        toastError("Failed to approve request");
      }
    } catch {
      toastError("Error connecting to server API");
    }
  };

  const handleQuickRejectRequest = async () => {
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
        fetchQueueData();
      } else {
        toastError("Failed to reject request");
      }
    } catch {
      toastError("Error connecting to server API");
    }
  };

  const handleExportCSV = () => {
    const headers = "Document ID,Student,College,Type,Status,Method,Confidence,Uploaded\n";
    const rows = documents
      .map(
        (d) =>
          `"${d.id}","${d.studentName || d.userId}","${d.collegeName || "N/A"}","${d.documentType}","${d.verificationStatus}","${d.verificationMethod || "N/A"}","${d.confidenceScore || "N/A"}%","${d.uploadedAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `studenthub_verification_center_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Verification Center records exported as CSV.");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Operational Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Verification Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automated document verification engine with human review queue for edge cases & exceptions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchQueueData()} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Queue
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* OPERATIONAL KPI METRICS SUMMARY (Section 15 Requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-card border-border shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Total Documents
          </span>
          <div className="text-2xl font-black text-foreground mt-1">{metrics.totalDocuments}</div>
          <span className="text-[10px] text-muted-foreground">Across all students</span>
        </Card>

        <Card className="p-3.5 bg-card border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Auto-Verified
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.autoVerifiedCount}
          </div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">
            Automation Rate: {metrics.automationRate}%
          </span>
        </Card>

        <Card className="p-3.5 bg-card border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Needs Review
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {metrics.needsReviewCount}
          </div>
          <span className="text-[10px] text-muted-foreground">In exception review queue</span>
        </Card>

        <Card className="p-3.5 bg-card border-rose-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Rejected
            </span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {metrics.rejectedCount}
          </div>
          <span className="text-[10px] text-muted-foreground">Failed requirements</span>
        </Card>

        <Card className="p-3.5 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Re-upload Requests
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{metrics.reuploadCount}</div>
          <span className="text-[10px] text-muted-foreground">Awaiting replacement</span>
        </Card>

        <Card className="p-3.5 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Expired Documents
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{metrics.expiredCount}</div>
          <span className="text-[10px] text-muted-foreground">Require renewal</span>
        </Card>
      </div>

      {/* Tabs Switcher: Document Review Queue vs Student Account Verifications */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-2.5 text-xs font-bold px-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "documents"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Document Review Queue
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
            {filteredDocuments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("accounts")}
          className={`pb-2.5 text-xs font-bold px-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "accounts"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-4 h-4" />
          Student Account Verifications
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-foreground font-bold">
            {requests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DOCUMENT REVIEW QUEUE */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search candidate, document, college..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-lg text-xs font-medium bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Document Types</option>
                <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                <option value="RESUME">Resume / CV</option>
                <option value="MARKSHEET">Academic Marksheet</option>
                <option value="INTERNSHIP_CERTIFICATE">Internship Certificate</option>
                <option value="PROJECT_CERTIFICATE">Project Certificate</option>
                <option value="GOVERNMENT_ID">Government ID</option>
                <option value="COLLEGE_ID">College ID</option>
              </select>

              <select
                value={docStatusFilter}
                onChange={(e) => setDocStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg text-xs font-medium bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="NEEDS_REVIEW">Needs Review (Queue)</option>
                <option value="AUTO_VERIFIED">Auto-Verified</option>
                <option value="VERIFIED">Verified by Officer</option>
                <option value="REUPLOAD_REQUIRED">Re-upload Required</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Documents Table */}
          {filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Signals & Discrepancy</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocuments.map((doc) => {
                    const confidence = doc.confidenceScore || 70;
                    return (
                      <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{doc.studentName || doc.userId}</div>
                          <div className="text-[11px] text-muted-foreground">{doc.collegeName || "Stanford University"}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground">
                            {doc.documentType.replace("_", " ")}
                          </span>
                          <div className="text-[10px] text-muted-foreground">
                            {doc.isSensitive ? "Encrypted Identity" : "Academic Credential"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-foreground font-mono text-[11px] block truncate max-w-[160px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.fileSize}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-black text-xs ${
                                confidence >= 80
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : confidence >= 50
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {confidence}%
                            </span>
                            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${
                                  confidence >= 80
                                    ? "bg-emerald-500"
                                    : confidence >= 50
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${confidence}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          {doc.matchedFields && doc.matchedFields.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {doc.matchedFields.slice(0, 3).map((f, i) => (
                                <span key={i} className="text-[9px] font-bold px-1 rounded bg-emerald-500/10 text-emerald-600">
                                  ✓ {f}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-[11px] text-muted-foreground truncate" title={doc.decisionReason || "None"}>
                            {doc.decisionReason || "Automated check complete"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {doc.verificationStatus === "AUTO_VERIFIED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                              <Sparkles className="w-3 h-3" /> Auto-Verified
                            </span>
                          ) : doc.verificationStatus === "VERIFIED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : doc.verificationStatus === "NEEDS_REVIEW" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Needs Review
                            </span>
                          ) : doc.verificationStatus === "REUPLOAD_REQUIRED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" /> Re-upload
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground">
                              {doc.verificationStatus}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewingDoc(doc)}
                            className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10 h-8"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Review & Compare
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No documents matching current filters"
              description="Change your status or document type filters to inspect other queue items."
              actionLabel="Reset Filters"
              onAction={() => {
                setDocSearch("");
                setDocTypeFilter("ALL");
                setDocStatusFilter("ALL");
              }}
            />
          )}
        </div>
      )}

      {/* TAB 2: STUDENT ACCOUNT VERIFICATIONS (Legacy Flow) */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <VerificationFilters filters={filters} onChange={setFilters} />

          {requests.length ? (
            <VerificationTable
              rows={requests}
              onApproveClick={(req) => setSelectedReqForApprove(req)}
              onRejectClick={(req) => setSelectedReqForReject(req)}
            />
          ) : (
            <EmptyState
              title="No pending student account verifications"
              description="All verification requests in this filter have been processed."
              actionLabel="Reset Filters"
              onAction={() => setFilters(initialFilters)}
            />
          )}
        </div>
      )}

      {/* DOCUMENT COMPARISON SIDE-BY-SIDE MODAL */}
      <DocumentComparisonModal
        isOpen={!!reviewingDoc}
        onClose={() => setReviewingDoc(null)}
        document={reviewingDoc}
        onApprove={handleApproveDocument}
        onReject={handleRejectDocument}
        onRequestReupload={handleRequestReuploadDocument}
      />

      {/* Confirmation Modal for Legacy Quick Approve */}
      <ConfirmationModal
        isOpen={!!selectedReqForApprove}
        title={`Approve ${selectedReqForApprove?.student.fullName}?`}
        description={`This will verify ${selectedReqForApprove?.student.fullName}'s StudentHub account, award the Verified Student badge, and grant full candidate access.`}
        actionLabel="Approve Student"
        onCancel={() => setSelectedReqForApprove(null)}
        onConfirm={handleQuickApproveRequest}
      />

      {/* Reject Modal for Legacy Quick Reject */}
      <RejectModal
        isOpen={!!selectedReqForReject}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={() => {
          setSelectedReqForReject(null);
          setRejectReason("");
        }}
        onConfirm={handleQuickRejectRequest}
      />
    </div>
  );
}
