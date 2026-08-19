"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  GraduationCap,
  MapPin,
  Sparkles,
  UserCheck,
  Send,
  SlidersHorizontal,
  Bookmark,
  Layers,
  Award,
  ExternalLink,
  Code2,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { CandidateProfileModal, CandidateModalData } from "@/components/dashboard/CandidateProfileModal";
import { useData } from "@/context/DataContext";
import { RecruiterStudentCandidate } from "@/types";

export default function RecruiterFindStudentsPage() {
  const router = useRouter();
  const {
    recruiterStudents,
    toggleShortlistCandidate,
    startRecruiterConversation,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [selectedGradYear, setSelectedGradYear] = useState<string>("all");
  const [minCgpaFilter, setMinCgpaFilter] = useState<string>("all");
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allSkills = Array.from(
    new Set(recruiterStudents.flatMap((s) => s.skills))
  ).sort();

  const allUniversities = Array.from(
    new Set(recruiterStudents.map((s) => s.university))
  ).sort();

  const allStreams = Array.from(
    new Set(recruiterStudents.map((s) => s.academicStream).filter(Boolean) as string[])
  ).sort();

  const filteredStudents = recruiterStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.specialization && student.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.academicStream && student.academicStream.toLowerCase().includes(searchQuery.toLowerCase())) ||
      student.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStream =
      selectedStream === "all" || student.academicStream === selectedStream;

    const matchesUniversity =
      selectedUniversity === "all" || student.university === selectedUniversity;

    const matchesSkill =
      selectedSkill === "all" || student.skills.includes(selectedSkill);

    const matchesGradYear =
      selectedGradYear === "all" || student.graduationYear.toString() === selectedGradYear;

    const matchesCgpa =
      minCgpaFilter === "all" ||
      parseFloat(student.cgpa.split("/")[0].trim()) >= parseFloat(minCgpaFilter);

    const matchesShortlist = !onlyShortlisted || student.isShortlisted;

    return (
      matchesSearch &&
      matchesStream &&
      matchesUniversity &&
      matchesSkill &&
      matchesGradYear &&
      matchesCgpa &&
      matchesShortlist
    );
  });

  const handleOpenCandidate = (student: RecruiterStudentCandidate) => {
    setSelectedCandidate({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      university: student.university,
      degree: student.degree,
      branch: student.branch,
      academicStream: student.academicStream,
      specialization: student.specialization,
      graduationYear: student.graduationYear,
      cgpa: student.cgpa,
      location: student.location,
      skills: student.skills,
      bio: student.bio,
      resumeUrl: student.resumeUrl,
      portfolioUrl: student.portfolioUrl,
      githubUrl: student.githubUrl,
      linkedinUrl: student.linkedinUrl,
      behanceUrl: student.behanceUrl,
      researchGateUrl: student.researchGateUrl,
      ssrnUrl: student.ssrnUrl,
      projects: student.projects,
      certifications: student.certifications,
    });
    setIsModalOpen(true);
  };

  const handleMessageCandidate = (student: RecruiterStudentCandidate) => {
    startRecruiterConversation({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      role: student.degree,
      college: student.university,
    });
    router.push("/dashboard/recruiter/messages");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStream("all");
    setSelectedUniversity("all");
    setSelectedSkill("all");
    setSelectedGradYear("all");
    setMinCgpaFilter("all");
    setOnlyShortlisted(false);
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Talent Discovery</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Find Student Talent
            </h1>
            <p className="text-xs text-muted-foreground">
              Search verified student engineers, designers, and researchers across top universities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={onlyShortlisted ? "primary" : "outline"}
              size="sm"
              onClick={() => setOnlyShortlisted(!onlyShortlisted)}
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              Shortlisted Only (
              {recruiterStudents.filter((s) => s.isShortlisted).length})
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Input
                placeholder="Search by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <Select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
              >
                <option value="all">All Academic Streams</option>
                {allStreams.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="all">All Universities</option>
                {allUniversities.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="all">All Skills &amp; Stacks</option>
                {allSkills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={minCgpaFilter}
                onChange={(e) => setMinCgpaFilter(e.target.value)}
              >
                <option value="all">Any GPA / Score</option>
                <option value="3.5">GPA 3.5+</option>
                <option value="3.8">GPA 3.8+ (High Honors)</option>
                <option value="3.9">GPA 3.9+ (Top 5%)</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Showing {filteredStudents.length} candidate profiles</span>
            </div>

            {(selectedStream !== "all" ||
              selectedUniversity !== "all" ||
              selectedSkill !== "all" ||
              minCgpaFilter !== "all" ||
              searchQuery ||
              onlyShortlisted) && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>
        </div>

        {/* Student Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              hoverEffect
              className="p-5 sm:p-6 border-border/80 bg-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Avatar & Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={student.avatar}
                      name={student.name}
                      size="lg"
                      isOnline={true}
                    />
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-snug">
                        {student.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {student.university}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {student.degree} ({student.graduationYear})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleShortlistCandidate(student.id)}
                    className={`p-2 rounded-xl transition-all ${
                      student.isShortlisted
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                    title={student.isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>

                {/* Stream & GPA pill */}
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/40 border border-border/50 gap-2">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 text-[11px] truncate">
                    {student.academicStream || student.status}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    CGPA {student.cgpa}
                  </span>
                </div>

                {/* Specialization / Major */}
                {(student.specialization || student.branch) && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span className="font-medium text-foreground">Major:</span>
                    <span>{student.specialization || student.branch}</span>
                  </div>
                )}

                {/* Bio */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {student.bio}
                </p>

                {/* Skills */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Top Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground/80"
                      >
                        {s}
                      </span>
                    ))}
                    {student.skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                        +{student.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Projects snippet */}
                {student.projects && student.projects.length > 0 && (
                  <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1 truncate mr-2">
                      <Code2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <strong className="text-foreground truncate">
                        {student.projects[0].title}
                      </strong>
                    </span>
                    <span className="shrink-0 text-[10px]">
                      {student.projects.length} {student.projects.length === 1 ? "project" : "projects"}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1"
                  onClick={() => handleOpenCandidate(student)}
                >
                  View Profile
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  size="sm"
                  className="text-xs flex-1"
                  onClick={() => handleMessageCandidate(student)}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Message
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Candidate Profile Review Modal */}
        <CandidateProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidate={selectedCandidate}
          onMessage={() => {
            if (selectedCandidate) {
              const student = recruiterStudents.find((s) => s.id === selectedCandidate.id);
              if (student) handleMessageCandidate(student);
            }
          }}
          onShortlistToggle={() => {
            if (selectedCandidate) toggleShortlistCandidate(selectedCandidate.id);
          }}
          isShortlisted={
            selectedCandidate
              ? recruiterStudents.find((s) => s.id === selectedCandidate.id)?.isShortlisted
              : false
          }
        />
      </div>
    </RoleGuard>
  );
}
