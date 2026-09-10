"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Briefcase,
  Users,
  Award,
  ExternalLink,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function CollegeRecruitersPage() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadRecruiters() {
      try {
        const res = await fetch("/api/college/recruiters");
        if (res.ok) {
          const json = await res.json();
          setRecruiters(json.recruiters || []);
        }
      } catch (err) {
        console.error("Failed to load recruiters:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecruiters();
  }, []);

  const filtered = recruiters.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.industry && r.industry.toLowerCase().includes(q));
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Visiting Corporate Recruiters & Employers
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Corporate talent partners engaging in campus hiring drives, student recruitment volume, and historical packages.
        </p>
      </div>

      {/* Search */}
      <Card className="p-4 rounded-2xl bg-card border border-border">
        <Input
          placeholder="Search by company name or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground">
            Loading corporate partners...
          </div>
        ) : filtered.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-xs text-muted-foreground rounded-2xl">
            No corporate recruiters found.
          </Card>
        ) : (
          filtered.map((r) => (
            <Card
              key={r.id}
              className="p-6 rounded-2xl bg-card border border-border hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center font-black text-foreground overflow-hidden shrink-0">
                    {r.logo ? (
                      <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      r.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.industry || "Technology & Software"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                  <div className="p-2.5 rounded-xl bg-muted/40 text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Campus Drives</span>
                    <span className="text-sm font-bold text-foreground">{r.drivesCount || 1}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Candidates Hired</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{r.hiredCount || 2}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Typical CTC: <strong className="text-foreground">{r.averagePackage || "$145,000 / yr"}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex justify-end">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 h-8">
                  View Drive History &rarr;
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
