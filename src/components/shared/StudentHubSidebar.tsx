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
  Shield,
  GraduationCap,
  PlusCircle,
  BarChart3,
  Building2,
  Search,
  Bookmark,
  Calendar,
  Settings,
  Flag,
  FileText,
  Users,
  Sun,
  Moon,
  Laptop,
  ArrowLeftRight,
  Dna,
  UserCheck,
  Layers,
  Award,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

export interface StudentHubSidebarProps {
  role?: UserRole;
  className?: string;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeVariant?: "purple" | "emerald" | "blue" | "lavender" | "rose";
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export function StudentHubSidebar({
  role: overrideRole,
  className,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}: StudentHubSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role: authRole, logout, switchRole } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const rawRole = (overrideRole || authRole || "STUDENT").toUpperCase();
  const activeRole: UserRole = (rawRole === "ADMIN" ? "PLATFORM_ADMIN" : rawRole) as UserRole;
  
  // Map the 7 IAM roles to the 3 visual Workspaces
  const isStudentWorkspace = activeRole === "STUDENT";
  const isRecruiterWorkspace = ["RECRUITER", "COMPANY_ADMIN"].includes(activeRole);
  const isAdminWorkspace = ["ADMIN", "PLATFORM_ADMIN", "SUPER_ADMIN", "VERIFICATION_OFFICER", "COLLEGE_ADMIN"].includes(activeRole);

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved collapse state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("studenthub_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage error
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("studenthub_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage error
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

  // Role Navigation Configurations with Groups
  const studentNavGroups: NavGroup[] = [
    {
      groupLabel: "RECRUITMENT PORTAL",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        {
          label: "Recruitment Drives",
          href: "/dashboard/drives",
          icon: Briefcase,
          badge: "Open",
          badgeVariant: "purple",
        },
        {
          label: "My Applications",
          href: "/dashboard/applications",
          icon: GitPullRequest,
          badge: activeApplicationsCount > 0 ? `${activeApplicationsCount} Active` : null,
          badgeVariant: "blue",
        },
        {
          label: "Assessments",
          href: "/dashboard/assessments",
          icon: FileText,
        },
        {
          label: "Interviews",
          href: "/dashboard/interviews",
          icon: Calendar,
        },
        {
          label: "Results & Merit",
          href: "/dashboard/results",
          icon: Award,
        },
        {
          label: "Internships",
          href: "/dashboard/internships",
          icon: Layers,
        },
      ],
    },
    {
      groupLabel: "PROFILE & COMMUNITY",
      items: [
        {
          label: "Career DNA",
          href: "/dashboard/career-dna",
          icon: Dna,
        },
        {
          label: "Messages",
          href: "/dashboard/messages",
          icon: Send,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
          badgeVariant: "emerald",
        },
        { label: "Communities", href: "/dashboard/communities", icon: Users2 },
        {
          label: "Profile",
          href: "/dashboard/profile",
          icon: User,
          badge: "85%",
          badgeVariant: "lavender",
        },
      ],
    },
    {
      groupLabel: "SYSTEM",
      items: [
        {
          label: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
          badgeVariant: "rose",
        },
        { label: "Connected Accounts", href: "/dashboard/connected-accounts", icon: Link2 },
      ],
    },
  ];

  const recruiterNavGroups: NavGroup[] = [
    {
      groupLabel: "RECRUITMENT WORKFLOW",
      items: [
        { label: "Overview", href: "/dashboard/recruiter", icon: LayoutDashboard },
        {
          label: "Recruitment Drives",
          href: "/dashboard/recruiter/drives",
          icon: Briefcase,
          badge: activeRecruiterListingsCount > 0 ? `${activeRecruiterListingsCount} Active` : null,
          badgeVariant: "blue",
        },
        {
          label: "Applications",
          href: "/dashboard/recruiter/applications",
          icon: GitPullRequest,
          badge: pendingApplicantsCount > 0 ? `${pendingApplicantsCount}` : null,
          badgeVariant: "emerald",
        },
        {
          label: "Screening & Eligibility",
          href: "/dashboard/recruiter/screening",
          icon: UserCheck,
        },
        {
          label: "Selection Pipeline",
          href: "/dashboard/recruiter/selection",
          icon: Layers,
        },
        {
          label: "Interviews",
          href: "/dashboard/recruiter/interviews",
          icon: Calendar,
        },
        {
          label: "Results & Merit",
          href: "/dashboard/recruiter/results",
          icon: Award,
          badge: "Published",
          badgeVariant: "purple",
        },
      ],
    },
    {
      groupLabel: "TALENT & SOURCING",
      items: [
        {
          label: "Talent Discovery",
          href: "/dashboard/recruiter/students",
          icon: Search,
          badge: shortlistedStudentsCount > 0 ? `${shortlistedStudentsCount} Saved` : null,
          badgeVariant: "lavender",
        },
        {
          label: "Internships",
          href: "/dashboard/recruiter/internships",
          icon: Briefcase,
          badge: activeRecruiterListingsCount > 0 ? `${activeRecruiterListingsCount} Active` : null,
          badgeVariant: "blue",
        },
        ...( ["RECRUITER", "COMPANY_ADMIN"].includes(activeRole) ? [{
          label: "Post Internship",
          href: "/dashboard/recruiter/post-internship",
          icon: PlusCircle,
          badge: "New",
          badgeVariant: "purple" as const,
        }] : []),
        {
          label: "Applications",
          href: "/dashboard/recruiter/applications",
          icon: GitPullRequest,
          badge: pendingApplicantsCount > 0 ? `${pendingApplicantsCount} Pending` : null,
          badgeVariant: "emerald",
        },
        {
          label: "Shortlisted",
          href: "/dashboard/recruiter/shortlisted",
          icon: Bookmark,
        },
        {
          label: "Messages",
          href: "/dashboard/recruiter/messages",
          icon: Send,
          badge: unreadRecruiterMessagesCount > 0 ? unreadRecruiterMessagesCount : null,
          badgeVariant: "emerald",
        },
      ],
    },
    {
      groupLabel: "GOVERNANCE & SYSTEM",
      items: [
        { label: "Analytics", href: "/dashboard/recruiter/analytics", icon: BarChart3 },
        { label: "Audit Trail", href: "/dashboard/recruiter/audit-logs", icon: FileText },
        { label: "Company Profile", href: "/dashboard/recruiter/company", icon: Building2 },
        {
          label: "Notifications",
          href: "/dashboard/recruiter/notifications",
          icon: Bell,
          badge: unreadRecruiterNotificationsCount > 0 ? unreadRecruiterNotificationsCount : null,
          badgeVariant: "rose",
        },
        { label: "Settings", href: "/dashboard/recruiter/settings", icon: Settings },
      ],
    },
  ];

  const adminNavGroups: NavGroup[] = [
    {
      groupLabel: "OPERATIONS & CONTROL",
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "User Management", href: "/admin/users", icon: Users },
        { label: "Companies", href: "/admin/companies", icon: Building2 },
        { label: "Recruiters", href: "/admin/recruiters", icon: Briefcase },
        { label: "Students", href: "/admin/students", icon: GraduationCap },
      ],
    },
    {
      groupLabel: "RECRUITMENT & TRUST",
      items: [
        {
          label: "Verification Queue",
          href: "/admin/verification",
          icon: Shield,
          badge: "Live",
          badgeVariant: "purple",
        },
        { label: "Recruitment Drives", href: "/admin/internships", icon: Layers },
        { label: "Applications", href: "/admin/applications", icon: GitPullRequest },
      ],
    },
    {
      groupLabel: "COMPLIANCE & SYSTEM",
      items: [
        { label: "Moderation Reports", href: "/admin/reports", icon: Flag },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
        { label: "Platform Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const navGroups =
    isAdminWorkspace
      ? adminNavGroups
      : isRecruiterWorkspace
      ? recruiterNavGroups
      : studentNavGroups;

  const brandHref =
    isAdminWorkspace
      ? "/admin"
      : isRecruiterWorkspace
      ? "/dashboard/recruiter"
      : "/dashboard";

  const brandRoleSubtitle =
    isAdminWorkspace
      ? "Admin Console"
      : isRecruiterWorkspace
      ? "Recruiter Workspace"
      : "Student Workspace";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleRoleSwitch = () => {
    let nextRole: UserRole = "STUDENT";
    if (activeRole === "STUDENT") nextRole = "RECRUITER";
    else if (isRecruiterWorkspace) nextRole = "PLATFORM_ADMIN";
    else nextRole = "STUDENT";

    switchRole(nextRole);
    if (nextRole === "PLATFORM_ADMIN") router.push("/admin");
    else if (nextRole === "RECRUITER") router.push("/dashboard/recruiter");
    else router.push("/dashboard");
  };

  const isLinkActive = (href: string) => {
    if (href === "/dashboard" || href === "/dashboard/recruiter" || href === "/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* Top Section: Brand Header & Collapse Toggle */}
      <div>
        <div
          className={cn(
            "h-16 px-4 flex items-center border-b border-border/80 transition-all",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link href={brandHref} className="flex items-center gap-2.5 min-w-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-foreground leading-none">
                  StudentHub
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground tracking-tight mt-0.5 truncate">
                  {brandRoleSubtitle}
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors hidden lg:flex"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger Button */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center pt-2">
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Middle Section: Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && group.groupLabel && (
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70 px-3 pt-1 pb-0.5">
                {group.groupLabel}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (onCloseMobileDrawer) onCloseMobileDrawer();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 h-10 rounded-xl text-xs font-semibold transition-all group relative",
                      active
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        active ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge !== null && (
                          <Badge
                            variant={item.badgeVariant || "purple"}
                            size="sm"
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-4 font-bold shrink-0",
                              active && "bg-background text-foreground"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}

                    {/* Collapsed Badge Dot Indicator */}
                    {isCollapsed && item.badge !== undefined && item.badge !== null && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Theme Switcher & Compact Profile Card */}
      <div className="p-3 border-t border-border/80 bg-card/50 space-y-2.5">
        {/* Unified Appearance / Theme Switcher */}
        {!isCollapsed ? (
          <div className="p-2 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              {resolvedTheme === "dark" ? (
                <Moon className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              Appearance
            </span>

            <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/60">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1 rounded-md text-[10px] font-semibold transition-colors",
                  theme === "light"
                    ? "bg-foreground text-background shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Light mode"
                aria-label="Light mode"
              >
                <Sun className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1 rounded-md text-[10px] font-semibold transition-colors",
                  theme === "dark"
                    ? "bg-foreground text-background shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <Moon className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1 rounded-md text-[10px] font-semibold transition-colors",
                  theme === "system"
                    ? "bg-foreground text-background shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="System theme"
                aria-label="System theme"
              >
                <Laptop className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600" />
              )}
            </button>
          </div>
        )}

        {/* Compact Profile Card */}
        <div className="p-2 rounded-xl bg-muted/40 border border-border/60">
          <div
            className={cn(
              "flex items-center gap-2.5",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar src={user?.avatar} name={user?.name || "User"} size="sm" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-xs text-foreground truncate">
                  {user?.name || "StudentHub User"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate font-medium">
                  {isAdminWorkspace
                    ? "Trust & Safety Admin"
                    : isRecruiterWorkspace
                    ? "University Recruiter"
                    : "Verified Student"}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={handleRoleSwitch}
                  className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  title="Switch Workspace Demo Role"
                >
                  <ArrowLeftRight className="w-3 h-3 text-purple-500" />
                  <span>Switch Role</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors"
                title="Sign out of StudentHub"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={cn(
          "hidden lg:block h-screen h-[100dvh] sticky top-0 border-r border-border/80 bg-card z-40 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileDrawer}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-card border-r border-border shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// Re-export as Sidebar for complete backward compatibility with all imports
export const Sidebar = StudentHubSidebar;
