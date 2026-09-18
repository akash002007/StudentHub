"use client";

import React, { useMemo, useState, useEffect } from "react";
import { CareerDNANodeId, CareerDNANodeItem } from "./CareerDNAData";

interface CareerDNAHelixProps {
  focusedNodeId: CareerDNANodeId | null;
  isCenterHovered: boolean;
  reducedMotion?: boolean;
  nodes: CareerDNANodeItem[];
  score?: number | null;
}

interface HelixRung {
  id: string;
  x: number;
  y1: number;
  y2: number;
  depth: number; // -1 to 1 (cosine)
  associatedNodes: CareerDNANodeId[];
}

export function CareerDNAHelix({
  focusedNodeId,
  isCenterHovered,
  reducedMotion = false,
  nodes,
  score = null,
}: CareerDNAHelixProps) {
  // Helix mathematical geometry
  // ViewBox: 1000 wide x 300 high, centered at y = 150
  const width = 1000;
  const centerY = 150;
  const amplitude = 44;
  const cycles = 3.5;
  const k = (cycles * 2 * Math.PI) / width;

  // Generate smooth SVG paths for the two interwoven sinusoidal strands
  const { pathA, pathB, rungs, pointsA, pointsB } = useMemo(() => {
    const pointsA: [number, number][] = [];
    const pointsB: [number, number][] = [];
    const generatedRungs: HelixRung[] = [];

    const steps = 140;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const angle = k * x;
      const yA = centerY + amplitude * Math.sin(angle);
      const yB = centerY - amplitude * Math.sin(angle);
      pointsA.push([x, yA]);
      pointsB.push([x, yB]);
    }

    // Generate connecting rungs at regular intervals across the helix
    const rungCount = 32;
    for (let i = 1; i < rungCount; i++) {
      const x = (i / rungCount) * width;
      const angle = k * x;
      const yA = centerY + amplitude * Math.sin(angle);
      const yB = centerY - amplitude * Math.sin(angle);
      const depth = Math.cos(angle);

      // Associate each rung with the closest career capability nodes based on x position
      const associated: CareerDNANodeId[] = [];
      if (x < 280) {
        associated.push("strengths", "education");
      } else if (x < 440) {
        associated.push("goals", "strengths");
      } else if (x <= 560) {
        associated.push("goals", "achievements");
      } else if (x < 740) {
        associated.push("skills", "achievements");
      } else {
        associated.push("skills", "projects", "experience");
      }

      generatedRungs.push({
        id: `rung-${i}`,
        x,
        y1: yA,
        y2: yB,
        depth,
        associatedNodes: associated,
      });
    }

    const svgPathA = `M ${pointsA[0][0]} ${pointsA[0][1]} ` +
      pointsA.slice(1).map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

    const svgPathB = `M ${pointsB[0][0]} ${pointsB[0][1]} ` +
      pointsB.slice(1).map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

    return { pathA: svgPathA, pathB: svgPathB, rungs: generatedRungs, pointsA, pointsB };
  }, [width, centerY, amplitude, k]);

  // Smooth score interpolation (~600ms cubic easing) so particle activity transitions fluidly
  const [animatedScore, setAnimatedScore] = useState<number | null>(score ?? null);

  useEffect(() => {
    if (score === null || score === undefined) {
      setAnimatedScore(null);
      return;
    }

    if (animatedScore === null) {
      setAnimatedScore(score);
      return;
    }

    const startScore = animatedScore;
    const targetScore = Math.min(Math.max(score, 0), 100);
    if (startScore === targetScore) return;

    const startTime = performance.now();
    const duration = 600;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeInOutCubic
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const current = Math.round(startScore + (targetScore - startScore) * ease);
      setAnimatedScore(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  // Generate dynamic particles based on the student's Career DNA Score
  const { particlesA, particlesB, staticParticlesA, staticParticlesB } = useMemo(() => {
    // Neutral fallback when score is not loaded yet (e.g. 50/100 equivalent)
    const effectiveScore = animatedScore !== null ? Math.min(Math.max(animatedScore, 0), 100) : 50;

    // Total particle count scales monotonically from 2 (at score 0) to 18 (at score 100)
    // 0-20: 2-5 particles (subtle, calm)
    // 21-40: 5-8 particles (low activity)
    // 41-60: 8-11 particles (moderate activity)
    // 61-80: 12-15 particles (high activity)
    // 81-100: 15-18 particles (very high activity, controlled and premium)
    const totalCount = Math.round(2 + (effectiveScore / 100) * 16);
    const countA = Math.ceil(totalCount / 2);
    const countB = Math.floor(totalCount / 2);

    // Duration: 9.0s (score 0, gentle & serene) down to 5.5s (score 100, active & nimble)
    const baseDur = 9.0 - (effectiveScore / 100) * 3.5;
    const durA = baseDur;
    const durB = baseDur * 1.18; // slight phase difference between strands for natural parallax

    // Opacity: 0.70 at score 0 to 0.98 at score 100
    const opacity = (0.7 + (effectiveScore / 100) * 0.28).toFixed(2);

    // Build strand A particles with negative begin offset so particles are immediately spread across helix
    const listA = [];
    for (let i = 0; i < countA; i++) {
      const beginOffset = -(i * (durA / countA)).toFixed(2);
      const r = (2.2 + ((i % 3) * 0.45)).toFixed(1);
      listA.push({
        id: `pa-${i}`,
        r,
        dur: `${durA.toFixed(2)}s`,
        begin: `${beginOffset}s`,
        opacity,
      });
    }

    // Build strand B particles (with a 35% phase offset to prevent lockstep mirroring)
    const listB = [];
    for (let i = 0; i < countB; i++) {
      const beginOffset = -((i * (durB / Math.max(countB, 1))) + durB * 0.35).toFixed(2);
      const r = (2.1 + (((i + 1) % 3) * 0.45)).toFixed(1);
      listB.push({
        id: `pb-${i}`,
        r,
        dur: `${durB.toFixed(2)}s`,
        begin: `${beginOffset}s`,
        opacity,
      });
    }

    // Static points for reduced motion preference
    const sA = [];
    for (let i = 0; i < countA; i++) {
      const idx = Math.floor(((i + 0.5) / countA) * (pointsA.length - 1));
      const pt = pointsA[idx] || [0, 150];
      sA.push({ id: `spa-${i}`, cx: pt[0], cy: pt[1], r: (2.3 + ((i % 3) * 0.4)).toFixed(1), opacity });
    }

    const sB = [];
    for (let i = 0; i < countB; i++) {
      const idx = Math.floor(((i + 0.5) / Math.max(countB, 1)) * (pointsB.length - 1));
      const pt = pointsB[idx] || [0, 150];
      sB.push({ id: `spb-${i}`, cx: pt[0], cy: pt[1], r: (2.2 + (((i + 1) % 3) * 0.4)).toFixed(1), opacity });
    }

    return { particlesA: listA, particlesB: listB, staticParticlesA: sA, staticParticlesB: sB };
  }, [animatedScore, pointsA, pointsB]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 overflow-visible"
      viewBox="0 0 1000 300"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Dark Mode Strand Primary Gradient */}
        <linearGradient id="helixStrandDarkA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#818cf8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.85" />
        </linearGradient>

        {/* Dark Mode Strand Secondary Gradient */}
        <linearGradient id="helixStrandDarkB" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="30%" stopColor="#a855f7" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
        </linearGradient>

        {/* Light Mode Strand Primary Gradient */}
        <linearGradient id="helixStrandLightA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
        </linearGradient>

        {/* Light Mode Strand Secondary Gradient */}
        <linearGradient id="helixStrandLightB" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
        </linearGradient>

        {/* Active DNA Glow Filter */}
        <filter id="dnaGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. Connecting DNA Rungs */}
      <g className="transition-opacity duration-300">
        {rungs.map((rung) => {
          const isAssociated = focusedNodeId !== null && rung.associatedNodes.includes(focusedNodeId);
          const isActive = isAssociated || isCenterHovered;
          const isDimmed = focusedNodeId !== null && !isActive;

          return (
            <g key={rung.id}>
              <line
                x1={rung.x}
                y1={rung.y1}
                x2={rung.x}
                y2={rung.y2}
                className={`transition-all duration-300 ${
                  isActive
                    ? "stroke-sky-400 dark:stroke-cyan-300 stroke-[2.2] opacity-95"
                    : isDimmed
                    ? "stroke-slate-200 dark:stroke-blue-950 stroke-[0.8] opacity-10"
                    : "stroke-slate-300 dark:stroke-blue-900/40 stroke-[1.1] opacity-25"
                }`}
                filter={isActive ? "url(#dnaGlowFilter)" : undefined}
              />

              {/* Glowing End Cap Nodes on each Rung */}
              <circle
                cx={rung.x}
                cy={rung.y1}
                r={isActive ? 2.5 : 1.5}
                className={`transition-all duration-300 ${
                  isActive
                    ? "fill-sky-400 dark:fill-cyan-300"
                    : "fill-slate-300 dark:fill-blue-800/60"
                }`}
              />
              <circle
                cx={rung.x}
                cy={rung.y2}
                r={isActive ? 2.5 : 1.5}
                className={`transition-all duration-300 ${
                  isActive
                    ? "fill-indigo-500 dark:fill-sky-300"
                    : "fill-slate-300 dark:fill-blue-800/60"
                }`}
              />
            </g>
          );
        })}
      </g>

      {/* 2. Strand B (Back/Depth Strand) */}
      <path
        d={pathB}
        fill="none"
        stroke="url(#helixStrandDarkB)"
        className="dark:inline hidden transition-all duration-300 stroke-[2] opacity-75"
        filter={isCenterHovered || focusedNodeId ? "url(#dnaGlowFilter)" : undefined}
      />
      <path
        d={pathB}
        fill="none"
        stroke="url(#helixStrandLightB)"
        className="dark:hidden inline transition-all duration-300 stroke-[2] opacity-75"
      />

      {/* 3. Strand A (Front Flowing Strand) */}
      <path
        d={pathA}
        fill="none"
        stroke="url(#helixStrandDarkA)"
        className="dark:inline hidden transition-all duration-300 stroke-[2.5] opacity-95"
        filter={isCenterHovered || focusedNodeId ? "url(#dnaGlowFilter)" : undefined}
      />
      <path
        d={pathA}
        fill="none"
        stroke="url(#helixStrandLightA)"
        className="dark:hidden inline transition-all duration-300 stroke-[2.5] opacity-95"
      />

      {/* 4. Score-Driven Traveling Data Packets along the DNA Strands */}
      {!reducedMotion ? (
        <g className="data-packets-layer">
          {particlesA.map((p) => (
            <circle
              key={p.id}
              r={p.r}
              className="fill-sky-400 dark:fill-cyan-300"
              style={{ opacity: p.opacity }}
              filter="url(#dnaGlowFilter)"
            >
              <animateMotion path={pathA} dur={p.dur} begin={p.begin} repeatCount="indefinite" />
            </circle>
          ))}
          {particlesB.map((p) => (
            <circle
              key={p.id}
              r={p.r}
              className="fill-indigo-400 dark:fill-sky-300"
              style={{ opacity: p.opacity }}
              filter="url(#dnaGlowFilter)"
            >
              <animateMotion path={pathB} dur={p.dur} begin={p.begin} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      ) : (
        <g className="static-data-packets-layer">
          {staticParticlesA.map((p) => (
            <circle
              key={p.id}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              className="fill-sky-400 dark:fill-cyan-300"
              style={{ opacity: p.opacity }}
              filter="url(#dnaGlowFilter)"
            />
          ))}
          {staticParticlesB.map((p) => (
            <circle
              key={p.id}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              className="fill-indigo-400 dark:fill-sky-300"
              style={{ opacity: p.opacity }}
              filter="url(#dnaGlowFilter)"
            />
          ))}
        </g>
      )}

      {/* 5. Capability Capsule Connecting Rays into the DNA Helix */}
      {nodes.map((node) => {
        // Node coordinates on 1000 x 300 viewBox
        const nodeX = (node.x / 100) * width;
        const nodeY = (node.y / 100) * 300;

        // Helix target entry point
        const helixAngle = k * nodeX;
        const isTopNode = node.y < 50;
        const targetHelixY = isTopNode
          ? centerY - amplitude * Math.abs(Math.sin(helixAngle))
          : centerY + amplitude * Math.abs(Math.sin(helixAngle));

        const isDirectFocus = focusedNodeId === node.id;
        const isActive = isDirectFocus || isCenterHovered;
        const isDimmed = focusedNodeId !== null && !isActive;

        return (
          <g key={`ray-${node.id}`}>
            <line
              x1={nodeX}
              y1={nodeY}
              x2={nodeX}
              y2={targetHelixY}
              className={`transition-all duration-300 ${
                isActive
                  ? "stroke-sky-400 dark:stroke-cyan-400 stroke-[1.8] opacity-90"
                  : isDimmed
                  ? "stroke-slate-200 dark:stroke-blue-950 stroke-[0.8] opacity-08"
                  : "stroke-slate-300 dark:stroke-blue-900/30 stroke-[1] opacity-20"
              }`}
              strokeDasharray={isActive ? undefined : "3 3"}
              filter={isActive ? "url(#dnaGlowFilter)" : undefined}
            />

            {/* Target Entry Beacon onto Helix */}
            <circle
              cx={nodeX}
              cy={targetHelixY}
              r={isActive ? 3.5 : 2}
              className={`transition-all duration-300 ${
                isActive
                  ? "fill-sky-400 dark:fill-cyan-300"
                  : "fill-slate-300/80 dark:fill-blue-900/60"
              }`}
            />
          </g>
        );
      })}
    </svg>
  );
}
