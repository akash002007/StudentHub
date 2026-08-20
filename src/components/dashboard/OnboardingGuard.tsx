"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { StudentProfile } from "@/types";
import { Sparkles } from "lucide-react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoaded, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    // Recruiters don't have student onboarding
    if (role === "recruiter") {
      setCanRender(true);
      return;
    }

    // For students: check if onboarding is incomplete
    const student = user as StudentProfile;
    if (
      student.accountStatus === "account_created" ||
      (!student.onboardingCompleted && student.verificationStatus === "not_submitted")
    ) {
      router.replace("/onboarding");
      return;
    }

    setCanRender(true);
  }, [user, role, isLoaded, isAuthenticated, router, pathname]);

  if (!isLoaded || !canRender) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Loading workspace...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
