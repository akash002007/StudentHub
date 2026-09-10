"use client";

import React from "react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="COLLEGE_ADMIN" redirectTo="/login">
      <DashboardShell role="COLLEGE_ADMIN" showFab={false}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
