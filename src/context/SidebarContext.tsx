"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (val: boolean) => void;
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isSidebarCollapsed: false,
  toggleSidebarCollapse: () => {},
  setSidebarCollapsed: () => {},
  isMobileDrawerOpen: false,
  openMobileDrawer: () => {},
  closeMobileDrawer: () => {},
  toggleMobileDrawer: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("commandskill_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("commandskill_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  const setSidebarCollapsed = (val: boolean) => {
    setIsSidebarCollapsed(val);
    try {
      localStorage.setItem("commandskill_sidebar_collapsed", String(val));
    } catch {
      // Ignore localStorage errors
    }
  };

  const openMobileDrawer = () => setIsMobileDrawerOpen(true);
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);
  const toggleMobileDrawer = () => setIsMobileDrawerOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarCollapsed,
        toggleSidebarCollapse,
        setSidebarCollapsed,
        isMobileDrawerOpen,
        openMobileDrawer,
        closeMobileDrawer,
        toggleMobileDrawer,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
