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
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (role !== allowedRole) {
      const fallbackRoute =
        role === "recruiter" ? "/dashboard/recruiter" : role === "admin" ? "/admin" : "/dashboard";
      const destination =
        redirectTo || fallbackRoute;
      router.replace(destination);
    } else {
      setIsAuthorized(true);
    }
  }, [role, allowedRole, redirectTo, router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center animate-pulse">
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
