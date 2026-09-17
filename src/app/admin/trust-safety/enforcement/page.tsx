"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TrustSafetyReport } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminEnforcementHistoryPage() {
  const [reports, setReports] = useState<TrustSafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trust-safety/reports");
      if (res.ok) {
        const data = await res.json();
        const enforced = (data.reports || []).filter(
          (r: TrustSafetyReport) => r.enforcementAction && r.enforcementAction !== "NO_ACTION"
        );
        setReports(enforced);
      }
    } catch {
      toastError("Failed to load enforcement history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.targetTitle.toLowerCase().includes(search.toLowerCase()) ||
      (r.enforcementAction && r.enforcementAction.toLowerCase().includes(search.toLowerCase())) ||
      (r.enforcementReason && r.enforcementReason.toLowerCase().includes(search.toLowerCase())) ||
      (r.enforcedBy && r.enforcedBy.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Enforcement History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical record of all warnings, opportunity restrictions, user restrictions, and suspensions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="text-xs flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/trust-safety/reports">
            <Button variant="primary" size="sm" className="text-xs">
              Moderation Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search enforcement history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>
        <span className="text-xs text-slate-400">
          <strong className="text-white">{filtered.length}</strong> enforcement events logged
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading enforcement history...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Case</th>
                  <th className="py-3.5 px-4 font-semibold">Enforced Target</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Reason / Justification</th>
                  <th className="py-3.5 px-4 font-semibold">Moderator</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">#{r.caseNumber}</td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 max-w-[200px]">
                        <p className="font-semibold text-slate-200 truncate">{r.targetTitle}</p>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{r.entityType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="rose" className="text-[10px] uppercase font-mono">
                        {r.enforcementAction}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300 text-[11px]">
                      {r.enforcementDuration || "PERMANENT"}
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-[240px] truncate">
                      {r.enforcementReason || "Policy non-compliance"}
                    </td>
                    <td className="py-4 px-4 text-slate-400">{r.enforcedBy || "Moderator"}</td>
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {r.enforcedAt ? new Date(r.enforcedAt).toLocaleDateString() : new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/trust-safety/reports/${r.id}`}
                        className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No enforcement records found</h4>
            <p className="text-xs text-slate-500">All cases currently resolved without disciplinary action.</p>
          </div>
        )}
      </div>
    </div>
  );
}
