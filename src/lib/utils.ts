import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApplicationStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a time-aware greeting calculated from local time.
 * Matches prompt specifications:
 * Morning -> Good morning
 * Afternoon -> Good afternoon
 * Evening -> Good evening
 * Night -> Good evening
 */
export function getTimeAwareGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export function getStatusBadgeStyle(status: ApplicationStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case "Applied":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20 dark:border-blue-500/30",
        dot: "bg-blue-500",
      };
    case "Under Review":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20 dark:border-amber-500/30",
        dot: "bg-amber-500",
      };
    case "Shortlisted":
      return {
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/20 dark:border-purple-500/30",
        dot: "bg-purple-500",
      };
    case "Interview":
      return {
        bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
        text: "text-cyan-600 dark:text-cyan-400",
        border: "border-cyan-500/20 dark:border-cyan-500/30",
        dot: "bg-cyan-500",
      };
    case "Selected":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20 dark:border-emerald-500/30",
        dot: "bg-emerald-500",
      };
    case "Rejected":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/20 dark:border-rose-500/30",
        dot: "bg-rose-500",
      };
    default:
      return {
        bg: "bg-zinc-500/10",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-500/20",
        dot: "bg-zinc-500",
      };
  }
}

export function getMatchScoreColor(score: number): {
  badge: string;
  bar: string;
} {
  if (score >= 90) {
    return {
      badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      bar: "bg-emerald-500",
    };
  } else if (score >= 75) {
    return {
      badge: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
      bar: "bg-blue-500",
    };
  } else if (score >= 60) {
    return {
      badge: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
      bar: "bg-purple-500",
    };
  } else {
    return {
      badge: "text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
      bar: "bg-zinc-500",
    };
  }
}

export function getInitials(name: string): string {
  if (!name) return "SH";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Determines whether an email address belongs to a university or college institution.
 * Academic institutions commonly use .edu, .ac.in, .ac.uk, .edu.in, .univ-, .college, etc.
 * Free webmail providers like gmail.com, yahoo.com, outlook.com are non-university emails.
 */
export function isUniversityEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;

  // Known public free email providers are never university emails
  const publicWebmailDomains = [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.in",
    "yahoo.co.uk",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "zoho.com",
    "mail.com",
    "gmx.com",
    "yandex.com",
  ];

  if (publicWebmailDomains.includes(domain)) {
    return false;
  }

  // Academic TLDs and domain conventions
  if (
    domain.endsWith(".edu") ||
    domain.includes(".edu.") ||
    domain.endsWith(".ac.in") ||
    domain.endsWith(".ac.uk") ||
    domain.endsWith(".ac.nz") ||
    domain.endsWith(".ac.za") ||
    domain.endsWith(".ac.jp") ||
    domain.endsWith(".ac.kr") ||
    domain.endsWith(".ac.th") ||
    domain.endsWith(".ac.cn") ||
    domain.includes(".ac.") ||
    domain.includes(".edu") ||
    domain.includes(".univ-") ||
    domain.includes(".university") ||
    domain.includes(".college") ||
    domain.includes(".institute") ||
    domain.includes(".school")
  ) {
    return true;
  }

  return false;
}

