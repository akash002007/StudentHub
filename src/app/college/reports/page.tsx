"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Download,
  Calendar,
  Filter,
  Building2,
  Layers,
  Dna,
  Printer,
  CheckCircle2,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { PlacementIntelligencePayload } from "@/lib/college-intelligence-engine";

export default function CollegeReportsPage() {
  const { success } = useToast();
  const [data, setData] = useState<PlacementIntelligencePayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Report configuration
  const [reportType, setReportType] = useState<
    "PLACEMENT_SUMMARY" | "INTERNSHIP_REPORT" | "DEPARTMENT_COMPARISON" | "COMPANY_PARTICIPATION" | "SKILL_DEMAND_GAP"
  >("PLACEMENT_SUMMARY");
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [department, setDepartment] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          academicYear,
          department,
        });
        const res = await fetch(`/api/college/intelligence?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load report data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [academicYear, department]);

  const handleExportCSV = () => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === "PLACEMENT_SUMMARY") {
      csvContent += "Stage,Count,Percentage\n";
      data.funnel.stages.forEach((s) => {
        csvContent += `"${s.stage}",${s.count},"${s.percentage}%"\n`;
      });
    } else if (reportType === "DEPARTMENT_COMPARISON") {
      csvContent += "Department,Eligible,Applied,Interviewed,Selected,Placement Rate\n";
      data.departmentAnalytics.forEach((d) => {
        csvContent += `"${d.department}",${d.eligibleCount},${d.appliedCount},${d.interviewedCount},${d.selectedCount},"${d.placementRate}%"\n`;
      });
    } else if (reportType === "COMPANY_PARTICIPATION") {
      csvContent += "Company,Applications,Interviewed,Selected,Conversion Rate\n";
      data.companyAnalytics.forEach((c) => {
        csvContent += `"${c.company}",${c.applicationsCount},${c.interviewedCount},${c.selectedCount},"${c.selectionRate}%"\n`;
      });
    } else {
      csvContent += "Skill,Recruiter Demand (Drives),Student Coverage (%),Is Critical Gap\n";
      data.skillIntelligence.topDemandSkills.forEach((sk) => {
        csvContent += `"${sk.skill}",${sk.opportunityDemandCount},"${sk.studentCoveragePercentage}%",${sk.isGap ? "YES" : "NO"}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StudentHub_${reportType}_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Report CSV exported successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Institutional Placement & Internship Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Generate, filter, print, and export official institutional reports on campus placement outcomes and skill benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </Button>
          <Button size="sm" onClick={handleExportCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Configuration Bar */}
      <Card className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>Report Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full text-xs rounded-xl bg-muted/60 border border-border px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="PLACEMENT_SUMMARY">Institutional Placement Funnel Summary</option>
              <option value="DEPARTMENT_COMPARISON">Departmental Benchmark & Outcome Report</option>
              <option value="COMPANY_PARTICIPATION">Corporate Hiring Partner Participation</option>
              <option value="SKILL_DEMAND_GAP">Curriculum Skill Demand vs. Coverage Gap</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full text-xs rounded-xl bg-muted/60 border border-border px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="2026-27">2026–27 (Current)</option>
              <option value="2025-26">2025–26</option>
              <option value="2024-25">2024–25</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Department Scope</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs rounded-xl bg-muted/60 border border-border px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Departments (Institutional)</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Electronics">Electronics & Communication</option>
              <option value="Electrical">Electrical Engineering</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Printable / Rendered Report Preview */}
      <Card className="p-8 rounded-3xl bg-card border border-border/80 shadow-md space-y-6" id="institutional-report-view">
        {/* Report Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              StudentHub Placement Intelligence System
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              {reportType.replace(/_/g, " ")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Institution: <span className="font-semibold text-foreground">{data?.college.name}</span> &bull; Academic Year: {academicYear}
            </p>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <span className="block font-medium">Generated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <Badge variant="emerald" className="mt-1 text-[10px]">
              Verified Outcome Record
            </Badge>
          </div>
        </div>

        {/* Dynamic Content based on Report Type */}
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Compiling institutional dataset...
          </div>
        ) : reportType === "PLACEMENT_SUMMARY" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground">Total Cohort</span>
                <div className="text-lg font-bold text-foreground mt-1">{data?.kpis.totalStudents}</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground">Applications</span>
                <div className="text-lg font-bold text-foreground mt-1">{data?.kpis.applicationsCount}</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground">Total Placed</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{data?.kpis.selectedCount}</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground">Placement Rate</span>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{data?.kpis.placementRate}%</div>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Funnel Milestone</th>
                  <th className="py-3 px-4 text-center">Candidate Count</th>
                  <th className="py-3 px-4 text-right">Progression Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {data?.funnel.stages.map((stage) => (
                  <tr key={stage.stage} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-foreground">{stage.stage}</td>
                    <td className="py-3 px-4 text-center">{stage.count.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{stage.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === "DEPARTMENT_COMPARISON" ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Faculty / Department</th>
                <th className="py-3 px-4 text-center">Eligible Pool</th>
                <th className="py-3 px-4 text-center">Applied</th>
                <th className="py-3 px-4 text-center">Interviewed</th>
                <th className="py-3 px-4 text-center">Selected</th>
                <th className="py-3 px-4 text-right">Placement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {data?.departmentAnalytics.map((dept) => (
                <tr key={dept.department} className="hover:bg-muted/20">
                  <td className="py-3 px-4 font-bold text-foreground">{dept.department}</td>
                  <td className="py-3 px-4 text-center">{dept.eligibleCount}</td>
                  <td className="py-3 px-4 text-center">{dept.appliedCount}</td>
                  <td className="py-3 px-4 text-center">{dept.interviewedCount}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{dept.selectedCount}</td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{dept.placementRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : reportType === "COMPANY_PARTICIPATION" ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Hiring Partner</th>
                <th className="py-3 px-4 text-center">Opportunities</th>
                <th className="py-3 px-4 text-center">Applications</th>
                <th className="py-3 px-4 text-center">Selected</th>
                <th className="py-3 px-4 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {data?.companyAnalytics.map((comp) => (
                <tr key={comp.company} className="hover:bg-muted/20">
                  <td className="py-3 px-4 font-bold text-foreground">{comp.company}</td>
                  <td className="py-3 px-4 text-center">{comp.opportunitiesCount}</td>
                  <td className="py-3 px-4 text-center">{comp.applicationsCount}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{comp.selectedCount}</td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{comp.selectionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Competency Skill</th>
                <th className="py-3 px-4 text-center">Opportunity Demand (Drives)</th>
                <th className="py-3 px-4 text-center">Student Coverage (%)</th>
                <th className="py-3 px-4 text-right">Institutional Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {data?.skillIntelligence.topDemandSkills.map((sk) => (
                <tr key={sk.skill} className="hover:bg-muted/20">
                  <td className="py-3 px-4 font-bold text-foreground">{sk.skill}</td>
                  <td className="py-3 px-4 text-center font-semibold">{sk.opportunityDemandCount} Drives</td>
                  <td className="py-3 px-4 text-center font-bold">{sk.studentCoveragePercentage}%</td>
                  <td className="py-3 px-4 text-right">
                    {sk.isGap ? (
                      <Badge variant="rose" className="text-[10px]">
                        Deficit Gap
                      </Badge>
                    ) : (
                      <Badge variant="emerald" className="text-[10px]">
                        Adequate Coverage
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Institutional Signoff Footer */}
        <div className="pt-6 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>StudentHub Institutional Analytics &bull; Observer Layer</span>
          <span>Confidential — For Internal Academic & Placement Governance Only</span>
        </div>
      </Card>
    </div>
  );
}
