"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Sparkles,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  Send,
  Calendar,
  Trash2,
  ExternalLink,
  Award,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { CandidateProfileModal, CandidateModalData } from "@/components/dashboard/CandidateProfileModal";
import { RecruiterCareerDNASection } from "@/components/recruiter/RecruiterCareerDNASection";
import { useData } from "@/context/DataContext";
import { RecruiterStudentCandidate } from "@/types";

export default function RecruiterShortlistedPage() {
  const router = useRouter();
  const {
    recruiterStudents,
    toggleShortlistCandidate,
    startRecruiterConversation,
    scheduleInterview,
    recruiterInternships,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState<string>("all");
  const [minCgpaFilter, setMinCgpaFilter] = useState<string>("all");

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Shortlisted students list
  const shortlistedList = recruiterStudents.filter((s) => s.isShortlisted);

  const filteredCandidates = shortlistedList.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.academicStream && student.academicStream.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStream =
      streamFilter === "all" || student.academicStream === streamFilter;

    const matchesCgpa =
      minCgpaFilter === "all" ||
      parseFloat(student.cgpa.split("/")[0].trim()) >= parseFloat(minCgpaFilter);

    return matchesSearch && matchesStream && matchesCgpa;
  });

  const allStreams = Array.from(
    new Set(shortlistedList.map((s) => s.academicStream).filter(Boolean) as string[])
  ).sort();

  const handleOpenCandidate = (student: RecruiterStudentCandidate) => {
    setSelectedCandidate({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      university: student.university,
      degree: student.degree,
      branch: student.branch,
      graduationYear: student.graduationYear,
      cgpa: student.cgpa,
      location: student.location,
      skills: student.skills,
      bio: student.bio,
      matchScore: 92,
      resumeUrl: student.resumeUrl,
      portfolioUrl: student.portfolioUrl,
      githubUrl: student.githubUrl,
      linkedinUrl: student.linkedinUrl,
      projects: student.projects,
      certifications: student.certifications,
      isShortlisted: student.isShortlisted,
      careerDNA: (student as any).careerDNA,
    });
    setIsModalOpen(true);
  };

  const handleStartMessage = (student: RecruiterStudentCandidate) => {
    startRecruiterConversation({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      role: student.degree,
      college: student.university,
    });
    router.push("/dashboard/recruiter/messages");
  };

  const handleMoveToInterview = (student: RecruiterStudentCandidate) => {
    scheduleInterview({
      candidateId: student.id,
      candidateName: student.name,
      candidateAvatar: student.avatar,
      candidateUniversity: student.university,
      candidateRole: recruiterInternships[0]?.title || "Summer 2026 Intern",
      internshipTitle: recruiterInternships[0]?.title || "Summer 2026 Intern",
      type: "Technical",
      date: "2026-04-03",
      time: "10:00 AM PST",
      duration: "45 mins",
      interviewerName: "David K. (Staff Systems Engineer)",
      meetingLink: "https://meet.google.com/stripe-shortlist-interview",
      notes: "Shortlisted talent direct interview fast-track.",
    });
    router.push("/dashboard/recruiter/interviews");
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Talent Bench</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Shortlisted Candidates
            </h1>
            <p className="text-xs text-muted-foreground">
              Review and manage top-tier student profiles bookmarked for upcoming cohorts.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/recruiter/students")}
            className="cursor-pointer"
          >
            Find More Students
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-border bg-card">
            <div className="text-xs font-medium text-muted-foreground">Total Shortlisted</div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {shortlistedList.length}
            </div>
          </Card>
          <Card className="p-4 border-border bg-card">
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400">High Match (&gt;90%)</div>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {shortlistedList.filter((s) => parseFloat(s.cgpa.split("/")[0]) >= 3.6).length}
            </div>
          </Card>
          <Card className="p-4 border-border bg-card">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Active Talent Pool</div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              100% Verified
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shortlisted candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Academic Streams</option>
              {allStreams.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
            >
              <option value="all">Any CGPA</option>
              <option value="3.5">&ge; 3.5 CGPA</option>
              <option value="3.7">&ge; 3.7 CGPA</option>
              <option value="3.9">&ge; 3.9 CGPA</option>
            </select>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
            <Bookmark className="w-10 h-10 text-muted-foreground mx-auto" />
            <div className="text-sm font-semibold text-foreground">No shortlisted candidates match</div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Explore the Talent Discovery page to bookmark promising student profiles.
            </p>
            <Button
              type="button"
              variant="gradient"
              size="sm"
              onClick={() => router.push("/dashboard/recruiter/students")}
            >
              Find Student Talent
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((student) => (
              <div
                key={student.id}
                className="p-5 rounded-2xl border border-border bg-card hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar src={student.avatar} name={student.name} size="lg" isOnline />
                      <div>
                        <h3 className="text-sm font-bold text-foreground hover:text-purple-600 transition-colors cursor-pointer" onClick={() => handleOpenCandidate(student)}>
                          {student.name}
                        </h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                          <span>{student.university}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {student.degree} &bull; {student.branch} ({student.graduationYear})
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleShortlistCandidate(student.id)}
                      className="p-1.5 rounded-lg text-purple-600 bg-purple-500/10 hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove from shortlist"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {student.bio && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                      {student.bio}
                    </p>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {student.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground border border-border/60"
                      >
                        {skill}
                      </span>
                    ))}
                    {student.skills.length > 5 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                        +{student.skills.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Compact Career DNA Section */}
                  <RecruiterCareerDNASection
                    studentId={student.id}
                    candidateName={student.name}
                    careerDNA={(student as any).careerDNA}
                    compact={true}
                    onOpenFullModal={() => handleOpenCandidate(student)}
                    className="mt-3"
                  />
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    CGPA: {student.cgpa}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartMessage(student)}
                      className="text-xs h-8 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Message
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCandidate(student)}
                      className="text-xs h-8 cursor-pointer"
                    >
                      Profile
                    </Button>

                    <Button
                      type="button"
                      variant="gradient"
                      size="sm"
                      onClick={() => handleMoveToInterview(student)}
                      className="text-xs h-8 shadow-xs cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Interview
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Candidate Profile Modal */}
        {selectedCandidate && (
          <CandidateProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            candidate={selectedCandidate}
          />
        )}
      </div>
    </RoleGuard>
  );
}
