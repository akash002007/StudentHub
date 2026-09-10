"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Sparkles,
  TrendingUp,
  Building2,
  Users,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default function CollegeResultsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch("/api/college/results");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load results:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResults() ;
  }, []);

  const summary = data?.summary;
  const meritList = data?.meritList || [];
  const multipleOffers = data?.multipleOffersStudents || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Campus Placement Results & Merit Offers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Verified institutional merit lists, final compensation packages, and multiple-offer policy compliance.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          rightIcon={<Download className="w-3.5 h-3.5" />}
          onClick={() => alert("Downloading Institutional Placement Report...")}
        >
          Export Merit Report
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Total Job Offers"
          value={loading ? "..." : summary?.totalOffers ?? 0}
          hint="Letters of Intent issued"
          icon={<Award className="w-4 h-4" />}
          iconVariant="emerald"
        />
        <MetricCard
          label="Placed Candidates"
          value={loading ? "..." : summary?.uniquePlacedStudents ?? 0}
          hint={`${summary?.placementRate ?? 0}% Placement Rate`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconVariant="blue"
        />
        <MetricCard
          label="Average CTC Package"
          value={loading ? "..." : summary?.averagePackage ?? "$140k / yr"}
          hint="Across all branches"
          icon={<TrendingUp className="w-4 h-4" />}
          iconVariant="purple"
        />
        <MetricCard
          label="Highest Dream Offer"
          value={loading ? "..." : summary?.highestPackage ?? "$210k / yr"}
          hint="Super Dream Category"
          icon={<Sparkles className="w-4 h-4" />}
          iconVariant="amber"
        />
      </div>

      {/* Multiple Offers Compliance Box */}
      {multipleOffers.length > 0 && (
        <Card className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Multiple Offers Tracker ({multipleOffers.length} Candidates Holding 2+ Offers)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Institutional placement policy monitors candidate retention to maximize peer placement opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {multipleOffers.map((item: any) => (
              <div
                key={item.candidateId}
                className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-foreground">{item.candidateName}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.department} &bull; Holds {item.offersCount} Offers
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {item.offers.map((o: any) => o.company).join(" + ")}
                  </div>
                </div>
                <Badge variant="purple" className="text-[10px]">
                  {item.offersCount} Offers
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Campus Merit List Table */}
      <Card className="overflow-hidden rounded-2xl bg-card border border-border space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Official Campus Merit List & Hired Cohort
          </h2>
          <span className="text-xs text-muted-foreground">{meritList.length} Verified Selections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Department & CGPA</th>
                <th className="py-3 px-4">Selected By</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">CTC Package</th>
                <th className="py-3 px-4 text-right">Offer Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Loading merit rankings...
                  </td>
                </tr>
              ) : meritList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No selections finalized yet.
                  </td>
                </tr>
              ) : (
                meritList.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-foreground text-sm">
                      <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 inline-flex items-center justify-center">
                        #{c.rank}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={c.studentAvatar}
                          alt={c.candidateName}
                          name={c.candidateName}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold text-foreground">{c.candidateName}</div>
                          <div className="text-[11px] text-muted-foreground">{c.candidateEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div className="text-foreground font-medium">{c.department}</div>
                      <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        CGPA {c.cgpa}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {c.company}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {c.position}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {c.salaryRange}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="emerald" className="gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Offer Issued
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
