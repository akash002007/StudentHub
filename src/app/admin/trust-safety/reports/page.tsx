"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Flag,
  Search,
  RefreshCw,
  Filter,
  Eye,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  XCircle,
  Building2,
  Briefcase,
  User,
  Layers,
  ArrowUpDown,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TrustSafetyReport, TrustSafetyStatus, ReportPriority, TrustSafetyEntityType } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminReportsQueuePage() {
  const [reports, setReports] = useState<TrustSafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState("ALL");

  const { error: toastError } = useToast();

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);
      if (entityTypeFilter !== "ALL") params.append("entityType", entityTypeFilter);

      const res = await fetch(`/api/trust-safety/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      toastError("Failed to fetch reports queue.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, priorityFilter, entityTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getPriorityBadge = (priority: ReportPriority) => {
    switch (priority) {
      case "CRITICAL":
        return <Badge variant="rose" className="font-mono text-[10px] uppercase font-bold tracking-wider">CRITICAL</Badge>;
      case "HIGH":
        return <Badge variant="rose" className="font-mono text-[10px] uppercase">HIGH</Badge>;
      case "MEDIUM":
        return <Badge variant="purple" className="font-mono text-[10px] uppercase">MEDIUM</Badge>;
      case "LOW":
        return <Badge variant="blue" className="font-mono text-[10px] uppercase">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: TrustSafetyStatus) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">Submitted</span>;
      case "TRIAGED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Triaged</span>;
      case "INVESTIGATION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">Investigation</span>;
      case "DECISION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Decision</span>;
      case "ACTION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Enforcement</span>;
      case "RESOLVED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>;
      case "ESCALATED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-300 border border-rose-500/20">Escalated</span>;
      case "DISMISSED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">Dismissed</span>;
    }
  };

  const getEntityIcon = (type: TrustSafetyEntityType) => {
    switch (type) {
      case "RECRUITER":
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case "COMPANY":
        return <Building2 className="w-3.5 h-3.5 text-purple-400" />;
      case "OPPORTUNITY":
      case "JOB":
      case "INTERNSHIP":
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      case "STUDENT":
      case "PROFILE":
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Flag className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Trust & Safety Moderation Queue
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Triage incoming community reports, assign investigators, review evidence, and execute enforcement
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/trust-safety/investigations">
            <Button variant="secondary" size="sm" className="text-xs">
              Active Investigations
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search case, target, reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="TRIAGED">Triaged</option>
              <option value="INVESTIGATION">Investigation</option>
              <option value="DECISION">Decision</option>
              <option value="ACTION">Action / Enforcement</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ESCALATED">Escalated</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
            >
              <option value="ALL">All Entity Types</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="COMPANY">Company</option>
              <option value="OPPORTUNITY">Opportunity / Job</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="STUDENT">Student</option>
              <option value="MESSAGE">Message</option>
              <option value="CERTIFICATE">Certificate</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <span>
            Found <strong className="text-white">{reports.length}</strong> moderation cases
          </span>
          {(search || statusFilter !== "ALL" || priorityFilter !== "ALL" || entityTypeFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
                setEntityTypeFilter("ALL");
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading cases...</div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Case</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Reporter</th>
                  <th className="py-3.5 px-4 font-semibold">Created</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      <Link
                        href={`/admin/trust-safety/reports/${r.id}`}
                        className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{r.caseNumber}</span>
                        {r.priority === "CRITICAL" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {getEntityIcon(r.entityType)}
                        <span className="font-medium text-[11px] uppercase">{r.entityType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 max-w-[220px]">
                        <p className="font-semibold text-slate-200 truncate">{r.targetTitle}</p>
                        {r.reportedCompanyName && (
                          <p className="text-[11px] text-slate-400 truncate">{r.reportedCompanyName}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-[180px] truncate">{r.category}</td>
                    <td className="py-4 px-4">{getPriorityBadge(r.priority)}</td>
                    <td className="py-4 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-300">{r.reporterName}</p>
                        <p className="text-[10px] text-slate-500">{r.reporterRole || "STUDENT"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/trust-safety/reports/${r.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-medium transition-colors"
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
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No matching cases found</h4>
            <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
