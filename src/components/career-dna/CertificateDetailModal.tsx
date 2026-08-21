"use client";

import React from "react";
import {
  Award,
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  Calendar,
  FileCheck,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CertificateRecord } from "@/types";

interface CertificateDetailModalProps {
  certificate: CertificateRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateDetailModal({
  certificate,
  isOpen,
  onClose,
}: CertificateDetailModalProps) {
  if (!isOpen || !certificate) return null;

  const getStatusBadge = () => {
    switch (certificate.verificationStatus) {
      case "VERIFIED":
        return <Badge variant="emerald" size="md">VERIFIED CREDENTIAL</Badge>;
      case "PARTIALLY_VERIFIED":
        return <Badge variant="purple" size="md">PARTIALLY VERIFIED</Badge>;
      case "UNABLE_TO_VERIFY":
        return <Badge variant="secondary" size="md">UNABLE TO VERIFY</Badge>;
      case "SUSPICIOUS":
        return <Badge variant="rose" size="md">SUSPICIOUS DOCUMENT</Badge>;
      default:
        return <Badge variant="secondary" size="md">ANALYSIS FAILED</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-foreground">{certificate.certificateTitle}</h2>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-muted-foreground">{certificate.courseName}</p>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground block">Recipient:</span>
              <span className="font-bold text-foreground">{certificate.recipientName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground block">Issuer:</span>
              <span className="font-bold text-foreground">{certificate.issuerName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground block">Issue Date:</span>
              <span className="font-medium text-foreground">{certificate.issueDate || "Not Specified"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground block">Credential ID:</span>
              <span className="font-mono font-bold text-foreground">{certificate.credentialId || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Verification Evidence Audit Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Verification Evidence Audit
          </h3>

          <div className="space-y-2">
            {certificate.evidenceStatements && certificate.evidenceStatements.length > 0 ? (
              certificate.evidenceStatements.map((stmt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-card border border-border/60 text-xs font-medium flex items-start gap-2 text-foreground"
                >
                  {stmt.startsWith("✓") ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : stmt.startsWith("⚠") ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <span>{stmt}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No evidence audit statements available.</p>
            )}
          </div>
        </div>

        {/* Skills Detected */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" /> Detected Skills & Technologies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {certificate.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Verification Link */}
        {certificate.verificationUrl && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Official Verification Page:</span>
            <a
              href={certificate.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              Verify Online <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end pt-3 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Audit
          </Button>
        </div>
      </div>
    </div>
  );
}
