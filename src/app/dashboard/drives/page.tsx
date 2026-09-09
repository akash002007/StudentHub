"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  Building2,
  AlertCircle,
  GraduationCap,
  Users2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { RecruitmentDrive } from "@/types";

interface EnrichedDrive extends RecruitmentDrive {
  userApplication?: {
    id: string;
    status: string;
    currentStageName: string;
    appliedAt: string;
  } | null;
  eligibilitySummary?: {
    status: "ELIGIBLE" | "NOT_ELIGIBLE" | "REQUIRES_MANUAL_REVIEW";
    score: number;
    passedCount: number;
    totalCount: number;
  };
}

export default function StudentRecruitmentDrivesPage() {
  const [drives, setDrives] = useState<EnrichedDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/drives");
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.error("Failed to fetch recruitment drives:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrives = drives.filter((drive) => {
    const matchesTab =
      selectedStatusTab === "all" ||
      (selectedStatusTab === "APPLICATIONS_OPEN" &&
        (drive.status === "APPLICATIONS_OPEN" || drive.status === "PUBLISHED")) ||
      (selectedStatusTab === "ELIGIBLE" &&
        drive.eligibilitySummary?.status === "ELIGIBLE") ||
      (selectedStatusTab === "APPLIED" && !!drive.userApplication) ||
      (selectedStatusTab === "RESULTS" && drive.status === "RESULTS_PUBLISHED");

    const matchesWorkMode =
      selectedWorkMode === "all" ||
      drive.workMode.toLowerCase() === selectedWorkMode.toLowerCase();

    const matchesDepartment =
      selectedDepartment === "all" ||
      drive.department.toLowerCase() === selectedDepartment.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      drive.title.toLowerCase().includes(q) ||
      drive.position.toLowerCase().includes(q) ||
      drive.company.toLowerCase().includes(q) ||
      drive.location.toLowerCase().includes(q) ||
      drive.eligibilityCriteria.requiredSkills.some((s) => s.toLowerCase().includes(q));

    return matchesTab && matchesWorkMode && matchesDepartment && matchesSearch;
  });

  const departments = Array.from(new Set(drives.map((d) => d.department).filter(Boolean)));

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recruitment Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recruitment Drives
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Explore verified campus and industry recruitment opportunities with structured eligibility criteria and multi-round selection pipelines.
            </p>
          </div>

          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
              My Applications
            </Button>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-border/60">
            {[
              { id: "all", label: "All Opportunities" },
              { id: "APPLICATIONS_OPEN", label: "Accepting Applications" },
              { id: "ELIGIBLE", label: "Eligible For You" },
              { id: "APPLIED", label: "Already Applied" },
              { id: "RESULTS", label: "Results Published" },
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

          {/* Search Inputs & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by position, company, skill (e.g. React, Python), or city..."
                className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Work Modes</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-Site</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Drives Grid / List */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading recruitment drives...</p>
          </div>
        ) : filteredDrives.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <Building2 className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-foreground">No recruitment drives found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No recruitment drives currently match your selected filters or search terms. Try adjusting your filter parameters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStatusTab("all");
                setSelectedWorkMode("all");
                setSelectedDepartment("all");
                setSearchQuery("");
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredDrives.map((drive) => {
              const isEligible = drive.eligibilitySummary?.status === "ELIGIBLE";
              const isApplied = !!drive.userApplication;
              const isClosed = drive.status === "CLOSED" || drive.status === "RESULTS_PUBLISHED";

              return (
                <Card
                  key={drive.id}
                  hoverEffect
                  className="p-5 border-border bg-card flex flex-col justify-between space-y-4 transition-all hover:border-purple-500/40"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Company & Status Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-muted border border-border overflow-hidden shrink-0 p-1 flex items-center justify-center">
                          {drive.companyLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={drive.companyLogo}
                              alt={drive.company}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                            {drive.title}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate font-medium">
                            {drive.company} • {drive.department}
                          </p>
                        </div>
                      </div>

                      {/* Application / Drive Status Badge */}
                      {isApplied ? (
                        <Badge variant="emerald" size="sm" className="shrink-0 font-bold">
                          Applied
                        </Badge>
                      ) : drive.status === "RESULTS_PUBLISHED" ? (
                        <Badge variant="purple" size="sm" className="shrink-0 font-bold">
                          Results Out
                        </Badge>
                      ) : drive.status === "APPLICATIONS_OPEN" || drive.status === "PUBLISHED" ? (
                        <Badge variant="blue" size="sm" className="shrink-0 font-bold">
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm" className="shrink-0 font-bold">
                          {drive.status.replace("_", " ")}
                        </Badge>
                      )}
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-500" />
                        {drive.location} ({drive.workMode})
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-semibold flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-blue-500" />
                        {drive.employmentType.replace("_", " ")}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                        {drive.salaryStipend}
                      </span>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {drive.description}
                    </p>

                    {/* Eligibility & Criteria Preview Card */}
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-2">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          Eligibility Requirement:
                        </span>
                        {isEligible ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Eligible ({drive.eligibilitySummary?.score}%)
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {drive.eligibilitySummary?.passedCount}/{drive.eligibilitySummary?.totalCount} Criteria
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          Min CGPA: <strong>{drive.eligibilityCriteria.minCgpa?.toFixed(1) || "Any"}</strong>
                        </span>
                        <span>
                          Cohort: <strong>{drive.eligibilityCriteria.gradYears?.join(", ") || "All"}</strong>
                        </span>
                        <span>
                          Backlogs: <strong>Max {drive.eligibilityCriteria.maxBacklogs ?? 0}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Row */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
                      <span>
                        Deadline:{" "}
                        <strong className="text-foreground font-semibold">
                          {new Date(drive.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>

                    <Link href={`/dashboard/drives/${drive.id}`}>
                      <Button
                        variant={isApplied ? "outline" : "gradient"}
                        size="sm"
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        {isApplied ? "View Application" : "Check & Apply"}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
