"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuestionBankRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/recruiter/assessments?tab=questions");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-medium">
          Redirecting to Question Bank in Assessments Workspace...
        </p>
      </div>
    </div>
  );
}
