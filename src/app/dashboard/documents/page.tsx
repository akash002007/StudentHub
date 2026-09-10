"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Eye,
  Shield,
  FileCheck2,
  GraduationCap,
  Briefcase,
  Layers,
  Search,
  Filter,
  ExternalLink,
  Info,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { DocumentRecord, DocumentType, DocumentStatus } from "@/types";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, { label: string; icon: any; color: string; desc: string }> = {
  RESUME: { label: "Resume / CV", icon: FileText, color: "text-blue-500", desc: "Shareable with recruiters in applications" },
  DEGREE_CERTIFICATE: { label: "Degree Certificate", icon: GraduationCap, color: "text-purple-500", desc: "Official university degree or provisional award" },
  MARKSHEET: { label: "Academic Marksheet / Transcript", icon: Layers, color: "text-indigo-500", desc: "Semester grades and academic performance transcripts" },
  INTERNSHIP_CERTIFICATE: { label: "Internship Certificate", icon: Briefcase, color: "text-emerald-500", desc: "Proof of practical workplace internship completion" },
  PROJECT_CERTIFICATE: { label: "Project Certificate", icon: Sparkles, color: "text-amber-500", desc: "Hackathon, capstone, or technical credential" },
  GOVERNMENT_ID: { label: "Government Identity ID", icon: ShieldCheck, color: "text-rose-500", desc: "Passport, Driver's License, or National ID (Private)" },
  COLLEGE_ID: { label: "College / Student ID Card", icon: Shield, color: "text-cyan-500", desc: "Official institutional campus enrollment card" },
  OTHER: { label: "Other Official Credential", icon: FileCheck2, color: "text-slate-500", desc: "Additional supporting documentation" },
};

export default function StudentDocumentsPage() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<DocumentType>("DEGREE_CERTIFICATE");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadExpiresAt, setUploadExpiresAt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");

  // Re-upload Modal State
  const [reuploadTarget, setReuploadTarget] = useState<DocumentRecord | null>(null);
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [isReuploading, setIsReuploading] = useState(false);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.warn("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.decisionReason && doc.decisionReason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedTypeFilter === "ALL" || doc.documentType === selectedTypeFilter;

      const matchesStatus =
        selectedStatusFilter === "ALL" || doc.verificationStatus === selectedStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  // Metrics summary
  const metrics = useMemo(() => {
    const verified = documents.filter(
      (d) => d.verificationStatus === "AUTO_VERIFIED" || d.verificationStatus === "VERIFIED"
    ).length;
    const needsReview = documents.filter((d) => d.verificationStatus === "NEEDS_REVIEW").length;
    const actionRequired = documents.filter(
      (d) => d.verificationStatus === "REUPLOAD_REQUIRED" || d.verificationStatus === "REJECTED"
    ).length;
    return {
      total: documents.length,
      verified,
      needsReview,
      actionRequired,
    };
  }, [documents]);

  // Handle Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toastError("Please choose a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgressMsg("Uploading & validating file structure...");

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("documentType", uploadDocType);
      if (uploadExpiresAt) formData.append("expiresAt", uploadExpiresAt);
      if (user?.id) formData.append("userId", user.id);

      setUploadProgressMsg("Running automated OCR classification & fuzzy credential matching...");
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.verificationResult?.status === "AUTO_VERIFIED") {
          success(`Document automatically verified with ${data.verificationResult.confidenceScore}% confidence!`);
        } else if (data.verificationResult?.status === "NEEDS_REVIEW") {
          info("Document uploaded. Submitted to Verification Review queue for exception verification.");
        } else {
          info(data.message || "Document uploaded successfully.");
        }
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadExpiresAt("");
        fetchDocuments();
      } else {
        toastError(data.error || "Failed to upload document.");
      }
    } catch {
      toastError("Error connecting to verification server.");
    } finally {
      setIsUploading(false);
      setUploadProgressMsg("");
    }
  };

  // Handle Re-upload
  const handleReuploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reuploadTarget || !reuploadFile) {
      toastError("Please choose a replacement file.");
      return;
    }

    setIsReuploading(true);
    try {
      const formData = new FormData();
      formData.append("file", reuploadFile);

      const res = await fetch(`/api/documents/${reuploadTarget.id}/reupload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success("Replacement document uploaded and re-verified!");
        setReuploadTarget(null);
        setReuploadFile(null);
        fetchDocuments();
      } else {
        toastError(data.error || "Failed to upload replacement document.");
      }
    } catch {
      toastError("Error connecting to server.");
    } finally {
      setIsReuploading(false);
    }
  };

  // Handle Secure Access / Preview
  const handlePreview = async (doc: DocumentRecord) => {
    setPreviewDoc(doc);
    setIsPreviewLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/access`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewUrl(data.accessUrl);
      } else {
        toastError(data.error || "Could not retrieve access authorization for this document.");
        setPreviewDoc(null);
      }
    } catch {
      toastError("Failed to initiate secure document session.");
      setPreviewDoc(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (doc: DocumentRecord) => {
    if (!confirm(`Are you sure you want to delete ${doc.fileName}?`)) return;
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (res.ok) {
        success("Document deleted.");
        fetchDocuments();
      } else {
        const data = await res.json();
        toastError(data.error || "Failed to delete document.");
      }
    } catch {
      toastError("Error deleting document.");
    }
  };

  const getStatusBadge = (status: DocumentStatus, method?: string) => {
    switch (status) {
      case "AUTO_VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            Auto-Verified
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Verified by Officer
          </span>
        );
      case "NEEDS_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Needs Review
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case "REUPLOAD_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            Re-upload Required
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
            Uploaded
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Document Management & Verification
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automated credential verification pipeline with instant verification and secure privacy governance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => fetchDocuments()} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Documents</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-2">{metrics.total}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Managed in your repository</p>
        </Card>

        <Card className="p-4 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Verified Credentials</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.verified}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Boosts Career DNA score</p>
        </Card>

        <Card className="p-4 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {metrics.needsReview}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">In officer verification queue</p>
        </Card>

        <Card className="p-4 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Action Needed</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {metrics.actionRequired}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Re-upload or replacement required</p>
        </Card>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-blue-950 dark:text-blue-200">
            Privacy & Identity Protection Guardrail Active:
          </span>{" "}
          <span className="text-blue-800 dark:text-blue-300">
            Sensitive identification documents (Government ID, College ID) are securely protected and never shared with recruiters.
            Recruiters only view cryptographically verified credential claims (e.g. Identity Verified ✓, Degree Verified ✓).
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name or document type..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            aria-label="Filter by Document Type"
            className="h-9 px-3 rounded-lg text-xs font-medium bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Document Types</option>
            <option value="RESUME">Resume / CV</option>
            <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
            <option value="MARKSHEET">Academic Marksheet</option>
            <option value="INTERNSHIP_CERTIFICATE">Internship Certificate</option>
            <option value="PROJECT_CERTIFICATE">Project Certificate</option>
            <option value="GOVERNMENT_ID">Government ID</option>
            <option value="COLLEGE_ID">College ID</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="h-9 px-3 rounded-lg text-xs font-medium bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AUTO_VERIFIED">Automatically Verified</option>
            <option value="VERIFIED">Verified by Officer</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="REUPLOAD_REQUIRED">Re-upload Required</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const typeConfig = DOCUMENT_TYPE_LABELS[doc.documentType] || DOCUMENT_TYPE_LABELS.OTHER;
            const Icon = typeConfig.icon;
            const isActionNeeded =
              doc.verificationStatus === "REUPLOAD_REQUIRED" || doc.verificationStatus === "REJECTED";

            return (
              <Card
                key={doc.id}
                className={`p-4 rounded-xl transition-all border flex flex-col justify-between ${
                  isActionNeeded
                    ? "border-rose-300 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10"
                    : doc.verificationStatus === "AUTO_VERIFIED"
                    ? "border-emerald-200 dark:border-emerald-900/40 bg-card"
                    : "border-border bg-card"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Icon & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg bg-muted ${typeConfig.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {typeConfig.label}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {doc.fileSize} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div>{getStatusBadge(doc.verificationStatus, doc.verificationMethod)}</div>
                  </div>

                  {/* File Name */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate" title={doc.fileName}>
                      {doc.fileName}
                    </h3>
                  </div>

                  {/* Verification Confidence & Matched Fields */}
                  {doc.confidenceScore !== null && doc.confidenceScore !== undefined && (
                    <div className="space-y-1.5 p-2 rounded-lg bg-muted/50 border border-border/50 text-[11px]">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-muted-foreground">Verification Confidence:</span>
                        <span
                          className={`font-bold ${
                            doc.confidenceScore >= 80
                              ? "text-emerald-600 dark:text-emerald-400"
                              : doc.confidenceScore >= 50
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {doc.confidenceScore}%
                        </span>
                      </div>

                      {doc.matchedFields && doc.matchedFields.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {doc.matchedFields.map((field, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            >
                              ✓ {field.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Callout Notice for Issues / Re-upload */}
                  {(doc.reuploadReason || doc.rejectionReason || (doc.warnings && doc.warnings.length > 0)) && (
                    <div
                      className={`p-2.5 rounded-lg text-xs border ${
                        isActionNeeded
                          ? "bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                          : "bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">
                            {doc.reuploadReason
                              ? "Re-upload Notice:"
                              : doc.rejectionReason
                              ? "Rejection Reason:"
                              : "Review Notice:"}
                          </span>{" "}
                          {doc.reuploadReason || doc.rejectionReason || doc.warnings?.[0]}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sensitive Badge Callout */}
                  {doc.isSensitive && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      Encrypted Sensitive Credential (Restricted Access)
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-border mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(doc)}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>

                    {isActionNeeded && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setReuploadTarget(doc);
                          setReuploadFile(null);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Replace
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc)}
                    className="text-muted-foreground hover:text-rose-600 p-1.5 h-8 w-8"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-border">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No documents found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
            Upload your Degree Certificate, Resume, Government ID, or Marksheets to start automated verification.
          </p>
          <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            Upload First Document
          </Button>
        </Card>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal isOpen={isUploadOpen} onClose={() => !isUploading && setIsUploadOpen(false)} title="Upload Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Document Category</label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value as DocumentType)}
              disabled={isUploading}
              className="w-full h-10 px-3 rounded-lg text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DEGREE_CERTIFICATE">Degree Certificate (B.Tech, B.S., etc.)</option>
              <option value="RESUME">Resume / CV (PDF or DOCX)</option>
              <option value="MARKSHEET">Academic Marksheet / Transcript</option>
              <option value="INTERNSHIP_CERTIFICATE">Internship Completion Certificate</option>
              <option value="PROJECT_CERTIFICATE">Technical Project Certificate</option>
              <option value="GOVERNMENT_ID">Government Identification (Passport, National ID)</option>
              <option value="COLLEGE_ID">College / Campus Student ID</option>
              <option value="OTHER">Other Academic Credential</option>
            </select>
            <p className="text-[11px] text-muted-foreground mt-1">
              {DOCUMENT_TYPE_LABELS[uploadDocType]?.desc}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Select File</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
              <input
                type="file"
                id="docUploadFileInput"
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                disabled={isUploading}
                className="hidden"
              />
              <label htmlFor="docUploadFileInput" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                {uploadFile ? (
                  <div>
                    <span className="text-xs font-bold text-foreground">{uploadFile.name}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-foreground">Click to browse or drop file</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Supports PDF, PNG, JPG, or DOCX (Max 10 MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Document Expiration Date <span className="font-normal text-muted-foreground">(Optional)</span>
            </label>
            <Input
              type="date"
              value={uploadExpiresAt}
              onChange={(e) => setUploadExpiresAt(e.target.value)}
              disabled={isUploading}
              className="text-xs h-9"
            />
          </div>

          {/* Progress message during AI verification */}
          {isUploading && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{uploadProgressMsg || "Processing automated verification..."}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isUploading}
              disabled={!uploadFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Verify & Upload
            </Button>
          </div>
        </form>
      </Modal>

      {/* RE-UPLOAD / REPLACE MODAL */}
      <Modal
        isOpen={!!reuploadTarget}
        onClose={() => !isReuploading && setReuploadTarget(null)}
        title="Replace Document"
      >
        <form onSubmit={handleReuploadSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
            <span className="font-bold">Reason for Re-upload Request:</span>
            <p className="mt-0.5">
              {reuploadTarget?.reuploadReason ||
                reuploadTarget?.rejectionReason ||
                "A clearer copy or replacement document is needed."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Select Replacement File for: <span className="text-blue-500">{reuploadTarget?.fileName}</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center bg-muted/20">
              <input
                type="file"
                id="docReuploadFileInput"
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                onChange={(e) => setReuploadFile(e.target.files?.[0] || null)}
                disabled={isReuploading}
                className="hidden"
              />
              <label htmlFor="docReuploadFileInput" className="cursor-pointer block">
                <UploadCloud className="w-7 h-7 mx-auto text-blue-500 mb-1.5" />
                {reuploadFile ? (
                  <div>
                    <span className="text-xs font-bold text-foreground">{reuploadFile.name}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {(reuploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-foreground">Select clearer replacement file</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Supports PDF, PNG, JPG, or DOCX</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReuploading}
              onClick={() => setReuploadTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isReuploading}
              disabled={!reuploadFile || isReuploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upload Replacement
            </Button>
          </div>
        </form>
      </Modal>

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={`Preview: ${previewDoc?.fileName || ""}`}>
        <div className="space-y-4">
          {isPreviewLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
              Establishing secure encrypted session...
            </div>
          ) : previewUrl ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-blue-400">{previewDoc?.fileName}</span>
                  <span className="text-[10px] text-slate-400">ID: {previewDoc?.id}</span>
                </div>
                <div>Type: {previewDoc?.documentType}</div>
                <div>Status: {previewDoc?.verificationStatus} ({previewDoc?.confidenceScore}% confidence)</div>
                <div>Size: {previewDoc?.fileSize} • MIME: {previewDoc?.mimeType}</div>
                <div>Uploaded: {previewDoc?.uploadedAt ? new Date(previewDoc.uploadedAt).toLocaleString() : "Recently"}</div>
                {previewDoc?.extractedData?.rawTextPreview && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    <span className="text-slate-400 block mb-1">OCR Stream Preview:</span>
                    {previewDoc.extractedData.rawTextPreview}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Access token authorized for 15 minutes
                </span>

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Document
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-rose-500">
              Failed to load document preview.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
