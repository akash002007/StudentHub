"use client";

import React from "react";
import { CareerDNANodeId, CareerDNANodeItem } from "./CareerDNAData";

interface CareerDNALinksProps {
  nodes: CareerDNANodeItem[];
  centerPos: { x: number; y: number };
  focusedNodeId: CareerDNANodeId | null; // Either hovered or clicked active node
  isCenterHovered: boolean;
  reducedMotion?: boolean;
}

export function CareerDNALinks({
  nodes,
  centerPos,
  focusedNodeId,
  isCenterHovered,
  reducedMotion = false,
}: CareerDNALinksProps) {
  const nodeMap = new Map<CareerDNANodeId, CareerDNANodeItem>(
    nodes.map((n) => [n.id, n])
  );

  // Structured relational flow of Career DNA:
  // Education & Projects & Experience -> Skills -> Strengths -> Career Goals
  // Achievements -> Strengths
  const relationalPairs: [CareerDNANodeId, CareerDNANodeId][] = [
    ["education", "skills"],
    ["projects", "skills"],
    ["experience", "skills"],
    ["skills", "strengths"],
    ["achievements", "strengths"],
    ["strengths", "goals"],
    ["skills", "goals"],
    ["experience", "achievements"],
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 overflow-visible"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Active line gradient (Dark Mode) */}
        <linearGradient id="activeGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
        </linearGradient>

        {/* Active line gradient (Light Mode) */}
        <linearGradient id="activeGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
        </linearGradient>

        {/* Active link glow filter */}
        <filter id="linkGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. Core-to-Node Radial Connections */}
      {nodes.map((node) => {
        const x1 = centerPos.x * 10;
        const y1 = centerPos.y * 6;
        const x2 = node.x * 10;
        const y2 = node.y * 6;

        const isDirect = focusedNodeId === node.id;
        const isActive = isDirect || isCenterHovered;
        const isDimmed = focusedNodeId !== null && !isActive;

        return (
          <g key={`core-${node.id}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={`transition-all duration-300 ${
                isActive
                  ? "stroke-sky-400 dark:stroke-cyan-400 stroke-[2] opacity-90"
                  : isDimmed
                  ? "stroke-slate-200 dark:stroke-blue-950 stroke-[0.8] opacity-10"
                  : "stroke-slate-300/80 dark:stroke-blue-900/35 stroke-[1] opacity-25"
              }`}
              strokeDasharray={isActive ? undefined : "3 3"}
              filter={isActive ? "url(#linkGlowFilter)" : undefined}
            />

            {/* Traveling Data Packet along active line */}
            {isActive && !reducedMotion && (
              <circle r="3" className="fill-sky-400 dark:fill-cyan-300 shadow-sm">
                <animateMotion
                  path={`M ${x1} ${y1} L ${x2} ${y2}`}
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })}

      {/* 2. Relational Constellation Links between Nodes */}
      {relationalPairs.map(([fromId, toId]) => {
        const fromNode = nodeMap.get(fromId);
        const toNode = nodeMap.get(toId);
        if (!fromNode || !toNode) return null;

        const x1 = fromNode.x * 10;
        const y1 = fromNode.y * 6;
        const x2 = toNode.x * 10;
        const y2 = toNode.y * 6;

        const isConnectedToFocused =
          focusedNodeId === fromId || focusedNodeId === toId;
        const isActive = isConnectedToFocused || isCenterHovered;
        const isDimmed = focusedNodeId !== null && !isActive;

        return (
          <g key={`pair-${fromId}-${toId}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={`transition-all duration-300 ${
                isActive
                  ? "stroke-blue-500 dark:stroke-sky-400 stroke-[1.8] opacity-85"
                  : isDimmed
                  ? "stroke-slate-200 dark:stroke-blue-950 stroke-[0.7] opacity-08"
                  : "stroke-slate-300/70 dark:stroke-blue-950/40 stroke-[0.9] opacity-20"
              }`}
              strokeDasharray={isActive ? undefined : "4 4"}
              filter={isActive ? "url(#linkGlowFilter)" : undefined}
            />

            {/* Micro Traveling Packet along active relational connection */}
            {isConnectedToFocused && !reducedMotion && (
              <circle r="2.2" className="fill-indigo-500 dark:fill-sky-300">
                <animateMotion
                  path={`M ${x1} ${y1} L ${x2} ${y2}`}
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}
