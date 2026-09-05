import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { QuickActionsFab } from "@/components/dashboard/QuickActionsFab";
import { OnboardingGuard } from "@/components/dashboard/OnboardingGuard";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <div className="flex min-h-screen bg-background text-foreground antialiased">
        {/* Desktop Sidebar Navigation */}
        <Sidebar />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          {/* Topbar Navigation */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <VerificationBanner />
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Global Quick Actions FAB */}
        <QuickActionsFab />
      </div>
    </OnboardingGuard>
  );
}
