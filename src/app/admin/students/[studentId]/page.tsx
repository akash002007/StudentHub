"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Building,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  ExternalLink,
  ShieldCheck,
  Clock,
  History,
  ShieldAlert,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState, SkeletonLoader, StatusBadge } from "@/components/admin/common";
import { StudentProfile, VerificationRequest, AuditLogEntry } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function StudentDetailPage({
  params,
}: {
  params: { studentId: string };
}) {
  const router = useRouter();
  const rawId = decodeURIComponent(params.studentId);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [verificationReq, setVerificationReq] = useState<VerificationRequest | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, info } = useToast();

  const fetchStudentData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(rawId)}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setVerificationReq(data.verificationRequest);
        setAuditLogs(data.auditLogs || []);
      } else {
        setStudent(null);
      }
    } catch (err) {
      console.warn("Failed to load student details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [rawId]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader className="h-10 w-36" />
        <SkeletonLoader className="h-64 w-full" />
        <SkeletonLoader className="h-96 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        title="Student Profile Not Found"
        description={`The student ID "${rawId}" does not exist in the database.`}
        actionLabel="Back to Students"
        onAction={() => router.push("/admin/students")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/students" className="inline-flex">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Directory
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStudentData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Record
          </Button>
          {verificationReq && (
            <Link href={`/admin/verification/${verificationReq.verificationId}`}>
              <Button variant="gradient" size="sm">
                Open Active Verification Request
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Student Header Dossier Card */}
      <Card className="p-6 border-border/80 bg-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-border shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-foreground">{student.name}</h1>
                <Badge
                  variant={student.verificationStatus === "approved" ? "emerald" : "amber"}
                  size="sm"
                  className="font-bold"
                >
                  {student.verificationStatus === "approved" ? "Verified Candidate" : "Unverified / Pending"}
                </Badge>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                  {student.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {student.headline || `${student.degree} in ${student.branch} @ ${student.university}`}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {student.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  {student.university}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Academic Information & Verification Records */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Academic & Verification (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Academic Details Card */}
          <Card className="p-5 border-border/80 bg-card space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-foreground">Academic Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/70">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">University / Institution</p>
                <p className="font-semibold text-foreground mt-0.5">{student.university}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border/70">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Degree Program</p>
                <p className="font-semibold text-foreground mt-0.5">{student.degree || "B.Tech"}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border/70">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Branch / Specialization</p>
                <p className="font-semibold text-foreground mt-0.5">{student.branch || student.specialization || "Computer Science"}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border/70">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Year of Study</p>
                <p className="font-semibold text-foreground mt-0.5">{student.yearOfStudy || "3rd Year"}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border/70">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Expected Graduation</p>
                <p className="font-semibold text-foreground mt-0.5">{student.graduationYear}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border/70">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">CGPA / Grade</p>
                <p className="font-semibold text-foreground mt-0.5">{student.cgpa || "3.85 / 4.0"}</p>
              </div>
            </div>
          </Card>

          {/* Verification History & Submitted Documents */}
          <Card className="p-5 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Verification Record &amp; History</h3>
              </div>
              <Badge
                variant={student.verificationStatus === "approved" ? "emerald" : "amber"}
                size="sm"
              >
                {student.verificationStatus === "approved" ? "Approved" : student.verificationStatus === "rejected" ? "Rejected" : student.verificationStatus === "needs_information" ? "Needs Information" : "Pending"}
              </Badge>
            </div>

            {verificationReq ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Verification ID: {verificationReq.verificationId}</span>
                    <span className="text-muted-foreground">{verificationReq.submittedAt}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Method: <strong className="text-foreground">{verificationReq.verificationMethod}</strong> • Risk: <strong className="text-foreground">{verificationReq.riskLevel}</strong>
                  </p>
                  {verificationReq.document && (
                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-semibold text-foreground">{verificationReq.document.fileName}</p>
                          <p className="text-[11px] text-muted-foreground">{verificationReq.document.fileSize} • {verificationReq.document.documentType}</p>
                        </div>
                      </div>
                      <Link href={`/admin/verification/${verificationReq.verificationId}`}>
                        <Button size="sm" variant="outline">Inspect Document</Button>
                      </Link>
                    </div>
                  )}
                  {verificationReq.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                      <strong>Rejection Reason:</strong> {verificationReq.rejectionReason}
                    </div>
                  )}
                  {verificationReq.adminNotes && (
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                      <strong>Admin Notes / Requested Info:</strong> {verificationReq.adminNotes}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No verification documents have been submitted yet.</p>
            )}
          </Card>

          {/* Projects & Resume */}
          <Card className="p-5 border-border/80 bg-card space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-foreground">Projects &amp; Experience</h3>
            </div>

            {student.projects && student.projects.length > 0 ? (
              <div className="space-y-3">
                {student.projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl bg-muted/20 border border-border/70 text-xs space-y-1">
                    <p className="font-bold text-foreground">{proj.title}</p>
                    <p className="text-muted-foreground leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-foreground font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No projects listed on profile.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Skills, Certifications & Audit History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skills Card */}
          <Card className="p-5 border-border/80 bg-card space-y-3">
            <h3 className="text-sm font-bold text-foreground">Verified Skills &amp; Stack</h3>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </Card>

          {/* Certifications Card */}
          {student.certifications && student.certifications.length > 0 && (
            <Card className="p-5 border-border/80 bg-card space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Certifications</h3>
              </div>
              <div className="space-y-2 text-xs">
                {student.certifications.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-muted/20 border border-border/70">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-muted-foreground text-[11px]">{c.issuingOrganization} • {c.issueDate}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Audit History Card */}
          <Card className="p-5 border-border/80 bg-card space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">Student Audit Trail</h3>
            </div>
            <p className="text-xs text-muted-foreground">Chronological log of administrative actions on this candidate record.</p>

            <div className="space-y-2 text-xs">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">Admin: <strong className="text-foreground">{log.admin}</strong></p>
                    <p className="text-[11px] text-foreground">{log.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No audit entries recorded for this student.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
