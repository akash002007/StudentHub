"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  ShieldAlert,
  Users,
  Building2,
  Briefcase,
  FileText,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TrustSafetyMetrics, TrustSafetyReport } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminTrustSafetyOverviewPage() {
  const [metrics, setMetrics] = useState<TrustSafetyMetrics | null>(null);
  const [recentReports, setRecentReports] = useState<TrustSafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, rRes] = await Promise.all([
        fetch("/api/trust-safety/metrics"),
        fetch("/api/trust-safety/reports?limit=5"),
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setRecentReports(rData.reports || []);
      }
    } catch (err) {
      toastError("Failed to load Trust & Safety dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "rose";
      case "HIGH":
        return "rose";
      case "MEDIUM":
        return "purple";
      default:
        return "blue";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "INVESTIGATION":
        return "purple";
      case "TRIAGED":
        return "blue";
      case "ACTION":
        return "rose";
      case "RESOLVED":
        return "emerald";
      case "DISMISSED":
        return "lavender";
      default:
        return "blue";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Trust & Safety Command Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Abuse detection, platform moderation, opportunity restrictions, and enforcement
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/trust-safety/reports">
            <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5">
              <span>Moderation Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Distinction Banner: Verification vs Trust & Safety */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-white">
              Two Distinct Systems: Verification vs. Trust & Safety
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              <strong>Verification</strong> answers <em>&quot;Is this entity legitimate?&quot;</em> whereas{" "}
              <strong>Trust & Safety</strong> answers <em>&quot;Is this platform being abused?&quot;</em> A verified recruiter
              or enterprise can still violate community standards and face restrictions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <Link
            href="/admin/verification"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            Verification Queue
          </Link>
          <Link
            href="/admin/trust-safety/restricted"
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors font-medium"
          >
            Restricted Entities
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Open Reports */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Open Reports</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {metrics ? metrics.openReports : "--"}
            </span>
            <span className="text-xs text-amber-400 font-medium">Active queue</span>
          </div>
        </div>

        {/* Critical Reports */}
        <div className="bg-slate-900/60 border border-rose-500/20 rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-300">Critical Reports</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400">
              {metrics ? metrics.criticalReports : "--"}
            </span>
            <span className="text-xs text-rose-300/80 font-medium">Needs triage</span>
          </div>
        </div>

        {/* Under Investigation */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Investigating</span>
            <Clock3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-300">
              {metrics ? metrics.underInvestigation : "--"}
            </span>
            <span className="text-xs text-indigo-400/80 font-medium">Assigned</span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">
              {metrics ? metrics.resolvedToday : "--"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {metrics ? `${metrics.resolutionRate}% rate` : ""}
            </span>
          </div>
        </div>

        {/* Suspended Entities */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Restricted</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-200">
              {metrics ? metrics.suspendedEntities : "--"}
            </span>
            <span className="text-xs text-slate-400 font-medium">Enforced</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports by Category */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Reports by Category</span>
            </h3>
            <span className="text-xs text-slate-400">Volume</span>
          </div>

          <div className="space-y-3">
            {metrics && Object.entries(metrics.reportsByCategory).length > 0 ? (
              Object.entries(metrics.reportsByCategory).slice(0, 5).map(([cat, count]) => {
                const total = metrics.openReports + (metrics.resolvedToday || 1);
                const percent = Math.min(100, Math.round((count / Math.max(1, total)) * 100));
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[200px]">{cat}</span>
                      <span className="text-slate-400 font-mono">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">No categories recorded yet.</div>
            )}
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Priority Distribution</h3>
            <span className="text-xs text-slate-400">Severity</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">Critical</span>
              <span className="text-2xl font-bold text-rose-400">
                {metrics?.priorityDistribution?.CRITICAL || 0}
              </span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">High</span>
              <span className="text-2xl font-bold text-amber-400">
                {metrics?.priorityDistribution?.HIGH || 0}
              </span>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-300 block">Medium</span>
              <span className="text-2xl font-bold text-purple-300">
                {metrics?.priorityDistribution?.MEDIUM || 0}
              </span>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Low</span>
              <span className="text-2xl font-bold text-blue-300">
                {metrics?.priorityDistribution?.LOW || 0}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Overall Resolution Rate</span>
              <span className="font-bold text-emerald-400">{metrics?.resolutionRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts & Repeat Offender Signals */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Moderation Shortcuts</span>
          </h3>

          <div className="space-y-2">
            <Link
              href="/admin/trust-safety/reports?priority=CRITICAL"
              className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="font-medium text-rose-200">View Critical Queue</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/trust-safety/investigations"
              className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 text-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Clock3 className="w-4 h-4 text-indigo-400" />
                <span className="font-medium text-indigo-200">Active Investigations</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/trust-safety/restricted"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-slate-200">Manage Restricted Entities</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/trust-safety/audit-logs"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-200">Trust & Safety Audit Trail</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Investigations Spotlight */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Trust & Safety Cases</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live case telemetry from students, recruiters, and platform abuse monitors
            </p>
          </div>
          <Link
            href="/admin/trust-safety/reports"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-xs text-slate-400 py-8 text-center">Loading cases...</div>
        ) : recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="pb-3 font-semibold">Case</th>
                  <th className="pb-3 font-semibold">Target Entity</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Reporter</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-mono font-bold text-white">
                      <Link
                        href={`/admin/trust-safety/reports/${r.id}`}
                        className="hover:text-rose-400 transition-colors"
                      >
                        {r.caseNumber}
                      </Link>
                    </td>
                    <td className="py-3.5">
                      <div className="space-y-0.5 max-w-[200px]">
                        <p className="font-semibold text-slate-200 truncate">{r.targetTitle}</p>
                        <span className="text-[10px] uppercase font-mono text-slate-400">
                          {r.entityType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300 max-w-[180px] truncate">{r.category}</td>
                    <td className="py-3.5">
                      <Badge variant={getPriorityBadgeVariant(r.priority)} className="text-[10px] font-mono uppercase">
                        {r.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      <Badge variant={getStatusBadgeVariant(r.status)} className="text-[10px] uppercase">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-slate-400">{r.reporterName}</td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/trust-safety/reports/${r.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Investigate</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-8 text-center">No reports in the queue.</div>
        )}
      </div>
    </div>
  );
}
