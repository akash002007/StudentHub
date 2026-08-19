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
  const { notifications, unreadNotificationsCount, markNotificationAsRead } = useData();

  const [greeting, setGreeting] = useState("Hello");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setGreeting(getTimeAwareGreeting(new Date()));
  }, []);

  const recentNotifications = notifications.slice(0, 4);

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Dynamic Greeting Snippet & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-foreground">
            {greeting},{" "}
            <span className="text-purple-600 dark:text-purple-400">
              {user?.name ? user.name.split(" ")[0] : "Student"}
            </span>
          </span>
        </div>
        <Badge
          variant="lavender"
          size="sm"
          className="hidden sm:inline-flex font-semibold text-[11px]"
        >
          {role === "student" ? "Open to Summer '26" : "Stripe University Talent"}
        </Badge>
      </div>

      {/* Right: Search, Notifications, Theme, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Input / Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-3 h-9 px-3.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-xs text-muted-foreground transition-colors w-60 lg:w-72 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Search internships, skills, peers...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-card border border-border rounded text-muted-foreground">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
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
            {unreadNotificationsCount > 0 && (
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
                    <h4 className="font-bold text-sm text-foreground">Notifications</h4>
                    {unreadNotificationsCount > 0 && (
                      <Badge variant="rose" size="sm">
                        {unreadNotificationsCount} new
                      </Badge>
                    )}
                  </div>
                  <Link
                    href="/dashboard/notifications"
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
                        markNotificationAsRead(notif.id);
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
        <Link href="/dashboard/profile" className="flex items-center">
          <Avatar
            src={user?.avatar}
            name={user?.name || "Student"}
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
                placeholder="Type to search internships, skills, applications, communities..."
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
                  <span>Track Application Statuses (5 Active)</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Kanban / List</span>
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
