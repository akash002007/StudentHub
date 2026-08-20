"use client";

import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  GraduationCap,
  PlusCircle,
  BarChart3,
  Building2,
  Search,
  UserCheck,
  ArrowLeftRight,
  Bookmark,
  Calendar,
  Settings,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, switchRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved collapse state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("studenthub_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("studenthub_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };
  const {
    unreadNotificationsCount,
    applications,
    conversations,
    recruiterInternships,
    recruiterApplicants,
    recruiterConversations,
    unreadRecruiterNotificationsCount,
    recruiterStudents,
  } = useData();

  // Student metrics
  const unreadMessagesCount = conversations.filter((c) => c.lastMessage.isUnread).length;
  const activeApplicationsCount = applications.filter(
    (a) => a.status !== "Rejected" && a.status !== "Selected"
  ).length;

  // Recruiter metrics
  const unreadRecruiterMessagesCount = recruiterConversations.filter(
    (c) => c.lastMessage.isUnread
  ).length;
  const pendingApplicantsCount = recruiterApplicants.filter(
    (a) => a.status === "Applied" || a.status === "Under Review"
  ).length;
  const activeRecruiterListingsCount = recruiterInternships.filter(
    (i) => i.status === "Active"
  ).length;
  const shortlistedStudentsCount = recruiterStudents.filter((s) => s.isShortlisted).length;

  const studentNavItems = [
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

  const recruiterNavItems = [
    {
      label: "Dashboard",
      href: "/dashboard/recruiter",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Talent Discovery",
      href: "/dashboard/recruiter/students",
      icon: Search,
      badge: shortlistedStudentsCount > 0 ? `${shortlistedStudentsCount} Saved` : null,
      badgeVariant: "lavender" as const,
    },
    {
      label: "Internships",
      href: "/dashboard/recruiter/internships",
      icon: Briefcase,
      badge: activeRecruiterListingsCount > 0 ? `${activeRecruiterListingsCount} Active` : null,
      badgeVariant: "blue" as const,
    },
    {
      label: "Post Internship",
      href: "/dashboard/recruiter/post-internship",
      icon: PlusCircle,
      badge: "New",
      badgeVariant: "purple" as const,
    },
    {
      label: "Applications",
      href: "/dashboard/recruiter/applications",
      icon: GitPullRequest,
      badge: pendingApplicantsCount > 0 ? `${pendingApplicantsCount} Pending` : null,
      badgeVariant: "emerald" as const,
    },
    {
      label: "Shortlisted",
      href: "/dashboard/recruiter/shortlisted",
      icon: Bookmark,
      badge: shortlistedStudentsCount > 0 ? `${shortlistedStudentsCount}` : null,
      badgeVariant: "lavender" as const,
    },
    {
      label: "Interviews",
      href: "/dashboard/recruiter/interviews",
      icon: Calendar,
      badge: null,
    },
    {
      label: "Messages",
      href: "/dashboard/recruiter/messages",
      icon: Send,
      badge: unreadRecruiterMessagesCount > 0 ? unreadRecruiterMessagesCount : null,
      badgeVariant: "emerald" as const,
    },
    {
      label: "Notifications",
      href: "/dashboard/recruiter/notifications",
      icon: Bell,
      badge: unreadRecruiterNotificationsCount > 0 ? unreadRecruiterNotificationsCount : null,
      badgeVariant: "rose" as const,
    },
    {
      label: "Company Profile",
      href: "/dashboard/recruiter/company",
      icon: Building2,
      badge: null,
    },
    {
      label: "Recruiter Profile",
      href: "/dashboard/recruiter/profile",
      icon: User,
      badge: null,
    },
    {
      label: "Analytics",
      href: "/dashboard/recruiter/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      label: "Settings",
      href: "/dashboard/recruiter/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const navItems = role === "recruiter" ? recruiterNavItems : studentNavItems;
  const brandHref = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleRoleSwitch = () => {
    const nextRole = role === "student" ? "recruiter" : "student";
    switchRole(nextRole);
    if (nextRole === "recruiter") {
      router.push("/dashboard/recruiter");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col justify-between border-r border-border bg-card/60 backdrop-blur-xl h-screen sticky top-0 shrink-0 select-none overflow-y-auto transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20 p-2.5 items-center" : "w-64 xl:w-72 p-4"
      )}
    >
      <div className={cn("space-y-5", isCollapsed ? "w-full" : "")}>
        {/* Brand Header */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2 pt-1 gap-2">
            <Link href={brandHref} className="flex items-center gap-2.5 group overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-bold text-base tracking-tight text-foreground truncate">
                  StudentHub
                </span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 truncate">
                  {role === "recruiter" ? (
                    <>
                      <Shield className="w-3 h-3 text-blue-500 shrink-0" /> Recruiter Suite
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3 text-purple-500 shrink-0" /> Student Workspace
                    </>
                  )}
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-transparent hover:border-border/60 shrink-0 cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-1 w-full">
            <Link href={brandHref} className="group" title="StudentHub">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-transparent hover:border-border/60 cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className={cn("space-y-1", isCollapsed ? "w-full" : "")}>
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : item.href === "/dashboard/recruiter"
                ? pathname === "/dashboard/recruiter"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            if (isCollapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label + (item.badge ? ` (${item.badge})` : "")}
                  aria-label={item.label}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-sm font-medium transition-all duration-150 group relative",
                    isActive
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-card" />
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <Badge variant={item.badgeVariant || "secondary"} size="sm" className="shrink-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout Area */}
      {!isCollapsed ? (
        <div className="pt-3 border-t border-border/60 space-y-2.5">
          {/* User Card */}
          <Link
            href={role === "recruiter" ? "/dashboard/recruiter/company" : "/dashboard/profile"}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar
                src={user?.avatar}
                name={user?.name || (role === "recruiter" ? "Sarah Chen" : "Alex Rivera")}
                size="md"
                isOnline={true}
              />
              <div className="overflow-hidden text-left">
                <div className="text-xs font-bold text-foreground truncate group-hover:text-purple-600 transition-colors">
                  {user?.name || (role === "recruiter" ? "Sarah Chen" : "Alex Rivera")}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {role === "recruiter" ? "Stripe University Talent" : "Stanford CS '26"}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>

          {/* Quick Role Switch & Logout */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRoleSwitch}
              className="flex-1 py-1.5 px-2 rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-center border border-border/50 cursor-pointer"
              title="Switch demo preview perspective"
            >
              Switch to {role === "student" ? "Recruiter" : "Student"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-border/60 flex flex-col items-center gap-2.5 w-full">
          {/* Compact User Avatar Link */}
          <Link
            href={role === "recruiter" ? "/dashboard/recruiter/company" : "/dashboard/profile"}
            className="flex items-center justify-center p-1 rounded-xl hover:bg-muted transition-colors group"
            title={user?.name || (role === "recruiter" ? "Sarah Chen (Company Profile)" : "Alex Rivera (Student Profile)")}
            aria-label="Profile"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name || (role === "recruiter" ? "Sarah Chen" : "Alex Rivera")}
              size="sm"
              isOnline={true}
            />
          </Link>

          {/* Compact Role Switch & Logout Buttons */}
          <button
            type="button"
            onClick={handleRoleSwitch}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-purple-600 hover:bg-purple-500/10 transition-colors border border-border/50 cursor-pointer"
            title={`Switch to ${role === "student" ? "Recruiter" : "Student"} perspective`}
            aria-label={`Switch to ${role === "student" ? "Recruiter" : "Student"}`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
