"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Briefcase,
  GitPullRequest,
  Users2,
  GraduationCap,
  CheckCircle2,
  Code2,
  Zap,
  Target,
  Trophy,
  Award,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Safely register GSAP Plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

export function GSAPBentoShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const bgParallaxRef = useRef<HTMLDivElement>(null);

  // Left Narrative step containers
  const stepTextRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Right Bento Cards refs
  const cardPrimaryRef = useRef<HTMLDivElement>(null);
  const cardSecondaryRef = useRef<HTMLDivElement>(null);
  const cardTertiaryRef = useRef<HTMLDivElement>(null);
  const cardQuaternaryRef = useRef<HTMLDivElement>(null);

  const [activeScene, setActiveScene] = useState(0);

  const scenes = [
    {
      id: "01",
      tag: "01 // DISCOVER",
      badge: "Institutional Trust Engine",
      badgeIcon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
      title: "Your Student Identity,",
      titleHighlight: "Verified by Proof-of-Work",
      description:
        "Break free from static PDF resumes. Validate your academic credentials via institutional domain, semester fee receipts, or student ID. Showcase verified coursework, hackathons, and technical projects.",
      metrics: [
        { label: "Verification Speed", value: "< 24 Hrs" },
        { label: "Verified Candidates", value: "10,000+" },
        { label: "Campus Networks", value: "500+" },
      ],
      ctaText: "Get Verified Identity",
      ctaLink: "/signup",
      secondaryCtaText: "Learn About Verification",
      secondaryCtaLink: "/login",
    },
    {
      id: "02",
      tag: "02 // BUILD",
      badge: "Dynamic Career DNA",
      badgeIcon: <Code2 className="w-4 h-4 text-blue-400" />,
      title: "Craft Your Portfolio &",
      titleHighlight: "Signal Real Competence",
      description:
        "Showcase live GitHub repositories, hackathon awards, verified GPAs, and technical stack proficiencies that campus recruiters actually evaluate. Build a living record of your engineering talent.",
      metrics: [
        { label: "Signal Strength", value: "94% Match" },
        { label: "Verified Projects", value: "48,000+" },
        { label: "Skill Badges", value: "120+ Tracks" },
      ],
      ctaText: "Build Your Career DNA",
      ctaLink: "/signup",
      secondaryCtaText: "View Sample Dossier",
      secondaryCtaLink: "/dashboard/profile",
    },
    {
      id: "03",
      tag: "03 // CONNECT",
      badge: "Peer & Alumni Ecosystem",
      badgeIcon: <Users2 className="w-4 h-4 text-emerald-400" />,
      title: "Collaborate Across 500+",
      titleHighlight: "Student & Alumni Hubs",
      description:
        "Join specialized communities for AI/ML systems, LeetCode & DSA interview preparation, open-source engineering, and founder squads. Find hackathon teammates and mock interview partners.",
      metrics: [
        { label: "Active Hubs", value: "500+" },
        { label: "Daily Topics", value: "1,800+" },
        { label: "Hackathon Squads", value: "620+" },
      ],
      ctaText: "Join Student Hubs",
      ctaLink: "/signup",
      secondaryCtaText: "Browse Communities",
      secondaryCtaLink: "/dashboard/communities",
    },
    {
      id: "04",
      tag: "04 // DISCOVER OPPORTUNITIES",
      badge: "AI-Powered Matching",
      badgeIcon: <Briefcase className="w-4 h-4 text-amber-400" />,
      title: "Curated Internships That",
      titleHighlight: "Actually Fit Your Stack",
      description:
        "No ghost postings or fake listings. Direct access to verified software engineering, product, and AI internships with transparent hourly stipends, clear requirements, and direct recruiter callbacks.",
      metrics: [
        { label: "Active Roles", value: "1,200+" },
        { label: "Avg Stipend", value: "$48 / Hr" },
        { label: "Direct Hiring Rate", value: "94%" },
      ],
      ctaText: "Explore Opportunities",
      ctaLink: "/signup",
      secondaryCtaText: "View Internship Feed",
      secondaryCtaLink: "/dashboard/internships",
    },
    {
      id: "05",
      tag: "05 // GROW",
      badge: "Direct Placement & Fast-Track",
      badgeIcon: <GraduationCap className="w-4 h-4 text-purple-400" />,
      title: "Your Gateway To",
      titleHighlight: "High-Growth Careers",
      description:
        "Skip the black hole of cold applications. Campus hiring managers search verified StudentHub talent pipelines to extend direct interview invitations and fast-track internship offers.",
      metrics: [
        { label: "Partner Companies", value: "350+" },
        { label: "Direct Offers", value: "2,400+" },
        { label: "Student Rating", value: "4.9 / 5" },
      ],
      ctaText: "Create Free Student Account",
      ctaLink: "/signup",
      secondaryCtaText: "Hire University Talent",
      secondaryCtaLink: "/onboarding/recruiter",
    },
  ];

  useLayoutEffect(() => {
    if (!containerRef.current || !triggerRef.current) return;

    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Fallback for reduced motion: keep all simple
        return;
      }

      // Master ScrollTrigger timeline pinned across 350vh scroll distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=350%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const raw = self.progress * (scenes.length - 1);
            const idx = Math.round(raw);
            setActiveScene(Math.max(0, Math.min(scenes.length - 1, idx)));
          },
        },
      });

      // 1. Initial Narrative Setup
      stepTextRefs.current.forEach((el, i) => {
        if (!el) return;
        if (i === 0) {
          gsap.set(el, { opacity: 1, y: 0, pointerEvents: "auto", display: "block" });
        } else {
          gsap.set(el, { opacity: 0, y: 40, pointerEvents: "none", display: "none" });
        }
      });

      // Initial Bento Cards setup
      if (cardPrimaryRef.current) {
        gsap.set(cardPrimaryRef.current, { scale: 1, xPercent: 0, yPercent: 0, opacity: 1 });
      }
      if (cardSecondaryRef.current) {
        gsap.set(cardSecondaryRef.current, { scale: 0.85, opacity: 0, y: 60 });
      }
      if (cardTertiaryRef.current) {
        gsap.set(cardTertiaryRef.current, { scale: 0.85, opacity: 0, y: 60 });
      }
      if (cardQuaternaryRef.current) {
        gsap.set(cardQuaternaryRef.current, { scale: 0.85, opacity: 0, y: 60 });
      }

      // Background Parallax
      if (bgParallaxRef.current) {
        tl.to(bgParallaxRef.current, { yPercent: -20, ease: "none" }, 0);
      }

      // ----------------------------------------------------
      // TRANSITION 1: SCENE 01 -> SCENE 02 (Progress 0.00 -> 0.25)
      // ----------------------------------------------------
      const t1Start = 0.05;
      const t1End = 0.25;

      // Text 01 out, Text 02 in
      if (stepTextRefs.current[0] && stepTextRefs.current[1]) {
        tl.to(
          stepTextRefs.current[0],
          { opacity: 0, y: -40, duration: 0.15, ease: "power2.inOut", onComplete: () => {
            if (stepTextRefs.current[0]) stepTextRefs.current[0].style.display = "none";
          }, onReverseComplete: () => {
            if (stepTextRefs.current[0]) stepTextRefs.current[0].style.display = "block";
          }},
          t1Start
        ).fromTo(
          stepTextRefs.current[1],
          { opacity: 0, y: 40, display: "block" },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out", pointerEvents: "auto" },
          t1Start + 0.05
        );
      }

      // Card Transformations into Bento Layout (Scene 02)
      if (cardPrimaryRef.current) {
        tl.to(
          cardPrimaryRef.current,
          {
            scale: 0.95,
            xPercent: -2,
            yPercent: -4,
            duration: 0.2,
            ease: "power2.inOut",
          },
          t1Start
        );
      }
      if (cardSecondaryRef.current) {
        tl.to(
          cardSecondaryRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "back.out(1.2)",
          },
          t1Start + 0.03
        );
      }

      // ----------------------------------------------------
      // TRANSITION 2: SCENE 02 -> SCENE 03 (Progress 0.25 -> 0.50)
      // ----------------------------------------------------
      const t2Start = 0.30;
      const t2End = 0.50;

      // Text 02 out, Text 03 in
      if (stepTextRefs.current[1] && stepTextRefs.current[2]) {
        tl.to(
          stepTextRefs.current[1],
          { opacity: 0, y: -40, duration: 0.15, ease: "power2.inOut", onComplete: () => {
            if (stepTextRefs.current[1]) stepTextRefs.current[1].style.display = "none";
          }, onReverseComplete: () => {
            if (stepTextRefs.current[1]) stepTextRefs.current[1].style.display = "block";
          }},
          t2Start
        ).fromTo(
          stepTextRefs.current[2],
          { opacity: 0, y: 40, display: "block" },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out", pointerEvents: "auto" },
          t2Start + 0.05
        );
      }

      // Cards transform into Networking & Community Bento (Scene 03)
      if (cardPrimaryRef.current) {
        tl.to(
          cardPrimaryRef.current,
          {
            scale: 0.9,
            xPercent: -6,
            yPercent: -10,
            duration: 0.2,
            ease: "power2.inOut",
          },
          t2Start
        );
      }
      if (cardTertiaryRef.current) {
        tl.to(
          cardTertiaryRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "back.out(1.2)",
          },
          t2Start + 0.03
        );
      }

      // ----------------------------------------------------
      // TRANSITION 3: SCENE 03 -> SCENE 04 (Progress 0.50 -> 0.75)
      // ----------------------------------------------------
      const t3Start = 0.55;
      const t3End = 0.75;

      // Text 03 out, Text 04 in
      if (stepTextRefs.current[2] && stepTextRefs.current[3]) {
        tl.to(
          stepTextRefs.current[2],
          { opacity: 0, y: -40, duration: 0.15, ease: "power2.inOut", onComplete: () => {
            if (stepTextRefs.current[2]) stepTextRefs.current[2].style.display = "none";
          }, onReverseComplete: () => {
            if (stepTextRefs.current[2]) stepTextRefs.current[2].style.display = "block";
          }},
          t3Start
        ).fromTo(
          stepTextRefs.current[3],
          { opacity: 0, y: 40, display: "block" },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out", pointerEvents: "auto" },
          t3Start + 0.05
        );
      }

      // Cards morph into Opportunities & Match Engine (Scene 04)
      if (cardPrimaryRef.current) {
        tl.to(
          cardPrimaryRef.current,
          {
            opacity: 0.4,
            scale: 0.85,
            xPercent: -10,
            yPercent: -18,
            duration: 0.2,
            ease: "power2.inOut",
          },
          t3Start
        );
      }
      if (cardSecondaryRef.current) {
        tl.to(
          cardSecondaryRef.current,
          {
            xPercent: 4,
            yPercent: -6,
            duration: 0.2,
            ease: "power2.inOut",
          },
          t3Start
        );
      }
      if (cardQuaternaryRef.current) {
        tl.to(
          cardQuaternaryRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "back.out(1.2)",
          },
          t3Start + 0.03
        );
      }

      // ----------------------------------------------------
      // TRANSITION 4: SCENE 04 -> SCENE 05 (Progress 0.75 -> 1.00)
      // ----------------------------------------------------
      const t4Start = 0.80;

      // Text 04 out, Text 05 in
      if (stepTextRefs.current[3] && stepTextRefs.current[4]) {
        tl.to(
          stepTextRefs.current[3],
          { opacity: 0, y: -40, duration: 0.15, ease: "power2.inOut", onComplete: () => {
            if (stepTextRefs.current[3]) stepTextRefs.current[3].style.display = "none";
          }, onReverseComplete: () => {
            if (stepTextRefs.current[3]) stepTextRefs.current[3].style.display = "block";
          }},
          t4Start
        ).fromTo(
          stepTextRefs.current[4],
          { opacity: 0, y: 40, display: "block" },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out", pointerEvents: "auto" },
          t4Start + 0.05
        );
      }

      // Cards settle into Final Direct Placement & Growth Roadmap (Scene 05)
      if (cardPrimaryRef.current) {
        tl.to(
          cardPrimaryRef.current,
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.15,
            ease: "power2.inOut",
          },
          t4Start
        );
      }
      if (cardQuaternaryRef.current) {
        tl.to(
          cardQuaternaryRef.current,
          {
            scale: 1.05,
            borderColor: "rgba(139, 92, 246, 0.6)",
            boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)",
            duration: 0.2,
            ease: "power2.out",
          },
          t4Start
        );
      }
    }, triggerRef);

    return () => ctx.revert();
  }, [scenes.length]);

  // Direct smooth scroll jump to specific scene (0 to 4)
  const scrollToScene = (index: number) => {
    if (!triggerRef.current) return;
    const st = ScrollTrigger.getById("experience-pin") || ScrollTrigger.getAll().find((s) => s.trigger === triggerRef.current);
    
    if (st) {
      const targetProgress = index / (scenes.length - 1);
      const targetScroll = st.start + targetProgress * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    } else {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetScroll = scrollTop + rect.top + (index / (scenes.length - 1)) * (window.innerHeight * 3);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={triggerRef}
      id="experience"
      className="relative w-full bg-background select-none"
      aria-label="StudentHub Interactive Platform Journey"
    >
      {/* Pinned Showcase Viewport */}
      <section
        ref={containerRef}
        className="relative w-full h-screen min-h-[100dvh] overflow-hidden border-y border-border/80 flex items-center justify-center bg-background"
      >
        {/* Dynamic Ambient Background Parallax Layer */}
        <div
          ref={bgParallaxRef}
          className="absolute inset-0 pointer-events-none -z-10 will-change-transform"
        >
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/10 dark:bg-purple-500/8 blur-[140px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-500/8 blur-[140px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-5" />
        </div>

        {/* Main Content Stage Grid */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Narrative Column (7 cols) */}
            <div className="lg:col-span-7 relative min-h-[420px] flex items-center">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  ref={(el) => {
                    stepTextRefs.current[idx] = el;
                  }}
                  className="w-full space-y-5 text-left will-change-transform absolute inset-0 flex flex-col justify-center"
                >
                  {/* Step Tag & Badge */}
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 shadow-2xs">
                      {scene.tag}
                    </span>
                    <Badge variant="outline" size="sm" className="gap-1.5 py-1 backdrop-blur-sm">
                      {scene.badgeIcon}
                      <span className="font-semibold text-xs">{scene.badge}</span>
                    </Badge>
                  </div>

                  {/* Main Headline */}
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
                    {scene.title}{" "}
                    <span className="text-gradient block sm:inline">{scene.titleHighlight}</span>
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                    {scene.description}
                  </p>

                  {/* Metric Stat Pills */}
                  <div className="grid grid-cols-3 gap-3 max-w-lg pt-1">
                    {scene.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-3 rounded-xl bg-card/75 border border-border/80 backdrop-blur-sm shadow-2xs"
                      >
                        <p className="text-base sm:text-lg font-black text-foreground">{m.value}</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Call to Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link href={scene.ctaLink}>
                      <Button
                        variant="gradient"
                        size="md"
                        className="h-11 px-6 text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        {scene.ctaText}
                      </Button>
                    </Link>

                    {scene.secondaryCtaText && (
                      <Link href={scene.secondaryCtaLink || "/login"}>
                        <Button variant="outline" size="md" className="h-11 px-5 text-xs sm:text-sm border-border/80">
                          {scene.secondaryCtaText}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Transforming Bento Stage (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[460px] flex items-center justify-center">
              
              {/* Bento Card 1: Student Identity & Verification Core */}
              <div
                ref={cardPrimaryRef}
                className="w-full max-w-md p-5 rounded-2xl bg-card/95 dark:bg-card/85 border border-purple-500/30 shadow-2xl backdrop-blur-xl space-y-4 will-change-transform z-20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-0.5 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                        alt="Student Profile"
                        className="w-full h-full object-cover rounded-[10px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-foreground">Alex Rivera</h4>
                        <span className="p-0.5 rounded-full bg-blue-500/20 text-blue-500">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Stanford • B.S. CS 2027</p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">
                    Verified Student
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Verified GPA</span>
                    <span className="font-bold text-foreground text-sm">3.92 / 4.0</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Auth Method</span>
                    <span className="font-bold text-foreground text-sm">Institutional Email</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Top Validated Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Distributed Systems", "TypeScript", "React", "Next.js", "PyTorch"].map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Career DNA & Verified Projects Card (Enters Scene 2) */}
              <div
                ref={cardSecondaryRef}
                className="absolute -bottom-6 -right-2 sm:-right-6 w-[88%] max-w-sm p-4 rounded-2xl bg-card/95 dark:bg-card/85 border border-blue-500/30 shadow-2xl backdrop-blur-xl space-y-2.5 will-change-transform z-25"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-foreground">Verified Project Signal</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Production Grade
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Distributed Raft Key-Value Store</span>
                    <span className="text-emerald-500 font-mono text-[11px]">99.8% Test Coverage</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Go • Concurrency • gRPC • Consensus Engine
                  </p>
                </div>
              </div>

              {/* Bento Card 3: Peer Communities & Mentorship Card (Enters Scene 3) */}
              <div
                ref={cardTertiaryRef}
                className="absolute -top-6 -left-2 sm:-left-6 w-[85%] max-w-xs p-3.5 rounded-2xl bg-card/95 dark:bg-card/85 border border-emerald-500/30 shadow-2xl backdrop-blur-xl space-y-2 will-change-transform z-30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-foreground">Peer Hub: AI & ML Systems</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>3,420 Active Builders</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">42 Live Rooms</span>
                </div>
              </div>

              {/* Bento Card 4: AI Internship Match & Placement Card (Enters Scene 4 & 5) */}
              <div
                ref={cardQuaternaryRef}
                className="absolute -bottom-8 left-0 sm:left-4 w-[92%] max-w-sm p-4 rounded-2xl bg-card/95 dark:bg-card/85 border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-3 will-change-transform z-35"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-sm">
                      S
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-foreground">Frontend Systems Intern</h5>
                      <p className="text-[10px] text-muted-foreground">Stripe • Summer 2026</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 block">$52/hr</span>
                    <span className="text-[9px] text-muted-foreground">Fast-Track Call</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 96% Match with Your Dossier
                  </span>
                  <span className="text-[10px] text-muted-foreground">Direct HR Invitation</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Floating Interactive Progress & Navigation Bar */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 bg-card/90 dark:bg-card/75 backdrop-blur-md p-2 rounded-2xl border border-border/80 shadow-xl">
          {/* Previous Scene Button */}
          <button
            onClick={() => scrollToScene(Math.max(0, activeScene - 1))}
            disabled={activeScene === 0}
            aria-label="Previous Showcase Scene"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Numbered scene indicators */}
          <div className="flex flex-col gap-2 py-1">
            {scenes.map((s, idx) => {
              const isActive = idx === activeScene;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToScene(idx)}
                  aria-label={`Jump to scene ${s.id}`}
                  className={`relative px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {s.id}
                </button>
              );
            })}
          </div>

          {/* Next Scene Button */}
          <button
            onClick={() => scrollToScene(Math.min(scenes.length - 1, activeScene + 1))}
            disabled={activeScene === scenes.length - 1}
            aria-label="Next Showcase Scene"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Scroll-Driven Interaction Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground/70 bg-card/60 backdrop-blur-sm px-3.5 py-1 rounded-full border border-border/40">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
          <span>Scroll to scrub through StudentHub story • Use right indicators anytime</span>
        </div>
      </section>
    </div>
  );
}

// Re-export for any backward references
export const GSAPSwipeSlider = GSAPBentoShowcase;
