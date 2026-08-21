"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Users2,
  Award,
  Bookmark,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { getTimeAwareGreeting, getStatusBadgeStyle } from "@/lib/utils";
import { CareerDNASummaryCard } from "@/components/dashboard/CareerDNASummaryCard";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const {
    internships,
    applications,
    savedInternshipIds,
    conversations,
    toggleSaveInternship,
    isInternshipSaved,
  } = useData();

  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    if (role === "recruiter") {
      router.replace("/dashboard/recruiter");
    }
  }, [role, router]);

  useEffect(() => {
    setGreeting(getTimeAwareGreeting(new Date()));
  }, []);

  if (role === "recruiter") {
    return null;
  }

  const recommendedInternships = internships.slice(0, 3);
  const activeApplications = applications.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Dynamic Greeting & Career Overview Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-900/20 via-card to-blue-900/15 border border-purple-500/20 shadow-sm overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gradient" size="sm" className="font-semibold">
                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                Candidate Hub
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting},{" "}
              <span className="text-gradient">
                {user?.name ? user.name.split(" ")[0] : "Alex"}
              </span>
              !
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              You have 2 interview rounds scheduled this week and 4 high-match internships waiting for your review.
            </p>
          </div>

          {/* Profile Completion Meter */}
          <div className="p-4 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-md shrink-0 w-full md:w-72 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Profile Strength</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">85%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                style={{ width: "85%" }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Next: Add a verified project link</span>
              <Link href="/dashboard/profile" className="text-purple-600 font-semibold hover:underline">
                Complete &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Career DNA Summary Section */}
      <CareerDNASummaryCard userId={user?.id} />

      {/* Quick Statistics Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card hoverEffect className="p-5 border-border/80 bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Applications
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {applications.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">+2</span> this week
          </p>
        </Card>

        <Card hoverEffect className="p-5 border-border/80 bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Interviews Scheduled
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {applications.filter((a) => a.status === "Interview").length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-purple-500 font-semibold">Feb 24</span> with Linear
          </p>
        </Card>

        <Card hoverEffect className="p-5 border-border/80 bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Internships
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {savedInternshipIds.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Ready for 1-click apply</p>
        </Card>

        <Card hoverEffect className="p-5 border-border/80 bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profile Views
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            342
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">18 recruiters</span> this month
          </p>
        </Card>
      </div>

      {/* Main 2-Column Section: Recommended Internships & Application Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recommended Internships (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Recommended For You
              </h2>
              <p className="text-xs text-muted-foreground">
                Matches your React, TypeScript, and Stanford coursework
              </p>
            </div>
            <Link href="/dashboard/internships">
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recommendedInternships.map((intern) => {
              const isSaved = isInternshipSaved(intern.id);
              return (
                <Card
                  key={intern.id}
                  hoverEffect
                  className="p-5 border-border/80 bg-card space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={intern.companyLogo}
                          alt={intern.company}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                          {intern.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {intern.company} • {intern.location} •{" "}
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {intern.stipend}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="emerald" size="sm" className="font-bold">
                        {intern.matchPercentage}% Match
                      </Badge>
                      <button
                        onClick={() => toggleSaveInternship(intern.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Save internship"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isSaved ? "fill-purple-600 text-purple-600" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Why this matches you block */}
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 text-xs text-muted-foreground space-y-1">
                    <div className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Why this matches you:
                    </div>
                    <p className="text-[11px]">
                      {intern.matchReasons.projectSynergy} &amp; {intern.matchReasons.academicMatch}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {intern.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80 border border-border/40"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Link href="/dashboard/internships">
                      <Button variant="outline" size="sm">
                        View &amp; Apply
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Applications Tracker + Recommended Peers (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Applications Mini-Tracker */}
          <Card className="p-5 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Recent Applications</h3>
                <p className="text-xs text-muted-foreground">Track stages &amp; interview rounds</p>
              </div>
              <Link href="/dashboard/applications">
                <Button variant="ghost" size="sm">
                  Full Tracker
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {activeApplications.map((app) => {
                const style = getStatusBadgeStyle(app.status);
                return (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted border border-border/50 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={app.companyLogo}
                          alt={app.company}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden text-left">
                        <div className="font-bold text-foreground truncate">{app.company}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{app.role}</div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recommended Connections & Peer Mentors */}
          <Card className="p-5 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Student Connections</h3>
                <p className="text-xs text-muted-foreground">Peers &amp; Alumni in your field</p>
              </div>
              <Link href="/dashboard/communities">
                <Button variant="ghost" size="sm">
                  Browse Hubs
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    name="Marcus Vance"
                    size="sm"
                    isOnline={true}
                  />
                  <div className="text-left text-xs">
                    <div className="font-bold text-foreground">Marcus Vance</div>
                    <div className="text-[11px] text-muted-foreground">SWE @ Linear (Mentor)</div>
                  </div>
                </div>
                <Link href="/dashboard/messages">
                  <Button variant="secondary" size="sm" className="h-7 text-xs">
                    Message
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    name="Priya Sharma"
                    size="sm"
                    isOnline={false}
                  />
                  <div className="text-left text-xs">
                    <div className="font-bold text-foreground">Priya Sharma</div>
                    <div className="text-[11px] text-muted-foreground">Stanford &apos;25 • CalHacks Team</div>
                  </div>
                </div>
                <Link href="/dashboard/messages">
                  <Button variant="secondary" size="sm" className="h-7 text-xs">
                    Message
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
