"use client";

import React from "react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { UnifiedMessagesWorkspace } from "@/components/messages/UnifiedMessagesWorkspace";

export default function RecruiterMessagesPage() {
  return (
    <RoleGuard allowedRole="recruiter">
      <UnifiedMessagesWorkspace forcedRole="RECRUITER" />
    </RoleGuard>
  );
}
