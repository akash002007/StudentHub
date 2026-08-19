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
  PlusCircle,
  BarChart3,
  Building2,
  Search,
  UserCheck,
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
      label: "Post Internship",
      href: "/dashboard/recruiter/post-internship",
      icon: PlusCircle,
      badge: "New",
      badgeVariant: "purple" as const,
    },
    {
      label: "Internships",
      href: "/dashboard/recruiter/internships",
      icon: Briefcase,
      badge: activeRecruiterListingsCount > 0 ? `${activeRecruiterListingsCount} Active` : null,
      badgeVariant: "blue" as const,
    },
    {
      label: "Applications",
      href: "/dashboard/recruiter/applications",
      icon: GitPullRequest,
      badge: pendingApplicantsCount > 0 ? `${pendingApplicantsCount} Pending` : null,
      badgeVariant: "emerald" as const,
    },
    {
      label: "Find Students",
      href: "/dashboard/recruiter/students",
      icon: Search,
      badge: shortlistedStudentsCount > 0 ? `${shortlistedStudentsCount} Saved` : null,
      badgeVariant: "lavender" as const,
    },
    {
      label: "Messages",
      href: "/dashboard/recruiter/messages",
      icon: Send,
      badge: unreadRecruiterMessagesCount > 0 ? unreadRecruiterMessagesCount : null,
      badgeVariant: "emerald" as const,
    },
    {
      label: "Analytics",
      href: "/dashboard/recruiter/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      label: "Company Profile",
      href: "/dashboard/recruiter/company",
      icon: Building2,
      badge: null,
    },
    {
      label: "Notifications",
      href: "/dashboard/recruiter/notifications",
      icon: Bell,
      badge: unreadRecruiterNotificationsCount > 0 ? unreadRecruiterNotificationsCount : null,
      badgeVariant: "rose" as const,
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
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col justify-between border-r border-border bg-card/60 backdrop-blur-xl p-4 h-screen sticky top-0 shrink-0 select-none overflow-y-auto">
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href={brandHref} className="flex items-center gap-2.5 group">
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
                : item.href === "/dashboard/recruiter"
                ? pathname === "/dashboard/recruiter"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

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
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Quick Role Switch & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRoleSwitch}
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
