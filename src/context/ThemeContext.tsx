"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Read stored preference on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("studenthub_theme") as Theme | null;
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system")) {
        setThemeState(storedTheme);
      } else {
        setThemeState("system");
      }
    } catch {
      setThemeState("system");
    }
  }, []);

  // Update resolvedTheme and document class when theme or OS appearance changes
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      const actual: "dark" | "light" = isDark ? "dark" : "light";
      setResolvedTheme(actual);
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      try {
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      } catch {
        // Fallback for legacy environment
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("studenthub_theme", newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

