"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Eye,
  X,
  Sparkles,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { EligibilityBreakdownView } from "@/components/recruiter/EligibilityBreakdownView";
import { useToast } from "@/context/ToastContext";

function EligibleStudentsContent() {
  const searchParams = useSearchParams();
  const initialDriveId = searchParams.get("driveId") || "drive_001";
  const { success } = useToast();

  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>(initialDriveId);
  const [evaluationData, setEvaluationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"eligible" | "potentiallyEligible" | "ineligible">("eligible");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalCandidate, setModalCandidate] = useState<any | null>(null);

  // Load drives list
  useEffect(() => {
    async function loadDrives() {
      try {
        const res = await fetch("/api/college/drives");
        if (res.ok) {
          const json = await res.json();
          setDrives(json.drives || []);
          if (!selectedDriveId && json.drives?.length > 0) {
            setSelectedDriveId(json.drives[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load drives:", err);
      }
    }
    loadDrives();
  }, []);

  // Load evaluation for selected drive
  const fetchEvaluation = async (driveId: string) => {
    if (!driveId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/college/drives/${driveId}/eligible-students`);
      if (res.ok) {
        const json = await res.json();
        setEvaluationData(json);
      }
    } catch (err) {
      console.error("Failed to load evaluation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDriveId) {
      fetchEvaluation(selectedDriveId);
    }
  }, [selectedDriveId]);

  const summary = evaluationData?.summary;
  const driveInfo = evaluationData?.drive;

  const currentList: any[] =
    activeTab === "eligible"
      ? evaluationData?.eligible || []
      : activeTab === "potentiallyEligible"
      ? evaluationData?.potentiallyEligible || []
      : evaluationData?.ineligible || [];

  const filteredCandidates = currentList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.student.name.toLowerCase().includes(q) ||
      item.student.email.toLowerCase().includes(q) ||
      item.student.branch.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Eligible Student Discovery & Screening
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            AI-powered academic & skill eligibility engine. Inspect itemized criterion verdicts for candidate cohorts.
          </p>
        </div>
      </div>

      {/* Drive Selector Card */}
      <Card className="p-5 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
              Screening Candidates For Campus Drive
            </label>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              className="text-sm font-bold bg-muted/60 border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} &bull; {d.company} ({d.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {summary && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="emerald" className="gap-1 text-xs py-1 px-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> {summary.eligibleCount} Eligible ({summary.eligibilityRatio}%)
            </Badge>
            <Badge variant="amber" className="gap-1 text-xs py-1 px-3">
              <AlertTriangle className="w-3.5 h-3.5" /> {summary.potentiallyEligibleCount} Review Needed
            </Badge>
            <Badge variant="rose" className="gap-1 text-xs py-1 px-3">
              <XCircle className="w-3.5 h-3.5" /> {summary.ineligibleCount} Ineligible
            </Badge>
          </div>
        )}
      </Card>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("eligible")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "eligible"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Fully Qualified ({summary?.eligibleCount ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("potentiallyEligible")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "potentiallyEligible"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Review Needed ({summary?.potentiallyEligibleCount ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("ineligible")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ineligible"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <XCircle className="w-4 h-4" />
            Ineligible ({summary?.ineligibleCount ?? 0})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search candidates by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Evaluating candidate profiles against drive criteria...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Card className="p-12 text-center text-xs text-muted-foreground rounded-2xl">
            No candidates in this tier matching your search.
          </Card>
        ) : (
          filteredCandidates.map((item) => {
            const { student, evaluation } = item;
            const matchScore = evaluation.score ?? 100;

            return (
              <Card
                key={student.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={student.avatar}
                    alt={student.name}
                    name={student.name}
                    size="md"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{student.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-md font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        CGPA {student.cgpa || "3.80"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {student.degree} in {student.branch} &bull; Batch of {student.graduationYear}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Skills: {(student.skills || []).slice(0, 4).join(", ")}
                    </p>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-foreground">
                      Match Score: <span className="text-blue-600 dark:text-blue-400">{matchScore}%</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {evaluation.passedCount ?? 5} / {evaluation.totalCount ?? 5} criteria passed
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9"
                    onClick={() => setModalCandidate(item)}
                    rightIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Criteria Breakdown
                  </Button>

                  {activeTab === "eligible" && (
                    <Button
                      variant="gradient"
                      size="sm"
                      className="text-xs h-9"
                      onClick={() => success(`Candidate ${student.name} approved for campus drive nomination!`)}
                      rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Nominate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Criteria Breakdown Modal */}
      {modalCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Eligibility Evaluation Verdict
                </h3>
                <p className="text-xs text-muted-foreground">
                  Candidate: {modalCandidate.student.name} &bull; Drive: {driveInfo?.title}
                </p>
              </div>
              <button
                onClick={() => setModalCandidate(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reused Production Component */}
            <EligibilityBreakdownView
              eligibility={modalCandidate.evaluation}
              candidateName={modalCandidate.student.name}
            />

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setModalCandidate(null)}>
                Close Breakdown
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollegeEligibleStudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading discovery engine...</div>}>
      <EligibleStudentsContent />
    </Suspense>
  );
}
