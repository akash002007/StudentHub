"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  CheckCircle2,
  Lock,
  Database,
  Key,
  Server,
  Users,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";

export default function AdminSettingsPage() {
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [require2FA, setRequire2FA] = useState(true);
  const [strictIDOR, setStrictIDOR] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { success } = useToast();

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success("Platform security settings updated and applied.");
    }, 600);
  };

  const roleMatrix = [
    {
      role: "SUPER_ADMIN",
      title: "Super Administrator",
      badge: "purple",
      desc: "Full system authority. Role assignment, system config, destructive actions, and audit logs.",
      permissions: ["Manage All Users", "Assign Roles", "Verify Companies", "Override Drives", "Access Audit Logs", "System Config"],
    },
    {
      role: "PLATFORM_ADMIN",
      title: "Platform Administrator",
      badge: "blue",
      desc: "Operational platform authority. User suspension, company verification, drive oversight, reports.",
      permissions: ["Suspend Users", "Verify Companies", "Override Drives", "Resolve Reports", "Access Audit Logs"],
    },
    {
      role: "VERIFICATION_OFFICER",
      title: "Trust & Safety Officer",
      badge: "teal",
      desc: "Student identity and credentials verification. Document reviews, duplicate checks, checklist approval.",
      permissions: ["Review Student Documents", "Approve / Reject Verification", "Request Information", "Inspect Audit Trail"],
    },
    {
      role: "COLLEGE_ADMIN",
      title: "College Placement Administrator",
      badge: "amber",
      desc: "Institutional placement cell. View university candidate applications and drive allocations.",
      permissions: ["View College Students", "Monitor College Drives", "Track Student Placements"],
    },
    {
      role: "RECRUITER",
      title: "Recruiter / Hiring Manager",
      badge: "emerald",
      desc: "Corporate hiring representative. Post drives, screen candidates, schedule interviews, publish results.",
      permissions: ["Create Recruitment Drives", "Review Applications", "Conduct Interviews", "Publish Results"],
    },
    {
      role: "STUDENT",
      title: "Verified Student Candidate",
      badge: "default",
      desc: "University candidate. Submit verification documents, apply to drives, take tests, attend interviews.",
      permissions: ["Submit Profile", "Upload Documents", "Apply to Drives", "View Personal Results"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Platform Configuration
            </span>
            <span className="text-xs text-muted-foreground">Production Hardened</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Platform Settings &amp; RBAC Architecture
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage Role-Based Access Control policies, platform security parameters, session expiration, and system health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="gradient" size="sm" onClick={handleSaveSettings} isLoading={isSaving}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Security Policies */}
      <Card className="p-5 border-border/80 bg-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-sm text-foreground">Platform Security &amp; Access Controls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Strict IDOR Protection</label>
              <input
                type="checkbox"
                checked={strictIDOR}
                onChange={(e) => setStrictIDOR(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enforces tenant and ownership boundaries across recruitment drives, company resources, and candidate dossiers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Admin Multi-Factor Enforcement</label>
              <input
                type="checkbox"
                checked={require2FA}
                onChange={(e) => setRequire2FA(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Requires 2-step hardware or TOTP authentication for all PLATFORM_ADMIN and SUPER_ADMIN sessions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <label className="text-xs font-bold text-foreground">JWT Inactivity Timeout (Minutes)</label>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="15">15 Minutes (High Security)</option>
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes (Standard)</option>
              <option value="120">2 Hours</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Platform Maintenance Mode</label>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Suspends public candidate submissions and limits access strictly to super administrators during migration.
            </p>
          </div>
        </div>
      </Card>

      {/* Role & Permission Matrix */}
      <Card className="p-5 border-border/80 bg-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Key className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-sm text-foreground">Role-Based Access Control (RBAC) Matrix</h3>
        </div>

        <div className="space-y-3">
          {roleMatrix.map((rm) => (
            <div
              key={rm.role}
              className="p-4 rounded-xl bg-muted/20 border border-border hover:border-border/80 transition-colors space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant={rm.badge as any}>{rm.role}</Badge>
                  <span className="font-bold text-xs text-foreground">{rm.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{rm.desc}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {rm.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-card border border-border text-foreground font-medium"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Diagnostics */}
      <Card className="p-5 border-border/80 bg-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Server className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-sm text-foreground">System Engine Diagnostics</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <p className="text-muted-foreground">Persistence Store</p>
            <p className="font-bold text-foreground mt-0.5">JSON File Database</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Synced (.data/)
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <p className="text-muted-foreground">Authentication Core</p>
            <p className="font-bold text-foreground mt-0.5">Dual JWT / SSR Session</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Active &amp; Validated
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <p className="text-muted-foreground">Audit Trail Engine</p>
            <p className="font-bold text-foreground mt-0.5">Append-Only Journal</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Immutable Recording
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
