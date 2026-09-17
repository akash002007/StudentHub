"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock3,
  Search,
  RefreshCw,
  Eye,
  Shield,
  Briefcase,
  Building2,
  Layers,
  User,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TrustSafetyReport } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminInvestigationsPage() {
  const [reports, setReports] = useState<TrustSafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trust-safety/reports?status=INVESTIGATION");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      toastError("Failed to load active investigations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.targetTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      (r.assignedModeratorName && r.assignedModeratorName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Clock3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Active Investigations</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cases currently undergoing moderator review, evidence validation, and cross-examination
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
              View All Reports
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
            placeholder="Search active investigations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <span className="text-xs text-slate-400">
          <strong className="text-white">{filtered.length}</strong> active cases
        </span>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">Loading active investigations...</div>
        ) : filtered.length > 0 ? (
          filtered.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900/60 border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-4 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">#{r.caseNumber}</span>
                    <Badge variant="rose" className="text-[10px] font-mono uppercase">
                      {r.priority}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">{r.targetTitle}</h3>
                  <span className="text-xs text-slate-400">{r.category}</span>
                </div>
                <Badge variant="purple" className="text-[10px] uppercase">
                  {r.entityType}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 border border-white/5 rounded-xl p-3">
                &quot;{r.description}&quot;
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <div>
                  <span>Investigator: </span>
                  <strong className="text-slate-200">{r.assignedModeratorName || "Unassigned"}</strong>
                </div>
                <Link
                  href={`/admin/trust-safety/reports/${r.id}`}
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">
            No active investigations found.
          </div>
        )}
      </div>
    </div>
  );
}
