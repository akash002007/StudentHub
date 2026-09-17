"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EntitySafetyHistory, TrustSafetyEntityType } from "@/types";

export interface EntityTrustSafetyWidgetProps {
  entityType: TrustSafetyEntityType | string;
  entityId: string;
  entityName: string;
  verificationStatus?: string;
  companyId?: string;
  className?: string;
}

export function EntityTrustSafetyWidget({
  entityType,
  entityId,
  entityName,
  verificationStatus = "Verified",
  companyId,
  className,
}: EntityTrustSafetyWidgetProps) {
  const [history, setHistory] = useState<EntitySafetyHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("entityType", entityType);
        params.append("entityId", entityId);
        if (companyId) params.append("companyId", companyId);

        const res = await fetch(`/api/trust-safety/entity-history?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history);
        }
      } catch (err) {
        console.warn("Failed to load entity safety history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [entityType, entityId, companyId]);

  return (
    <div className={className}>
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Trust & Safety Dossier
              </h3>
              <p className="text-[11px] text-slate-400">
                Independent compliance and abuse history
              </p>
            </div>
          </div>

          <Link
            href={`/admin/trust-safety/reports?search=${encodeURIComponent(entityName || entityId)}`}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>View Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Verification vs Trust & Safety Side-by-Side Notice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Verification Box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Identity Verification
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{verificationStatus}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Legitimate credentials & legal identity verified.
            </p>
          </div>

          {/* Trust & Safety Box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Abuse & Compliance
            </span>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {history && history.totalReports > 0 ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {history.totalReports} Incidents Filed
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Clean Record
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Verification does not excuse platform misconduct.
            </p>
          </div>
        </div>

        {/* Telemetry Metrics */}
        {isLoading ? (
          <div className="text-xs text-slate-400 py-2">Loading safety metrics...</div>
        ) : history ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Reports</span>
              <span className="text-lg font-bold text-white">{history.totalReports}</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Violations</span>
              <span className={`text-lg font-bold ${history.confirmedViolations > 0 ? "text-rose-400" : "text-slate-300"}`}>
                {history.confirmedViolations}
              </span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Active Cases</span>
              <span className={`text-lg font-bold ${history.activeInvestigations > 0 ? "text-amber-400" : "text-slate-300"}`}>
                {history.activeInvestigations}
              </span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Warnings</span>
              <span className="text-lg font-bold text-slate-300">{history.warningsCount}</span>
            </div>
          </div>
        ) : null}

        {/* Current Restrictions Indicator */}
        {history && history.currentRestrictions && history.currentRestrictions.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Active Restrictions: {history.currentRestrictions.join(", ")}</span>
            </div>
            <Link
              href="/admin/trust-safety/restricted"
              className="text-[11px] underline hover:text-white"
            >
              Manage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
