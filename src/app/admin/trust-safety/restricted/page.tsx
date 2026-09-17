"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Search,
  RefreshCw,
  Building2,
  Briefcase,
  Layers,
  User,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { TrustSafetyReport } from "@/types";

export default function AdminRestrictedEntitiesPage() {
  const [reports, setReports] = useState<TrustSafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Restore Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [targetToRestore, setTargetToRestore] = useState<{
    targetType: string;
    targetId: string;
    targetTitle: string;
  } | null>(null);
  const [restoreReason, setRestoreReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trust-safety/reports");
      if (res.ok) {
        const data = await res.json();
        // Filter reports that have an active enforcement action
        const restricted = (data.reports || []).filter(
          (r: TrustSafetyReport) =>
            r.enforcementAction &&
            [
              "OPPORTUNITY_RESTRICTED",
              "USER_RESTRICTED",
              "RECRUITER_SUSPENDED",
              "COMPANY_SUSPENDED",
              "ACCOUNT_SUSPENDED",
              "ACCOUNT_BANNED",
            ].includes(r.enforcementAction)
        );
        setReports(restricted);
      }
    } catch {
      toastError("Failed to load restricted entities.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRestore = (r: TrustSafetyReport) => {
    setTargetToRestore({
      targetType: r.entityType,
      targetId: r.reportedOpportunityId || r.reportedUserId || r.targetId,
      targetTitle: r.targetTitle,
    });
    setRestoreReason("");
    setIsRestoreModalOpen(true);
  };

  const handleExecuteRestore = async () => {
    if (!targetToRestore) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/trust-safety/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: targetToRestore.targetType,
          targetId: targetToRestore.targetId,
          reason: restoreReason.trim() || "Reinstated by administrator after review",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(`${targetToRestore.targetTitle} has been reinstated.`);
        setIsRestoreModalOpen(false);
        loadData();
      } else {
        toastError(data.error || "Failed to reinstate entity.");
      }
    } catch {
      toastError("Network error while reinstating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = reports.filter(
    (r) =>
      r.targetTitle.toLowerCase().includes(search.toLowerCase()) ||
      (r.enforcementAction && r.enforcementAction.toLowerCase().includes(search.toLowerCase())) ||
      (r.enforcementReason && r.enforcementReason.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Restricted Entities Console</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review currently restricted opportunities, suspended recruiter accounts, and restricted companies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="text-xs flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/trust-safety/enforcement">
            <Button variant="secondary" size="sm" className="text-xs">
              Enforcement History
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search restricted entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <span className="text-xs text-slate-400">
          <strong className="text-white">{filtered.length}</strong> active restrictions
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading restricted entities...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Restricted Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Entity Type</th>
                  <th className="py-3.5 px-4 font-semibold">Enforcement Action</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Justification / Reason</th>
                  <th className="py-3.5 px-4 font-semibold">Enforced By</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 max-w-[200px]">
                        <p className="font-bold text-white truncate">{r.targetTitle}</p>
                        <span className="text-[10px] font-mono text-slate-500">Case #{r.caseNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="purple" className="text-[10px] uppercase font-mono">
                        {r.entityType}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="rose" className="text-[10px] uppercase font-mono">
                        {r.enforcementAction}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-mono text-[11px]">
                      {r.enforcementDuration || "PERMANENT"}
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-[240px] truncate">
                      {r.enforcementReason || "Policy non-compliance"}
                    </td>
                    <td className="py-4 px-4 text-slate-400">{r.enforcedBy || "Admin"}</td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRestore(r)}
                        className="text-xs hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center gap-1.5 ml-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reinstate</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No active restrictions</h4>
            <p className="text-xs text-slate-500">All opportunities and accounts are in healthy standing.</p>
          </div>
        )}
      </div>

      {/* Restore Modal */}
      <Modal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} maxWidth="md">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reinstate Restricted Entity</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{targetToRestore?.targetTitle}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Restoring this {targetToRestore?.targetType.toLowerCase()} will remove the active restriction
              and reactivate normal platform capabilities.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reinstatement Reason / Compliance Note
              </label>
              <textarea
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="e.g. Recruiter cleared security review; opportunity compensation verified..."
                rows={3}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="outline" size="sm" onClick={() => setIsRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleExecuteRestore}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              {isSubmitting ? "Reinstating..." : "Confirm Reinstatement"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
