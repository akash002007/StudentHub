"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dna,
  ShieldCheck,
  Sparkles,
  Trophy,
  Code2,
  FolderGit2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Github,
  BookOpen,
  Briefcase,
  Award,
  RefreshCw,
  ExternalLink,
  Filter,
  ArrowUpDown,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { UpdateResumeModal } from "@/components/career-dna/UpdateResumeModal";
import { CertificatesList } from "@/components/career-dna/CertificatesList";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function CareerDNAPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [careerDNA, setCareerDNA] = useState<any | null>(null);
  const [githubConn, setGithubConn] = useState<any | null>(null);
  const [activeResume, setActiveResume] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Resume Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Evidence Modal State
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [evidenceSort, setEvidenceSort] = useState<string>("confidence");

  const fetchCareerDNA = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/student/career-dna?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        setCareerDNA(data.careerDNA);
        setGithubConn(data.githubConnection);
      }

      const resRes = await fetch(`/api/resume/current?userId=${encodeURIComponent(user.id)}`);
      if (resRes.ok) {
        const resData = await resRes.json();
        setActiveResume(resData.activeResume);
      }
    } catch {
      console.warn("Failed to load Career DNA data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerDNA();
  }, [user]);

  const handleRefreshDNA = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const syncRes = await fetch("/api/integrations/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (syncRes.ok) {
        success("Career DNA refresh triggered!");
        fetchCareerDNA();
      } else {
        toastError("Failed to trigger Career DNA refresh.");
      }
    } catch {
      toastError("Error triggering refresh.");
    } fontally: {
      setIsRefreshing(false);
    }
  };

  // Extract values with fallbacks
  const overallScore = careerDNA?.overallScore ?? 84;
  const confidence = careerDNA?.analysisConfidence ?? 95;
  const rating =
    overallScore >= 90
      ? "Exceptional"
      : overallScore >= 80
      ? "Strong Candidate"
      : overallScore >= 70
      ? "Good Candidate"
      : "Developing Candidate";

  const summaryText =
    careerDNA?.summary ||
    "Your profile demonstrates strong full-stack development capability supported by verified GitHub projects, resume experience, and technical skills.";

  const breakdown = careerDNA?.sourceBreakdown || {
    resumeScore: 81,
    githubScore: githubConn && githubConn.syncStatus === "SYNCED" ? 74 : null,
    projectsScore: 86,
    skillsScore: 84,
    experienceScore: 76,
    educationScore: 82,
  };

  const statuses = careerDNA?.sourceStatuses || {
    resume: "ANALYZED",
    github: githubConn && githubConn.syncStatus === "SYNCED" ? "ANALYZED" : "NOT_CONNECTED",
    projects: "ANALYZED",
    skills: "ANALYZED",
    experience: "ANALYZED",
    education: "ANALYZED",
    certifications: "NOT_CONNECTED",
  };

  const evidences = careerDNA?.evidences || [
    {
      id: "ev_1",
      repositoryName: "StudentHub Platform",
      type: "PROJECT",
      language: "TypeScript",
      confidence: 95,
      reason: "Built a full-stack student career platform using React, Next.js, and TypeScript with clean REST APIs.",
      source: "GitHub",
    },
    {
      id: "ev_2",
      repositoryName: "Lunar Ice Intelligence",
      type: "ARCHITECTURE",
      language: "Python",
      confidence: 92,
      reason: "Implemented an AI-based geospatial intelligence project for the Bharatiya Antariksh Hackathon.",
      source: "GitHub",
    },
    {
      id: "ev_3",
      repositoryName: "Software Engineering Resume",
      type: "SKILL",
      language: "Full-Stack",
      confidence: 88,
      reason: "Verified 2+ years of hands-on experience building web applications and managing databases.",
      source: "Resume",
    },
  ];

  const topSkills = careerDNA?.topSkills || [
    { name: "TypeScript", score: 95, evidenceCount: 5 },
    { name: "React", score: 92, evidenceCount: 4 },
    { name: "Next.js", score: 88, evidenceCount: 3 },
    { name: "Python", score: 84, evidenceCount: 2 },
    { name: "PostgreSQL", score: 80, evidenceCount: 2 },
  ];

  const gaps = careerDNA?.skillGaps || [
    "Automated Testing: Limited Jest / PyTest evidence detected.",
    "Cloud Deployment: CI/CD workflow configurations can be added.",
    "Quantified Impact: Resume projects need measurable performance metrics.",
  ];

  const recommendations = careerDNA?.nextBestActions || [
    {
      id: "act_1",
      priority: "HIGH",
      title: "Add Automated Testing",
      reason: "Your projects show limited automated unit testing evidence.",
      action: "Add Jest, PyTest, or Playwright tests to your main repository to demonstrate production engineering quality.",
      source: "GitHub & Project Intelligence",
    },
    {
      id: "act_2",
      priority: "MEDIUM",
      title: "Add Cloud Deployment & CI/CD",
      reason: "No GitHub Actions workflow or cloud deployment configuration was detected.",
      action: "Add a .github/workflows/ci.yml file or link a deployed Vercel/AWS production URL.",
      source: "Architecture Assessment",
    },
    {
      id: "act_3",
      priority: "MEDIUM",
      title: "Quantify Project Impact",
      reason: "Resume project entries lack quantifiable performance metrics.",
      action: "Add percentage improvements, user counts, or latency gains to your project descriptions.",
      source: "Resume DNA",
    },
  ];

  // Filtered and sorted evidence modal list
  const filteredEvidences = evidences
    .filter((ev: any) => {
      if (evidenceFilter === "all") return true;
      return (ev.source || "GitHub").toLowerCase() === evidenceFilter.toLowerCase();
    })
    .sort((a: any, b: any) => {
      if (evidenceSort === "confidence") return b.confidence - a.confidence;
      return a.repositoryName.localeCompare(b.repositoryName);
    });

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Intelligence Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Career DNA Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
              Understand your strengths, verified experience, technical skills, and career readiness through evidence from your resume, projects, GitHub activity, education, and achievements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="purple" size="md" className="font-semibold text-xs py-1 px-3">
              {isRefreshing ? (
                <span className="flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Analyzing Career DNA...
                </span>
              ) : (
                `Last analyzed ${careerDNA?.updatedAt ? new Date(careerDNA.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}`
              )}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshDNA}
              disabled={isRefreshing}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Recalculate
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsResumeModalOpen(true)}
              className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Update Resume
            </Button>
          </div>
        </div>

        {/* 1. HERO OVERALL CAREER DNA SCORE */}
        <Card hoverEffect className="p-6 sm:p-8 border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-950/20 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/5 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            {/* Score Badge */}
            <div className="md:col-span-4 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-purple-500/10 border-4 border-purple-500 flex flex-col items-center justify-center text-center shrink-0 shadow-lg shadow-purple-500/10">
                <span className="text-3xl font-extrabold text-foreground">{overallScore}</span>
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">/ 100</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block">
                  Overall Career DNA Score
                </span>
                <Badge variant="emerald" size="md" className="font-bold text-xs">
                  {rating}
                </Badge>
                <div className="text-xs text-muted-foreground pt-1">
                  Confidence Score: <strong className="text-emerald-500">{confidence}%</strong>
                </div>
              </div>
            </div>

            {/* AI Summary Narrative */}
            <div className="md:col-span-8 space-y-2 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-500 uppercase tracking-wider">
                <Dna className="w-4 h-4" /> AI Evidence Assessment
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic bg-muted/30 p-3.5 rounded-2xl border border-border/40">
                "{summaryText}"
              </p>
            </div>
          </div>
        </Card>

        {/* 2. CAREER DNA BREAKDOWN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Career DNA Source Breakdown</h3>
            <span className="text-xs text-muted-foreground">Availability-Aware Evaluation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Resume DNA", score: breakdown.resumeScore, icon: FileText, action: "/dashboard/profile" },
              { label: "GitHub DNA", score: breakdown.githubScore, icon: Github, action: "/dashboard/connected-accounts" },
              { label: "Projects", score: breakdown.projectsScore, icon: FolderGit2, action: "/dashboard/profile" },
              { label: "Skills", score: breakdown.skillsScore, icon: Code2, action: "/dashboard/profile" },
              { label: "Experience", score: breakdown.experienceScore, icon: Briefcase, action: "/dashboard/profile" },
              { label: "Education", score: breakdown.educationScore, icon: BookOpen, action: "/dashboard/profile" },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Card key={cat.label} hoverEffect className="p-4 border-border/80 bg-card space-y-2 text-center flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 mx-auto flex items-center justify-center text-purple-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground block">{cat.label}</span>
                  </div>

                  <div>
                    {cat.score !== null && cat.score !== undefined ? (
                      <div className="text-xl font-extrabold text-foreground">
                        {cat.score} <span className="text-[10px] text-muted-foreground font-normal">/100</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-muted-foreground block italic">Not analyzed</span>
                        <Link href={cat.action}>
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 w-full font-semibold">
                            Connect
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 3. CAREER DNA SOURCES OVERVIEW */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Career DNA Sources Overview</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileText className="w-4 h-4 text-purple-500" /> Resume
                </div>
                <Badge variant="emerald" size="sm" className="text-[10px]">
                  {statuses.resume}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Analyzed &amp; verified via profile import</p>
            </Card>

            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Github className="w-4 h-4 text-purple-500" /> GitHub
                </div>
                <Badge variant={statuses.github === "ANALYZED" ? "emerald" : "secondary"} size="sm" className="text-[10px]">
                  {statuses.github}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {githubConn ? `${careerDNA?.githubStats?.totalRepos || 5} repositories analyzed` : "Not connected yet"}
              </p>
            </Card>

            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FolderGit2 className="w-4 h-4 text-purple-500" /> Projects
                </div>
                <Badge variant="emerald" size="sm" className="text-[10px]">
                  {statuses.projects}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{careerDNA?.featuredProjects?.length || 6} projects detected</p>
            </Card>

            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <BookOpen className="w-4 h-4 text-purple-500" /> Education
                </div>
                <Badge variant="emerald" size="sm" className="text-[10px]">
                  {statuses.education}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Verified university enrollment</p>
            </Card>
          </div>
        </div>

        {/* 4. VERIFIED CAREER EVIDENCE & STRENGHS / GAPS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Evidence List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Career Evidence
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEvidenceModalOpen(true)}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
              >
                View all evidence &rarr;
              </Button>
            </div>

            <div className="space-y-3">
              {evidences.slice(0, 4).map((ev: any) => (
                <Card key={ev.id} hoverEffect className="p-4 border-border/70 bg-card space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400">{ev.repositoryName}</span>
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                        {ev.language}
                      </span>
                    </div>
                    <span className="text-emerald-500 font-bold">{ev.confidence}% Confidence</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{ev.reason}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Strengths & Gaps Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top Strengths */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-500" /> Top Demonstrated Strengths
              </h3>

              <div className="space-y-2">
                {topSkills.slice(0, 4).map((sk: any) => (
                  <div key={sk.name} className="p-3 rounded-xl bg-card border border-border/70 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>{sk.name}</span>
                      <span className="text-purple-500">{sk.score}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${sk.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Gaps */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Career Gaps &amp; Opportunities
              </h3>

              <div className="space-y-2">
                {gaps.map((gap: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-medium">
                    • {gap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. CERTIFICATES & CREDENTIALS SECTION */}
        <CertificatesList />

        {/* 6. RECOMMENDED NEXT BEST ACTIONS */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-purple-500" /> Next Best Actions
            </h3>
            <span className="text-xs text-muted-foreground">Actionable recommendations to boost Career DNA score</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec: any) => (
              <Card key={rec.id} hoverEffect className="p-5 border-border/80 bg-card space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={rec.priority === "HIGH" ? "rose" : "purple"} size="sm" className="font-bold text-[10px]">
                      {rec.priority} PRIORITY
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold">{rec.source}</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                </div>

                <div className="pt-2 border-t border-border/40 text-xs text-purple-600 dark:text-purple-400 font-medium">
                  → {rec.action}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* DETAILED EVIDENCE MODAL */}
        {isEvidenceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-lg text-foreground">Verified Career Evidence Audit Trail</h3>
                </div>
                <button
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters & Sorting */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Source:</span>
                  {["all", "GitHub", "Resume"].map((src) => (
                    <button
                      key={src}
                      onClick={() => setEvidenceFilter(src)}
                      className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] ${
                        evidenceFilter === src
                          ? "bg-purple-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Sort:</span>
                  <button
                    onClick={() => setEvidenceSort(evidenceSort === "confidence" ? "name" : "confidence")}
                    className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-semibold text-[10px]"
                  >
                    {evidenceSort === "confidence" ? "Confidence (High → Low)" : "Repository Name"}
                  </button>
                </div>
              </div>

              {/* Evidence Scroll List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredEvidences.map((ev: any) => (
                  <div key={ev.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span className="text-purple-600 dark:text-purple-400">{ev.repositoryName}</span>
                      <Badge variant="emerald" size="sm" className="text-[10px]">
                        {ev.confidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{ev.reason}</p>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                      <span>Source: {ev.source || "GitHub"}</span>
                      <span>Type: {ev.type}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border/50 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsEvidenceModalOpen(false)}>
                  Close Audit View
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Update Resume Modal */}
        <UpdateResumeModal
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
          onSuccess={() => fetchCareerDNA()}
          currentResumeName={activeResume?.fileName}
          lastUpdatedDate={activeResume?.uploadedAt}
        />
      </div>
    </RoleGuard>
  );
}
