"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Download, FileText, Filter } from "lucide-react";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AuditLogEntry } from "@/types";
import { EmptyState, SkeletonLoader } from "@/components/admin/common";
import { useToast } from "@/context/ToastContext";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (actionFilter !== "All") params.append("action", actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn("Failed to fetch audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [query, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    const headers = "Timestamp,Admin,Action,Student,Previous Status,New Status,IP / Session,Details\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.admin}","${l.action}","${l.student}","${l.previousStatus}","${l.newStatus}","${l.ipSessionRef}","${l.details}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `studenthub_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Audit logs exported as CSV.");
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card className="p-5 border-border/80 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-bold text-foreground">Audit Log Trail (Immutable)</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Every sensitive admin action is recorded for compliance and security, including student verification decisions, document inspections, information requests, and status changes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs} isLoading={isLoading}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="p-4 border-border/80 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search audit logs by admin name, student name, action, or details..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Audit Actions</option>
              <option value="ADMIN_APPROVED_STUDENT">ADMIN_APPROVED_STUDENT</option>
              <option value="ADMIN_REJECTED_STUDENT">ADMIN_REJECTED_STUDENT</option>
              <option value="ADMIN_REQUESTED_INFORMATION">ADMIN_REQUESTED_INFORMATION</option>
              <option value="STUDENT_SUBMITTED_VERIFICATION">STUDENT_SUBMITTED_VERIFICATION</option>
              <option value="STUDENT_RESUBMITTED_VERIFICATION">STUDENT_RESUBMITTED_VERIFICATION</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader className="h-96 w-full" />
      ) : logs.length > 0 ? (
        <AuditLogTable rows={logs} />
      ) : (
        <EmptyState
          title="No audit log entries found"
          description="No audit logs matched your search or action filter."
          actionLabel="Reset Search"
          onAction={() => {
            setQuery("");
            setActionFilter("All");
          }}
        />
      )}
    </div>
  );
}
