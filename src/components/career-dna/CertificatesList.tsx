"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Plus,
  ShieldCheck,
  Building,
  Calendar,
  ExternalLink,
  Trash2,
  Eye,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CertificateRecord, CertificateDNA } from "@/types";
import { AddCertificateModal } from "./AddCertificateModal";
import { CertificateDetailModal } from "./CertificateDetailModal";

export function CertificatesList() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [certificateDNA, setCertificateDNA] = useState<CertificateDNA | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCertificates = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/certificates?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
        setCertificateDNA(data.certificateDNA || null);
      }
    } catch {
      console.warn("Failed to fetch certificates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const handleDelete = async (certId: string) => {
    if (!user) return;
    setDeletingId(certId);
    try {
      const res = await fetch(`/api/certificates/${certId}?userId=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Certificate deleted successfully.");
        fetchCertificates();
      } else {
        toastError("Failed to delete certificate.");
      }
    } catch {
      toastError("Error deleting certificate.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: CertificateRecord["verificationStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="emerald" size="sm">VERIFIED</Badge>;
      case "PARTIALLY_VERIFIED":
        return <Badge variant="purple" size="sm">PARTIALLY VERIFIED</Badge>;
      case "UNABLE_TO_VERIFY":
        return <Badge variant="secondary" size="sm">UNABLE TO VERIFY</Badge>;
      case "SUSPICIOUS":
        return <Badge variant="rose" size="sm">SUSPICIOUS</Badge>;
      default:
        return <Badge variant="secondary" size="sm">PROCESSING</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-card via-card to-amber-950/10 border border-amber-500/20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Certificates & Credentials</h2>
            <p className="text-xs text-muted-foreground">
              Add certificates to strengthen your verified career profile and evidence-based Career DNA.
            </p>

            {certificateDNA && (
              <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold text-muted-foreground">
                <span className="text-emerald-500 font-bold">{certificateDNA.verifiedCount} Verified</span>
                <span>•</span>
                <span className="text-purple-500 font-bold">{certificateDNA.partiallyVerifiedCount} Partially Verified</span>
                <span>•</span>
                <span>{certificateDNA.totalCertificates} Total</span>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Certificate
        </Button>
      </div>

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <p className="text-xs">Loading certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/80 bg-card/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-foreground">No Certificates Added Yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload certificates from online courses, workshops, hackathons, or university events to verify your skills.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Upload First Certificate
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              hoverEffect
              className="p-5 border-border/80 bg-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{cert.certificateTitle}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{cert.courseName}</p>
                    </div>
                  </div>
                  {getStatusBadge(cert.verificationStatus)}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-muted-foreground" /> Issuer:
                    </span>
                    <span className="font-bold text-foreground">{cert.issuerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Issue Date:
                    </span>
                    <span className="font-medium text-foreground">{cert.issueDate || "N/A"}</span>
                  </div>
                  {cert.credentialId && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-muted-foreground" /> Credential ID:
                      </span>
                      <span className="font-mono font-bold text-foreground">{cert.credentialId}</span>
                    </div>
                  )}
                </div>

                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cert.skills.slice(0, 4).map((sk, idx) => (
                      <Badge key={idx} variant="secondary" size="sm" className="text-[10px]">
                        {sk}
                      </Badge>
                    ))}
                    {cert.skills.length > 4 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{cert.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCert(cert)}
                  className="text-xs h-8"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> View Audit Details
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cert.id)}
                  disabled={deletingId === cert.id}
                  className="h-8 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  {deletingId === cert.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddCertificateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => fetchCertificates()}
      />

      <CertificateDetailModal
        certificate={selectedCert}
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
}
