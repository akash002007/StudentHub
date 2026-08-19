"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  MapPin,
  Mail,
  Award,
  FileText,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Sparkles,
  Send,
  UserCheck,
  CheckCircle,
  Clock,
  Layers,
  Code2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ApplicationStatus, Project, Certification } from "@/types";

export interface CandidateModalData {
  id: string;
  name: string;
  avatar: string;
  university: string;
  degree: string;
  branch: string;
  academicStream?: string;
  specialization?: string;
  graduationYear: number;
  cgpa: string;
  location: string;
  skills: string[];
  bio: string;
  status?: string;
  matchScore?: number;
  resumeUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  behanceUrl?: string;
  researchGateUrl?: string;
  ssrnUrl?: string;
  projects?: Project[];
  certifications?: Certification[];
  applicationStatus?: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
}

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateModalData | null;
  onStatusChange?: (newStatus: ApplicationStatus) => void;
  onShortlistToggle?: () => void;
  isShortlisted?: boolean;
  onMessage?: () => void;
  onSaveNote?: (note: string) => void;
}

export function CandidateProfileModal({
  isOpen,
  onClose,
  candidate,
  onStatusChange,
  onShortlistToggle,
  isShortlisted,
  onMessage,
  onSaveNote,
}: CandidateProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "notes">("overview");
  const [noteText, setNoteText] = useState(candidate?.notes || "");

  if (!candidate) return null;

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveNote) {
      onSaveNote(noteText);
    }
  };

  const statusOptions: ApplicationStatus[] = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="2xl"
    >
      <div className="space-y-6 -mt-4">
        {/* Header Hero */}
        <div className="relative rounded-2xl p-5 bg-gradient-to-br from-purple-900/25 via-muted/60 to-blue-900/20 border border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={candidate.avatar}
                name={candidate.name}
                size="xl"
                isOnline={true}
                className="ring-4 ring-card"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    {candidate.name}
                  </h2>
                  {candidate.matchScore && (
                    <Badge variant="emerald" size="sm" className="font-bold">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {candidate.matchScore}% Match
                    </Badge>
                  )}
                  {candidate.academicStream && (
                    <Badge variant="purple" size="sm" className="font-medium">
                      {candidate.academicStream}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-medium text-foreground/90">{candidate.university}</span>
                  <span>•</span>
                  <span>{candidate.degree} ({candidate.graduationYear})</span>
                  {candidate.specialization && (
                    <>
                      <span>•</span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">{candidate.specialization}</span>
                    </>
                  )}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" /> {candidate.location}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    CGPA: {candidate.cgpa}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {onShortlistToggle && (
                <Button
                  type="button"
                  variant={isShortlisted ? "primary" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={onShortlistToggle}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  {isShortlisted ? "Shortlisted" : "Shortlist"}
                </Button>
              )}
              {onMessage && (
                <Button
                  type="button"
                  variant="gradient"
                  size="sm"
                  className="text-xs"
                  onClick={onMessage}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Message
                </Button>
              )}
            </div>
          </div>

          {/* Social / External Links Bar */}
          <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-3 text-xs">
            {candidate.portfolioUrl && (
              <a
                href={candidate.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {candidate.githubUrl && (
              <a
                href={candidate.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-foreground/80 hover:text-foreground font-medium"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {candidate.linkedinUrl && (
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {candidate.researchGateUrl && (
              <a
                href={candidate.researchGateUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ResearchGate</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {candidate.behanceUrl && (
              <a
                href={candidate.behanceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Behance</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {candidate.ssrnUrl && (
              <a
                href={candidate.ssrnUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SSRN Law Papers</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Simulated PDF Resume preview in new tab");
              }}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium ml-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Resume (PDF)</span>
            </a>
          </div>
        </div>

        {/* Application Status Pipeline Changer (if candidate is in application context) */}
        {candidate.applicationStatus && onStatusChange && (
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                Application Stage
              </span>
              <span className="text-muted-foreground text-[11px]">
                Applied: {candidate.appliedDate || "Recent"}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {statusOptions.map((st) => {
                const isCurrent = candidate.applicationStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onStatusChange(st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                      isCurrent
                        ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-border text-xs font-semibold gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview &amp; Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === "projects"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Projects ({candidate.projects?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === "notes"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Recruiter Notes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4 text-xs">
            {/* Bio */}
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 text-xs">Candidate Summary</h4>
              <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                {candidate.bio || "No summary provided by student."}
              </p>
            </div>

            {/* Skills Badges */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-xs">Verified Skills &amp; Domain Expertise</h4>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Academic Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground block">Specialization / Major</span>
                <span className="font-bold text-foreground">{candidate.specialization || candidate.branch}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground block">Cumulative CGPA</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {candidate.cgpa}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] text-muted-foreground block">Graduation Class</span>
                <span className="font-bold text-foreground">Class of {candidate.graduationYear}</span>
              </div>
            </div>

            {/* Certifications if available */}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-xs">Certifications</h4>
                <div className="space-y-2">
                  {candidate.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-foreground">{cert.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {cert.issuingOrganization} • {cert.issueDate}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm">
                        Verified
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            {candidate.projects && candidate.projects.length > 0 ? (
              candidate.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-foreground">{proj.title}</h5>
                        <Badge variant="purple" size="sm">
                          {proj.type}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{proj.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.documentUrl && (
                        <a
                          href={proj.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5" /> Doc
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(proj.technologies || proj.tools || []).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-card text-[10px] font-mono text-muted-foreground border border-border/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Code2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No proof-of-work projects listed by this candidate yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <form onSubmit={handleNoteSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-1.5">
                Internal Recruiter &amp; Hiring Team Notes
              </label>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add interview feedback, technical assessment notes, or alignment observations..."
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="gradient" size="sm">
                Save Recruiter Notes
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
