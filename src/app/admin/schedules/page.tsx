"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CandidateInterviewRecord } from "@/types";

export default function AdminSchedulesPage() {
  const [interviews, setInterviews] = useState<CandidateInterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roundFilter, setRoundFilter] = useState("ALL");

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      // Use existing recruiter/admin calendar events endpoint
      const res = await fetch("/api/calendar?timeRange=ALL");
      if (res.ok) {
        const data = await res.json();
        const evts = data.events || [];
        // Map back to operational records for admin table
        const records: CandidateInterviewRecord[] = evts
          .filter((e: any) => e.type === "INTERVIEW")
          .map((e: any) => ({
            id: e.id,
            driveId: e.metadata?.driveId || "",
            applicationId: e.metadata?.applicationId || "",
            studentId: e.metadata?.candidateId || "",
            candidateName: e.metadata?.candidateName || e.title.split(" — ")[0],
            candidateAvatar: e.metadata?.candidateAvatar || "",
            candidateUniversity: e.metadata?.candidateUniversity || "Partner University",
            driveTitle: e.metadata?.position || e.subtitle,
            company: e.company,
            companyLogo: e.companyLogo,
            stageId: "stage_01",
            roundType: e.metadata?.roundType || "TECHNICAL",
            roundName: e.metadata?.roundName || "Round",
            roundNumber: e.metadata?.roundNumber || 1,
            type: "VIDEO",
            date: e.date,
            time: e.startTime,
            duration: e.duration,
            meetingLink: e.meetingUrl,
            interviewerName: e.metadata?.interviewerName || "Assigned Interviewer",
            interviewerRole: e.metadata?.interviewerRole,
            status: e.status,
            notes: e.description,
            createdAt: "2026-09-16T10:00:00.000Z",
          }));
        setInterviews(records);
      }
    } catch (err) {
      console.error("Failed to load operational schedule data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const totalCount = interviews.length;
  const scheduledCount = interviews.filter((i) => i.status === "SCHEDULED").length;
  const rescheduledCount = interviews.filter((i) => i.status === "RESCHEDULED").length;
  const cancelledCount = interviews.filter((i) => i.status === "CANCELLED").length;
  const completedCount = interviews.filter((i) => i.status === "COMPLETED").length;

  const filtered = interviews.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (roundFilter !== "ALL" && item.roundType !== roundFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.candidateName.toLowerCase().includes(q) ||
        (item.company || "").toLowerCase().includes(q) ||
        item.driveTitle.toLowerCase().includes(q) ||
        (item.roundName || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Operations &amp; Governance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mt-1">
            Recruitment Schedules &amp; Interview Operations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational oversight of candidate interviews, assessment schedules, cancellation rates, and meeting link availability.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInterviews}
          className="text-xs gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Pipeline
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-border bg-card">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Slotted
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{totalCount}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
            {scheduledCount} active scheduled
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Rescheduled
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{rescheduledCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Date/Time adjusted</div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Cancellations
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{cancelledCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Discontinued sessions</div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Completed
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Evaluations logged</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl border-border bg-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, company, role..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl bg-muted/60 border border-border px-3 py-1.5 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            className="text-xs rounded-xl bg-muted/60 border border-border px-3 py-1.5 font-medium"
          >
            <option value="ALL">All Rounds</option>
            <option value="FINAL">Final Round</option>
            <option value="TECHNICAL">Technical Round</option>
            <option value="HR">HR Round</option>
            <option value="SCREENING">Screening Round</option>
          </select>
        </div>
      </Card>

      {/* Operational Interview Table */}
      <Card className="rounded-2xl border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">
            <div className="h-10 bg-muted/40 rounded-xl" />
            <div className="h-10 bg-muted/40 rounded-xl" />
            <div className="h-10 bg-muted/40 rounded-xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-1">
            <div className="text-xl">📅</div>
            <p className="font-semibold">No operational interview records match current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold uppercase text-[10px]">
                  <th className="p-3.5 pl-5">Candidate</th>
                  <th className="p-3.5">Company &amp; Drive</th>
                  <th className="p-3.5">Round</th>
                  <th className="p-3.5">Date &amp; Time</th>
                  <th className="p-3.5">Meeting Link</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5">Operational Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => {
                  const isFinal = item.roundType === "FINAL" || (item.roundName || "").toLowerCase().includes("final");

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-foreground">{item.candidateName}</div>
                        <div className="text-[11px] text-muted-foreground">{item.candidateUniversity}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{item.company}</div>
                        <div className="text-[11px] text-muted-foreground">{item.driveTitle}</div>
                      </td>

                      <td className="p-3.5">
                        {isFinal ? (
                          <Badge variant="rose" className="text-[9px] px-1.5 py-0 font-extrabold flex items-center gap-1 w-fit">
                            <Sparkles className="w-2.5 h-2.5" />
                            Final Round
                          </Badge>
                        ) : (
                          <Badge variant="purple" className="text-[9px] px-1.5 py-0 w-fit">
                            {item.roundName || `${item.roundType} Round`}
                          </Badge>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-0.5">{item.interviewerName}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {item.date}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{item.time} ({item.duration})</div>
                      </td>

                      <td className="p-3.5">
                        {item.meetingLink ? (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                          >
                            <Video className="w-3.5 h-3.5" /> Google Meet
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No link assigned</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant={
                            item.status === "COMPLETED"
                              ? "emerald"
                              : item.status === "CANCELLED"
                              ? "rose"
                              : item.status === "RESCHEDULED"
                              ? "amber"
                              : "blue"
                          }
                          className="text-[10px] capitalize font-semibold"
                        >
                          {item.status.toLowerCase()}
                        </Badge>
                      </td>

                      <td className="p-3.5 pr-5 text-muted-foreground max-w-xs truncate text-[11px]">
                        {item.notes || "Standard corporate recruitment slot."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
