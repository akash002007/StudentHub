"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Shield,
  Clock,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sliders,
  ExternalLink,
  Layers,
  Building2,
  Briefcase,
  Play,
  Eye,
  Edit,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import { AssessmentRecord, RecruitmentDrive } from "@/types";

interface EnrichedAssessment extends AssessmentRecord {
  questionsCount: number;
  candidatesAssignedCount: number;
  completedCount: number;
  averageScore: number;
}

export default function RecruiterAssessmentsPage() {
  const { success, error: toastError } = useToast();

  const [assessments, setAssessments] = useState<EnrichedAssessment[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDriveId, setSelectedDriveId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchAssessments();
    fetchDrives();
  }, [selectedStatus, selectedDriveId]);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/recruiter/assessments", window.location.origin);
      url.searchParams.set("mode", "configs");
      if (selectedStatus !== "ALL") url.searchParams.set("status", selectedStatus);
      if (selectedDriveId !== "all") url.searchParams.set("driveId", selectedDriveId);
      if (searchQuery) url.searchParams.set("search", searchQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.configs || []);
      }
    } catch (err) {
      console.error("Failed to load assessments:", err);
      toastError("Failed to fetch assessments.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/recruiter/drives");
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAssessments = assessments.filter((a) => {
    if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.driveTitle && a.driveTitle.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metrics
  const totalAssessments = assessments.length;
  const activeAssessments = assessments.filter((a) => a.status === "ACTIVE").length;
  const totalCompleted = assessments.reduce((sum, a) => sum + (a.completedCount || 0), 0);
  const avgScores = assessments.filter((a) => a.averageScore > 0);
  const overallAvgScore =
    avgScores.length > 0
      ? Math.round((avgScores.reduce((sum, a) => sum + a.averageScore, 0) / avgScores.length) * 10) / 10
      : 0;

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Proctored Assessment Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recruiter Assessments
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Create, configure, publish, and evaluate secure assessments integrated with your recruitment pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/dashboard/recruiter/questions">
              <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-4 h-4 text-purple-500" />}>
                Question Bank
              </Button>
            </Link>

            <Link href="/dashboard/recruiter/assessments/new">
              <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Create Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Assessments</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{totalAssessments}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active & Scheduled</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{activeAssessments}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed Submissions</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{totalCompleted}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Average Score</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{overallAvgScore} pts</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter & Tab Bar */}
        <Card className="p-4 border-border bg-card space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
              {["ALL", "ACTIVE", "DRAFT", "SCHEDULED", "COMPLETED", "ARCHIVED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedStatus === status
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status === "ALL" ? "All Statuses" : status}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assessments..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/60">
            {/* Drive Filter */}
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
              >
                <option value="all">All Recruitment Drives</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.company})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Aptitude">Aptitude</option>
                <option value="Communication">Communication</option>
                <option value="Domain">Domain</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="ml-auto text-xs text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredAssessments.length}</span> assessments
            </div>
          </div>
        </Card>

        {/* Assessments List / Table */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading recruiter assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-bold text-base text-foreground">No assessments found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {searchQuery || selectedDriveId !== "all" || selectedStatus !== "ALL"
                ? "No assessments match the current filters. Try changing or clearing your search criteria."
                : "You haven't configured any assessments yet. Create an assessment to begin evaluating candidates."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/dashboard/recruiter/assessments/new">
                <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Create New Assessment
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAssessments.map((assessment) => {
              const isProctored = assessment.mode === "PROCTORED";
              const isDraft = assessment.status === "DRAFT";

              return (
                <Card
                  key={assessment.id}
                  hoverEffect
                  className="p-5 border-border bg-card transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 min-w-0 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/dashboard/recruiter/assessments/${assessment.id}`}>
                          <h3 className="text-base font-bold text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            {assessment.title}
                          </h3>
                        </Link>

                        {isProctored ? (
                          <Badge variant="purple" size="sm" className="font-bold gap-1">
                            <Shield className="w-3 h-3" /> Proctored
                          </Badge>
                        ) : (
                          <Badge variant="blue" size="sm">
                            Standard
                          </Badge>
                        )}

                        <Badge
                          variant={
                            assessment.status === "ACTIVE"
                              ? "emerald"
                              : assessment.status === "DRAFT"
                              ? "lavender"
                              : assessment.status === "SCHEDULED"
                              ? "blue"
                              : "rose"
                          }
                          size="sm"
                          className="font-bold uppercase"
                        >
                          {assessment.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {assessment.description || assessment.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                          {assessment.driveTitle} ({assessment.companyName})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          {assessment.questionsCount} Questions
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {assessment.durationMinutes} mins
                        </span>
                        <span>•</span>
                        <span>
                          Passing: <strong className="text-foreground">{assessment.passingMarks}/{assessment.totalMarks}</strong> ({assessment.passingPercentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Middle: Candidate Stats */}
                    <div className="flex items-center gap-6 py-2 px-4 rounded-xl bg-muted/40 border border-border/50 shrink-0">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Assigned</p>
                        <p className="text-sm font-extrabold text-foreground mt-0.5">
                          {assessment.candidatesAssignedCount}
                        </p>
                      </div>
                      <div className="w-px h-7 bg-border" />
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Completed</p>
                        <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {assessment.completedCount}
                        </p>
                      </div>
                      <div className="w-px h-7 bg-border" />
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Avg Score</p>
                        <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                          {assessment.averageScore}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link href={`/dashboard/recruiter/assessments/${assessment.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          Workspace
                        </Button>
                      </Link>

                      <Link href={`/dashboard/recruiter/assessments/${assessment.id}?tab=results`}>
                        <Button variant="outline" size="sm" leftIcon={<Award className="w-3.5 h-3.5" />}>
                          Results
                        </Button>
                      </Link>

                      {isDraft ? (
                        <Link href={`/dashboard/recruiter/assessments/new?editId=${assessment.id}`}>
                          <Button variant="gradient" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                            Edit Draft
                          </Button>
                        </Link>
                      ) : null}
                    </div>
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
