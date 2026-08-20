"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Filter, Users } from "lucide-react";
import { StudentsTable } from "@/components/admin/StudentsTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AdminStudentRecord } from "@/types";
import { EmptyState, SkeletonLoader } from "@/components/admin/common";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("query", search);
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.warn("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card className="p-5 border-border/80 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-bold text-foreground">Student Candidate Directory</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Inspect candidate profiles, academic history, uploaded credentials, and verification status. Click any student to open their complete administrative dossier.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchStudents} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="p-4 border-border/80 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, college, or student ID..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Verification Statuses</option>
              <option value="Approved">Verified Students</option>
              <option value="Pending">Pending Verification</option>
              <option value="Needs Information">Needs Information</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table / State */}
      {isLoading ? (
        <SkeletonLoader className="h-96 w-full" />
      ) : students.length > 0 ? (
        <StudentsTable rows={students} />
      ) : (
        <EmptyState
          title="No student records found"
          description="No students matched your search criteria. Try modifying your search or filter."
          actionLabel="Reset Search"
          onAction={() => {
            setSearch("");
            setStatusFilter("All");
          }}
        />
      )}
    </div>
  );
}
