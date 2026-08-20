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
  Activity,
  FileCheck2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard, StatusBadge, RiskIndicator, SkeletonLoader } from "@/components/admin/common";
import { AdminOverviewMetrics, VerificationRequest } from "@/types";
import { adminOverviewMetrics as initialMetrics } from "@/data/mock-admin-data";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminOverviewMetrics>(initialMetrics);
  const [spotlight, setSpotlight] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/verification?sort=Newest"),
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.metrics) setMetrics(mData.metrics);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.requests) setSpotlight(vData.requests.slice(0, 5));
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
            Trust &amp; Verification Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor incoming verification queues, review fee receipts, manage candidate status, and inspect platform audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOverview} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Data
          </Button>
          <Link href="/admin/verification">
            <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Verification Queue ({metrics.pendingVerification})
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Core Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={metrics.totalStudents.toLocaleString()}
          hint="+8.4% this month"
          icon={<Users2 className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          label="Pending Verification"
          value={metrics.pendingVerification.toString()}
          hint={`${metrics.newRegistrationsToday} submitted today`}
          icon={<Clock3 className="w-4 h-4 text-amber-500 animate-pulse" />}
        />
        <StatCard
          label="Verified Students"
          value={metrics.verifiedStudents.toLocaleString()}
          hint={`${metrics.verificationRate}% approval rate`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          label="Rejected"
          value={metrics.rejectedApplications.toString()}
          hint={`${metrics.awaitingInformation} awaiting student info`}
          icon={<ShieldAlert className="w-4 h-4 text-rose-500" />}
        />
      </section>

      {/* Health & Workflow Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-7 p-5 border-border/80 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Platform Verification Health</h2>
              <p className="text-xs text-muted-foreground">Computed in real-time from backend records</p>
            </div>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <MetricTile
              label="Verification Rate"
              value={`${metrics.verificationRate}%`}
              helper="Approval ratio across all submitted requests"
            />
            <MetricTile
              label="Average Verification Time"
              value={`${metrics.avgVerificationTimeHours} hrs`}
              helper="From student upload to admin decision"
            />
            <MetricTile
              label="New Registrations (Today)"
              value={metrics.newRegistrationsToday.toString()}
              helper="Real-time today's student signups"
            />
            <MetricTile
              label="New Registrations (Week)"
              value={metrics.newRegistrationsWeek.toString()}
              helper="Active 7-day intake volume"
            />
            <MetricTile
              label="Awaiting Additional Information"
              value={metrics.awaitingInformation.toString()}
              helper="Pending student document update"
            />
            <MetricTile
              label="Suspicious Attempts Blocked"
              value={metrics.suspiciousAttempts.toString()}
              helper="Duplicate / Risk engine alerts"
            />
          </div>
        </Card>

        <Card className="lg:col-span-5 p-5 border-border/80 bg-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-bold text-foreground">Operational Protocol</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Standard operating procedure for student verification review:
            </p>

            <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
              {[
                "Inspect submitted document (Semester Fee Receipt / ID Card)",
                "Cross-check student name, university, degree, and graduation year",
                "Complete 8-point verification checklist",
                "Verify absence of duplicate account flags",
                "Approve, reject with reason, or request clearer document",
                "Action automatically logs in immutable Audit Trail and notifies student",
              ].map((step, idx) => (
                <li key={step} className="flex gap-2">
                  <span className="w-5 h-5 rounded-lg bg-muted border border-border/70 flex items-center justify-center text-[11px] font-semibold text-foreground shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <Link href="/admin/verification" className="block pt-2">
            <Button variant="primary" className="w-full justify-center">
              Go to Active Queue
            </Button>
          </Link>
        </Card>
      </section>

      {/* Live Spotlight Queue */}
      <section className="grid grid-cols-1 gap-4">
        <Card className="p-5 border-border/80 bg-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Recent Verification Activity</h2>
              <p className="text-xs text-muted-foreground">
                High-priority and latest incoming student verification requests
              </p>
            </div>
            <Link href="/admin/verification">
              <Button size="sm" variant="outline">
                View Full Queue ({metrics.pendingVerification})
              </Button>
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[880px] w-full text-xs">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground">
                  {[
                    "Verification ID",
                    "Student",
                    "College",
                    "Method",
                    "Status",
                    "Risk",
                    "Submitted",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left font-bold uppercase tracking-[0.12em] text-[11px] py-2.5 px-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {spotlight.map((row) => (
                  <tr key={row.verificationId} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">{row.verificationId}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-foreground">{row.student.fullName}</p>
                      <p className="text-muted-foreground text-[11px]">{row.student.email}</p>
                    </td>
                    <td className="py-3 px-3">{row.student.college}</td>
                    <td className="py-3 px-3">{row.verificationMethod}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-3">
                      <RiskIndicator risk={row.riskLevel} />
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{row.submittedAt}</td>
                    <td className="py-3 px-3">
                      <Link href={`/admin/verification/${row.verificationId}`}>
                        <Button variant="outline" size="sm">
                          Review Request
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function MetricTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
      <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-extrabold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{helper}</p>
    </div>
  );
}
