"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Kanban,
  List,
  Search,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";
import { ApplicationStatus, Application } from "@/types";
import { getStatusBadgeStyle } from "@/lib/utils";

const STAGES: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

export default function ApplicationsPage() {
  const { applications, updateApplicationStatus } = useData();

  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const filteredApps = applications.filter(
    (app) =>
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Application Pipeline Tracker
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage your interview rounds, test dates, and internship offers in real time.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-muted dark:bg-[#141722] border border-border dark:border-[#242938]">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "kanban"
                    ? "bg-card dark:bg-[#1e2333] text-foreground dark:text-slate-100 shadow-xs border border-border/60 dark:border-[#2e354a]"
                    : "text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-card dark:bg-[#1e2333] text-foreground dark:text-slate-100 shadow-xs border border-border/60 dark:border-[#2e354a]"
                    : "text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List / Table</span>
              </button>
            </div>

            <Link href="/dashboard/internships">
              <Button variant="gradient" size="sm" rightIcon={<Plus className="w-3.5 h-3.5" />}>
                Find More Roles
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Filter */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter applications by company or role..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-card dark:bg-[#161924] border border-border dark:border-[#2a3042] text-xs text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400/75 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30 transition-all"
          />
        </div>

        {/* Kanban View */}
        {viewMode === "kanban" ? (
          <div className="w-full overflow-x-auto pb-4 pt-1">
            <div className="flex gap-4 min-w-max">
              {STAGES.map((stage) => {
                const stageApps = filteredApps.filter((a) => a.status === stage);
                const style = getStatusBadgeStyle(stage);

                return (
                  <div
                    key={stage}
                    className="w-[280px] sm:w-[290px] flex flex-col rounded-2xl bg-muted/40 dark:bg-[#141722] border border-border/80 dark:border-[#242938] p-3.5 space-y-3 shrink-0 shadow-xs"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/60 dark:border-[#242938]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        <span className="font-bold text-xs text-foreground dark:text-slate-100">
                          {stage}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-card dark:bg-[#1a1d2c] border border-border/80 dark:border-[#2e354a] text-muted-foreground dark:text-slate-300 font-bold">
                        {stageApps.length}
                      </span>
                    </div>

                    {/* Cards Column */}
                    <div className="space-y-3 flex-1 overflow-y-auto min-h-[440px] flex flex-col">
                      {stageApps.length === 0 ? (
                        <div className="flex-1 min-h-[160px] border border-dashed border-border/60 dark:border-[#242938] rounded-xl flex items-center justify-center text-xs text-muted-foreground/60 dark:text-slate-400">
                          No applications
                        </div>
                      ) : (
                        stageApps.map((app) => (
                          <Card
                            key={app.id}
                            hoverEffect
                            onClick={() => setSelectedApp(app)}
                            className="p-3.5 border-border/80 dark:border-[#282e40] bg-card dark:bg-[#181b28] cursor-pointer space-y-2.5 shadow-xs w-full min-w-0 transition-all hover:border-purple-500/50"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted dark:bg-[#1f2333] border border-border/50 dark:border-[#2e354a] shrink-0 p-0.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={app.companyLogo}
                                  alt={app.company}
                                  className="w-full h-full object-contain rounded"
                                />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <h4 className="font-bold text-xs text-foreground dark:text-slate-100 truncate">
                                  {app.company}
                                </h4>
                                <p className="text-[11px] text-muted-foreground dark:text-slate-400 line-clamp-2 leading-tight mt-0.5">
                                  {app.role}
                                </p>
                              </div>
                            </div>

                            <div className="text-[11px] text-muted-foreground dark:text-slate-400 flex items-center justify-between pt-1 border-t border-border/40 dark:border-[#242938]">
                              <span className="truncate max-w-[130px]">
                                {app.location || app.workType}
                              </span>
                              <span className="font-bold text-purple-600 dark:text-purple-400 shrink-0 ml-1">
                                {app.stipend}
                              </span>
                            </div>

                            {app.nextStep && (
                              <div className="p-2 rounded-lg bg-muted/60 dark:bg-[#141724] text-[11px] text-foreground/80 dark:text-slate-300 border border-border/40 dark:border-[#242938] leading-snug">
                                <span className="font-semibold text-purple-600 dark:text-purple-400 mr-1">
                                  Next:
                                </span>
                                <span>{app.nextStep}</span>
                              </div>
                            )}
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Table View */
          <Card className="border-border/80 dark:border-[#242938] bg-card dark:bg-[#141722] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 dark:bg-[#12141c]/60 text-muted-foreground dark:text-slate-400 font-semibold border-b border-border dark:border-[#242938]">
                  <tr>
                    <th className="p-3.5">Company &amp; Role</th>
                    <th className="p-3.5">Location &amp; Work Type</th>
                    <th className="p-3.5">Stipend</th>
                    <th className="p-3.5">Date Applied</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Next Step</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-[#242938]">
                  {filteredApps.map((app) => {
                    const style = getStatusBadgeStyle(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted dark:bg-[#1f2333] border border-border/50 dark:border-[#2e354a] shrink-0 p-0.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={app.companyLogo}
                                alt={app.company}
                                className="w-full h-full object-contain rounded"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-foreground dark:text-slate-100">{app.company}</div>
                              <div className="text-[11px] text-muted-foreground dark:text-slate-400">{app.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-muted-foreground dark:text-slate-400">
                          {app.location} ({app.workType})
                        </td>
                        <td className="p-3.5 font-semibold text-purple-600 dark:text-purple-400">
                          {app.stipend}
                        </td>
                        <td className="p-3.5 text-muted-foreground dark:text-slate-400">{app.appliedDate}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground dark:text-slate-400 max-w-xs truncate">
                          {app.nextStep || "Awaiting response"}
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Application Stage Update Modal */}
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={selectedApp ? `${selectedApp.company} Application` : "Application"}
          description={selectedApp?.role}
        >
          {selectedApp && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 dark:text-slate-200 tracking-wide uppercase mb-2">
                  Move Stage / Update Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STAGES.map((s) => {
                    const style = getStatusBadgeStyle(s);
                    const isCurrent = selectedApp.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          updateApplicationStatus(selectedApp.id, s);
                          setSelectedApp({ ...selectedApp, status: s });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          isCurrent
                            ? `${style.bg} ${style.text} ${style.border} ring-2 ring-purple-500/30`
                            : "bg-card dark:bg-[#161924] border-border dark:border-[#2a3042] text-muted-foreground dark:text-slate-400 hover:bg-muted dark:hover:bg-muted/40 hover:text-foreground dark:hover:text-slate-100"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedApp.interviewDate && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    Scheduled Interview:
                  </span>{" "}
                  {selectedApp.interviewDate}
                </div>
              )}

              {selectedApp.notes && (
                <div className="p-3 rounded-xl bg-muted/50 dark:bg-[#161924] border border-border dark:border-[#2a3042] text-xs text-muted-foreground dark:text-slate-400">
                  <span className="font-bold text-foreground dark:text-slate-100">Candidate Notes:</span>{" "}
                  {selectedApp.notes}
                </div>
              )}

              <div className="pt-3 border-t border-border dark:border-[#242938] flex justify-end">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setSelectedApp(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RoleGuard>
  );
}
