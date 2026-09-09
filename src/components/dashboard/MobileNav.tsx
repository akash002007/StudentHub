"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Send,
  GitPullRequest,
  User,
  MoreHorizontal,
  Users2,
  Bell,
  Link2,
  LogOut,
  X,
  Sparkles,
  Search,
  PlusCircle,
  BarChart3,
  Building2,
  Calendar,
  Bookmark,
  Settings,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, role } = useAuth();
  const normRole = (role || "STUDENT").toUpperCase();
  const isRecruiter = ["RECRUITER", "COMPANY_ADMIN"].includes(normRole);

  const { theme, setTheme } = useTheme();
  const {
    unreadNotificationsCount,
    conversations,
    recruiterConversations,
    unreadRecruiterNotificationsCount,
    recruiterApplicants,
  } = useData();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const unreadMessagesCount = conversations.filter((c) => c.lastMessage.isUnread).length;
  const unreadRecruiterMessages = recruiterConversations.filter(
    (c) => c.lastMessage.isUnread
  ).length;
  const pendingApplicantsCount = recruiterApplicants.filter(
    (a) => a.status === "Applied" || a.status === "Under Review"
  ).length;

  const studentPrimaryTabs = [
    {
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Internships",
      href: "/dashboard/internships",
      icon: Briefcase,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: Send,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      label: "Applications",
      href: "/dashboard/applications",
      icon: GitPullRequest,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  const recruiterPrimaryTabs = [
    {
      label: "Dashboard",
      href: "/dashboard/recruiter",
      icon: LayoutDashboard,
    },
    {
      label: "Internships",
      href: "/dashboard/recruiter/internships",
      icon: Briefcase,
    },
    {
      label: "Applications",
      href: "/dashboard/recruiter/applications",
      icon: GitPullRequest,
      badge: pendingApplicantsCount > 0 ? pendingApplicantsCount : undefined,
    },
    {
      label: "Students",
      href: "/dashboard/recruiter/students",
      icon: Search,
    },
    {
      label: "Messages",
      href: "/dashboard/recruiter/messages",
      icon: Send,
      badge: unreadRecruiterMessages > 0 ? unreadRecruiterMessages : undefined,
    },
  ];

  const primaryTabs = isRecruiter ? recruiterPrimaryTabs : studentPrimaryTabs;

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border px-2 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
        {primaryTabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : tab.href === "/dashboard/recruiter"
              ? pathname === "/dashboard/recruiter"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-medium transition-colors flex-1",
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {typeof tab.badge === "number" && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="truncate">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </Link>
          );
        })}

        {/* More Options Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-medium text-muted-foreground hover:text-foreground flex-1"
          aria-label="More Options"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-card border-t border-border rounded-t-3xl p-6 shadow-2xl space-y-4 animate-slide-up z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-foreground">
                  {isRecruiter ? "Recruiter Navigation" : "More Options"}
                </span>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isRecruiter ? (
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <Link
                  href="/dashboard/recruiter/post-internship"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 flex items-center gap-2.5 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Internship</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/shortlisted"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
                >
                  <Bookmark className="w-4 h-4 text-blue-500" />
                  <span>Shortlisted</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/interviews"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
                >
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Interviews</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/analytics"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
                >
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/company"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
                >
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span>Company Profile</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/profile"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
                >
                  <User className="w-4 h-4 text-blue-500" />
                  <span>Recruiter Profile</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/notifications"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-between text-foreground border border-border/50"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-rose-500" />
                    <span>Notifications</span>
                  </div>
                  {unreadRecruiterNotificationsCount > 0 && (
                    <Badge variant="rose" size="sm">
                      {unreadRecruiterNotificationsCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  href="/dashboard/recruiter/settings"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
                <div className="p-3 rounded-xl bg-muted/60 flex items-center justify-between text-foreground border border-border/50 col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">Appearance</span>
                  <ThemeToggle showLabels size="sm" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <Link
                  href="/dashboard/communities"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
                >
                  <Users2 className="w-4 h-4 text-blue-500" />
                  <span>Communities</span>
                </Link>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-between text-foreground border border-border/50"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-rose-500" />
                    <span>Notifications</span>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <Badge variant="rose" size="sm">
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  href="/dashboard/connected-accounts"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50 col-span-2 sm:col-span-1"
                >
                  <Link2 className="w-4 h-4 text-blue-500" />
                  <span>Integrations</span>
                </Link>
                <div className="p-3 rounded-xl bg-muted/60 flex items-center justify-between text-foreground border border-border/50 col-span-2 sm:col-span-1">
                  <span className="text-xs font-semibold text-muted-foreground">Appearance</span>
                  <ThemeToggle showLabels size="sm" />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  logout();
                  setIsMoreOpen(false);
                  router.push("/login");
                }}
                className="w-full p-3 rounded-xl bg-primary/10 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-500/20 hover:bg-primary/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of StudentHub</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
