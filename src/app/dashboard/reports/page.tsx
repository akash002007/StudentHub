"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flag,
  Shield,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Info,
  ExternalLink,
  PlusCircle,
  Briefcase,
  Building2,
  Layers,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TrustSafetyReport, TrustSafetyEntityType } from "@/types";
import { ReportModal } from "@/components/trust-safety/ReportModal";
import { useToast } from "@/context/ToastContext";

export default function StudentMyReportsPage() {
  const [reports, setReports] = useState<TrustSafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TrustSafetyReport | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const { error: toastError } = useToast();

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trust-safety/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      toastError("Failed to load your submitted reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>;
      case "INVESTIGATION":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">Under Investigation</span>;
      case "TRIAGED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">Triaged</span>;
      case "DISMISSED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">Dismissed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Submitted</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Trust & Safety Reports</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Track the status and resolution updates for issues you have reported
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Report</span>
        </Button>
      </div>

      {/* Trust & Safety Assurance Banner */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-300">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          CommandSkill takes community integrity seriously. Your identity is kept strictly confidential
          and will never be shared with reported recruiters, companies, or peers.
        </p>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading your reports...</div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Case ID</th>
                  <th className="py-3.5 px-4 font-semibold">Reported Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted On</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">#{r.caseNumber}</td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 max-w-[200px]">
                        <p className="font-semibold text-slate-200 truncate">{r.targetTitle}</p>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{r.entityType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{r.category}</td>
                    <td className="py-4 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(r)}
                        className="text-xs flex items-center gap-1 ml-auto hover:bg-white/10"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Status</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Reports Filed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have not submitted any Trust & Safety reports. If you encounter scam offers, fees, or abusive behavior, use the Report button.
            </p>
          </div>
        )}
      </div>

      {/* Report Status Detail Modal (Non-sensitive updates only) */}
      <Modal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        maxWidth="md"
      >
        {selectedReport && (
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-rose-400">
                  Case #{selectedReport.caseNumber}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedReport.targetTitle}
                </h3>
                <span className="text-xs text-slate-400">{selectedReport.category}</span>
              </div>
              <div>{getStatusBadge(selectedReport.status)}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Your Submission</span>
                <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-slate-300 leading-relaxed">
                  &quot;{selectedReport.description}&quot;
                </div>
              </div>

              {/* Resolution Update (Non-sensitive) */}
              {selectedReport.resolutionNotes ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-1.5 text-emerald-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Review Conclusion</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {selectedReport.resolutionNotes}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex items-center gap-2 text-slate-400">
                  <Clock3 className="w-4 h-4 text-purple-400" />
                  <span>Our moderation team is actively reviewing this case.</span>
                </div>
              )}

              <div className="text-[11px] text-slate-500 pt-2 border-t border-white/5 flex justify-between">
                <span>Submitted: {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                {selectedReport.resolvedAt && (
                  <span>Concluded: {new Date(selectedReport.resolvedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* General Report Submission Modal */}
      <ReportModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        entityType="OPPORTUNITY"
        targetId="general_incident"
        targetTitle="General Platform Incident"
        onSuccess={() => {
          loadReports();
        }}
      />
    </div>
  );
}
