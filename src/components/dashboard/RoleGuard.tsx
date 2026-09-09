"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { Sparkles } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRole, redirectTo }: RoleGuardProps) {
  const { role, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const normRole = (role || "STUDENT").toUpperCase();
  const normAllowed = (allowedRole || "STUDENT").toUpperCase();

  const isMatch = () => {
    if (normAllowed === "STUDENT") {
      return normRole === "STUDENT";
    }
    if (normAllowed === "RECRUITER") {
      return ["RECRUITER", "COMPANY_ADMIN"].includes(normRole);
    }
    if (normAllowed === "ADMIN") {
      return ["ADMIN", "PLATFORM_ADMIN", "SUPER_ADMIN", "VERIFICATION_OFFICER", "COLLEGE_ADMIN"].includes(normRole);
    }
    return normRole === normAllowed;
  };

  const isAuthorized = isMatch();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAuthorized) {
      const fallbackRoute =
        ["RECRUITER", "COMPANY_ADMIN"].includes(normRole)
          ? "/dashboard/recruiter"
          : ["ADMIN", "PLATFORM_ADMIN", "SUPER_ADMIN", "VERIFICATION_OFFICER", "COLLEGE_ADMIN"].includes(normRole)
          ? "/admin"
          : "/dashboard";
      const destination = redirectTo || fallbackRoute;
      if (destination !== pathname) {
        router.replace(destination);
      }
    }
  }, [isLoaded, isAuthorized, normRole, redirectTo, router, pathname]);

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Loading workspace...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Verifying workspace permissions...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
