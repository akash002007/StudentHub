"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  User,
  GraduationCap,
  Briefcase,
  AlertCircle,
  MoreVertical,
  Edit,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { CandidateProfileModal, CandidateModalData } from "@/components/dashboard/CandidateProfileModal";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import {
  RecruiterInterview,
  InterviewType,
  InterviewStatus,
} from "@/types";

export default function RecruiterInterviewsPage() {
  const {
    recruiterInterviews,
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    completeInterview,
    recruiterApplicants,
    recruiterStudents,
    recruiterInternships,
    toggleShortlistCandidate,
    startRecruiterConversation,
  } = useData();

  const { success, error: toastError } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<RecruiterInterview | null>(null);

  // Candidate Profile Review Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateModalData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New Interview Form
  const [candidateId, setCandidateId] = useState(recruiterApplicants[0]?.studentId || "");
  const [internshipTitle, setInternshipTitle] = useState(recruiterInternships[0]?.title || "");
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical");
  const [interviewDate, setInterviewDate] = useState("2026-04-02");
  const [interviewTime, setInterviewTime] = useState("11:00 AM PST");
  const [duration, setDuration] = useState("45 mins");
  const [interviewerName, setInterviewerName] = useState("David K. (Staff Infrastructure Engineer)");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/stripe-interview");
  const [notes, setNotes] = useState("");

  // Reschedule Form
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Feedback Form
  const [feedbackText, setFeedbackText] = useState("");

  const filteredInterviews = recruiterInterviews.filter((item) => {
    const matchesSearch =
      item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.candidateUniversity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interviewerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || item.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const scheduledCount = recruiterInterviews.filter((i) => i.status === "Scheduled" || i.status === "Rescheduled").length;
  const completedCount = recruiterInterviews.filter((i) => i.status === "Completed").length;
  const cancelledCount = recruiterInterviews.filter((i) => i.status === "Cancelled").length;

  const handleOpenScheduleModal = () => {
    if (recruiterApplicants.length > 0) {
      setCandidateId(recruiterApplicants[0].studentId);
    }
    setIsScheduleModalOpen(true);
  };

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedApp = recruiterApplicants.find((a) => a.studentId === candidateId);
    const selectedStud = recruiterStudents.find((s) => s.id === candidateId);

    const candName = selectedApp?.studentName || selectedStud?.name || "Student Candidate";
    const candAvatar = selectedApp?.studentAvatar || selectedStud?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
    const candUni = selectedApp?.university || selectedStud?.university || "University";

    scheduleInterview({
      candidateId,
      candidateName: candName,
      candidateAvatar: candAvatar,
      candidateUniversity: candUni,
      candidateRole: internshipTitle,
      internshipTitle,
      type: interviewType,
      date: interviewDate,
      time: interviewTime,
      duration,
      interviewerName,
      meetingLink,
      notes,
    });

    setIsScheduleModalOpen(false);
    setNotes("");
  };

  const handleOpenReschedule = (interview: RecruiterInterview) => {
    setSelectedInterview(interview);
    setNewDate(interview.date);
    setNewTime(interview.time);
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    rescheduleInterview(selectedInterview.id, newDate, newTime);
    setIsRescheduleModalOpen(false);
  };

  const handleOpenFeedback = (interview: RecruiterInterview) => {
    setSelectedInterview(interview);
    setFeedbackText(interview.feedback || "");
    setIsFeedbackModalOpen(true);
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    completeInterview(selectedInterview.id, feedbackText);
    setIsFeedbackModalOpen(false);
  };

  const handleOpenCandidateProfile = (interview: RecruiterInterview) => {
    const studentMatch = recruiterStudents.find(
      (s) =>
        s.id === interview.candidateId ||
        s.name.toLowerCase() === interview.candidateName.toLowerCase()
    );
    const applicantMatch = recruiterApplicants.find(
      (a) =>
        a.studentId === interview.candidateId ||
        a.studentName.toLowerCase() === interview.candidateName.toLowerCase()
    );

    setSelectedCandidate({
      id: interview.candidateId,
      name: interview.candidateName,
      avatar: interview.candidateAvatar,
      university: interview.candidateUniversity,
      degree: studentMatch?.degree || applicantMatch?.degree || "Student",
      branch: studentMatch?.branch || applicantMatch?.branch || "Engineering",
      graduationYear: studentMatch?.graduationYear || applicantMatch?.graduationYear || 2026,
      cgpa: studentMatch?.cgpa || applicantMatch?.cgpa || "3.9",
      location: studentMatch?.location || applicantMatch?.location || "Remote",
      skills: studentMatch?.skills || applicantMatch?.skills || ["Engineering"],
      bio: studentMatch?.bio || applicantMatch?.bio || "",
      matchScore: applicantMatch?.matchScore || 90,
      resumeUrl: studentMatch?.resumeUrl || applicantMatch?.resumeUrl,
      portfolioUrl: studentMatch?.portfolioUrl || applicantMatch?.portfolioUrl,
      githubUrl: studentMatch?.githubUrl || applicantMatch?.githubUrl,
      linkedinUrl: studentMatch?.linkedinUrl || applicantMatch?.linkedinUrl,
      projects: studentMatch?.projects || applicantMatch?.projects,
      certifications: studentMatch?.certifications || applicantMatch?.certifications,
      isShortlisted: studentMatch?.isShortlisted,
      careerDNA: (studentMatch as any)?.careerDNA,
    });
    setIsProfileModalOpen(true);
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interview Operations</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Candidate Interviews
            </h1>
            <p className="text-xs text-muted-foreground">
              Coordinate technical rounds, managerial syncs, and candidate evaluations.
            </p>
          </div>

          <Button
            type="button"
            variant="gradient"
            size="sm"
            onClick={handleOpenScheduleModal}
            className="shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-border bg-card">
            <div className="text-xs font-medium text-muted-foreground">Total Scheduled</div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {recruiterInterviews.length}
            </div>
          </Card>
          <Card className="p-4 border-border bg-card">
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Upcoming Rounds</div>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {scheduledCount}
            </div>
          </Card>
          <Card className="p-4 border-border bg-card">
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Completed</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {completedCount}
            </div>
          </Card>
          <Card className="p-4 border-border bg-card">
            <div className="text-xs font-medium text-muted-foreground">Cancelled</div>
            <div className="text-2xl font-extrabold text-muted-foreground mt-1">
              {cancelledCount}
            </div>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidate, role, or interviewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Types</option>
              <option value="technical">Technical</option>
              <option value="video">Video</option>
              <option value="hr">HR</option>
              <option value="managerial">Managerial</option>
              <option value="final">Final Round</option>
              <option value="phone">Phone Screen</option>
            </select>
          </div>
        </div>

        {/* Interviews List */}
        <div className="space-y-3">
          {filteredInterviews.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
              <div className="text-sm font-semibold text-foreground">No interviews found</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No scheduled candidate sessions match your search criteria.
              </p>
            </div>
          ) : (
            filteredInterviews.map((interview) => {
              const isUpcoming = interview.status === "Scheduled" || interview.status === "Rescheduled";
              const isDone = interview.status === "Completed";
              const isCancelled = interview.status === "Cancelled";

              return (
                <div
                  key={interview.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border bg-card hover:border-purple-500/30 transition-all space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={interview.candidateAvatar}
                        name={interview.candidateName}
                        size="md"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {interview.candidateName}
                          </span>
                          <Badge
                            variant={
                              interview.type === "Technical"
                                ? "purple"
                                : interview.type === "Final"
                                ? "emerald"
                                : "blue"
                            }
                            size="sm"
                          >
                            {interview.type} Round
                          </Badge>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isDone
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isCancelled
                                ? "bg-rose-500/10 text-rose-600"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            }`}
                          >
                            {interview.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                            {interview.candidateUniversity}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                            {interview.internshipTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Time & Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl border border-border/60">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-semibold text-foreground">{interview.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl border border-border/60">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{interview.time} ({interview.duration})</span>
                      </div>
                    </div>
                  </div>

                  {/* Interviewer and Notes Row */}
                  <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">Interviewer: </span>
                        {interview.interviewerName}
                      </div>
                      {interview.notes && (
                        <div className="text-muted-foreground text-[11px] italic">
                          "{interview.notes}"
                        </div>
                      )}
                      {interview.feedback && (
                        <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                          Feedback: "{interview.feedback}"
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCandidateProfile(interview)}
                        className="text-xs h-8 cursor-pointer text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                      >
                        Profile &amp; Career DNA
                      </Button>

                      {isUpcoming && (
                        <>
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meeting</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                          </a>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReschedule(interview)}
                            className="text-xs h-8 cursor-pointer"
                          >
                            Reschedule
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenFeedback(interview)}
                            className="text-xs h-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                          >
                            Complete
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelInterview(interview.id, "Candidate requested reschedule / conflicting cohort")}
                            className="text-xs h-8 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {isDone && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenFeedback(interview)}
                          className="text-xs h-8 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Edit Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Schedule Interview Modal */}
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Schedule Candidate Interview"
          description="Set up an evaluation round with a student applicant."
        >
          <form onSubmit={handleCreateInterview} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Select Candidate *
              </label>
              <select
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
                required
              >
                {recruiterApplicants.map((app) => (
                  <option key={app.id} value={app.studentId}>
                    {app.studentName} &bull; {app.university} ({app.internshipTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Interview Round Type *
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                  className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
                >
                  <option value="Phone">Phone Screen</option>
                  <option value="Video">Video Call</option>
                  <option value="Technical">Technical Round</option>
                  <option value="HR">HR / Culture Fit</option>
                  <option value="Managerial">Managerial</option>
                  <option value="Final">Final Round</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Duration *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
                >
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="60 mins">60 mins</option>
                  <option value="90 mins">90 mins</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Date *"
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
              <Input
                label="Time *"
                placeholder="11:00 AM PST"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                required
              />
            </div>

            <Input
              label="Interviewer Name & Role *"
              placeholder="David K. (Staff Systems Engineer)"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              required
            />

            <Input
              label="Meeting Link *"
              placeholder="https://meet.google.com/abc-xyz"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Focus Areas / Prep Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Focus on systems architecture and live code walkthrough."
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Confirm & Send Invitation
              </Button>
            </div>
          </form>
        </Modal>

        {/* Reschedule Modal */}
        <Modal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          title="Reschedule Interview"
          description={`Update date and time for ${selectedInterview?.candidateName}`}
        >
          <form onSubmit={handleSaveReschedule} className="space-y-4">
            <Input
              label="New Date *"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
            <Input
              label="New Time *"
              placeholder="02:30 PM PST"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRescheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Save & Notify Candidate
              </Button>
            </div>
          </form>
        </Modal>

        {/* Feedback Modal */}
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          title="Interview Evaluation & Feedback"
          description={`Submit feedback notes for ${selectedInterview?.candidateName}`}
        >
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Evaluation Notes *
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                placeholder="Candidate demonstrated strong algorithmic problem solving and clear communication..."
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFeedbackModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Save Feedback & Mark Completed
              </Button>
            </div>
          </form>
        </Modal>

        {/* Candidate Profile Review Modal with Career DNA */}
        <CandidateProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          candidate={selectedCandidate}
          onShortlistToggle={() => {
            if (selectedCandidate) toggleShortlistCandidate(selectedCandidate.id);
          }}
          isShortlisted={
            selectedCandidate
              ? recruiterStudents.find((s) => s.id === selectedCandidate.id)?.isShortlisted
              : false
          }
          onMessage={() => {
            if (!selectedCandidate) return;
            startRecruiterConversation({
              id: selectedCandidate.id,
              name: selectedCandidate.name,
              avatar: selectedCandidate.avatar,
              role: selectedCandidate.degree,
              college: selectedCandidate.university,
            });
            setIsProfileModalOpen(false);
          }}
        />
      </div>
    </RoleGuard>
  );
}
