"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";

export default function CollegeProfilePage() {
  const { success, error } = useToast();
  const [college, setCollege] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/college/profile");
        if (res.ok) {
          const json = await res.json();
          setCollege(json.college || {});
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/college/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(college),
      });

      if (res.ok) {
        success("Institutional profile updated successfully!");
      } else {
        error("Failed to save changes.");
      }
    } catch (err) {
      error("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading institutional profile...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Institutional Profile & Campus Verification
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your official institutional details, placement office contacts, and verified campus status.
          </p>
        </div>
        <Badge variant="emerald" className="gap-1 text-xs py-1 px-3">
          <ShieldCheck className="w-4 h-4" /> Enterprise Verified Campus
        </Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Institution Info */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground">Institution Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Institution Name"
              value={college?.name || ""}
              onChange={(e) => setCollege({ ...college, name: e.target.value })}
              required
            />
            <Input
              label="Institution Code / Identifier"
              value={college?.code || ""}
              onChange={(e) => setCollege({ ...college, code: e.target.value })}
              required
            />
            <Input
              label="Campus Location"
              value={college?.location || ""}
              onChange={(e) => setCollege({ ...college, location: e.target.value })}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Official Website URL"
              value={college?.website || ""}
              onChange={(e) => setCollege({ ...college, website: e.target.value })}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>
        </Card>

        {/* Placement Officer Details */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground">Placement & Training Authority (TPO)</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Placement Officer / Dean Name"
              value={college?.placementOfficer?.name || ""}
              onChange={(e) =>
                setCollege({
                  ...college,
                  placementOfficer: { ...college.placementOfficer, name: e.target.value },
                })
              }
              required
            />
            <Input
              label="Designation / Title"
              value={college?.placementOfficer?.designation || ""}
              onChange={(e) =>
                setCollege({
                  ...college,
                  placementOfficer: { ...college.placementOfficer, designation: e.target.value },
                })
              }
            />
            <Input
              label="Official Placement Email"
              type="email"
              value={college?.placementOfficer?.email || ""}
              onChange={(e) =>
                setCollege({
                  ...college,
                  placementOfficer: { ...college.placementOfficer, email: e.target.value },
                })
              }
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Phone / Extension"
              value={college?.placementOfficer?.phone || ""}
              onChange={(e) =>
                setCollege({
                  ...college,
                  placementOfficer: { ...college.placementOfficer, phone: e.target.value },
                })
              }
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="gradient"
            isLoading={saving}
            rightIcon={<Save className="w-4 h-4" />}
            className="px-6"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
