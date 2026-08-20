"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Sparkles,
  Command,
  CheckCircle2,
  Briefcase,
  User,
  SlidersHorizontal,
  X,
  ExternalLink,
  PlusCircle,
  Users2,
  Building2,
  BarChart3,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { getTimeAwareGreeting } from "@/lib/utils";

export function TopBar() {
  const router = useRouter();
  const { user, role } = useAuth();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    recruiterNotifications,
    unreadRecruiterNotificationsCount,
    markRecruiterNotificationAsRead,
  } = useData();

  const [greeting, setGreeting] = useState("Hello");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setGreeting(getTimeAwareGreeting(new Date()));
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const activeNotifications = role === "recruiter" ? recruiterNotifications : notifications;
  const activeUnreadCount =
    role === "recruiter" ? unreadRecruiterNotificationsCount : unreadNotificationsCount;
  const recentNotifications = activeNotifications.slice(0, 4);

  const notificationsPageUrl =
    role === "recruiter" ? "/dashboard/recruiter/notifications" : "/dashboard/notifications";
  const profilePageUrl =
    role === "recruiter" ? "/dashboard/recruiter/company" : "/dashboard/profile";

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Dynamic Greeting Snippet & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-foreground">
            {greeting},{" "}
            <span className="text-purple-600 dark:text-purple-400">
              {user?.name ? user.name.split(" ")[0] : role === "recruiter" ? "Sarah" : "Student"}
            </span>
          </span>
        </div>
        <Badge
          variant={role === "recruiter" ? "gradient" : "lavender"}
          size="sm"
          className="hidden sm:inline-flex font-semibold text-[11px]"
        >
          {role === "recruiter" ? "Stripe University Talent" : "Open to Summer '26"}
        </Badge>
      </div>

      {/* Right: Search, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Modern Global Search Bar Trigger */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center justify-between gap-3 h-9 px-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 dark:bg-card/70 dark:hover:bg-card/90 border border-border/70 hover:border-purple-500/40 dark:hover:border-purple-500/40 text-xs text-muted-foreground hover:text-foreground shadow-2xs hover:shadow-xs transition-all duration-200 w-56 sm:w-64 md:w-72 lg:w-80 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
          aria-label="Search internships, skills, peers (Press ⌘K or Ctrl+K to open)"
        >
          <div className="flex items-center gap-2.5 min-w-0 truncate">
            <Search className="w-3.5 h-3.5 text-muted-foreground/80 group-hover:text-purple-500 transition-colors shrink-0" />
            <span className="truncate text-xs font-normal text-muted-foreground group-hover:text-foreground transition-colors">
              {role === "recruiter"
                ? "Search candidates, skills, jobs..."
                : "Search internships, skills, peers..."}
            </span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-background/80 dark:bg-muted/60 border border-border/80 text-muted-foreground shadow-2xs group-hover:border-purple-500/30 group-hover:text-purple-500 transition-colors shrink-0">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border/60"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <ThemeToggle />

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeUnreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-card animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-slide-up">
                <div className="p-4 border-b border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">
                      {role === "recruiter" ? "Hiring Alerts" : "Notifications"}
                    </h4>
                    {activeUnreadCount > 0 && (
                      <Badge variant="rose" size="sm">
                        {activeUnreadCount} new
                      </Badge>
                    )}
                  </div>
                  <Link
                    href={notificationsPageUrl}
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (role === "recruiter") {
                          markRecruiterNotificationAsRead(notif.id);
                        } else {
                          markNotificationAsRead(notif.id);
                        }
                        if (notif.actionUrl) router.push(notif.actionUrl);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 text-xs hover:bg-muted/60 transition-colors cursor-pointer flex gap-3 ${
                        !notif.isRead ? "bg-purple-500/5 dark:bg-purple-950/20" : ""
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-foreground">{notif.title}</div>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          {notif.description}
                        </p>
                        <div className="text-[10px] text-muted-foreground/80">{notif.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar Mini */}
        <Link href={profilePageUrl} className="flex items-center">
          <Avatar
            src={user?.avatar}
            name={user?.name || (role === "recruiter" ? "Sarah Chen" : "Student")}
            size="sm"
            isOnline={true}
          />
        </Link>
      </div>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl z-10 overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  role === "recruiter"
                    ? "Type to search candidate talent, posted roles, applications..."
                    : "Type to search internships, skills, applications, communities..."
                }
                className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 text-xs text-muted-foreground max-h-72 overflow-y-auto space-y-2">
              <div className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/70 px-2">
                Quick Navigation
              </div>

              {role === "recruiter" ? (
                <>
                  <button
                    onClick={() => {
                      router.push("/dashboard/recruiter/students");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-purple-500" />
                      <span>Search Student Talent Directory (Stanford, MIT, Berkeley)</span>
                    </div>
                    <Badge variant="purple" size="sm">
                      8+ Profiles
                    </Badge>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/dashboard/recruiter/applications");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <span>Review Candidate Pipeline &amp; Statuses</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Pipeline</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/dashboard/recruiter/post-internship");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4 text-emerald-500" />
                      <span>Post a New Summer 2026 Internship</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Form</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      router.push("/dashboard/internships");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      <span>Browse Software Engineering Internships</span>
                    </div>
                    <Badge variant="purple" size="sm">
                      96% Matches
                    </Badge>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/dashboard/applications");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <span>Track Application Statuses</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Tracker</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/dashboard/profile");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-emerald-500" />
                      <span>Manage Proof-of-Work Projects &amp; Resume</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">85% Complete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
