import React from "react";
import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { BadgeProps } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VerificationQueueStatus, VerificationRiskLevel } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: VerificationQueueStatus }) {
  const statusConfig: Record<VerificationQueueStatus, { variant: BadgeProps["variant"]; label: string }> = {
    Pending: { variant: "amber", label: "Pending" },
    "Under Review": { variant: "blue", label: "Under Review" },
    Approved: { variant: "emerald", label: "Approved" },
    Rejected: { variant: "rose", label: "Rejected" },
    "Needs Information": { variant: "purple", label: "Needs Information" },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size="sm" className="font-semibold">
      {config.label}
    </Badge>
  );
}

export function RiskIndicator({ risk }: { risk: VerificationRiskLevel }) {
  if (risk === "Low") {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Low
      </span>
    );
  }

  if (risk === "Medium") {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-semibold">
        <Clock3 className="w-3.5 h-3.5" />
        Medium
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
      <TriangleAlert className="w-3.5 h-3.5" />
      High
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5 border-border/70 bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-foreground">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="p-10 text-center border-dashed border-border/80 bg-card/60">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-muted border border-border/70 flex items-center justify-center text-muted-foreground">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="p-8 border-rose-200/60 dark:border-rose-900/30 bg-rose-50/60 dark:bg-rose-950/10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-rose-700 dark:text-rose-300">{title}</h3>
          <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-300/80">{description}</p>
          {onRetry ? (
            <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted/70", className)} />;
}
