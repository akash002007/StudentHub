"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { CommandSkillSidebar } from "@/components/shared/CommandSkillSidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { QuickActionsFab } from "@/components/dashboard/QuickActionsFab";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

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
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    isMobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer,
  } = useSidebar();

  const isCommunities = pathname === "/dashboard/communities";

  return (
    <div
      data-sidebar={isSidebarCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "min-h-screen bg-background text-foreground antialiased flex flex-col lg:grid transition-[grid-template-columns] duration-200 ease-in-out",
        isSidebarCollapsed
          ? "lg:grid-cols-[72px_minmax(0,1fr)]"
          : "lg:grid-cols-[280px_minmax(0,1fr)]"
      )}
    >
      {/* Desktop Sticky Sidebar & Mobile Navigation Drawer */}
      <CommandSkillSidebar
        role={role}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={closeMobileDrawer}
      />

      {/* Main Workspace Area (No overflow-x-clip to preserve position: sticky) */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 relative">
        {/* Global Dashboard Atmospheric Background Layer */}
        <AtmosphericBackground
          variant="dashboard"
          showPattern={true}
          showNetwork={true}
          className="absolute inset-0 h-full -z-10"
        />

        {/* Topbar Navigation (Sticky inside main column, omitted on Communities page for top-0 Communities header) */}
        {!isCommunities && (
          <TopHeader
            onOpenMobileDrawer={openMobileDrawer}
            title={title}
            subtitle={subtitle}
          />
        )}

        {/* Page Content Container */}
        <main
          className={cn(
            "flex-1 min-w-0",
            isCommunities
              ? "w-full"
              : "p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6",
            contentClassName
          )}
        >
          {!isCommunities && banner}
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

