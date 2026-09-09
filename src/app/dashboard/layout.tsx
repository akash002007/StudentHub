"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OnboardingGuard } from "@/components/dashboard/OnboardingGuard";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTakeAssessmentMode = pathname.includes("/assessments/") && pathname.endsWith("/take");

  // In Secure Exam Mode, render pure full-viewport children with zero StudentHub navigation
  if (isTakeAssessmentMode) {
    return (
      <OnboardingGuard>
        <div className="min-h-screen w-full bg-background text-foreground antialiased overflow-x-hidden">
          {children}
        </div>
      </OnboardingGuard>
    );
  }

  return (
    <OnboardingGuard>
      <DashboardShell banner={<VerificationBanner />}>
        {children}
      </DashboardShell>
    </OnboardingGuard>
  );
}
