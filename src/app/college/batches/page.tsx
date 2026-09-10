"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  ChevronRight,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CollegeBatch } from "@/types";

export default function CollegeBatchesPage() {
  const [batches, setBatches] = useState<CollegeBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await fetch("/api/college/batches");
        if (res.ok) {
          const json = await res.json();
          setBatches(json.batches || []);
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Graduation Batches & Cohort Progression
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Track cohort-level recruitment milestones across outgoing 2025, current 2026, and upcoming 2027 batches.
        </p>
      </div>

      {/* Batches Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            Loading batch metrics...
          </div>
        ) : (
          batches.map((batch) => {
            const placementPercentage =
              batch.totalStudents > 0
                ? Math.round((batch.placedStudents / batch.totalStudents) * 100)
                : 0;

            return (
              <Card
                key={batch.id}
                className="p-6 rounded-2xl bg-card border border-border hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-sm">
                        {batch.year.toString().slice(-2)}
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-foreground">Batch of {batch.year}</h2>
                        <span className="text-[11px] text-muted-foreground">{batch.degree}</span>
                      </div>
                    </div>
                    <Badge
                      variant={batch.year === 2026 ? "emerald" : batch.year === 2025 ? "purple" : "blue"}
                      className="text-[10px]"
                    >
                      {batch.year === 2026 ? "Active Hiring" : batch.year === 2025 ? "Alumni Cohort" : "Early Sourcing"}
                    </Badge>
                  </div>

                  {/* High level numbers */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">Placed</span>
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {batch.placedStudents}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-1">/ {batch.totalStudents}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">Unplaced</span>
                      <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                        {batch.unplacedStudents}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-1">seeking</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                      <span>Cohort Placement Rate</span>
                      <span className="font-bold text-foreground">{placementPercentage}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${placementPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Additional stats */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{batch.totalOffers} Total Offers Received</span>
                    <span>{batch.activeApplications} In Pipeline</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <Link href={`/college/students?batch=${batch.year}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-center">
                      View Batch Students <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
