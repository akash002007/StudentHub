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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { unreadNotificationsCount, conversations } = useData();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const unreadMessagesCount = conversations.filter((c) => c.lastMessage.isUnread).length;

  const primaryTabs = [
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

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border px-2 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
        {primaryTabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors flex-1",
                isActive
                  ? "text-purple-600 dark:text-purple-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {typeof tab.badge === "number" && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="truncate">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400" />
              )}
            </Link>
          );
        })}

        {/* More Options Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-muted-foreground hover:text-foreground flex-1"
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
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-foreground">More Options</span>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <Link
                href="/dashboard/communities"
                onClick={() => setIsMoreOpen(false)}
                className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
              >
                <Users2 className="w-4 h-4 text-purple-500" />
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
                className="p-3 rounded-xl bg-muted/60 hover:bg-muted flex items-center gap-2.5 text-foreground border border-border/50"
              >
                <Link2 className="w-4 h-4 text-blue-500" />
                <span>Integrations</span>
              </Link>
              <div className="p-3 rounded-xl bg-muted/60 flex items-center justify-between text-foreground border border-border/50">
                <span className="text-xs">Theme</span>
                <ThemeToggle />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  logout();
                  setIsMoreOpen(false);
                  router.push("/login");
                }}
                className="w-full p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
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
