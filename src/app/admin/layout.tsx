"use client";

import React from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <DashboardShell role="admin" showFab={false}>
        {children}
      </DashboardShell>
    </AdminGuard>
  );
}
