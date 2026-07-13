"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";

import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Discover", href: "/discover" },
  { name: "Community", href: "#coming-soon" },
  { name: "Networking", href: "/messages" },
  { name: "Alumni", href: "#coming-soon" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);

    // Detect if navbar is overlapping a light section
    const lightSections = document.querySelectorAll('[data-theme="light"]');
    let overlapsLight = false;
    
    // The navbar is positioned at top-6 (approx 24px) and is about 64px tall.
    // We check a point around the middle of the navbar, e.g. Y=56.
    const navbarY = 56; 

    lightSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navbarY && rect.bottom >= navbarY) {
        overlapsLight = true;
      }
    });

    setIsLight(overlapsLight);
  });

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        backgroundColor: isScrolled
          ? isLight
            ? "rgba(255, 255, 255, 0.7)"
            : "rgba(11, 16, 32, 0.6)"
          : "rgba(0,0,0,0)",
        borderColor: isScrolled
          ? isLight
            ? "rgba(0, 0, 0, 0.1)"
            : "rgba(255, 255, 255, 0.1)"
          : "rgba(0,0,0,0)",
        boxShadow: isScrolled
          ? isLight
            ? "0 4px 24px -1px rgba(0,0,0,0.05)"
            : "0 4px 24px -1px rgba(0,0,0,0.2)"
          : "none"
      }}
      transition={{ 
        duration: 0.4, 
        ease: "easeInOut",
        y: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 } 
      }}
      style={{
        backdropFilter: isScrolled ? "blur(24px)" : "none"
      }}
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-full border",
        isScrolled ? "py-3 px-6" : "py-6 px-6"
      )}
    >
      <div className="flex items-center justify-between w-full h-full">
        {/* Logo */}
        <AnimatedLogo isLight={isLight} />

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isComingSoon = link.href === "#coming-soon";
            const isActive = pathname.startsWith(link.href) && !isComingSoon;

            if (isComingSoon) {
              return (
                <div key={link.name} className="relative group block cursor-not-allowed opacity-50" title="Coming Soon">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors text-zinc-500">
                    {link.name}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative group block"
                data-cursor-priority="2"
              >
                <motion.span
                  animate={{ color: isActive ? (isLight ? "#000" : "#fff") : (isLight ? "#52525B" : "#A1A1AA") }}
                  whileHover={{ color: isLight ? "#000" : "#fff" }}
                  className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
                >
                  {link.name}
                </motion.span>
                <motion.span 
                  animate={{ 
                    backgroundColor: isLight ? "#000" : "#fff",
                    width: isActive ? "100%" : "0%" 
                  }}
                  className="absolute -bottom-2 left-1/2 h-px -translate-x-1/2 group-hover:w-full transition-all duration-500 ease-out" 
                />
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden sm:block">
            <motion.span
                animate={{ color: isLight ? "#52525B" : "#A1A1AA" }}
                whileHover={{ color: isLight ? "#000" : "#fff" }}
                className="text-xs font-semibold uppercase tracking-[0.1em] transition-colors"
              >
                Sign In
            </motion.span>
          </Link>
          <div className="relative group">
            <Button variant="primary" className="h-10 px-6 rounded-full text-xs tracking-wider" data-cursor-priority="1">
              <Sparkles className="w-4 h-4" />
              Join Access
            </Button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl overflow-hidden">
              <Link href="/signup/student" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Student
              </Link>
              <Link href="/signup/recruiter" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Recruiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
