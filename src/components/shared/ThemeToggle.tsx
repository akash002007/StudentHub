"use client";

import React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme, Theme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
  size?: "sm" | "md";
}

export function ThemeToggle({
  className,
  showLabels = false,
  size = "md",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Laptop },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-muted/80 border border-border/70 gap-0.5 shadow-2xs backdrop-blur-xs",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = theme === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={isSelected}
            aria-label={`${opt.label} theme`}
            title={`${opt.label} theme`}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer select-none",
              size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
              isSelected
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon
              className={cn(
                size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
                opt.value === "light" && isSelected && "text-amber-500",
                opt.value === "dark" && isSelected && "text-blue-400",
                opt.value === "system" && isSelected && "text-foreground"
              )}
            />
            {showLabels ? (
              <span className="text-[11px] leading-none">{opt.label}</span>
            ) : (
              <span className="hidden sm:inline text-[11px] leading-none">{opt.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
