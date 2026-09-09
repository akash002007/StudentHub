"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Sparkles,
  Building2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  User,
  Layers,
  Phone,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

interface StudentInterviewItem {
  id: string;
  driveId: string;
  applicationId: string;
  driveTitle: string;
  company: string;
  companyLogo?: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  meetingLink?: string;
  location?: string;
  interviewerName: string;
  status: string;
  createdAt: string;
}

export default function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState<StudentInterviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/interviews");
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews || []);
      }
    } catch (err) {
      console.error("Failed to load interviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interview Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recruitment Interviews
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Access your scheduled 1-on-1 engineering deep-dives, video call links, interviewer information, and completed rounds.
            </p>
          </div>

          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
              My Applications
            </Button>
          </Link>
        </div>

        {/* Interviews Listing */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading recruitment interview schedule...</p>
          </div>
        ) : interviews.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-foreground">No interviews scheduled yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Once you clear screening and assessment stages, shortlisted interview rounds will appear here with direct meeting links.
            </p>
            <Link href="/dashboard/drives" className="inline-block mt-4">
              <Button variant="gradient" size="sm">
                Explore Recruitment Drives
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviews.map((int) => {
              const isScheduled = int.status === "SCHEDULED";
              const isCompleted = int.status === "COMPLETED";

              return (
                <Card
                  key={int.id}
                  hoverEffect
                  className="p-5 border-border bg-card space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-muted border border-border p-1 overflow-hidden shrink-0 flex items-center justify-center">
                        {int.companyLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={int.companyLogo}
                            alt={int.company}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                            {int.type} Interview • {int.driveTitle}
                          </h3>
                          {isScheduled ? (
                            <Badge variant="purple" size="sm" className="font-bold">
                              Scheduled
                            </Badge>
                          ) : (
                            <Badge variant="emerald" size="sm" className="font-bold">
                              Completed ✓
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {int.company} • Interviewer:{" "}
                          <strong className="text-foreground">{int.interviewerName}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Join Meeting / Status CTA */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {isScheduled && int.meetingLink ? (
                        <a
                          href={int.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="gradient"
                            size="sm"
                            leftIcon={<Video className="w-3.5 h-3.5" />}
                            rightIcon={<ExternalLink className="w-3 h-3" />}
                          >
                            Join Video Meeting
                          </Button>
                        </a>
                      ) : (
                        <Link href={`/dashboard/applications`}>
                          <Button variant="outline" size="sm">
                            View in Application
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      {int.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {int.time} ({int.duration})
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-emerald-500" />
                      Mode: {int.type}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
