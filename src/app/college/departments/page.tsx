"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  Briefcase,
  ChevronRight,
  Plus,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CollegeDepartment } from "@/types";

export default function CollegeDepartmentsPage() {
  const [departments, setDepartments] = useState<CollegeDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await fetch("/api/college/departments");
        if (res.ok) {
          const json = await res.json();
          setDepartments(json.departments || []);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDepts();
  }, []);

  const totalEnrolled = departments.reduce((acc, d) => acc + (d.studentCount || 0), 0);
  const totalPlaced = departments.reduce((acc, d) => acc + (d.placedCount || 0), 0);
  const avgPlacementRate =
    departments.length > 0
      ? Math.round(departments.reduce((acc, d) => acc + (d.placementRate || 0), 0) / departments.length)
      : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Academic Departments & Placements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Institutional performance by faculty department, student enrollment volumes, and departmental placement metrics.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Departments
          </span>
          <div className="text-2xl font-extrabold text-foreground mt-1">{departments.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Accredited engineering & technology faculties</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Enrolled Candidates
          </span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {totalEnrolled}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Active students participating across all branches</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Average Institutional Placement Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {avgPlacementRate}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">{totalPlaced} total candidate offers accepted</p>
        </Card>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            Loading academic departments...
          </div>
        ) : (
          departments.map((dept) => (
            <Card
              key={dept.id}
              className="p-6 rounded-2xl bg-card border border-border hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase">
                    {dept.code}
                  </span>
                  <Badge variant="emerald" className="text-[10px]">
                    {dept.placementRate}% Placed
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">{dept.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    HOD: {dept.headOfDepartment || "Faculty Chair"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                  <div className="text-center p-2 rounded-xl bg-muted/40">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Students</span>
                    <span className="text-sm font-bold text-foreground">{dept.studentCount}</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-muted/40">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Eligible</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {dept.eligibleCount}
                    </span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-muted/40">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Placed</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {dept.placedCount}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Placement Completion</span>
                    <span>{dept.placementRate}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, dept.placementRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {dept.activeDrivesCount} Active Drives
                </span>
                <Link href={`/college/students?department=${encodeURIComponent(dept.name)}`}>
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 h-8">
                    View Students <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
