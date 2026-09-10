"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function CollegeInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    async function loadInterviews() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status !== "ALL") params.append("status", status);

        const res = await fetch(`/api/college/interviews?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setInterviews(json.interviews || []);
        }
      } catch (err) {
        console.error("Failed to load interviews:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInterviews();
  }, [status]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Campus Interview Schedule & Evaluations
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Monitor scheduled candidate interview rounds, interviewer panels, meeting links, and post-round feedback.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search interviews by candidate, panelist, or drive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs bg-muted/60 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </Card>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground">
            Loading interview schedules...
          </div>
        ) : interviews.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-xs text-muted-foreground rounded-2xl">
            No interviews scheduled matching criteria.
          </Card>
        ) : (
          interviews.map((item) => (
            <Card
              key={item.id}
              className="p-5 rounded-2xl bg-card border border-border hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" className="text-[10px]">
                    {item.type}
                  </Badge>
                  <Badge
                    variant={item.status === "COMPLETED" ? "emerald" : "blue"}
                    className="text-[10px]"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">{item.candidateName}</h3>
                  <p className="text-xs text-muted-foreground">
                    Role: <span className="font-semibold text-foreground">{item.driveTitle}</span> &bull; {item.companyName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> {item.date}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> {item.time} ({item.duration || "45m"})
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 font-medium pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">Interviewer:</span>{" "}
                    <span className="font-semibold text-foreground">{item.interviewerName}</span>
                  </div>
                </div>

                {item.evaluation && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Panel Recommendation:</span>
                      <span>{item.evaluation.recommendation}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">&ldquo;{item.evaluation.feedback}&rdquo;</p>
                  </div>
                )}
              </div>

              {item.meetingLink && (
                <div className="pt-2 border-t border-border/60 flex justify-end">
                  <a href={item.meetingLink} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="text-xs h-8" rightIcon={<ExternalLink className="w-3 h-3" />}>
                      Join Session Link
                    </Button>
                  </a>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
