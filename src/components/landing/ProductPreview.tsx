"use client";

import React from "react";
import {
  Sparkles,
  Briefcase,
  Layers,
  Send,
  Search,
  CheckCircle,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export function ProductPreview() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-purple-500/20 via-border/50 to-transparent border border-border/80 shadow-2xl backdrop-blur-xl">
      {/* Outer Shell */}
      <div className="rounded-xl sm:rounded-2xl bg-card border border-border overflow-hidden shadow-inner">
        {/* Browser Topbar / Window header */}
        <div className="px-4 py-3 bg-muted/60 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <div className="ml-3 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-background/80 border border-border/60 text-xs text-muted-foreground font-mono">
              <span className="text-purple-500 font-semibold">https://</span>
              studenthub.app/dashboard
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="emerald" size="sm" className="gap-1 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </Badge>
          </div>
        </div>

        {/* Inner Dashboard View Mockup */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* Mini Sidebar Preview */}
          <div className="hidden md:flex md:col-span-3 border-r border-border p-4 flex-col justify-between bg-muted/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">StudentHub</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Career Suite</div>
                </div>
              </div>

              <div className="space-y-1 text-xs font-medium text-muted-foreground">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Internships</span>
                  </div>
                  <span className="text-[10px] bg-muted-foreground/20 px-1.5 rounded">6 new</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Applications</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 rounded font-bold">5 active</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Messages</span>
                  </div>
                  <span className="text-[10px] bg-purple-500 text-white px-1.5 rounded-full font-bold">1</span>
                </div>
              </div>
            </div>

            {/* User Pill Preview */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border/60">
              <Avatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                name="Alex Rivera"
                size="sm"
                isOnline={true}
              />
              <div className="overflow-hidden text-left">
                <div className="text-xs font-semibold truncate text-foreground">Alex Rivera</div>
                <div className="text-[10px] text-muted-foreground truncate">Stanford &apos;26</div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Preview Area */}
          <div className="md:col-span-9 p-4 sm:p-6 space-y-5 bg-card">
            {/* Top greeting & stats row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Good morning, Alex! ☀️
                  </h3>
                  <Badge variant="lavender" size="sm">
                    Open to Internships
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You have 2 upcoming interview rounds and 4 high-match internships waiting.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">85% Profile</div>
                  <div className="text-[10px] text-muted-foreground">High Visibility</div>
                </div>
              </div>
            </div>

            {/* Grid with 2 columns: Internship Match Spotlight + Active Applications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Featured Match Card */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 space-y-3 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                      L
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                        SWE Intern - Frontend
                      </h4>
                      <p className="text-xs text-muted-foreground">Linear • Remote</p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm" className="font-bold text-[11px]">
                    96% Match
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  High synergy with your React, TypeScript, and real-time canvas projects.
                </p>

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-card border border-border text-foreground font-medium">
                    React
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-card border border-border text-foreground font-medium">
                    TypeScript
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-card border border-border text-foreground font-medium">
                    $48/hr
                  </span>
                </div>

                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">Deadline: Mar 30</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    Quick Apply <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Active Pipeline Card */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Active Pipeline
                  </h4>
                  <span className="text-[11px] text-muted-foreground">5 Tracking</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-xs font-semibold">Linear • SWE Intern</div>
                      <div className="text-[10px] text-muted-foreground">Tech Round • Feb 24</div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Interview
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-xs font-semibold">Swiggy • Frontend Intern</div>
                      <div className="text-[10px] text-muted-foreground">Offer Letter Sent</div>
                    </div>
                    <Badge variant="emerald" size="sm">
                      Selected
                    </Badge>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-muted-foreground text-center">
                  Track stages from Applied to Offer in one place
                </div>
              </div>
            </div>

            {/* Bottom mini banner */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                <span>
                  <strong>Student Communities:</strong> 142 new discussions in AI/ML & Web Development.
                </span>
              </div>
              <span className="hidden sm:inline font-semibold text-foreground">Explore &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
