import React from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminScaffold } from "@/components/admin/AdminScaffold";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminScaffold>{children}</AdminScaffold>
    </AdminGuard>
  );
}
