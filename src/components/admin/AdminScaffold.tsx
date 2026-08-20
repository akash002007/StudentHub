"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminHeader, AdminSidebar } from "@/components/admin/AdminLayoutShell";
import { adminNotifications } from "@/data/mock-admin-data";

const pageMeta: Array<{ match: (path: string) => boolean; title: string; subtitle: string }> = [
  {
    match: (path) => path === "/admin",
    title: "Overview",
    subtitle: "Monitor verification operations and platform trust health in real time.",
  },
  {
    match: (path) => path.startsWith("/admin/verification"),
    title: "Student Verification",
    subtitle: "Review and verify student accounts before granting platform access.",
  },
  {
    match: (path) => path.startsWith("/admin/students"),
    title: "Students",
    subtitle: "Search and review all student accounts with verification visibility.",
  },
  {
    match: (path) => path.startsWith("/admin/audit-logs"),
    title: "Audit Logs",
    subtitle: "Read-only history of sensitive admin actions and status transitions.",
  },
];

export function AdminScaffold({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
  const meta =
    pageMeta.find((entry) => entry.match(pathname)) ||
    ({ title: "Admin", subtitle: "Internal operations workspace." } as const);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AdminSidebar
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader
          title={meta.title}
          subtitle={meta.subtitle}
          notifications={adminNotifications}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
