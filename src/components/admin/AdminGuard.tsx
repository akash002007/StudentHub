"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role, isLoaded, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard");
      return;
    }

    setAuthorized(true);
  }, [isLoaded, isAuthenticated, role, router]);

  if (!authorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-pulse">
          <Shield className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Validating admin access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
