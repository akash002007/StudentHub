"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Briefcase,
  Users2,
  GitPullRequest,
  CheckCircle2,
  TrendingUp,
  Eye,
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  PlusCircle,
  Search,
  BarChart3,
  Building2,
  UserCheck,
  Award,
  Filter,
  ShieldCheck,
  Bookmark,
  Video,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { getTimeAwareGreeting, getStatusBadgeStyle } from "@/lib/utils";
import { CandidateProfileModal, CandidateModalData } from "@/components/dashboard/CandidateProfileModal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { ApplicationStatus } from "@/types";

export default function RecruiterDashboardHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    recruiterInternships,
    recruiterApplicants,
    recruiterStudents,
    recruiterInterviews,
    updateApplicantStatus,
    toggleShortlistCandidate,
    addApplicantNote,
    startRecruiterConversation,
  } = useData();

  const [greeting, setGreeting] = useState("Good morning");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setGreeting(getTimeAwareGreeting(new Date()));
  }, []);

  const activeInternships = recruiterInternships.filter((i) => i.status === "Active");
  const totalApplicationsCount = recruiterInternships.reduce(
    (acc, curr) => acc + curr.applicationsCount,
    0
  );
  const newApplicationsCount = recruiterApplicants.filter(
    (a) => a.status === "Applied" || a.status === "Under Review"
  ).length;
  const shortlistedCount = recruiterApplicants.filter((a) => a.status === "Shortlisted").length;
  const interviewsCount = recruiterApplicants.filter((a) => a.status === "Interview").length;
  const totalViewsCount = recruiterInternships.reduce(
    (acc, curr) => acc + curr.viewsCount,
    0
  );

  const recentApplicants = recruiterApplicants.slice(0, 5);

  const handleOpenCandidate = (applicant: (typeof recruiterApplicants)[0]) => {
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

  const handleMessageCandidate = () => {
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
      <div className="space-y-8">
        {/* Recruiter Workspace Hero Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-950/30 via-card to-purple-950/20 border border-blue-500/20 shadow-sm overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gradient" size="sm" className="font-semibold">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  Recruiter Hiring Workspace
                </Badge>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Recruiter &bull; Stripe
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {greeting},{" "}
                <span className="text-gradient">
                  {user?.name ? user.name.split(" ")[0] : "Sarah"}
                </span>
                !
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Your hiring overview across all active listings. You have{" "}
                <span className="text-foreground font-semibold">
                  {newApplicationsCount} candidate submissions
                </span>{" "}
                ready for review today.
              </p>
            </div>

            {/* Quick Action Button Group */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link href="/dashboard/recruiter/post-internship">
                <Button variant="gradient" size="sm" rightIcon={<PlusCircle className="w-4 h-4" />}>
                  Post Internship
                </Button>
              </Link>
              <Link href="/dashboard/recruiter/students">
                <Button variant="outline" size="sm" rightIcon={<Search className="w-4 h-4" />}>
                  Find Talent
                </Button>
              </Link>
              <Link href="/dashboard/recruiter/interviews">
                <Button variant="outline" size="sm" rightIcon={<Calendar className="w-4 h-4" />}>
                  Interviews
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hiring Statistics Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Internships
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {activeInternships.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">10 Openings</span> available
            </p>
          </Card>

          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Applications
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <GitPullRequest className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {totalApplicationsCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-purple-500 font-semibold">+{newApplicationsCount} new</span> awaiting review
            </p>
          </Card>

          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shortlisted
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {shortlistedCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">High-match candidates</p>
          </Card>

          <Card hoverEffect className="p-5 border-border/80 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interviews Scheduled
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {interviewsCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-amber-500 font-semibold">This week:</span> Alex Rivera (Stanford)
            </p>
          </Card>
        </div>

        {/* Main 2-Column Section: Candidate Pipeline & Active Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Recent Candidate Submissions (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Recent Applications
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest student applicants for your engineering and design listings
                </p>
              </div>
              <Link href="/dashboard/recruiter/applications">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  View All Candidates
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentApplicants.map((applicant) => {
                const style = getStatusBadgeStyle(applicant.status);
                return (
                  <Card
                    key={applicant.id}
                    hoverEffect
                    className="p-4 sm:p-5 border-border/80 bg-card space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={applicant.studentAvatar}
                          name={applicant.studentName}
                          size="md"
                          isOnline={true}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-foreground">
                              {applicant.studentName}
                            </h3>
                            <Badge variant="emerald" size="sm" className="font-semibold text-[10px]">
                              {applicant.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {applicant.university} • {applicant.branch} •{" "}
                            <span className="font-semibold text-foreground/80">
                              CGPA {applicant.cgpa}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border} shrink-0`}
                      >
                        {applicant.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px] truncate mr-2">
                        Role:{" "}
                        <strong className="text-foreground">{applicant.internshipTitle}</strong>
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {applicant.appliedDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground/80"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleOpenCandidate(applicant)}
                      >
                        Review Profile
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Internships & Quick Shortcuts (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Internship Listings */}
            <Card className="p-5 border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Active Listings</h3>
                  <p className="text-xs text-muted-foreground">Live student-facing positions</p>
                </div>
                <Link href="/dashboard/recruiter/internships">
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {activeInternships.slice(0, 3).map((listing) => (
                  <div
                    key={listing.id}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-foreground leading-snug">
                          {listing.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {listing.workType} • {listing.stipend}
                        </p>
                      </div>
                      <Badge variant="purple" size="sm">
                        {listing.internshipType}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Users2 className="w-3.5 h-3.5 text-purple-500" />
                        <strong className="text-foreground">{listing.applicationsCount}</strong>{" "}
                        applicants
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <strong className="text-foreground">{listing.viewsCount}</strong> views
                      </span>
                      <span className="text-rose-500 font-semibold text-[10px]">
                        Due {listing.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Interviews Widget */}
            <Card className="p-5 border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>Upcoming Interviews</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Scheduled evaluation rounds</p>
                </div>
                <Link href="/dashboard/recruiter/interviews">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-2.5">
                {recruiterInterviews
                  .filter((i) => i.status === "Scheduled" || i.status === "Rescheduled")
                  .slice(0, 2)
                  .map((int) => (
                    <div
                      key={int.id}
                      className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Avatar src={int.candidateAvatar} name={int.candidateName} size="sm" />
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-foreground truncate">
                            {int.candidateName}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {int.type} &bull; {int.date} ({int.time})
                          </div>
                        </div>
                      </div>

                      <a
                        href={int.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shrink-0 shadow-xs"
                        title="Join Meeting"
                      >
                        <Video className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Recruiter Quick Action Tiles */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/recruiter/post-internship"
                className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex flex-col justify-between group h-28"
              >
                <PlusCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-bold text-xs text-foreground">Post Internship</div>
                  <div className="text-[10px] text-muted-foreground">Publish new role</div>
                </div>
              </Link>

              <Link
                href="/dashboard/recruiter/students"
                className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex flex-col justify-between group h-28"
              >
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-bold text-xs text-foreground">Find Students</div>
                  <div className="text-[10px] text-muted-foreground">Source top talent</div>
                </div>
              </Link>

              <Link
                href="/dashboard/recruiter/analytics"
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex flex-col justify-between group h-28"
              >
                <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-bold text-xs text-foreground">Hiring Analytics</div>
                  <div className="text-[10px] text-muted-foreground">Funnel performance</div>
                </div>
              </Link>

              <Link
                href="/dashboard/recruiter/company"
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex flex-col justify-between group h-28"
              >
                <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-bold text-xs text-foreground">Company Profile</div>
                  <div className="text-[10px] text-muted-foreground">Stripe Talent Hub</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Candidate Profile Review Modal */}
        <CandidateProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidate={selectedCandidate}
          onStatusChange={handleStatusChange}
          onMessage={handleMessageCandidate}
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
