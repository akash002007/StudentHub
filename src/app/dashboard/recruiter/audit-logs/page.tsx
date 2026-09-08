"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import { RecruiterAuditLogEntry } from "@/types";

export default function RecruiterAuditLogsPage() {
  const { success, error: toastError } = useToast();

  const [logs, setLogs] = useState<RecruiterAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.append("action", actionFilter);
      if (searchQuery) params.append("query", searchQuery);

      const res = await fetch(`/api/recruiter/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn("Failed to fetch recruiter audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = "Timestamp,Actor,Role,Action,Target Type,Target Name,Previous State,New State,Reason,Details,Session\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.targetType}","${l.targetName || ""}","${l.previousState || ""}","${l.newState || ""}","${l.reason || ""}","${l.details.replace(/"/g, '""')}","${l.ipSessionRef || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `recruiter_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Recruiter audit log trail exported as CSV.");
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Immutable Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recruiter Audit Log Trail
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Every sensitive action is cryptographically recorded: drive creation, eligibility overrides, assessment scoring, stage movement, and result publication.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs} isLoading={isLoading}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button variant="gradient" size="sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Audit Actions</option>
              <option value="DRIVE_CREATED">Drive Created</option>
              <option value="DRIVE_PUBLISHED">Drive Published</option>
              <option value="ELIGIBILITY_OVERRIDDEN">Eligibility Overridden</option>
              <option value="CANDIDATE_SHORTLISTED">Candidate Shortlisted</option>
              <option value="ASSESSMENT_SCORE_RECORDED">Assessment Score Recorded</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="INTERVIEW_EVALUATION_RECORDED">Interview Evaluation</option>
              <option value="RESULTS_PUBLISHED">Results Published</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by actor, candidate, reason..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Target Entity</th>
                  <th className="px-4 py-3 font-semibold">State Transition</th>
                  <th className="px-4 py-3 font-semibold">Details & Justification</th>
                  <th className="px-4 py-3 font-semibold">Session Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No audit log records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground">{log.actorName}</div>
                        <div className="text-[10px] text-muted-foreground">{log.actorRole}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            log.action.includes("OVERRIDDEN")
                              ? "rose"
                              : log.action.includes("PUBLISHED")
                              ? "purple"
                              : "blue"
                          }
                          size="sm"
                          className="font-bold text-[10px]"
                        >
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-medium text-foreground">
                          {log.targetName || log.targetId}
                        </span>
                        <div className="text-[10px] text-muted-foreground">{log.targetType}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {log.previousState && log.newState ? (
                          <span className="flex items-center gap-1">
                            <span className="text-muted-foreground">{log.previousState}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-bold text-foreground">{log.newState}</span>
                          </span>
                        ) : log.newState ? (
                          <span className="font-bold text-foreground">{log.newState}</span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="text-foreground font-medium leading-snug">{log.details}</div>
                        {log.reason && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                            Reason: {log.reason}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[10px] text-muted-foreground">
                        {log.ipSessionRef || "127.0.0.1"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
