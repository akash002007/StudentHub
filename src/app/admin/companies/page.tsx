"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Search,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  ShieldAlert,
  Clock3,
  ExternalLink,
  Users,
  Briefcase,
  X,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CompanyRecord, CompanyStatus } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Verify/Suspend Modal
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [statusToSet, setStatusToSet] = useState<CompanyStatus | null>(null);
  const [verificationTier, setVerificationTier] = useState<"STANDARD" | "ENTERPRISE">("STANDARD");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Company Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    website: "",
    industry: "",
    size: "50-200 employees",
    location: "",
    description: "",
    status: "PENDING" as CompanyStatus,
  });

  const { success, error: toastError } = useToast();

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/companies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.warn("Failed to load companies:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenStatusModal = (company: CompanyRecord, status: CompanyStatus) => {
    setSelectedCompany(company);
    setStatusToSet(status);
    setReason("");
  };

  const handleCloseStatusModal = () => {
    setSelectedCompany(null);
    setStatusToSet(null);
    setReason("");
  };

  const handleSaveStatus = async () => {
    if (!selectedCompany || !statusToSet) return;

    if (!reason.trim()) {
      toastError("A justification reason is required for status changes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/companies/${selectedCompany.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusToSet,
          reason: reason.trim(),
          verificationTier: statusToSet === "VERIFIED" ? verificationTier : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || `Company status updated to ${statusToSet}`);
        handleCloseStatusModal();
        fetchCompanies();
      } else {
        toastError(data.error || "Failed to update company.");
      }
    } catch (err: any) {
      toastError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      toastError("Company name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(`Registered ${data.company.name} successfully.`);
        setIsAddOpen(false);
        setNewCompany({
          name: "",
          website: "",
          industry: "",
          size: "50-200 employees",
          location: "",
          description: "",
          status: "PENDING",
        });
        fetchCompanies();
      } else {
        toastError(data.error || "Failed to register company.");
      }
    } catch (err: any) {
      toastError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Employer Governance
            </span>
            <span className="text-xs text-muted-foreground">{companies.length} Registered Companies</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Company Registry &amp; Verification
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Audit employer profiles, assign verification tiers, inspect live drive participation, and suspend compromised entities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCompanies} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Register Company
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border/80 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name, industry, or location..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Review</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading company directory...
          </div>
        ) : companies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No companies found matching current filters.
          </div>
        ) : (
          companies.map((c) => {
            const isVerified = c.status === "VERIFIED";
            const isSuspended = c.status === "SUSPENDED";

            return (
              <Card key={c.id} className="p-5 border-border/80 bg-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-base">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          {c.name}
                          {isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{c.industry}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isVerified ? (
                        <Badge variant="emerald">Verified</Badge>
                      ) : isSuspended ? (
                        <Badge variant="rose">Suspended</Badge>
                      ) : (
                        <Badge variant="amber">Pending</Badge>
                      )}
                      {c.verificationTier && c.verificationTier !== "UNVERIFIED" && (
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                          {c.verificationTier}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                    {c.description || "No company description provided."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{c.recruiterCount || 0} Recruiters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <span>{c.activeDrivesCount || 0} Active Drives</span>
                    </div>
                  </div>

                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline mt-2.5"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {c.suspensionReason && (
                    <div className="mt-2.5 p-2 rounded-lg bg-primary/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400">
                      <strong>Suspension Note:</strong> {c.suspensionReason}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                  {!isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-blue-500/30 hover:bg-emerald-500/10"
                      onClick={() => handleOpenStatusModal(c, "VERIFIED")}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verify Company
                    </Button>
                  )}
                  {isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-500/30 hover:bg-primary/10"
                      onClick={() => handleOpenStatusModal(c, "SUSPENDED")}
                    >
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      Suspend
                    </Button>
                  )}
                  {isSuspended && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-blue-500/30 hover:bg-emerald-500/10"
                      onClick={() => handleOpenStatusModal(c, "VERIFIED")}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Verification / Suspension Action Modal */}
      {selectedCompany && statusToSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground">
                {statusToSet === "VERIFIED" ? `Verify Company: ${selectedCompany.name}` : `Suspend Company: ${selectedCompany.name}`}
              </h3>
              <button onClick={handleCloseStatusModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusToSet === "VERIFIED" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Verification Tier</label>
                <select
                  value={verificationTier}
                  onChange={(e) => setVerificationTier(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="STANDARD">Standard Verified</option>
                  <option value="ENTERPRISE">Enterprise Trusted Partner</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Justification Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain the audit justification for this status modification..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCloseStatusModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={statusToSet === "SUSPENDED" ? "danger" : "gradient"}
                size="sm"
                onClick={handleSaveStatus}
                isLoading={isSubmitting}
              >
                Confirm {statusToSet === "VERIFIED" ? "Verification" : "Suspension"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Company Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg p-6 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Register New Employer</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Company Name *</label>
                <input
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Acme Technologies"
                  required
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Website URL</label>
                  <input
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Industry</label>
                  <input
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    placeholder="e.g. Fintech, Cloud"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Headquarters / Location</label>
                  <input
                    value={newCompany.location}
                    onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Company Size</label>
                  <input
                    value={newCompany.size}
                    onChange={(e) => setNewCompany({ ...newCompany, size: e.target.value })}
                    placeholder="e.g. 50-200 employees"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  rows={2}
                  placeholder="Overview of company core operations..."
                  className="mt-1 w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm" isLoading={isSubmitting}>
                  Register Company
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
