"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getTimeAwareGreeting, cn } from "@/lib/utils";

export interface WelcomeCardProps {
  portalBadge?: string;
  portalBadgeIcon?: React.ReactNode;
  userName?: string;
  title?: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  rightWidget?: React.ReactNode;
  className?: string;
}

export function WelcomeCard({
  portalBadge = "Candidate Recruitment Hub",
  portalBadgeIcon = <Sparkles className="w-3.5 h-3.5 text-blue-500" />,
  userName,
  title,
  description,
  primaryAction,
  secondaryAction,
  rightWidget,
  className,
}: WelcomeCardProps) {
  const [greeting, setGreeting] = useState("Hello");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setGreeting(getTimeAwareGreeting(now));
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  const displayTitle = title || `${greeting}, ${userName ? userName.split(" ")[0] : "there"}!`;

  return (
    <div
      className={cn(
        "relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-card via-card to-blue-950/25 border border-border/80 shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left / Main Content */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="gradient" size="sm" className="font-semibold text-xs py-0.5">
              {portalBadgeIcon}
              <span className="ml-1.5">{portalBadge}</span>
            </Badge>
            {currentDate && (
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <span>•</span>
                <span>{currentDate}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
            {displayTitle}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            {description}
          </p>

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {primaryAction && (
                <Link href={primaryAction.href}>
                  <Button variant="gradient" size="sm" rightIcon={primaryAction.icon || <ArrowRight className="w-3.5 h-3.5" />}>
                    {primaryAction.label}
                  </Button>
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href}>
                  <Button variant="outline" size="sm" rightIcon={secondaryAction.icon}>
                    {secondaryAction.label}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Widget Container */}
        {rightWidget ? (
          <div className="shrink-0 lg:max-w-xs w-full">
            {rightWidget}
          </div>
        ) : (
          /* Default Profile Strength Widget */
          <div className="shrink-0 w-full lg:w-72 p-4 rounded-2xl bg-muted/40 border border-border/80 backdrop-blur-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Profile Strength</span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">85%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-[85%]" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Academic Records
              </span>
              <Link href="/dashboard/profile" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center">
                View <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
