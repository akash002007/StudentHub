"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Shield,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  Save,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";

export default function AdminCollegesPage() {
  const { success, error } = useToast();
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [newInst, setNewInst] = useState({
    name: "",
    code: "",
    domain: "",
    location: "",
    adminName: "",
    adminEmail: "",
  });

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status !== "ALL") params.append("status", status);

      const res = await fetch(`/api/admin/colleges?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setColleges(json.colleges || []);
      }
    } catch (err) {
      console.error("Failed to load colleges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [status]);

  const handleApprove = async (collegeId: string) => {
    setActionLoadingId(collegeId);
    try {
      const res = await fetch(`/api/admin/colleges/${collegeId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "Platform Admin" }),
      });

      if (res.ok) {
        success("Institution approved and activated for campus recruitment!");
        fetchColleges();
      } else {
        error("Failed to approve institution.");
      }
    } catch (err) {
      error("Network error while approving.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSuspend = async (collegeId: string) => {
    if (!confirm("Are you sure you want to suspend campus placement access for this institution?")) return;
    setActionLoadingId(collegeId);
    try {
      const res = await fetch(`/api/admin/colleges/${collegeId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Administrative platform review" }),
      });

      if (res.ok) {
        success("Institution suspended from active placement drives.");
        fetchColleges();
      } else {
        error("Failed to suspend institution.");
      }
    } catch (err) {
      error("Network error while suspending.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await fetch("/api/admin/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInst),
      });

      if (res.ok) {
        success("New institution registered and queued for onboarding review!");
        setIsRegisterOpen(false);
        setNewInst({ name: "", code: "", domain: "", location: "", adminName: "", adminEmail: "" });
        fetchColleges();
      } else {
        error("Failed to register institution.");
      }
    } catch (err) {
      error("Network error during registration.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Platform University & College Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Oversee affiliated institutions, campus placement cells, student cohort volumes, and operational compliance.
          </p>
        </div>
        <Button
          variant="gradient"
          size="sm"
          className="text-xs h-9"
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsRegisterOpen(true)}
        >
          Register Institution
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search institutions by name, code (e.g. STAN, MIT, IITM), or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Campuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <Button variant="outline" size="sm" className="h-10 text-xs px-4" onClick={fetchColleges}>
            Filter
          </Button>
        </div>
      </Card>

      {/* College Table */}
      <Card className="overflow-hidden rounded-2xl bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">University / College</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Placement Officer</th>
                <th className="py-3 px-4">Enrolled Cohort</th>
                <th className="py-3 px-4">Placement Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Loading institutions...
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No institutions found.
                  </td>
                </tr>
              ) : (
                colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-foreground text-xs overflow-hidden shrink-0">
                          {c.logo ? (
                            <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.code
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            Code: <span className="font-semibold text-purple-600 dark:text-purple-400">{c.code}</span> &bull; {c.website}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {c.location || "Campus"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{c.placementOfficer?.name || "Placement Head"}</div>
                      <div className="text-[11px] text-muted-foreground">{c.placementOfficer?.email || "placement@campus.edu"}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {c.enrolledStudentsCount ?? 0} candidates
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {c.placementRate ?? 0}%
                      </span>{" "}
                      <span className="text-[11px] text-muted-foreground">({c.placedCount ?? 0} placed)</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={c.status === "ACTIVE" ? "emerald" : c.status === "PENDING" ? "amber" : "rose"}
                        className="text-[10px]"
                      >
                        {c.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {c.status === "PENDING" ? (
                        <Button
                          variant="gradient"
                          size="sm"
                          className="h-8 text-xs"
                          isLoading={actionLoadingId === c.id}
                          onClick={() => handleApprove(c.id)}
                        >
                          Approve Onboarding
                        </Button>
                      ) : c.status === "ACTIVE" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/college/dashboard?collegeId=${c.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs text-blue-600">
                              View Portal
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-rose-600 hover:bg-rose-500/10"
                            isLoading={actionLoadingId === c.id}
                            onClick={() => handleSuspend(c.id)}
                          >
                            Suspend
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-emerald-600"
                          isLoading={actionLoadingId === c.id}
                          onClick={() => handleApprove(c.id)}
                        >
                          Re-Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register Institution Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Register New College / University</h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Institution Name"
                placeholder="e.g. Harvard University"
                value={newInst.name}
                onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Short Code"
                  placeholder="e.g. HARV"
                  value={newInst.code}
                  onChange={(e) => setNewInst({ ...newInst, code: e.target.value })}
                  required
                />
                <Input
                  label="Domain Name"
                  placeholder="e.g. harvard.edu"
                  value={newInst.domain}
                  onChange={(e) => setNewInst({ ...newInst, domain: e.target.value })}
                />
              </div>
              <Input
                label="Location / Campus Address"
                placeholder="e.g. Cambridge, MA"
                value={newInst.location}
                onChange={(e) => setNewInst({ ...newInst, location: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Dean / TPO Name"
                  placeholder="e.g. Dr. Jane Smith"
                  value={newInst.adminName}
                  onChange={(e) => setNewInst({ ...newInst, adminName: e.target.value })}
                />
                <Input
                  label="Dean / TPO Email"
                  placeholder="e.g. placement@harvard.edu"
                  type="email"
                  value={newInst.adminEmail}
                  onChange={(e) => setNewInst({ ...newInst, adminEmail: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm" isLoading={registering}>
                  Register & Queue for Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
