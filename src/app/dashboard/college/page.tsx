"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function CollegePlacementDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/college/dashboard");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center animate-pulse">
        <Sparkles className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs text-muted-foreground font-medium">
        Redirecting to College Management Portal...
      </p>
    </div>
  );
}
