"use client";

import React, { useState, useEffect } from "react";
import {
  GitPullRequest,
  Search,
  Filter,
  Briefcase,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export default function CollegeApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (stageFilter !== "ALL") params.append("stage", stageFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/college/applications?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setApplications(json.applications || []);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [stageFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApps();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <GitPullRequest className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Institutional Applications Tracker
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor all drive candidatures across departments and track active selection stage milestones.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 rounded-2xl bg-card border border-border space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by student name, email, or drive title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="gradient" className="h-10 text-xs px-5">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Selection Stages</option>
            <option value="SCREENING">Stage: Screening</option>
            <option value="ASSESSMENT">Stage: Assessment</option>
            <option value="INTERVIEW">Stage: Interview</option>
            <option value="FINAL_SELECTION">Stage: Final Selection</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSESSMENT_CLEARED">Assessment Cleared</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="overflow-hidden rounded-2xl bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Recruitment Drive</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Scores</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No applications found matching the criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={app.studentAvatar}
                          alt={app.candidateName}
                          name={app.candidateName}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold text-foreground">{app.candidateName}</div>
                          <div className="text-[11px] text-muted-foreground">{app.candidateEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="font-bold text-foreground">{app.driveTitle}</div>
                      <div className="text-[11px] text-muted-foreground">{app.companyName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {app.department} ({app.branch})
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {app.currentStageName || app.currentStageType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-bold">
                      {app.assessmentScore ? (
                        <span className="text-blue-600 dark:text-blue-400">Test: {app.assessmentScore}/100</span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          app.status === "SELECTED"
                            ? "emerald"
                            : app.status === "REJECTED"
                            ? "rose"
                            : app.status === "INTERVIEW_SCHEDULED"
                            ? "purple"
                            : "blue"
                        }
                        className="text-[10px]"
                      >
                        {app.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right text-muted-foreground">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
