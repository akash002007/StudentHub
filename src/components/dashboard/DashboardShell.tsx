"use client";

import React, { useState } from "react";
import { StudentHubSidebar } from "@/components/shared/StudentHubSidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { QuickActionsFab } from "@/components/dashboard/QuickActionsFab";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

export interface DashboardShellProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  subtitle?: string;
  banner?: React.ReactNode;
  contentClassName?: string;
  showMobileNav?: boolean;
  showFab?: boolean;
}

export function DashboardShell({
  children,
  role,
  title,
  subtitle,
  banner,
  contentClassName,
  showMobileNav = true,
  showFab = true,
}: DashboardShellProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
      {/* Desktop Sticky Sidebar & Mobile Navigation Drawer */}
      <StudentHubSidebar
        role={role}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Topbar Navigation (Sticky inside main column, never overlapping sidebar) */}
        <TopHeader
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        {/* Page Content Container */}
        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6",
            contentClassName
          )}
        >
          {banner}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {showMobileNav && <MobileNav />}

      {/* Global Quick Actions FAB */}
      {showFab && <QuickActionsFab />}
    </div>
  );
}
