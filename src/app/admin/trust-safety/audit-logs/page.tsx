"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Filter,
  Shield,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AuditLogEntry } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminTrustSafetyAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (actionFilter !== "ALL") params.append("action", actionFilter);

      const res = await fetch(`/api/trust-safety/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      toastError("Failed to fetch Trust & Safety audit logs.");
    } finally {
      setIsLoading(false);
    }
  }, [query, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    const headers = "Timestamp,Actor,Action,Target Type,Target ID,Target Name,Previous Status,New Status,Reason,Details\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.admin}","${l.action}","${l.targetType || "N/A"}","${l.targetId || "N/A"}","${l.targetName || l.student || "N/A"}","${l.previousStatus || "N/A"}","${l.newStatus || "N/A"}","${l.reason || "N/A"}","${(l.details || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `commandskill_trust_safety_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Trust & Safety audit logs exported.");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Trust & Safety Audit Trail
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Tamper-evident log of all triage decisions, priority shifts, notes, and enforcement actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by actor, target, reason..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="ALL">All Audit Actions</option>
            <option value="REPORT_CREATED">Report Created</option>
            <option value="STATUS_CHANGED">Status Changed</option>
            <option value="PRIORITY_CHANGED">Priority Changed</option>
            <option value="NOTE_ADDED">Note Added</option>
            <option value="EVIDENCE_ADDED">Evidence Added</option>
            <option value="OPPORTUNITY_RESTRICTED">Opportunity Restricted</option>
            <option value="USER_RESTRICTED">User Restricted</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="REPORT_RESOLVED">Report Resolved</option>
            <option value="REPORT_DISMISSED">Report Dismissed</option>
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            <strong className="text-white">{logs.length}</strong> events
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Actor</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Target</th>
                  <th className="py-3.5 px-4 font-semibold">State Transition</th>
                  <th className="py-3.5 px-4 font-semibold">Audit Details & Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{l.admin}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-[180px]">
                        <p className="text-slate-200 font-medium truncate">{l.targetName || l.student || "N/A"}</p>
                        {l.targetType && (
                          <span className="text-[9px] uppercase font-mono text-slate-500">
                            {l.targetType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {l.previousStatus !== "N/A" || l.newStatus !== "N/A" ? (
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="text-slate-500">{l.previousStatus || "INIT"}</span>
                          <span className="text-slate-600">→</span>
                          <span className="text-emerald-400 font-bold">{l.newStatus}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-[320px]">
                      <p className="text-slate-300 truncate">{l.details}</p>
                      {l.reason && (
                        <p className="text-[11px] text-slate-500 truncate">Reason: {l.reason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No audit events found</h4>
            <p className="text-xs text-slate-500">Events appear here whenever administrative moderation actions are executed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
