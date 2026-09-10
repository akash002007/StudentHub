"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Scale,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";

export default function CollegeSettingsPage() {
  const { success, error } = useToast();
  const [college, setCollege] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRule, setNewRule] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/college/profile");
        if (res.ok) {
          const json = await res.json();
          setCollege(json.college || {});
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const policy = college?.placementPolicy || {
    minAttendancePercentage: 75,
    maxOffersAllowed: 2,
    dreamTierThresholdLpa: 18,
    allowSimultaneousInterview: true,
    rules: [],
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/college/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...college,
          placementPolicy: policy,
        }),
      });

      if (res.ok) {
        success("Campus placement policies successfully saved!");
      } else {
        error("Failed to update placement policies.");
      }
    } catch (err) {
      error("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    const currentRules = policy.rules || [];
    setCollege({
      ...college,
      placementPolicy: {
        ...policy,
        rules: [...currentRules, newRule.trim()],
      },
    });
    setNewRule("");
  };

  const handleRemoveRule = (index: number) => {
    const currentRules = [...(policy.rules || [])];
    currentRules.splice(index, 1);
    setCollege({
      ...college,
      placementPolicy: {
        ...policy,
        rules: currentRules,
      },
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading placement policies...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Campus Placement Governance & Policies
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Define institutional rules governing candidate nominations, dream offers, multiple offer caps, and interview scheduling.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Quotas & Rules */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-5">
          <h2 className="text-base font-bold text-foreground">Offer Eligibility Rules</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                Maximum Job Offers Allowed Per Student
              </label>
              <Input
                type="number"
                min="1"
                max="5"
                value={policy.maxOffersAllowed ?? 2}
                onChange={(e) =>
                  setCollege({
                    ...college,
                    placementPolicy: {
                      ...policy,
                      maxOffersAllowed: parseInt(e.target.value) || 1,
                    },
                  })
                }
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                After reaching this cap, candidates are de-prioritized to ensure equitable batch placement.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                Dream Offer Threshold (CTC in $k / year)
              </label>
              <Input
                type="number"
                min="50"
                max="500"
                value={policy.dreamTierThresholdLpa ?? 150}
                onChange={(e) =>
                  setCollege({
                    ...college,
                    placementPolicy: {
                      ...policy,
                      dreamTierThresholdLpa: parseInt(e.target.value) || 100,
                    },
                  })
                }
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Offers exceeding this threshold override normal offer caps (&ldquo;Super Dream&rdquo; policy).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                Minimum Academic Attendance Floor (%)
              </label>
              <Input
                type="number"
                min="50"
                max="100"
                value={policy.minAttendancePercentage ?? 75}
                onChange={(e) =>
                  setCollege({
                    ...college,
                    placementPolicy: {
                      ...policy,
                      minAttendancePercentage: parseInt(e.target.value) || 75,
                    },
                  })
                }
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Students below this attendance are blocked from registering for campus drives.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                Simultaneous Interview Scheduling
              </label>
              <select
                value={policy.allowSimultaneousInterview ? "true" : "false"}
                onChange={(e) =>
                  setCollege({
                    ...college,
                    placementPolicy: {
                      ...policy,
                      allowSimultaneousInterview: e.target.value === "true",
                    },
                  })
                }
                className="w-full text-xs bg-muted/60 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="true">Allowed (Flexible Interviewing)</option>
                <option value="false">Restricted (One Interview Round At A Time)</option>
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Controls whether a student can attend multiple company interview panels in parallel.
              </p>
            </div>
          </div>
        </Card>

        {/* Institutional Placement Guidelines */}
        <Card className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground">Institutional Placement Code of Conduct</h2>

          <div className="space-y-2">
            {(policy.rules || []).map((rule: string, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
              >
                <span className="text-foreground font-medium">{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/60">
            <Input
              placeholder="Add institutional placement rule or guideline..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 text-xs shrink-0"
              onClick={handleAddRule}
              rightIcon={<Plus className="w-4 h-4" />}
            >
              Add Rule
            </Button>
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
            Save Placement Policies
          </Button>
        </div>
      </form>
    </div>
  );
}
