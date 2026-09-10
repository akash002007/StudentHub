"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Lock,
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronRight,
  Eye,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  RecruitmentDrive,
  RecruitmentResultRecord,
  ResultCandidateItem,
} from "@/types";

export default function RecruitmentResultsPage() {
  const { success, error: toastError, info } = useToast();

  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>("");
  const [resultsData, setResultsData] = useState<RecruitmentResultRecord | null>(null);
  const [candidatesRoster, setCandidatesRoster] = useState<ResultCandidateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Pre-publish confirmation modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [publishConfirmationText, setPublishConfirmationText] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    if (selectedDriveId) {
      fetchResults(selectedDriveId);
    }
  }, [selectedDriveId]);

  const fetchDrives = async () => {
    try {
      const res = await fetch("/api/recruiter/drives");
      if (res.ok) {
        const data = await res.json();
        const driveList: RecruitmentDrive[] = data.drives || [];
        setDrives(driveList);
        if (driveList.length > 0) {
          setSelectedDriveId(driveList[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResults = async (driveId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/recruiter/results?driveId=${driveId}`);
      if (res.ok) {
        const data = await res.json();
        const resObj: RecruitmentResultRecord = data.results;
        setResultsData(resObj);
        setCandidatesRoster(resObj?.candidates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCandidateStatus = (
    applicationId: string,
    nextStatus: "SELECTED" | "WAITLISTED" | "REJECTED"
  ) => {
    if (resultsData?.isLocked) {
      info("Results are locked and published. Formal authorization required for post-publication corrections.");
      return;
    }
    setCandidatesRoster((prev) =>
      prev.map((c) => (c.applicationId === applicationId ? { ...c, selectionStatus: nextStatus } : c))
    );
  };

  const handlePublishResults = async () => {
    if (publishConfirmationText.trim().toLowerCase() !== "publish") {
      toastError('Please type "PUBLISH" to confirm result publication.');
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        driveId: selectedDriveId,
        finalRoster: candidatesRoster.map((c) => ({
          applicationId: c.applicationId,
          selectionStatus: c.selectionStatus,
          notes: c.notes,
        })),
      };

      const res = await fetch("/api/recruiter/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success("Official results and merit list published & locked! Candidate notifications dispatched.");
        setIsPreviewModalOpen(false);
        setPublishConfirmationText("");
        fetchResults(selectedDriveId);
      } else {
        toastError("Failed to publish results.");
      }
    } catch (err) {
      console.error(err);
      toastError("An error occurred.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportCSV = () => {
    if (candidatesRoster.length === 0) return;
    const headers = "Rank,Student Name,University,Degree,Assessment Score,Interview Score,Final Score,Selection Status\n";
    const rows = candidatesRoster
      .map(
        (c) =>
          `"${c.rank}","${c.studentName}","${c.university}","${c.degree || ""}","${c.assessmentScore}","${c.interviewScore}","${c.finalScore}","${c.selectionStatus}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `merit_list_${selectedDriveId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Merit list exported as CSV.");
  };

  const activeDrive = drives.find((d) => d.id === selectedDriveId);
  const selectedCount = candidatesRoster.filter((c) => c.selectionStatus === "SELECTED").length;
  const waitlistedCount = candidatesRoster.filter((c) => c.selectionStatus === "WAITLISTED").length;
  const rejectedCount = candidatesRoster.filter((c) => c.selectionStatus === "REJECTED").length;

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Official Merit List &amp; Publication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Results & Final Selection
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Generate transparent weighted candidate rankings, allocate final offers, preview rosters, and publish immutable results.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              className="h-9 px-3 text-xs font-bold rounded-xl bg-card border border-border focus:outline-none focus:border-blue-500"
            >
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Results Banner & Lock State */}
        {resultsData?.isLocked ? (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  Official Results Published & Locked
                  <Badge variant="purple" size="sm">
                    IMMUTABLE AUDIT TRAIL
                  </Badge>
                </div>
                <div className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                  Published by {resultsData.publishedBy} on{" "}
                  {new Date(resultsData.publishedAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono font-bold text-foreground shrink-0">
              <span className="text-emerald-600">{resultsData.totalSelected} Selected</span> •{" "}
              <span className="text-amber-600">{resultsData.totalWaitlisted} Waitlisted</span> •{" "}
              <span className="text-rose-600">{resultsData.totalRejected} Rejected</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                  Pre-Publication Merit Review
                </div>
                <div className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Review final candidate ranks, confirm selections against {activeDrive?.openingsCount || 5} openings, and publish.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setIsPreviewModalOpen(true)}
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Preview & Publish Results
              </Button>
            </div>
          </div>
        )}

        {/* Merit List Data Table */}
        <Card className="border-border bg-card shadow-sm space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Consolidated Merit Table ({candidatesRoster.length} Candidates)
              </h2>
              <p className="text-xs text-muted-foreground">
                Rankings calculated via: Final Score = (Assessment ×{" "}
                {activeDrive?.stageWeights?.assessmentWeight || 60}%) + (Interview ×{" "}
                {activeDrive?.stageWeights?.interviewWeight || 40}%)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                {selectedCount} / {activeDrive?.openingsCount || 5} Selected
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-bold">
                {waitlistedCount} Waitlisted
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-rose-600 font-bold">
                {rejectedCount} Rejected
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold w-14 text-center">Rank</th>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">Assessment Score</th>
                  <th className="px-4 py-3 font-semibold">Interview Score</th>
                  <th className="px-4 py-3 font-semibold">Final Composite Score</th>
                  <th className="px-4 py-3 font-semibold">Selection Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Roster Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Calculating merit rankings...
                    </td>
                  </tr>
                ) : candidatesRoster.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No candidate scores recorded for this drive yet.
                    </td>
                  </tr>
                ) : (
                  candidatesRoster.map((cand) => (
                    <tr key={cand.applicationId} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                            cand.rank === 1
                              ? "bg-amber-400 text-amber-950 font-black shadow-xs"
                              : cand.rank <= (activeDrive?.openingsCount || 5)
                              ? "bg-blue-600 text-white font-bold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          #{cand.rank}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={cand.studentAvatar} alt={cand.studentName} size="sm" />
                          <div>
                            <div className="font-bold text-foreground">{cand.studentName}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {cand.degree} • {cand.university}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        {cand.assessmentScore} / 100
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        {cand.interviewScore} / 100
                      </td>

                      <td className="px-4 py-3.5 font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                        {cand.finalScore} / 100
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            cand.selectionStatus === "SELECTED"
                              ? "bg-emerald-500/10 text-emerald-600 border border-blue-500/30"
                              : cand.selectionStatus === "WAITLISTED"
                              ? "bg-amber-500/10 text-amber-600 border border-blue-500/30"
                              : "bg-primary/10 text-rose-600 border border-rose-500/30"
                          }`}
                        >
                          {cand.selectionStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {!resultsData?.isLocked ? (
                          <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border">
                            <button
                              onClick={() => handleToggleCandidateStatus(cand.applicationId, "SELECTED")}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                cand.selectionStatus === "SELECTED"
                                  ? "bg-emerald-600 text-white"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Select
                            </button>
                            <button
                              onClick={() => handleToggleCandidateStatus(cand.applicationId, "WAITLISTED")}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                cand.selectionStatus === "WAITLISTED"
                                  ? "bg-amber-500 text-white"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Waitlist
                            </button>
                            <button
                              onClick={() => handleToggleCandidateStatus(cand.applicationId, "REJECTED")}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                cand.selectionStatus === "REJECTED"
                                  ? "bg-rose-600 text-white"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pre-Publish Preview & Confirmation Modal */}
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Confirm & Publish Official Results"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-blue-500/30 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Critical Result Publication Notice
              </div>
              <p>
                Publishing results locks the merit roster and makes final selections immutable. Candidate
                notifications will be sent automatically to all applicants.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <div className="text-lg font-black">{selectedCount}</div>
                <div className="text-[11px] font-semibold">Selected (Offers)</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <div className="text-lg font-black">{waitlistedCount}</div>
                <div className="text-[11px] font-semibold">Waitlisted</div>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-rose-600">
                <div className="text-lg font-black">{rejectedCount}</div>
                <div className="text-[11px] font-semibold">Rejected</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-foreground">
                Type <strong className="text-blue-600">PUBLISH</strong> to confirm:
              </label>
              <input
                type="text"
                value={publishConfirmationText}
                onChange={(e) => setPublishConfirmationText(e.target.value)}
                placeholder="PUBLISH"
                className="w-full h-10 px-3 text-sm rounded-xl bg-card border border-border focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                isLoading={isPublishing}
                disabled={publishConfirmationText.trim().toLowerCase() !== "publish"}
                onClick={handlePublishResults}
              >
                Lock & Publish Results
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
