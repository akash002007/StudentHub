"use client";

import React from "react";
import { UnifiedMessagesWorkspace } from "@/components/messages/UnifiedMessagesWorkspace";

export default function AdminMessagesPage() {
  return <UnifiedMessagesWorkspace forcedRole="ADMIN" />;
}
