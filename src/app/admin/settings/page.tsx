import React from "react";
import { Card } from "@/components/ui/Card";

export default function AdminSettingsPage() {
  return (
    <Card className="p-5 border-border/80 bg-card space-y-2">
      <h2 className="text-base font-bold text-foreground">Admin Settings</h2>
      <p className="text-sm text-muted-foreground">
        Configure verification policies, risk thresholds, reviewer assignment rules, and notification routing.
      </p>
      <p className="text-xs text-muted-foreground">
        Security note: never expose tokens or credentials in client-side logs.
      </p>
    </Card>
  );
}
