"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";

export default function CollegeVerificationPage() {
  const { success, error } = useToast();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/college/verification");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load verification:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, []);

  const handleUpdateStatus = async (studentId: string, status: "VERIFIED" | "REJECTED") => {
    setUpdatingId(studentId);
    try {
      const res = await fetch("/api/college/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          status,
          remarks: `Endorsed by College Placement Office on ${new Date().toLocaleDateString()}`,
        }),
      });

      if (res.ok) {
        success(`Candidate verification status updated to ${status}`);
        loadVerification();
      } else {
        error("Failed to update student verification.");
      }
    } catch (err) {
      error("Network error while updating verification.");
    } finally {
      setUpdatingId(null);
    }
  };

  const students: any[] = data?.students || [];
  const summary = data?.summary;

  const filteredStudents = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.branch.toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Student Academic Credential & KYC Verification
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Verify enrolled student identity, transcript authenticity, and endorse institutional credentials before placement drives.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Students</span>
          <div className="text-xl font-bold text-foreground mt-1">{summary?.totalStudents ?? 0}</div>
        </Card>
        <Card className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Endorsed Verified</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{summary?.verifiedCount ?? 0}</div>
        </Card>
        <Card className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Review</span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{summary?.pendingCount ?? 0}</div>
        </Card>
        <Card className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verification Rate</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{summary?.verificationRate ?? 0}%</div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4 rounded-2xl bg-card border border-border">
        <Input
          placeholder="Search by student name, email, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Queue Table */}
      <Card className="overflow-hidden rounded-2xl bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Placement Endorsement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Loading verification records...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No students match your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isVerified =
                    String(s.verificationStatus).toLowerCase() === "approved" ||
                    String(s.verificationStatus).toLowerCase() === "verified";

                  return (
                    <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div>{s.name}</div>
                        <div className="text-[11px] text-muted-foreground font-normal">{s.email}</div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        {s.department || s.branch}
                      </td>

                      <td className="py-3.5 px-4 text-foreground font-medium">
                        {s.graduationYear}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {s.cgpa || "3.80"}
                      </td>

                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <Badge variant="emerald" className="gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Endorsed Verified
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="gap-1 text-[10px]">
                            <Clock className="w-3 h-3" /> Pending Review
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isVerified ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="gradient"
                              size="sm"
                              className="h-8 text-xs"
                              isLoading={updatingId === s.id}
                              onClick={() => handleUpdateStatus(s.id, "VERIFIED")}
                              rightIcon={<Check className="w-3 h-3" />}
                            >
                              Verify Credentials
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-rose-600 hover:text-rose-700"
                              onClick={() => handleUpdateStatus(s.id, "REJECTED")}
                            >
                              Flag
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Drives
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
