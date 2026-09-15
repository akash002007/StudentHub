"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShinyCTA } from "@/components/ui/ShinyCTA";
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
  portalBadgeIcon,
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
        "relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-card via-card to-blue-50/50 dark:to-blue-950/25 border border-blue-500/20 shadow-[0_4px_24px_-4px_rgba(37,99,235,0.06),0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden",
        className
      )}
    >
      {/* Large Soft Blurred Atmospheric Blooms */}
      <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-blue-500/[0.09] via-cyan-400/[0.07] to-transparent rounded-full blur-[100px] pointer-events-none -z-0" />
      <div className="absolute -bottom-10 left-1/4 w-[350px] h-[220px] bg-indigo-500/[0.04] rounded-full blur-[90px] pointer-events-none -z-0" />

      {/* Subtle Abstract Career Intelligence Network Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.25] dark:opacity-[0.18] -z-0"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 800 240"
        fill="none"
      >
        <path
          d="M200,200 C360,80 500,220 700,60"
          stroke="url(#welcomeDnaGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <path
          d="M400,220 C540,140 640,180 780,110"
          stroke="#06b6d4"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        <circle cx="360" cy="120" r="3" fill="#2563eb" fillOpacity="0.5" />
        <circle cx="500" cy="180" r="2.5" fill="#06b6d4" fillOpacity="0.5" />
        <circle cx="700" cy="60" r="3.5" fill="#3b82f6" fillOpacity="0.6" />
        <defs>
          <linearGradient id="welcomeDnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.0" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left / Main Content */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="gradient" size="sm" className="font-semibold text-xs py-0.5">
              {portalBadgeIcon}
              <span className={portalBadgeIcon ? "ml-1.5" : ""}>{portalBadge}</span>
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
                  <ShinyCTA className="text-xs">
                    {primaryAction.label} {primaryAction.icon || <ArrowRight className="w-3.5 h-3.5" />}
                  </ShinyCTA>
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
