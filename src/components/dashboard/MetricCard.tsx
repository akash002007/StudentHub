"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: "blue" | "emerald" | "amber" | "rose" | "purple";
  href?: string;
  isLoading?: boolean;
  className?: string;
  iconVariant?: "blue" | "emerald" | "amber" | "rose" | "purple";
}

const iconVariantStyles = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function MetricCard({
  label,
  value,
  hint,
  icon,
  badge,
  badgeVariant = "blue",
  href,
  isLoading = false,
  className,
  iconVariant = "blue",
}: MetricCardProps) {
  const content = (
    <Card
      className={cn(
        "p-5 rounded-2xl bg-card border border-border/80 hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-xs group",
        href && "cursor-pointer hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider line-clamp-1">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
              iconVariantStyles[iconVariant]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="w-16 h-7 bg-muted animate-pulse rounded-md" />
        ) : (
          <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {value}
          </div>
        )}

        {hint && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {hint}
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-medium">Status</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full font-bold text-[10px]",
              badgeVariant === "emerald" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              badgeVariant === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              badgeVariant === "rose" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              badgeVariant === "purple" && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
              badgeVariant === "blue" && "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            )}
          >
            {badge}
          </span>
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
