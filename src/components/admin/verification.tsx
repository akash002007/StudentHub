"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileImage,
  RotateCw,
  Search,
  ShieldCheck,
  User,
  ZoomIn,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  VerificationChecklistItem,
  VerificationRequest,
  VerificationQueueStatus,
  VerificationRiskLevel,
} from "@/types";
import { StatusBadge, RiskIndicator } from "@/components/admin/common";

export type VerificationFiltersState = {
  search: string;
  status: "All" | VerificationQueueStatus;
  method: "All" | "College Email" | "Google" | "Payment Receipt" | "Manual Review";
  risk: "All" | VerificationRiskLevel;
  sort: "Newest" | "Oldest" | "Highest priority" | "Risk level";
};

export function VerificationFilters({
  filters,
  onChange,
}: {
  filters: VerificationFiltersState;
  onChange: (next: VerificationFiltersState) => void;
}) {
  return (
    <Card className="p-4 border-border/80 bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by name, email, college, student ID, verification ID"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
          />
        </div>

        <SelectField
          label="Status"
          value={filters.status}
          options={["All", "Pending", "Under Review", "Approved", "Rejected", "Needs Information"]}
          onChange={(value) => onChange({ ...filters, status: value as VerificationFiltersState["status"] })}
        />

        <SelectField
          label="Verification Type"
          value={filters.method}
          options={["All", "College Email", "Google", "Payment Receipt", "Manual Review"]}
          onChange={(value) => onChange({ ...filters, method: value as VerificationFiltersState["method"] })}
        />

        <SelectField
          label="Risk"
          value={filters.risk}
          options={["All", "Low", "Medium", "High"]}
          onChange={(value) => onChange({ ...filters, risk: value as VerificationFiltersState["risk"] })}
        />

        <SelectField
          label="Sort"
          value={filters.sort}
          options={["Newest", "Oldest", "Highest priority", "Risk level"]}
          onChange={(value) => onChange({ ...filters, sort: value as VerificationFiltersState["sort"] })}
        />
      </div>
    </Card>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="lg:col-span-2">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-border bg-card px-3 pr-8 text-xs text-foreground focus:outline-none focus:border-blue-500"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

export function VerificationTable({
  rows,
  onApproveClick,
  onRejectClick,
}: {
  rows: VerificationRequest[];
  onApproveClick?: (req: VerificationRequest) => void;
  onRejectClick?: (req: VerificationRequest) => void;
}) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-xs">
          <thead className="bg-muted/40 border-b border-border/70">
            <tr>
              {[
                "Student",
                "College",
                "Degree / Branch",
                "Verification Method",
                "Submitted",
                "Status",
                "Risk",
                "Reviewer",
                "Actions",
              ].map((header) => (
                <th key={header} className="text-left py-3 px-4 font-bold uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {rows.map((row) => (
              <tr key={row.verificationId} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-muted overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.student.avatar} alt={row.student.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{row.student.fullName}</p>
                      <p className="text-muted-foreground">{row.student.email}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{row.verificationId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{row.student.college}</td>
                <td className="px-4 py-3">{row.student.degree} {row.student.branch}</td>
                <td className="px-4 py-3">{row.verificationMethod}</td>
                <td className="px-4 py-3">{row.submittedAt}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-3"><RiskIndicator risk={row.riskLevel} /></td>
                <td className="px-4 py-3">{row.reviewedBy || "Unassigned"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/verification/${row.verificationId}`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                    {row.status !== "Approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        onClick={() => onApproveClick?.(row)}
                      >
                        Approve
                      </Button>
                    )}
                    {row.status !== "Rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        onClick={() => onRejectClick?.(row)}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function StudentProfileCard({ request }: { request: VerificationRequest }) {
  const { student } = request;

  return (
    <Card className="p-5 border-border/80 bg-card">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={student.avatar} alt={student.fullName} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">{student.fullName}</h2>
          <p className="text-sm text-muted-foreground">{student.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" size="sm">{request.verificationId}</Badge>
            <StatusBadge status={request.status} />
            <Badge variant="secondary" size="sm">{request.verificationMethod}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <InfoItem label="Phone" value={student.phone} />
        <InfoItem label="College" value={student.college} />
        <InfoItem label="Degree" value={student.degree} />
        <InfoItem label="Branch" value={student.branch} />
        <InfoItem label="Academic Year" value={student.year} />
        <InfoItem label="Graduation Year" value={student.graduationYear} />
        <InfoItem label="Student ID" value={student.studentId} />
        <InfoItem label="Account Created" value={student.accountCreatedAt} />
      </div>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-3 bg-muted/20">
      <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground truncate">{value}</p>
    </div>
  );
}

export function AcademicInfoCard({ request }: { request: VerificationRequest }) {
  return (
    <Card className="p-5 border-border/80 bg-card">
      <h3 className="text-sm font-bold text-foreground">Academic Information</h3>
      <div className="mt-3 divide-y divide-border/70">
        {request.academicFields.map((field) => (
          <div key={field.label} className="py-2.5 flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-foreground">{field.label}</p>
              <p className="text-muted-foreground">{field.value}</p>
            </div>
            <Badge variant={field.verified ? "emerald" : "amber"} size="sm">
              {field.verified ? "Verified" : "Pending"}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DocumentViewer({ request }: { request: VerificationRequest }) {
  const doc = request.document;

  if (!doc) {
    return (
      <Card className="p-5 border-border/80 bg-card">
        <h3 className="text-sm font-bold text-foreground">Document Verification</h3>
        <p className="mt-2 text-sm text-muted-foreground">No uploaded document is required for this verification method.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-border/80 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Latest College Fee Payment Receipt</h3>
          <p className="text-xs text-muted-foreground">Document preview and metadata</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm"><ZoomIn className="w-3.5 h-3.5" />Zoom</Button>
          <Button variant="outline" size="sm"><RotateCw className="w-3.5 h-3.5" />Rotate</Button>
          <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" />Download</Button>
          <Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5" />Full screen</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/30 p-6">
        <div className="aspect-[4/3] rounded-xl border border-border/70 bg-card flex flex-col items-center justify-center gap-2">
          <FileImage className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">{doc.fileName}</p>
          <p className="text-xs text-muted-foreground">Secure preview in production environment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <InfoItem label="File name" value={doc.fileName} />
        <InfoItem label="Upload date" value={doc.uploadDate} />
        <InfoItem label="File size" value={doc.fileSize} />
        <InfoItem label="Document type" value={doc.documentType} />
        <InfoItem label="Student name detected" value={doc.studentNameDetected || "Unavailable"} />
        <InfoItem label="College name detected" value={doc.collegeNameDetected || "Unavailable"} />
        <InfoItem label="Payment date" value={doc.paymentDate || "Unavailable"} />
        <InfoItem label="Receipt/reference number" value={doc.receiptNumber || "Unavailable"} />
      </div>
    </Card>
  );
}

export function VerificationChecklist({
  items,
  onUpdate,
}: {
  items: VerificationChecklistItem[];
  onUpdate: (id: string, state: VerificationChecklistItem["state"]) => void;
}) {
  return (
    <Card className="p-4 border-border/80 bg-card">
      <h3 className="text-sm font-bold text-foreground">Verification Checklist</h3>
      <div className="mt-3 space-y-2.5">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-border/70 p-3 bg-muted/20">
            <p className="text-xs font-semibold text-foreground">{item.label}</p>
            <div className="mt-2 flex items-center gap-1.5">
              {(["Pending", "Verified", "Failed"] as const).map((state) => (
                <button
                  key={state}
                  className={`text-[11px] font-semibold px-2.5 h-7 rounded-lg border transition-colors ${
                    item.state === state
                      ? state === "Verified"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/40"
                        : state === "Failed"
                        ? "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/40"
                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                  onClick={() => onUpdate(item.id, state)}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DecisionPanel({
  status,
  onApprove,
  onReject,
  onRequestInfo,
}: {
  status: VerificationQueueStatus;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
}) {
  return (
    <Card className="p-4 border-border/80 bg-card sticky top-20">
      <h3 className="text-sm font-bold text-foreground">Verification Decision</h3>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Current status:</span>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 space-y-2">
        <Button variant="primary" className="w-full" onClick={onApprove}>
          Approve Student
        </Button>
        <Button variant="outline" className="w-full" onClick={onRequestInfo}>
          Request More Information
        </Button>
        <Button variant="outline" className="w-full text-rose-700 dark:text-rose-300" onClick={onReject}>
          Reject Application
        </Button>
      </div>
      <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border/70 text-[11px] text-muted-foreground leading-relaxed">
        All sensitive actions require confirmation and will be recorded in audit logs.
      </div>
    </Card>
  );
}

export function VerificationTimeline({ request }: { request: VerificationRequest }) {
  return (
    <Card className="p-5 border-border/80 bg-card">
      <h3 className="text-sm font-bold text-foreground">Verification Timeline</h3>
      <div className="mt-4 space-y-3">
        {request.timeline.map((event) => (
          <div key={event.id} className="flex gap-3">
            <div className="pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-foreground">{event.title}</p>
              <p className="text-muted-foreground">{event.timestamp} - {event.actor}</p>
              {event.description ? <p className="text-muted-foreground mt-0.5">{event.description}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DuplicateAccountsCard({ request }: { request: VerificationRequest }) {
  return (
    <Card className="p-5 border-border/80 bg-card">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-foreground">Possible Duplicate Accounts</h3>
      </div>

      {request.duplicateCandidates.length ? (
        <div className="mt-3 space-y-2">
          {request.duplicateCandidates.map((dup) => (
            <div key={dup.id} className="p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/10 text-xs">
              <p className="font-semibold text-foreground">{dup.name}</p>
              <p className="text-muted-foreground">{dup.email}</p>
              <p className="text-muted-foreground">{dup.degree} - {dup.college}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">View Account</Button>
                <Button variant="outline" size="sm">Compare</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">No probable duplicate account was detected for this student.</p>
      )}
    </Card>
  );
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  actionLabel,
  actionVariant,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel: string;
  actionVariant?: "primary" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} description={description} maxWidth="md">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant={actionVariant === "danger" ? "danger" : "primary"} onClick={onConfirm}>
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function RejectModal({
  isOpen,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Reject Student Verification"
      description="Provide a reason for rejection. The student will see this message."
      maxWidth="lg"
    >
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground">Suggested rejection reason</label>
        <select
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
        >
          <option value="">Select reason</option>
          <option value="Invalid document">Invalid document</option>
          <option value="Information mismatch">Information mismatch</option>
          <option value="Duplicate account">Duplicate account</option>
          <option value="College information could not be verified">College information could not be verified</option>
          <option value="Document appears invalid">Document appears invalid</option>
          <option value="Student information incomplete">Student information incomplete</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={4}
          placeholder="Add custom explanation..."
          className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Reject Student</Button>
        </div>
      </div>
    </Modal>
  );
}

export function RequestInfoModal({
  isOpen,
  message,
  requirements,
  onMessageChange,
  onToggleRequirement,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  message: string;
  requirements: string[];
  onMessageChange: (value: string) => void;
  onToggleRequirement: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const options = [
    "Updated fee receipt",
    "College ID",
    "Student ID",
    "College email verification",
    "Academic information",
    "Other",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Request Additional Information"
      description="Select required information and provide a clear message to the student."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Required information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onToggleRequirement(opt)}
                className={`h-9 rounded-xl border text-xs font-semibold text-left px-3 ${
                  requirements.includes(opt)
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground">Message</label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Send Request</Button>
        </div>
      </div>
    </Modal>
  );
}

export function VerificationMethodCard({ request }: { request: VerificationRequest }) {
  return (
    <Card className="p-4 border-border/80 bg-card">
      <h3 className="text-sm font-bold text-foreground">Verification Method</h3>
      <div className="mt-3 text-xs space-y-2">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Method</span>
          <span className="font-semibold text-foreground">{request.verificationMethod}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Result</span>
          <span className="font-semibold text-foreground text-right">{request.verificationResult}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Risk</span>
          <RiskIndicator risk={request.riskLevel} />
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Priority</span>
          <span className="inline-flex items-center gap-1 text-foreground font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {request.priority}
          </span>
        </div>
      </div>
    </Card>
  );
}
