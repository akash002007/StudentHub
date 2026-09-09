"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Filter,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  Building2,
  GraduationCap,
  Briefcase,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AdminUserRecord, UserRole } from "@/types";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Status/Role action modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [actionType, setActionType] = useState<"SUSPEND" | "REACTIVATE" | "CHANGE_ROLE" | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("STUDENT");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.warn("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAction = (user: AdminUserRecord, type: "SUSPEND" | "REACTIVATE" | "CHANGE_ROLE") => {
    setSelectedUser(user);
    setActionType(type);
    setNewRole(user.role);
    setReason("");
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setActionType(null);
    setReason("");
  };

  const handleExecuteAction = async () => {
    if (!selectedUser || !actionType) return;

    if (!reason.trim()) {
      toastError("A justification reason is required for administrative actions.");
      return;
    }

    // Client-side self-suspension guard
    if (actionType === "SUSPEND" && currentUser?.id === selectedUser.id) {
      toastError("Administrators cannot suspend their own account.");
      return;
    }

    setIsSubmitting(true);
    try {
      let body: any = { reason: reason.trim() };
      if (actionType === "SUSPEND") {
        body.status = "SUSPENDED";
      } else if (actionType === "REACTIVATE") {
        body.status = "ACTIVE";
      } else if (actionType === "CHANGE_ROLE") {
        body.role = newRole;
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || "User updated successfully.");
        handleCloseModal();
        fetchUsers();
      } else {
        toastError(data.error || "Failed to update user.");
      }
    } catch (err: any) {
      toastError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const r = role.toUpperCase();
    if (r.includes("ADMIN")) return "purple";
    if (r === "RECRUITER") return "blue";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Identity & Access Management
            </span>
            <span className="text-xs text-muted-foreground">{users.length} Total Users Registered</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            User Management Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Oversee user accounts, enforce account suspensions, audit access tiers, and manage role permissions across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border/80 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, college, or company..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="RECRUITER">Recruiters</option>
              <option value="PLATFORM_ADMIN">Platform Admins</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden border-border/80 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Affiliation / College</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading platform users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isSuspended = u.status === "SUSPENDED";

                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={u.name} size="sm" />
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 font-medium">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {u.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {u.companyName ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>{u.companyName}</span>
                          </div>
                        ) : u.college ? (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                            <span>{u.college}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isSuspended ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-primary/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            Suspended
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </div>
                        )}
                        {u.suspensionReason && (
                          <p className="text-[10px] text-rose-500/80 mt-0.5 max-w-xs truncate">
                            {u.suspensionReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAction(u, "CHANGE_ROLE")}
                          >
                            Change Role
                          </Button>
                          {isSuspended ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-600 border-blue-500/30 hover:bg-emerald-500/10"
                              onClick={() => handleOpenAction(u, "REACTIVATE")}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSelf}
                              className="text-rose-600 border-rose-500/30 hover:bg-primary/10 disabled:opacity-40"
                              onClick={() => handleOpenAction(u, "SUSPEND")}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Modal */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                {actionType === "SUSPEND" ? (
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                ) : actionType === "REACTIVATE" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Shield className="w-5 h-5 text-blue-500" />
                )}
                <h3 className="font-bold text-base text-foreground">
                  {actionType === "SUSPEND"
                    ? `Suspend User: ${selectedUser.name}`
                    : actionType === "REACTIVATE"
                    ? `Reactivate User: ${selectedUser.name}`
                    : `Change Role: ${selectedUser.name}`}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionType === "CHANGE_ROLE" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Select New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="STUDENT">Student</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="PLATFORM_ADMIN">Platform Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Justification / Audit Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain the operational justification for this change..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-muted-foreground">
                This action will be permanently recorded in the immutable platform audit log.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={actionType === "SUSPEND" ? "danger" : "gradient"}
                size="sm"
                onClick={handleExecuteAction}
                isLoading={isSubmitting}
              >
                Confirm {actionType === "SUSPEND" ? "Suspension" : actionType === "REACTIVATE" ? "Reactivation" : "Role Update"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
