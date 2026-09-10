"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";

export default function CollegePlacementDrivesPage() {
  const { success, error } = useToast();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/college/drives?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.error("Failed to load drives:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [statusFilter]);

  const handleApproveDrive = async (driveId: string) => {
    setApprovingId(driveId);
    try {
      const res = await fetch(`/api/college/drives/${driveId}/participation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          approvedByCollege: true,
          approvalNotes: "Approved for campus recruitment drive by Placement Cell",
        }),
      });

      if (res.ok) {
        success("Drive approved for campus recruitment participation!");
        fetchDrives();
      } else {
        error("Failed to update drive participation status.");
      }
    } catch (err) {
      error("Network error while approving drive.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Campus Placement Drives
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage corporate partner drives visiting your institution, approve campus participation, and screen candidate eligibility.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search drives by role, company, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-auto"
          >
            <option value="ALL">All Drive Statuses</option>
            <option value="APPROVED">Campus Approved</option>
            <option value="OPEN">Open for Enrollment</option>
            <option value="APPLICATIONS_OPEN">Applications Open</option>
            <option value="SELECTION_IN_PROGRESS">Selection Active</option>
          </select>
          <Button variant="gradient" size="sm" className="h-10 text-xs px-4" onClick={fetchDrives}>
            Apply
          </Button>
        </div>
      </Card>

      {/* Drives Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">Loading recruitment drives...</div>
        ) : drives.length === 0 ? (
          <Card className="p-12 text-center text-xs text-muted-foreground rounded-2xl">
            No recruitment drives found matching the criteria.
          </Card>
        ) : (
          drives.map((drive) => {
            const isApproved = drive.collegeApproved || drive.participationStatus === "APPROVED";

            return (
              <Card
                key={drive.id}
                className="p-6 rounded-2xl bg-card border border-border hover:border-purple-500/40 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-foreground text-lg overflow-hidden shrink-0">
                      {drive.companyLogo ? (
                        <img src={drive.companyLogo} alt={drive.company} className="w-full h-full object-cover" />
                      ) : (
                        drive.company.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-foreground">{drive.title}</h2>
                        <Badge variant="blue" className="text-[10px]">
                          {drive.status.replace(/_/g, " ")}
                        </Badge>
                        {isApproved ? (
                          <Badge variant="emerald" className="gap-1 text-[10px]">
                            <ShieldCheck className="w-3 h-3" /> Campus Approved
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px]">
                            Participation Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {drive.company} &bull; {drive.department} &bull; {drive.location} ({drive.workMode})
                      </p>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Package: {drive.salaryStipend || "Competitive Industry Standard"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
                    <Link href={`/college/eligible-students?driveId=${drive.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-9" rightIcon={<Users className="w-3.5 h-3.5" />}>
                        Eligible Candidates
                      </Button>
                    </Link>

                    {!isApproved ? (
                      <Button
                        variant="gradient"
                        size="sm"
                        className="text-xs h-9"
                        isLoading={approvingId === drive.id}
                        onClick={() => handleApproveDrive(drive.id)}
                        rightIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve for Campus
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-xs h-9 text-emerald-600 dark:text-emerald-400 font-semibold" disabled>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved
                      </Button>
                    )}
                  </div>
                </div>

                {/* Eligibility criteria summary row */}
                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      <strong>Min CGPA:</strong> {drive.eligibilityCriteria?.minCgpa || "3.5"}
                    </span>
                    <span>&bull;</span>
                    <span>
                      <strong>Max Backlogs:</strong> {drive.eligibilityCriteria?.maxBacklogs ?? 0}
                    </span>
                    <span>&bull;</span>
                    <span>
                      <strong>Batches:</strong> {drive.eligibilityCriteria?.gradYears?.join(", ") || "2025, 2026"}
                    </span>
                  </div>
                  <div className="font-medium text-foreground">
                    Enrolled Candidates: <span className="font-bold text-blue-600 dark:text-blue-400">{drive.participatingStudentsCount || 0}</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
