"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Instant follow for the cursor
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // 0 = Base, 1 = Tier 1 (primary), 2 = Tier 2 (secondary), 3 = Tier 3 (minor)
  const [hoverPriority, setHoverPriority] = useState<0 | 1 | 2 | 3>(0);
  
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Avoid synchronous state updates to prevent cascading render warnings
    const touchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    
    setTimeout(() => {
      setIsTouch(touchDevice);
      setIsMounted(true);
    }, 0);
    
    if (touchDevice) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    document.body.classList.add("use-custom-cursor");
    
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      const target = e.target as HTMLElement;
      if (!target || typeof target.closest !== "function") {
        setHoverPriority(0);
        return;
      }
      
      const priorityElement = target.closest('[data-cursor-priority]');
      if (priorityElement) {
        const priority = parseInt(priorityElement.getAttribute('data-cursor-priority') || '0', 10);
        if (priority >= 1 && priority <= 3) {
          setHoverPriority(priority as 1 | 2 | 3);
          return;
        }
      }
      
      const isClickable = 
        (target.tagName && (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button')) ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('[role="link"]') ||
        target.closest('[role="listitem"]');
        
      if (isClickable) {
        setHoverPriority(3);
      } else {
        setHoverPriority(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", handleMotionChange);
      document.body.classList.remove("use-custom-cursor");
    };
  }, [cursorX, cursorY]);

  if (!isMounted || isTouch) return null;

  const getGlowFilter = (priority: number) => {
    // We pad all tiers with 3 drop-shadows so framer-motion can interpolate smoothly.
    switch (priority) {
      case 1:
        return 'drop-shadow(0 0 4px rgba(0,240,255,1)) drop-shadow(0 0 12px rgba(0,240,255,0.9)) drop-shadow(0 0 24px rgba(0,240,255,0.6))';
      case 2:
        return 'drop-shadow(0 0 3px rgba(0,240,255,1)) drop-shadow(0 0 8px rgba(0,240,255,0.7)) drop-shadow(0 0 16px rgba(0,240,255,0.4))';
      case 3:
        return 'drop-shadow(0 0 2px rgba(0,240,255,0.9)) drop-shadow(0 0 6px rgba(0,240,255,0.5)) drop-shadow(0 0 0px rgba(0,240,255,0))';
      default:
        return 'drop-shadow(0 0 2px rgba(0,240,255,0.7)) drop-shadow(0 0 4px rgba(0,240,255,0.3)) drop-shadow(0 0 0px rgba(0,240,255,0))';
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    >
      <motion.div
        className="origin-top-left"
        initial={{ filter: getGlowFilter(0), scale: 1 }}
        animate={{ 
          filter: getGlowFilter(hoverPriority),
          scale: hoverPriority === 1 ? 1.2 : hoverPriority === 2 ? 1.1 : hoverPriority === 3 ? 1.05 : 1 
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="glossyArrow" x1="0%" y1="0%" x2="100%" y2="100%">
              {/* Glossy obsidian-like fill */}
              <stop offset="0%" stopColor="#4A4A5A" />
              <stop offset="30%" stopColor="#1F1F2A" />
              <stop offset="100%" stopColor="#0A0A0F" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 0 L 0 16 L 4 12 L 8 20 L 11 18 L 7 10 L 15 10 Z"
            fill="url(#glossyArrow)" 
            stroke="rgba(255, 255, 255, 0.4)" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
