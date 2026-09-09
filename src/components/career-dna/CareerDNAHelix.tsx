"use client";

import React, { useMemo } from "react";
import { CareerDNANodeId, CareerDNANodeItem } from "./CareerDNAData";

interface CareerDNAHelixProps {
  focusedNodeId: CareerDNANodeId | null;
  isCenterHovered: boolean;
  reducedMotion?: boolean;
  nodes: CareerDNANodeItem[];
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
}: CareerDNAHelixProps) {
  // Helix mathematical geometry
  // ViewBox: 1000 wide x 300 high, centered at y = 150
  const width = 1000;
  const centerY = 150;
  const amplitude = 44;
  const cycles = 3.5;
  const k = (cycles * 2 * Math.PI) / width;

  // Generate smooth SVG paths for the two interwoven sinusoidal strands
  const { pathA, pathB, rungs } = useMemo(() => {
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

    return { pathA: svgPathA, pathB: svgPathB, rungs: generatedRungs };
  }, [width, centerY, amplitude, k]);

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

      {/* 4. Traveling Data Packets along the DNA strands */}
      {!reducedMotion && (
        <>
          <circle r="3" className="fill-sky-400 dark:fill-cyan-300 shadow-md">
            <animateMotion path={pathA} dur="6s" repeatCount="indefinite" />
          </circle>
          <circle r="2.8" className="fill-indigo-500 dark:fill-sky-400 shadow-md">
            <animateMotion path={pathB} dur="8s" repeatCount="indefinite" />
          </circle>
        </>
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
