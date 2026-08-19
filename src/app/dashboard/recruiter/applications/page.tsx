"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GitPullRequest,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Send,
  UserCheck,
  Award,
  ChevronDown,
  Layers,
  FileText,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { CandidateProfileModal, CandidateModalData } from "@/components/dashboard/CandidateProfileModal";
import { useData } from "@/context/DataContext";
import { ApplicationStatus, RecruiterApplicant } from "@/types";
import { getStatusBadgeStyle } from "@/lib/utils";

export default function RecruiterApplicationsPage() {
  const router = useRouter();
  const {
    recruiterApplicants,
    recruiterInternships,
    updateApplicantStatus,
    addApplicantNote,
    recruiterStudents,
    toggleShortlistCandidate,
    startRecruiterConversation,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statuses: ApplicationStatus[] = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
  ];

  const filteredApplicants = recruiterApplicants.filter((applicant) => {
    const matchesSearch =
      applicant.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === "all" || applicant.internshipId === selectedRoleFilter;

    const matchesStatus =
      selectedStatusFilter === "all" || applicant.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenCandidate = (applicant: RecruiterApplicant) => {
    setSelectedCandidate({
      id: applicant.studentId,
      name: applicant.studentName,
      avatar: applicant.studentAvatar,
      university: applicant.university,
      degree: applicant.degree,
      branch: applicant.branch,
      graduationYear: applicant.graduationYear,
      cgpa: applicant.cgpa,
      location: applicant.location,
      skills: applicant.skills,
      bio: applicant.bio,
      matchScore: applicant.matchScore,
      resumeUrl: applicant.resumeUrl,
      portfolioUrl: applicant.portfolioUrl,
      githubUrl: applicant.githubUrl,
      linkedinUrl: applicant.linkedinUrl,
      projects: applicant.projects,
      certifications: applicant.certifications,
      applicationStatus: applicant.status,
      appliedDate: applicant.appliedDate,
      notes: applicant.notes,
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (!selectedCandidate) return;
    const applicant = recruiterApplicants.find(
      (a) => a.studentId === selectedCandidate.id || a.studentName === selectedCandidate.name
    );
    if (applicant) {
      updateApplicantStatus(applicant.id, newStatus);
      setSelectedCandidate((prev) => (prev ? { ...prev, applicationStatus: newStatus } : null));
    }
  };

  const handleMessage = () => {
    if (!selectedCandidate) return;
    startRecruiterConversation({
      id: selectedCandidate.id,
      name: selectedCandidate.name,
      avatar: selectedCandidate.avatar,
      role: selectedCandidate.degree,
      college: selectedCandidate.university,
    });
    setIsModalOpen(false);
    router.push("/dashboard/recruiter/messages");
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Candidate Pipeline</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Application Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Review and advance candidate profiles across interview and offer stages.
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-muted rounded-xl border border-border flex items-center">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "kanban"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kanban Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                placeholder="Search candidates, college, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Internship Roles</option>
                {recruiterInternships.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Pipeline Stages</option>
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick status pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">
              Quick Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedStatusFilter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({recruiterApplicants.length})
            </button>
            {statuses.map((st) => {
              const count = recruiterApplicants.filter((a) => a.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedStatusFilter === st
                      ? "bg-purple-600 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => {
                const style = getStatusBadgeStyle(applicant.status);
                return (
                  <Card
                    key={applicant.id}
                    hoverEffect
                    className="p-5 border-border/80 bg-card space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Candidate info */}
                      <div className="flex items-center gap-3.5">
                        <Avatar
                          src={applicant.studentAvatar}
                          name={applicant.studentName}
                          size="lg"
                          isOnline={true}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-foreground">
                              {applicant.studentName}
                            </h3>
                            <Badge variant="emerald" size="sm" className="font-bold">
                              {applicant.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground/90">{applicant.university}</strong> •{" "}
                            {applicant.degree} ({applicant.graduationYear})
                          </p>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                            <span>Major: {applicant.branch}</span>
                            <span>•</span>
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              CGPA: {applicant.cgpa}
                            </span>
                            <span>•</span>
                            <span>Applied: {applicant.appliedDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status changer & actions */}
                      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                        <select
                          value={applicant.status}
                          onChange={(e) =>
                            updateApplicantStatus(applicant.id, e.target.value as ApplicationStatus)
                          }
                          className="h-8 px-2.5 rounded-lg bg-muted border border-border text-xs font-semibold text-foreground focus:outline-none focus:border-purple-500"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleOpenCandidate(applicant)}
                        >
                          Review Profile
                        </Button>
                      </div>
                    </div>

                    {/* Target Internship & Skills strip */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="text-muted-foreground text-[11px]">
                        Target Listing:{" "}
                        <strong className="text-foreground">{applicant.internshipTitle}</strong>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-card text-[10px] font-medium text-foreground/80 border border-border/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
                <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-semibold">No candidates match your active filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Kanban Board View */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
            {statuses.map((st) => {
              const columnApplicants = filteredApplicants.filter((a) => a.status === st);
              return (
                <div
                  key={st}
                  className="rounded-2xl bg-muted/30 border border-border/70 p-3 space-y-3 min-w-[240px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                      {st}
                    </span>
                    <Badge variant="secondary" size="sm" className="font-bold">
                      {columnApplicants.length}
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    {columnApplicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        onClick={() => handleOpenCandidate(applicant)}
                        className="p-3 rounded-xl bg-card border border-border shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={applicant.studentAvatar}
                            name={applicant.studentName}
                            size="sm"
                          />
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-foreground truncate">
                              {applicant.studentName}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {applicant.university}
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-muted-foreground truncate">
                          {applicant.internshipTitle}
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/40">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {applicant.matchScore}% Match
                          </span>
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            CGPA {applicant.cgpa}
                          </span>
                        </div>
                      </div>
                    ))}
                    {columnApplicants.length === 0 && (
                      <div className="p-4 text-center text-[11px] text-muted-foreground/60">
                        No candidates in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Candidate Profile Review Modal */}
        <CandidateProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidate={selectedCandidate}
          onStatusChange={handleStatusChange}
          onMessage={handleMessage}
          onShortlistToggle={() => {
            if (selectedCandidate) toggleShortlistCandidate(selectedCandidate.id);
          }}
          isShortlisted={
            selectedCandidate
              ? recruiterStudents.find((s) => s.id === selectedCandidate.id)?.isShortlisted
              : false
          }
          onSaveNote={(note) => {
            if (selectedCandidate) {
              const applicant = recruiterApplicants.find(
                (a) => a.studentId === selectedCandidate.id
              );
              if (applicant) addApplicantNote(applicant.id, note);
            }
          }}
        />
      </div>
    </RoleGuard>
  );
}
