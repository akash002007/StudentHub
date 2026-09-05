"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
// useData removed
import { useToast } from "@/context/ToastContext";
import { Internship as BaseInternship } from "@/types";

// Extend Internship type with our dynamic fields
type Internship = BaseInternship & { isSaved?: boolean; hasApplied?: boolean };

export default function InternshipsPage() {
  const { success } = useToast();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState<string>("all");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyingInternship, setApplyingInternship] = useState<Internship | null>(null);
  const [applicationNote, setApplicationNote] = useState("");

  useEffect(() => {
    async function fetchInternships() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/internships?search=${encodeURIComponent(searchQuery)}&format=${workTypeFilter}&discipline=${selectedDomain}`);
        if (res.ok) {
          const data = await res.json();
          setInternships(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Simple debounce for search
    const timeoutId = setTimeout(() => {
      fetchInternships();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, workTypeFilter, selectedDomain]);

  const tabs = [
    { id: "all", label: "All Internships", count: internships.length },
    { id: "recommended", label: "Recommended (85%+ Match)", count: internships.filter(i => i.matchPercentage >= 85).length },
    { id: "saved", label: "Saved Roles", count: internships.filter(i => i.isSaved).length },
    { id: "remote", label: "100% Remote", count: internships.filter((i) => i.workType === "Remote").length },
  ];

  const domainOptions = [
    { id: "all", label: "All Disciplines" },
    { id: "tech", label: "Engineering & Tech" },
    { id: "business", label: "Finance & Business" },
    { id: "health", label: "Healthcare & Bio" },
    { id: "law", label: "Law & Policy" },
    { id: "design", label: "Design & Creative" },
  ];

  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      // API already filters by search, workType, and domain. 
      // We only need to filter locally by activeTab.
      if (activeTab === "recommended") {
        return item.matchPercentage >= 85;
      }
      if (activeTab === "saved") {
        return item.isSaved;
      }
      if (activeTab === "remote") {
        return item.workType === "Remote";
      }
      return true;
    });
  }, [internships, activeTab]);

  const handleOpenApply = (internship: Internship) => {
    setApplyingInternship(internship);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingInternship) return;

    const id = applyingInternship.id;
    // Optimistic UI
    setInternships(prev => prev.map(i => i.id === id ? { ...i, hasApplied: true, applicantsCount: (i.applicantsCount || 0) + 1 } : i));
    
    setIsApplyModalOpen(false);
    setApplicationNote("");
    setApplyingInternship(null);
    success("Application submitted successfully!");

    try {
      await fetch(`/api/internships/${id}/apply`, { method: "POST" });
    } catch (err) {
      console.error(err);
      setInternships(prev => prev.map(i => i.id === id ? { ...i, hasApplied: false, applicantsCount: (i.applicantsCount || 1) - 1 } : i));
    }
  };

  const handleToggleSave = async (id: string) => {
    // Optimistic UI update
    setInternships(prev => prev.map(i => i.id === id ? { ...i, isSaved: !i.isSaved } : i));
    try {
      await fetch(`/api/internships/${id}/save`, { method: "POST" });
    } catch (err) {
      console.error(err);
      setInternships(prev => prev.map(i => i.id === id ? { ...i, isSaved: !i.isSaved } : i));
    }
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
            Explore verified student roles across Engineering, Business, Bio &amp; Healthcare, Law, and Design.
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, department or skill..."
              className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Work type filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(["all", "remote", "hybrid", "onsite"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setWorkTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 border ${
                  workTypeFilter === type
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                }`}
              >
                {type === "all" ? "All Formats" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Academic Domain Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {domainOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedDomain(opt.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 border ${
                selectedDomain === opt.id
                  ? "bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold"
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

      {/* Internships Cards List */}
      {filteredInternships.length === 0 ? (
        <EmptyState
          title="No internships match your filters"
          description="Try clearing your search query or changing location filters to view more student opportunities."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setWorkTypeFilter("all");
            setActiveTab("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading && internships.length === 0 ? (
            <div className="col-span-1 md:col-span-2 py-20 flex justify-center text-muted-foreground">
              Loading internships...
            </div>
          ) : filteredInternships.map((intern) => {
            const isSaved = intern.isSaved;
            const isApplied = intern.hasApplied;

            return (
              <Card
                key={intern.id}
                hoverEffect
                className="p-6 border-border/80 bg-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={intern.companyLogo}
                          alt={intern.company}
                          className="w-full h-full object-cover"
                        />
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
                      <Badge variant="emerald" size="sm" className="font-bold">
                        {intern.matchPercentage}% Match
                      </Badge>
                      <button
                        onClick={() => handleToggleSave(intern.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Bookmark internship"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isSaved ? "fill-purple-600 text-purple-600" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Stipend and Meta Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="purple" size="sm" className="font-bold">
                      {intern.stipend}
                    </Badge>
                    <span className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border/50">
                      {intern.workType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border/50">
                      {intern.duration}
                    </span>
                  </div>

                  {/* Why this matches you section */}
                  <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Why this matches you:</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {intern.matchReasons.projectSynergy}. Aligns with your{" "}
                      {intern.matchReasons.academicMatch}.
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {intern.requiredSkills.map((skill) => (
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
                    <Clock className="w-3 h-3" /> Deadline: {intern.deadline}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInternship(intern)}
                    >
                      View Details
                    </Button>

                    {isApplied ? (
                      <Button variant="secondary" size="sm" disabled className="gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Applied
                      </Button>
                    ) : (
                      <Button
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
        description={`${selectedInternship?.company} • ${selectedInternship?.location} • ${selectedInternship?.stipend}`}
        maxWidth="2xl"
      >
        {selectedInternship && (
          <div className="space-y-5 text-xs sm:text-sm text-foreground">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                About The Role
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {selectedInternship.description}
              </p>
            </div>

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

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Requirements &amp; Qualifications
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
                {selectedInternship.requirements.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

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

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedInternship.applicantsCount} student applicants
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

      {/* 1-Click Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply to ${applyingInternship?.company}`}
        description={`Fast-Track submission for ${applyingInternship?.title}`}
      >
        {applyingInternship && (
          <form onSubmit={handleConfirmApply} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border/60 text-xs space-y-2">
              <div className="font-semibold text-foreground">Attached Profile Assets:</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Alex_Rivera_SWE_Resume_2026.pdf</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>PulseFlow, DeepQuery, CampusEats (Projects)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Stanford University (B.S. CS &apos;26)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                Note for Recruiter (Optional)
              </label>
              <textarea
                rows={3}
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
                placeholder="Share why you're enthusiastic about this team or highlight relevant project achievements..."
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
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
              <Button type="submit" variant="gradient" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
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
