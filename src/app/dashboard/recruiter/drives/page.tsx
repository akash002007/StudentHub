"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Users2,
  ChevronRight,
  MoreVertical,
  ShieldCheck,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import { RecruitmentDrive, DriveStatus } from "@/types";

export default function RecruitmentDrivesPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/recruiter/drives");
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.error("Failed to fetch drives:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (driveId: string, nextStatus: DriveStatus) => {
    try {
      const res = await fetch(`/api/recruiter/drives/${driveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        success(`Drive status updated to ${nextStatus.replace("_", " ")}`);
        fetchDrives();
      }
    } catch (err) {
      toastError("Failed to update status.");
    }
  };

  const filteredDrives = drives.filter((drive) => {
    const matchesTab =
      selectedStatusTab === "all" ||
      drive.status.toLowerCase() === selectedStatusTab.toLowerCase() ||
      (selectedStatusTab === "active" &&
        (drive.status === "APPLICATIONS_OPEN" ||
          drive.status === "SCREENING" ||
          drive.status === "SELECTION_IN_PROGRESS" ||
          drive.status === "PUBLISHED"));

    const matchesSearch =
      drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Drive Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recruitment Drives
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Configure structured eligibility criteria, multi-round selection pipelines, and published merit results.
            </p>
          </div>

          <Link href="/dashboard/recruiter/drives/new">
            <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Recruitment Drive
            </Button>
          </Link>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
            {[
              { id: "all", label: "All Drives" },
              { id: "active", label: "Active Pipeline" },
              { id: "APPLICATIONS_OPEN", label: "Accepting Apps" },
              { id: "DRAFT", label: "Drafts" },
              { id: "RESULTS_PUBLISHED", label: "Results Published" },
              { id: "CLOSED", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatusTab === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drives by title, role, location..."
              className="w-full h-9 pl-9 pr-3.5 rounded-xl bg-card border border-border text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Drives Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading recruitment drives...</div>
        ) : filteredDrives.length === 0 ? (
          <Card className="p-12 text-center space-y-3 bg-card border-border">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto" />
            <div className="font-bold text-foreground">No recruitment drives found</div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No recruitment drives match your current filter. Create a new structured recruitment drive to get started.
            </p>
            <Link href="/dashboard/recruiter/drives/new">
              <Button size="sm" variant="gradient">
                Create First Drive
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDrives.map((drive) => (
              <Card
                key={drive.id}
                className="p-6 border-border/80 hover:border-blue-500/40 transition-all bg-card flex flex-col justify-between space-y-5 shadow-xs"
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        drive.status === "RESULTS_PUBLISHED"
                          ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                          : drive.status === "CLOSED"
                          ? "bg-slate-500/10 text-slate-600 border border-slate-500/30"
                          : "bg-emerald-500/10 text-emerald-600 border border-blue-500/30"
                      }`}
                    >
                      {drive.status.replace(/_/g, " ")}
                    </span>

                    <span className="text-xs font-extrabold text-foreground">
                      {drive.openingsCount} {drive.openingsCount === 1 ? "Opening" : "Openings"}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-foreground tracking-tight line-clamp-1">
                      {drive.title}
                    </h2>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      {drive.position} • {drive.department}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {drive.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{drive.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{drive.salaryStipend}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Till {drive.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Candidate Pipeline Metrics */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-muted/60">
                      <div className="text-base font-black text-foreground">{drive.applicantsCount}</div>
                      <div className="text-[10px] text-muted-foreground">Applied</div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <div className="text-base font-black">{drive.eligibleCount}</div>
                      <div className="text-[10px]">Eligible</div>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                      <div className="text-base font-black">{drive.shortlistedCount}</div>
                      <div className="text-[10px]">Shortlist</div>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/10 text-rose-600">
                      <div className="text-base font-black">{drive.selectedCount}</div>
                      <div className="text-[10px]">Selected</div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/recruiter/screening?driveId=${drive.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                          Screening ({drive.eligibleCount})
                        </Button>
                      </Link>
                      <Link href={`/dashboard/recruiter/selection?driveId=${drive.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                          <Layers className="w-3.5 h-3.5 mr-1" />
                          Stages
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/recruiter/results?driveId=${drive.id}`}>
                        <Button size="sm" variant="gradient" className="h-8 text-xs font-bold">
                          <Award className="w-3.5 h-3.5 mr-1" />
                          Merit & Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
