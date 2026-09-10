"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Mail,
  MapPin,
  ExternalLink,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";

export default function AdminCollegeApprovalsPage() {
  const { success, error } = useToast();
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/colleges?status=PENDING");
      if (res.ok) {
        const json = await res.json();
        setColleges(json.colleges || []);
      }
    } catch (err) {
      console.error("Failed to load pending colleges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (collegeId: string) => {
    setActingId(collegeId);
    try {
      const res = await fetch(`/api/admin/colleges/${collegeId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "Platform Super Admin" }),
      });

      if (res.ok) {
        success("Institution approved and activated for campus recruitment operations!");
        fetchPending();
      } else {
        error("Failed to approve institution.");
      }
    } catch (err) {
      error("Network error while approving.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          University Onboarding & Verification Approvals
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Review institutional applications from universities seeking to participate in StudentHub corporate placement drives.
        </p>
      </div>

      {/* Queue Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">Loading onboarding queue...</div>
        ) : colleges.length === 0 ? (
          <Card className="p-12 text-center text-xs text-muted-foreground rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No pending university onboarding applications. All campus affiliations are up to date.
          </Card>
        ) : (
          colleges.map((c) => (
            <Card
              key={c.id}
              className="p-6 rounded-2xl bg-card border border-border hover:border-purple-500/40 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg overflow-hidden shrink-0 border border-purple-500/20">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.code
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">{c.name}</h2>
                      <Badge variant="amber" className="gap-1 text-[10px]">
                        <Clock className="w-3 h-3" /> Awaiting Operational Approval
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {c.location || "Campus"} &bull; Code: {c.code}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <span>TPO Contact: <strong>{c.placementOfficer?.name || "Dr. S. Ramanathan"}</strong></span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {c.placementOfficer?.email || "tpo@iitm.ac.in"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="h-9 text-xs"
                    isLoading={actingId === c.id}
                    onClick={() => handleApprove(c.id)}
                    rightIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Approve & Activate Campus
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs text-muted-foreground"
                    onClick={() => success("Information request sent to university administration.")}
                  >
                    Request Info
                  </Button>
                </div>
              </div>

              {/* Requirements checklist preview */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Institutional Domain Verified
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Placement Dean Identity Validated
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Academic Accreditation Confirmed
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
