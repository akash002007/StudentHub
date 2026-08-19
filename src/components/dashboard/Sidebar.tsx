"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  Send,
  Users2,
  GitPullRequest,
  User,
  Bell,
  Link2,
  LogOut,
  ChevronRight,
  Shield,
  GraduationCap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, switchRole } = useAuth();
  const { unreadNotificationsCount, applications, conversations } = useData();

  const unreadMessagesCount = conversations.filter((c) => c.lastMessage.isUnread).length;
  const activeApplicationsCount = applications.filter(
    (a) => a.status !== "Rejected" && a.status !== "Selected"
  ).length;

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Internships",
      href: "/dashboard/internships",
      icon: Briefcase,
      badge: "6 New",
      badgeVariant: "purple" as const,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: Send,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      badgeVariant: "emerald" as const,
    },
    {
      label: "Communities",
      href: "/dashboard/communities",
      icon: Users2,
      badge: null,
    },
    {
      label: "Applications",
      href: "/dashboard/applications",
      icon: GitPullRequest,
      badge: activeApplicationsCount > 0 ? `${activeApplicationsCount} Active` : null,
      badgeVariant: "blue" as const,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: User,
      badge: "85%",
      badgeVariant: "lavender" as const,
    },
    {
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      badgeVariant: "rose" as const,
    },
    {
      label: "Connected Accounts",
      href: "/dashboard/connected-accounts",
      icon: Link2,
      badge: null,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col justify-between border-r border-border bg-card/60 backdrop-blur-xl p-4 h-screen sticky top-0 shrink-0 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground">
                StudentHub
              </span>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                {role === "recruiter" ? (
                  <>
                    <Shield className="w-3 h-3 text-blue-500" /> Recruiter Suite
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3 h-3 text-purple-500" /> Student Workspace
                  </>
                )}
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <Badge variant={item.badgeVariant || "secondary"} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout Area */}
      <div className="pt-4 border-t border-border/60 space-y-3">
        {/* User Card */}
        <Link
          href="/dashboard/profile"
          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar
              src={user?.avatar}
              name={user?.name || "Student"}
              size="md"
              isOnline={true}
            />
            <div className="overflow-hidden text-left">
              <div className="text-xs font-bold text-foreground truncate group-hover:text-purple-600 transition-colors">
                {user?.name || "Alex Rivera"}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {role === "recruiter" ? "Stripe Recruiter" : "Stanford '26"}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Quick Role Switch & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchRole(role === "student" ? "recruiter" : "student")}
            className="flex-1 py-1.5 px-2 rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-center border border-border/50"
            title="Switch demo preview perspective"
          >
            Switch to {role === "student" ? "Recruiter" : "Student"}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
