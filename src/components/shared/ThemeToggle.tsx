"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={cn(
        "p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors relative border border-transparent hover:border-border/60",
        className
      )}
      aria-label="Toggle theme"
      title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-purple-600 transition-transform duration-200" />
      )}
    </button>
  );
}
