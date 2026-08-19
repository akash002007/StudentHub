"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  Kanban,
  List,
  Search,
  Plus,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
          <div className="flex items-center p-1 rounded-xl bg-muted border border-border">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "kanban"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter applications by company or role..."
          className="w-full h-9 pl-9 pr-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.status === stage);
            const style = getStatusBadgeStyle(stage);

            return (
              <div
                key={stage}
                className="flex flex-col rounded-2xl bg-muted/30 border border-border/70 p-3 min-w-[240px] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className="font-bold text-xs text-foreground">{stage}</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-semibold">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards Column */}
                <div className="space-y-3 flex-1 overflow-y-auto min-h-[350px]">
                  {stageApps.length === 0 ? (
                    <div className="h-32 border border-dashed border-border/60 rounded-xl flex items-center justify-center text-[11px] text-muted-foreground/60">
                      No applications
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <Card
                        key={app.id}
                        hoverEffect
                        onClick={() => setSelectedApp(app)}
                        className="p-3.5 border-border/80 bg-card cursor-pointer space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted border border-border/50 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={app.companyLogo}
                              alt={app.company}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="overflow-hidden text-left">
                            <h4 className="font-bold text-xs text-foreground truncate">
                              {app.company}
                            </h4>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {app.role}
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                          <span>{app.workType}</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {app.stipend}
                          </span>
                        </div>

                        {app.nextStep && (
                          <div className="p-2 rounded-lg bg-muted/60 text-[10px] text-foreground/80 line-clamp-2 border border-border/40">
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              Next:
                            </span>{" "}
                            {app.nextStep}
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
      ) : (
        /* Table View */
        <Card className="border-border/80 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
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
              <tbody className="divide-y divide-border/60">
                {filteredApps.map((app) => {
                  const style = getStatusBadgeStyle(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted border border-border/50 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={app.companyLogo}
                              alt={app.company}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{app.company}</div>
                            <div className="text-[11px] text-muted-foreground">{app.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {app.location} ({app.workType})
                      </td>
                      <td className="p-3.5 font-semibold text-purple-600 dark:text-purple-400">
                        {app.stipend}
                      </td>
                      <td className="p-3.5 text-muted-foreground">{app.appliedDate}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground max-w-xs truncate">
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
              <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-2">
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
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
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
              <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Candidate Notes:</span>{" "}
                {selectedApp.notes}
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
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
  );
}
