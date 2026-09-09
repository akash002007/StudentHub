"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  Users2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  Briefcase,
  Layers,
  Flag,
  FileText,
  AlertTriangle,
  GitPullRequest,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard, StatusBadge, RiskIndicator, SkeletonLoader } from "@/components/admin/common";
import { AdminOverviewMetrics, VerificationRequest, AuditLogEntry } from "@/types";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [spotlight, setSpotlight] = useState<VerificationRequest[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const [mRes, vRes, aRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/verification?sort=Newest"),
        fetch("/api/admin/audit-logs"),
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.metrics) setMetrics(mData.metrics);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.requests) setSpotlight(vData.requests.slice(0, 5));
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.logs) setRecentAudits(aData.logs.slice(0, 5));
      }
    } catch (err) {
      console.warn("Failed to load admin overview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Operations Control Center
            </span>
            <span className="text-xs text-muted-foreground">Live Database Synced</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Centralized operational management: oversee users, corporate partners, recruitment funnels, verification queues, and compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOverview} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
          <Link href="/admin/verification">
            <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Verification Queue ({metrics?.pendingVerification || 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Core Stat Cards (Honest Real Platform Metrics) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          label="Total Users"
          value={metrics ? (metrics.totalUsers || metrics.totalStudents).toString() : "—"}
          hint="All platform tiers"
          icon={<Users className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          label="Pending Verification"
          value={metrics ? metrics.pendingVerification.toString() : "—"}
          hint="Action required"
          icon={<Clock3 className="w-4 h-4 text-amber-500 animate-pulse" />}
        />
        <StatCard
          label="Verified Students"
          value={metrics ? metrics.verifiedStudents.toString() : "—"}
          hint={`${metrics?.verificationRate || 0}% rate`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          label="Companies"
          value={metrics ? (metrics.totalCompanies || 0).toString() : "—"}
          hint="Employer partners"
          icon={<Building2 className="w-4 h-4 text-purple-500" />}
        />
        <StatCard
          label="Active Drives"
          value={metrics ? (metrics.activeDrives || 0).toString() : "—"}
          hint="Recruiting funnels"
          icon={<Layers className="w-4 h-4 text-indigo-500" />}
        />
        <StatCard
          label="Flagged Reports"
          value={metrics ? (metrics.pendingReports || 0).toString() : "—"}
          hint="Trust & Safety"
          icon={<Flag className="w-4 h-4 text-rose-500" />}
        />
      </section>

      {/* Quick Access Control Plane */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "User Directory", href: "/admin/users", icon: Users, desc: "Roles & status" },
          { label: "Company Registry", href: "/admin/companies", icon: Building2, desc: "Employer tiers" },
          { label: "Recruiter Directory", href: "/admin/recruiters", icon: Briefcase, desc: "Hiring managers" },
          { label: "Recruitment Drives", href: "/admin/internships", icon: Layers, desc: "Active funnels" },
          { label: "Applications", href: "/admin/applications", icon: GitPullRequest, desc: "Candidate records" },
          { label: "Audit Trail", href: "/admin/audit-logs", icon: FileText, desc: "Immutable logs" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="p-3.5 border-border/80 bg-card hover:border-blue-500/50 hover:shadow-xs transition-all flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-foreground">{item.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </section>

      {/* Workflow & Verification Health */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-7 p-5 border-border/80 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Platform Engine Telemetry</h2>
              <p className="text-xs text-muted-foreground">Real-time statistics calculated from server records</p>
            </div>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <MetricTile
              label="Verification Approval Rate"
              value={`${metrics?.verificationRate || 0}%`}
              helper="Decided student verification ratio"
            />
            <MetricTile
              label="Avg Verification Turnaround"
              value={`${metrics?.avgVerificationTimeHours || 0} hrs`}
              helper="Queue submission to admin decision"
            />
            <MetricTile
              label="Active Applications"
              value={(metrics?.totalApplications || 0).toString()}
              helper="Across all campus & corporate drives"
            />
            <MetricTile
              label="Awaiting Additional Info"
              value={(metrics?.awaitingInformation || 0).toString()}
              helper="Resubmission requests pending"
            />
            <MetricTile
              label="High Risk Verification Alerts"
              value={(metrics?.suspiciousAttempts || 0).toString()}
              helper="Flagged by heuristic validation"
            />
            <MetricTile
              label="Moderation Queue Backlog"
              value={(metrics?.pendingReports || 0).toString()}
              helper="Incidents awaiting review"
            />
          </div>
        </Card>

        {/* Live Immutable Audit Feed */}
        <Card className="lg:col-span-5 p-5 border-border/80 bg-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-bold text-foreground">Recent Audit Stream</h2>
              </div>
              <Link href="/admin/audit-logs" className="text-[11px] text-blue-500 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live immutable log of state modifications
            </p>

            <div className="mt-3 space-y-2.5">
              {recentAudits.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No recent audit events.</p>
              ) : (
                recentAudits.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-foreground">{a.action}</span>
                      <span className="text-muted-foreground">{a.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{a.details}</p>
                    <div className="mt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>Admin: <strong className="text-foreground">{a.admin}</strong></span>
                      {a.reason && <span className="text-blue-500 italic max-w-[160px] truncate">&quot;{a.reason}&quot;</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link href="/admin/audit-logs" className="block pt-2">
            <Button variant="outline" className="w-full justify-center text-xs">
              Inspect Full Compliance Journal
            </Button>
          </Link>
        </Card>
      </section>

      {/* Live Spotlight Queue */}
      <section className="grid grid-cols-1 gap-4">
        <Card className="p-5 border-border/80 bg-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Pending Verification Spotlight</h2>
              <p className="text-xs text-muted-foreground">High priority queue items awaiting admin decision</p>
            </div>
            <Link href="/admin/verification">
              <Button variant="outline" size="sm">
                Full Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">College &amp; Degree</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading verification spotlight...
                    </td>
                  </tr>
                ) : spotlight.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No pending verifications in spotlight.
                    </td>
                  </tr>
                ) : (
                  spotlight.map((req) => (
                    <tr key={req.verificationId} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        {req.student.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {req.student.college} • {req.student.degree}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{req.verificationMethod}</td>
                      <td className="py-2.5 px-3">
                        <RiskIndicator risk={req.riskLevel} />
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link href="/admin/verification">
                          <Button variant="ghost" size="sm">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function MetricTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-extrabold text-foreground mt-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground/80 mt-1">{helper}</p>
    </div>
  );
}
