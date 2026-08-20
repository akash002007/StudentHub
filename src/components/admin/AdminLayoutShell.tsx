"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  Search,
  UserCircle2,
  Activity,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { StudentHubSidebar } from "@/components/shared/StudentHubSidebar";
import { useAuth } from "@/context/AuthContext";
import { AdminNotificationItem } from "@/types";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}: {
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}) {
  return (
    <StudentHubSidebar
      role="admin"
      isMobileDrawerOpen={isMobileDrawerOpen}
      onCloseMobileDrawer={onCloseMobileDrawer}
    />
  );
}

export function AdminHeader({
  title,
  subtitle,
  notifications,
  onOpenMobileMenu,
}: {
  title: string;
  subtitle?: string;
  notifications: AdminNotificationItem[];
  onOpenMobileMenu?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border/80 bg-card/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="min-w-0 flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground truncate">{title}</h1>
          {subtitle ? <p className="text-xs text-muted-foreground truncate">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 h-9 w-80 px-3 rounded-xl border border-border bg-muted/40">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student, email, college, student ID..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Global Theme Toggle in Admin Topbar as well */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border/70"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" /> : null}
          </button>

          {isNotifOpen ? (
            <div className="absolute right-0 mt-2 w-96 max-w-[92vw] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-border/70 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Notification Center</h4>
                {unreadCount > 0 ? <Badge variant="rose" size="sm">{unreadCount} unread</Badge> : null}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border/70">
                {notifications.length ? (
                  notifications.map((item) => (
                    <div key={item.id} className={cn("p-3", item.isRead ? "" : "bg-blue-500/5")}>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                      <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {item.timestamp}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-xs text-muted-foreground">No notifications right now.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border bg-muted/30">
          <Avatar src={user?.avatar} name={user?.name || "Admin"} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-muted-foreground">Trust & Safety Admin</p>
          </div>
          <UserCircle2 className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
