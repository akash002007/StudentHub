"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Bookmark,
  Building2,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  ArrowUpRight,
  Send,
  X,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";

export interface InternshipUI {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyDescription?: string;
  location: string;
  format: "Remote" | "Hybrid" | "Onsite" | string;
  workType?: "Remote" | "Hybrid" | "Onsite" | string;
  discipline: string;
  pay: string;
  stipend?: string;
  duration: string;
  skills: string[];
  requiredSkills?: string[];
  deadline: string;
  match_percentage: number;
  matchPercentage?: number;
  match_reason: string;
  matchReasons?: {
    matchingSkills: string[];
    academicMatch: string;
    projectSynergy: string;
  };
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  perks?: string[];
  applicants_count?: number;
  applicantsCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export default function InternshipsPage() {
  const { success } = useToast();

  // 1. React State for Filters & Data
  const [internships, setInternships] = useState<InternshipUI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFormat, setActiveFormat] = useState<string>("all");
  const [activeDiscipline, setActiveDiscipline] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  const [selectedInternship, setSelectedInternship] = useState<InternshipUI | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [applyingInternship, setApplyingInternship] = useState<InternshipUI | null>(null);
  const [applicationNote, setApplicationNote] = useState<string>("");

  // 2. Data Fetching via useEffect whenever any filter state changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({
          search: searchQuery,
          format: activeFormat,
          discipline: activeDiscipline,
          tab: activeTab,
        });

        const res = await fetch(`/api/internships?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setInternships(data);
          }
        } else {
          console.error("Error response from /api/internships:", res.statusText);
        }
      } catch (err) {
        console.error("Failed to fetch internships:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeFormat, activeDiscipline, activeTab]);

  // Tab definitions with counts
  const tabs = useMemo(() => {
    return [
      { id: "all", label: "All Internships", count: internships.length },
      {
        id: "recommended",
        label: "Recommended (85%+ Match)",
        count: internships.filter(
          (i) => (i.match_percentage ?? i.matchPercentage ?? 0) >= 85
        ).length,
      },
      {
        id: "saved",
        label: "Saved Roles",
        count: internships.filter((i) => i.isSaved).length,
      },
      {
        id: "remote",
        label: "100% Remote",
        count: internships.filter(
          (i) => (i.format || i.workType)?.toLowerCase() === "remote"
        ).length,
      },
    ];
  }, [internships]);

  const domainOptions = [
    { id: "all", label: "All Disciplines" },
    { id: "tech", label: "Engineering & Tech" },
    { id: "business", label: "Finance & Business" },
    { id: "health", label: "Healthcare & Bio" },
    { id: "law", label: "Law & Policy" },
    { id: "design", label: "Design & Creative" },
  ];

  // Optimistic Save / Bookmark Toggle
  const handleToggleSave = async (id: string) => {
    setInternships((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      )
    );

    try {
      const res = await fetch(`/api/internships/${id}/save`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Save request failed");
      }
      const data = await res.json();
      setInternships((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isSaved: data.saved } : item
        )
      );
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setInternships((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isSaved: !item.isSaved } : item
        )
      );
    }
  };

  // Open Quick Apply Modal
  const handleOpenApply = (internship: InternshipUI) => {
    setApplyingInternship(internship);
    setIsApplyModalOpen(true);
  };

  // Optimistic Apply Submission
  const handleConfirmApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingInternship) return;

    const targetId = applyingInternship.id;

    // Optimistic UI update
    setInternships((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? {
              ...item,
              hasApplied: true,
              applicants_count: (item.applicants_count ?? item.applicantsCount ?? 0) + 1,
              applicantsCount: (item.applicants_count ?? item.applicantsCount ?? 0) + 1,
            }
          : item
      )
    );

    setIsApplyModalOpen(false);
    setApplicationNote("");
    setApplyingInternship(null);
    success("Application submitted successfully!");

    try {
      const res = await fetch(`/api/internships/${targetId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: applicationNote }),
      });
      if (!res.ok) {
        throw new Error("Apply request failed");
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setInternships((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                hasApplied: false,
                applicants_count: Math.max(0, (item.applicants_count ?? 1) - 1),
                applicantsCount: Math.max(0, (item.applicantsCount ?? 1) - 1),
              }
            : item
        )
      );
    }
  };

  const formatDeadline = (deadlineStr: string) => {
    try {
      const d = new Date(deadlineStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch {
      // Fallback to string
    }
    return deadlineStr;
  };

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Internship Discovery
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Explore verified opportunities across Engineering, Business, and Tech tailored to your skills.
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="internship-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role, company, skills (Python, C++, JS)..."
                className="w-full h-10 pl-10 pr-10 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Work format buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {(["all", "Remote", "Hybrid", "Onsite"] as const).map((format) => (
                <button
                  key={format}
                  id={`format-btn-${format.toLowerCase()}`}
                  onClick={() => setActiveFormat(format)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 border ${
                    activeFormat.toLowerCase() === format.toLowerCase()
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {format === "all" ? "All Formats" : format}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Domain Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {domainOptions.map((opt) => (
              <button
                key={opt.id}
                id={`discipline-btn-${opt.id}`}
                onClick={() => setActiveDiscipline(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 border ${
                  activeDiscipline === opt.id
                    ? "bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                    : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Internships Cards Grid */}
        {isLoading && internships.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Fetching verified student opportunities...</p>
          </div>
        ) : internships.length === 0 ? (
          <EmptyState
            title="No internships match your filters"
            description="Try clearing your search query or adjusting format & discipline filters to view available roles."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearchQuery("");
              setActiveFormat("all");
              setActiveDiscipline("all");
              setActiveTab("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {internships.map((intern) => {
              const matchVal = intern.match_percentage ?? intern.matchPercentage ?? 80;
              const displayFormat = intern.format || intern.workType || "Remote";
              const displayPay = intern.pay || intern.stipend || "$45/hr";
              const displaySkills = intern.skills || intern.requiredSkills || [];
              const matchReasonText =
                intern.match_reason ||
                intern.matchReasons?.projectSynergy ||
                "Role aligns with your computer science background";

              return (
                <Card
                  key={intern.id}
                  hoverEffect
                  className="p-6 border border-outline-variant bg-surface-container-lowest flex flex-col justify-between space-y-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all relative overflow-hidden group z-0"
                >
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="space-y-4">
                    {/* Top Bar: Company, Title, Match, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0 flex items-center justify-center">
                          {intern.companyLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={intern.companyLogo}
                              alt={intern.company}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground leading-snug">
                            {intern.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {intern.company} • {intern.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-space-xs py-space-2xs rounded-full bg-blue-50 text-blue-600 font-label-sm text-label-sm font-bold">
                          {matchVal}% Match
                        </span>
                        <button
                          id={`bookmark-btn-${intern.id}`}
                          onClick={() => handleToggleSave(intern.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label="Bookmark internship"
                          title={intern.isSaved ? "Saved" : "Save role"}
                        >
                          <Bookmark
                            className={`w-4 h-4 transition-transform ${
                              intern.isSaved
                                ? "fill-blue-600 text-blue-600 scale-110"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Stipend and Meta Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-space-xs py-space-2xs rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                        {displayPay}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border/50">
                        {displayFormat}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border/50">
                        {intern.duration}
                      </span>
                    </div>

                    {/* Why this matches you section */}
                    <div className="p-3 rounded-xl bg-surface-container border border-outline-variant text-xs space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center gap-1.5 font-bold text-primary text-[11px] relative z-10">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Why this matches you:</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {matchReasonText}
                      </p>
                    </div>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {displaySkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-muted text-foreground/80 text-[11px] font-medium border border-border/40"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Deadline: {formatDeadline(intern.deadline)}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedInternship(intern)}
                      >
                        View Details
                      </Button>

                      {intern.hasApplied ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled
                          className="gap-1 font-semibold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Applied
                        </Button>
                      ) : (
                        <Button
                          id={`apply-btn-${intern.id}`}
                          variant="gradient"
                          size="sm"
                          onClick={() => handleOpenApply(intern)}
                          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        >
                          Quick Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Internship Details Modal */}
        <Modal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          title={selectedInternship?.title}
          description={`${selectedInternship?.company} • ${selectedInternship?.location} • ${
            selectedInternship?.pay || selectedInternship?.stipend
          }`}
          maxWidth="2xl"
        >
          {selectedInternship && (
            <div className="space-y-5 text-xs sm:text-sm text-foreground">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  About The Role
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedInternship.description ||
                    selectedInternship.companyDescription ||
                    "No detailed description provided."}
                </p>
              </div>

              {selectedInternship.responsibilities &&
                selectedInternship.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
                      {selectedInternship.responsibilities.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedInternship.requirements &&
                selectedInternship.requirements.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Requirements &amp; Technical Skills
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
                      {selectedInternship.requirements.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedInternship.perks && selectedInternship.perks.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Perks &amp; Benefits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedInternship.perks.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-muted/60 border border-border/60 flex items-center gap-2 text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedInternship.applicants_count ?? selectedInternship.applicantsCount ?? 0} student applicants
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInternship(null)}
                  >
                    Close
                  </Button>
                  {!selectedInternship.hasApplied && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => {
                        const temp = selectedInternship;
                        setSelectedInternship(null);
                        handleOpenApply(temp);
                      }}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* 1-Click Fast Apply Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Apply to ${applyingInternship?.company}`}
          description={`Fast-Track submission for ${applyingInternship?.title}`}
        >
          {applyingInternship && (
            <form onSubmit={handleConfirmApply} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border/60 text-xs space-y-2">
                <div className="font-semibold text-foreground">Attached Verified Assets:</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified CS Engineering Resume (PDF)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Technical Portfolio &amp; Code Evidence</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>University Academic Transcript Verification</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                  Note for Hiring Manager (Optional)
                </label>
                <textarea
                  id="application-notes-textarea"
                  rows={3}
                  value={applicationNote}
                  onChange={(e) => setApplicationNote(e.target.value)}
                  placeholder="Mention relevant coursework, project repositories, or why you're passionate about this engineering team..."
                  className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  id="submit-application-btn"
                  type="submit"
                  variant="gradient"
                  size="sm"
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </RoleGuard>
  );
}
