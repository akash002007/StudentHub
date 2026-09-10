"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function CollegeAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    async function loadAssessments() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status !== "ALL") params.append("status", status);

        const res = await fetch(`/api/college/assessments?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setAssessments(json.assessments || []);
        }
      } catch (err) {
        console.error("Failed to load assessments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, [status]);

  const passedCount = assessments.filter((a) => a.passed === true).length;
  const passRate = assessments.length > 0 ? Math.round((passedCount / assessments.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Technical & Coding Assessments
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Review candidate test attempts, passing ratios, scoring analytics, and proctoring benchmarks across drives.
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Assessed Candidates
          </span>
          <div className="text-2xl font-extrabold text-foreground mt-1">{assessments.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Automated algorithmic & domain tests</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Candidates Cleared
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {passedCount}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Scored above required passing benchmark</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Campus Pass Rate
          </span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {passRate}%
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Institutional qualification efficiency</p>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Assessment Test</th>
                <th className="py-3 px-4">Recruiter / Company</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Cutoff Score</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Loading assessments...
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No assessments recorded.
                  </td>
                </tr>
              ) : (
                assessments.map((ass) => (
                  <tr key={ass.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{ass.candidateName}</div>
                      <div className="text-[11px] text-muted-foreground">{ass.candidateEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {ass.assessmentName}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {ass.companyName}
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      <span className={ass.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                        {ass.candidateScore ?? 0} / {ass.maxScore ?? 100}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {ass.passingScore}
                    </td>

                    <td className="py-3.5 px-4">
                      {ass.passed ? (
                        <Badge variant="emerald" className="gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Cleared
                        </Badge>
                      ) : (
                        <Badge variant="rose" className="gap-1 text-[10px]">
                          <XCircle className="w-3 h-3" /> Below Cutoff
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-muted-foreground">
                      {ass.date || "Recent"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
