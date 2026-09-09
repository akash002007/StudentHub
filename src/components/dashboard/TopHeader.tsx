"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  X,
  ExternalLink,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { getTimeAwareGreeting, cn } from "@/lib/utils";

export interface TopHeaderProps {
  onOpenMobileDrawer?: () => void;
  title?: string;
  subtitle?: string;
}

export function TopHeader({ onOpenMobileDrawer, title, subtitle }: TopHeaderProps) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const normRole = (role || "STUDENT").toUpperCase();

  const isCollege = normRole === "COLLEGE_ADMIN" || pathname.startsWith("/dashboard/college");
  const isAdmin = !isCollege && (["ADMIN", "PLATFORM_ADMIN", "SUPER_ADMIN", "VERIFICATION_OFFICER"].includes(normRole) || pathname.startsWith("/admin"));
  const isRecruiter = !isCollege && !isAdmin && (["RECRUITER", "COMPANY_ADMIN"].includes(normRole) || pathname.startsWith("/dashboard/recruiter"));

  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    recruiterNotifications,
    unreadRecruiterNotificationsCount,
    markRecruiterNotificationAsRead,
    conversations,
    recruiterConversations,
  } = useData();

  const unreadMessagesTotal = isRecruiter
    ? recruiterConversations.filter((c) => c.lastMessage.isUnread).length
    : conversations.filter((c) => c.lastMessage.isUnread).length;

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

  const activeNotifications = isRecruiter ? recruiterNotifications : notifications;
  const activeUnreadCount = isRecruiter ? unreadRecruiterNotificationsCount : unreadNotificationsCount;
  const recentNotifications = activeNotifications.slice(0, 4);

  const notificationsPageUrl = isCollege
    ? "/dashboard/notifications"
    : isAdmin
    ? "/admin/notifications"
    : isRecruiter
    ? "/dashboard/recruiter/notifications"
    : "/dashboard/notifications";

  const messagesPageUrl = isCollege
    ? "/dashboard/messages"
    : isAdmin
    ? "/admin/messages"
    : isRecruiter
    ? "/dashboard/recruiter/messages"
    : "/dashboard/messages";

  const profilePageUrl = isCollege
    ? "/dashboard/college"
    : isAdmin
    ? "/admin/settings"
    : isRecruiter
    ? "/dashboard/recruiter/company"
    : "/dashboard/profile";

  const searchPlaceholder = isCollege
    ? "Search placement drives, batches, students..."
    : isAdmin
    ? "Search users, audit logs, verification requests..."
    : isRecruiter
    ? "Search candidates, skills, drives, interviews..."
    : "Search jobs, companies, skills, drives...";

  const statusBadge = isCollege ? (
    <Badge variant="emerald" size="sm" className="hidden md:inline-flex font-semibold text-[11px]">
      Placement Season &apos;26
    </Badge>
  ) : isAdmin ? (
    <Badge variant="purple" size="sm" className="hidden md:inline-flex font-semibold text-[11px]">
      Command Center
    </Badge>
  ) : isRecruiter ? (
    <Badge variant="gradient" size="sm" className="hidden md:inline-flex font-semibold text-[11px]">
      Active Hiring
    </Badge>
  ) : (
    <Badge variant="lavender" size="sm" className="hidden md:inline-flex font-semibold text-[11px]">
      Open to Summer &apos;26
    </Badge>
  );

  return (
    <>
      <header className="h-16 border-b border-border/80 bg-card/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 w-full">
        {/* Left: Mobile Menu Trigger + Global Search Trigger */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Search Bar Input / Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center relative w-48 sm:w-64 md:w-80 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
            aria-label="Global search (Press ⌘K to open)"
          >
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground z-10 group-hover:text-foreground transition-colors" />
            <div className="w-full pl-9 pr-14 py-1.5 bg-muted/50 hover:bg-muted/80 border border-border/70 text-foreground rounded-xl text-xs h-9 flex items-center transition-all shadow-2xs">
              <span className="truncate text-muted-foreground group-hover:text-foreground/80">
                {searchPlaceholder}
              </span>
            </div>
            <kbd className="absolute right-2 px-1.5 py-0.5 rounded bg-card border border-border/80 text-[10px] font-mono text-muted-foreground shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Center / Right: Greeting, Status, Messages, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          {/* Greeting & Status Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {greeting},{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {user?.name ? user.name.split(" ")[0] : "there"}
              </span>
            </span>
            {statusBadge}
          </div>

          {/* Messages Link */}
          <Link
            href={messagesPageUrl}
            className={cn(
              "relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors border border-transparent hover:border-border/60",
              pathname.includes("/messages") && "bg-muted text-foreground"
            )}
            aria-label="Messages"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesTotal > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card shadow-xs">
                {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
              </span>
            )}
          </Link>

          {/* Notifications Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className={cn(
                "relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors border border-transparent hover:border-border/60 cursor-pointer",
                isNotifOpen && "bg-muted text-foreground"
              )}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card shadow-xs">
                  {activeUnreadCount > 9 ? "9+" : activeUnreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden animate-fade-in">
                  <div className="p-3.5 border-b border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">Notifications</span>
                      {activeUnreadCount > 0 && (
                        <Badge variant="rose" size="sm">
                          {activeUnreadCount} New
                        </Badge>
                      )}
                    </div>
                    <Link
                      href={notificationsPageUrl}
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                    {recentNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No notifications to display.
                      </div>
                    ) : (
                      recentNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-3 text-xs transition-colors hover:bg-muted/40 flex items-start gap-2.5",
                            !notif.isRead && "bg-blue-500/5"
                          )}
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="font-semibold text-foreground text-xs line-clamp-1">{notif.title}</p>
                            <p className="text-muted-foreground text-[11px] line-clamp-2">
                              {(notif as any).description || (notif as any).message}
                            </p>
                            <span className="text-[10px] text-muted-foreground/70">{notif.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Avatar Link */}
          <Link href={profilePageUrl} className="shrink-0 group" title="Account profile">
            <Avatar
              src={user?.avatar}
              name={user?.name || "User"}
              size="sm"
              className="ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all"
            />
          </Link>
        </div>
      </header>

      {/* Global Cmd+K Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in">
            <div className="flex items-center px-4 border-b border-border/80">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 text-xs text-muted-foreground">
              <p className="px-2 py-1 font-semibold uppercase tracking-wider text-[10px]">Quick Navigation</p>
              <div className="mt-1 space-y-1">
                <Link
                  href={isCollege ? "/dashboard/college" : isAdmin ? "/admin" : isRecruiter ? "/dashboard/recruiter" : "/dashboard"}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-foreground transition-colors"
                >
                  <span>Dashboard Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/dashboard/drives"
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-foreground transition-colors"
                >
                  <span>Recruitment &amp; Placement Drives</span>
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
