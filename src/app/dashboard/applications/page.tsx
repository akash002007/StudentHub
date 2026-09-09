"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  Building2,
  AlertCircle,
  Calendar,
  Layers,
  Award,
  Video,
  FileCheck2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { RecruitmentApplication, RecruitmentStage } from "@/types";

interface EnrichedApplication extends RecruitmentApplication {
  companyLogo?: string;
  salaryStipend?: string;
  location?: string;
  workMode?: string;
  department?: string;
  stages?: RecruitmentStage[];
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [selectedAppForTimeline, setSelectedAppForTimeline] = useState<EnrichedApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELECTED":
        return <Badge variant="emerald" size="sm" className="font-bold">Selected 🎉</Badge>;
      case "WAITLISTED":
        return <Badge variant="purple" size="sm" className="font-bold">Waitlisted</Badge>;
      case "SHORTLISTED":
      case "IN_SELECTION":
        return <Badge variant="blue" size="sm" className="font-bold">In Selection</Badge>;
      case "ELIGIBLE":
      case "ELIGIBILITY_CONFIRMED":
        return <Badge variant="emerald" size="sm" className="font-bold">Eligible</Badge>;
      case "ELIGIBILITY_FAILED":
      case "REJECTED":
        return <Badge variant="rose" size="sm" className="font-bold">Not Selected</Badge>;
      case "SUBMITTED":
      default:
        return <Badge variant="outline" size="sm" className="font-bold">Submitted</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesTab =
      selectedStatusTab === "all" ||
      (selectedStatusTab === "active" &&
        ["SUBMITTED", "UNDER_REVIEW", "ELIGIBLE", "SHORTLISTED", "IN_SELECTION"].includes(app.status)) ||
      (selectedStatusTab === "selected" && app.status === "SELECTED") ||
      (selectedStatusTab === "rejected" && (app.status === "REJECTED" || app.status === "ELIGIBILITY_FAILED"));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.driveTitle.toLowerCase().includes(q) ||
      app.company.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Application Pipeline Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              My Applications
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Track multi-stage recruitment rounds, screening results, assessment schedules, and official selection status in real time.
            </p>
          </div>

          <Link href="/dashboard/drives">
            <Button variant="gradient" size="sm">
              Discover More Drives
            </Button>
          </Link>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-border/60">
            {[
              { id: "all", label: `All Applications (${applications.length})` },
              {
                id: "active",
                label: `Active Pipeline (${
                  applications.filter((a) =>
                    ["SUBMITTED", "UNDER_REVIEW", "ELIGIBLE", "SHORTLISTED", "IN_SELECTION"].includes(a.status)
                  ).length
                })`,
              },
              {
                id: "selected",
                label: `Selected (${applications.filter((a) => a.status === "SELECTED").length})`,
              },
              {
                id: "rejected",
                label: `Archive / Non-Selected (${
                  applications.filter((a) => a.status === "REJECTED" || a.status === "ELIGIBILITY_FAILED").length
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatusTab === tab.id
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by drive title, company, or Application ID..."
              className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Application Cards List */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading your recruitment applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <GitPullRequest className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-foreground">No applications found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              You haven&apos;t submitted any recruitment applications matching these filters yet. Explore open drives to get started!
            </p>
            <Link href="/dashboard/drives" className="inline-block mt-4">
              <Button variant="gradient" size="sm">
                Browse Recruitment Drives
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const stages = app.stages || [];
              const currentStageIndex = stages.findIndex((s) => s.id === app.currentStageId);

              return (
                <Card
                  key={app.id}
                  hoverEffect
                  className="p-5 border-border bg-card space-y-4 transition-all"
                >
                  {/* Top Bar: Company, Title, ID, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-muted border border-border p-1 overflow-hidden shrink-0 flex items-center justify-center">
                        {app.companyLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={app.companyLogo}
                            alt={app.company}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                            {app.driveTitle}
                          </h3>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold shrink-0">
                            {app.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">
                          {app.company} • Applied on{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Visual Stage Progression Bar */}
                  {stages.length > 0 && (
                    <div className="space-y-2 py-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Recruitment Progress</span>
                        <span className="font-semibold text-foreground">
                          Current Stage: <strong className="text-purple-600 dark:text-purple-400">{app.currentStageName}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {stages.map((stage, sIdx) => {
                          const isPast =
                            currentStageIndex > sIdx ||
                            app.status === "SELECTED";
                          const isPresent = currentStageIndex === sIdx && app.status !== "SELECTED";

                          return (
                            <div
                              key={stage.id}
                              className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-2 transition-all ${
                                isPast
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                  : isPresent
                                  ? "bg-purple-500/15 border-purple-500/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30 font-bold"
                                  : "bg-muted/40 border-border/60 text-muted-foreground"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                  isPast
                                    ? "bg-emerald-600 text-white"
                                    : isPresent
                                    ? "bg-purple-600 text-white animate-pulse"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isPast ? "✓" : sIdx + 1}
                              </span>
                              <span className="truncate">{stage.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Application Metrics & Quick Action Row */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px]">
                      {app.assessmentScore !== undefined && (
                        <span className="px-2 py-0.5 rounded-lg bg-muted text-foreground font-semibold">
                          Assessment: <strong>{app.assessmentScore}/100</strong>
                        </span>
                      )}
                      {app.interviewScore !== undefined && (
                        <span className="px-2 py-0.5 rounded-lg bg-muted text-foreground font-semibold">
                          Interview: <strong>{app.interviewScore}/100</strong>
                        </span>
                      )}
                      {app.rank && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                          Merit Rank: #{app.rank}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {app.status === "SHORTLISTED" || app.status === "ASSESSMENT_CLEARED" || app.currentStageName?.toLowerCase().includes("assessment") ? (
                        <Link href="/dashboard/assessments">
                          <Button
                            variant="gradient"
                            size="sm"
                            leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
                          >
                            Assessments
                          </Button>
                        </Link>
                      ) : null}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAppForTimeline(app)}
                        leftIcon={<Clock className="w-3.5 h-3.5" />}
                      >
                        Timeline
                      </Button>

                      <Link href={`/dashboard/drives/${app.driveId}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          Drive
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Timeline History Modal */}
        <Modal
          isOpen={!!selectedAppForTimeline}
          onClose={() => setSelectedAppForTimeline(null)}
          title="Recruitment Timeline History"
          description={
            selectedAppForTimeline
              ? `${selectedAppForTimeline.driveTitle} (${selectedAppForTimeline.id})`
              : "Timeline"
          }
        >
          {selectedAppForTimeline && (
            <div className="space-y-4 text-xs sm:text-sm max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-2xl bg-muted/50 border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground">Current Stage:</span>{" "}
                  <strong className="text-foreground">{selectedAppForTimeline.currentStageName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <strong className="text-purple-600 dark:text-purple-400 font-bold">
                    {selectedAppForTimeline.status}
                  </strong>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {selectedAppForTimeline.history && selectedAppForTimeline.history.length > 0 ? (
                  selectedAppForTimeline.history.map((event, idx) => (
                    <div key={idx} className="relative space-y-1 text-xs">
                      <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-background" />

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground">{event.status.replace("_", " ")}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground">
                        Stage: <span className="font-medium text-foreground">{event.stageName}</span> • Actor:{" "}
                        <span className="font-medium text-foreground">{event.actor}</span>
                      </p>

                      {event.note && (
                        <p className="text-[11px] text-muted-foreground/90 bg-muted/40 p-2 rounded-xl border border-border/60">
                          {event.note}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No historical logs available.</p>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setSelectedAppForTimeline(null)}
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
