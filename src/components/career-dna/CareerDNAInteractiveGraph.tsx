"use client";

import React, { useState, useRef, useEffect } from "react";
import { CareerDNANodeId, CareerDNANodeItem } from "./CareerDNAData";
import { CareerDNAHelix } from "./CareerDNAHelix";
import { CareerDNACore } from "./CareerDNACore";
import { CareerDNANode } from "./CareerDNANode";
import { CareerDNAInsightPanel } from "./CareerDNAInsightCard";

interface CareerDNAInteractiveGraphProps {
  nodes: CareerDNANodeItem[];
}

export function CareerDNAInteractiveGraph({
  nodes,
}: CareerDNAInteractiveGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<CareerDNANodeId | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<CareerDNANodeId | null>(null);
  const [isCenterHovered, setIsCenterHovered] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const nodeMap = new Map<CareerDNANodeId, CareerDNANodeItem>(
    nodes.map((n) => [n.id, n])
  );

  const focusedNodeId = activeNodeId || hoveredNodeId;
  const activeNodeItem = nodes.find((n) => n.id === activeNodeId) || null;

  // Check user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Subtle mouse tracking for gentle identity graph parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallaxOffset({
      x: nx * 8,
      y: ny * 5,
    });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
    setHoveredNodeId(null);
    setIsCenterHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[280px] sm:h-[300px] md:h-[320px] rounded-2xl overflow-visible select-none border border-border/60 bg-gradient-to-b from-background via-slate-50/50 to-blue-50/20 dark:from-slate-950 dark:via-[#080b16] dark:to-[#060812] transition-colors duration-500"
    >
      {/* 1. Ambient Background Glow & Star Dust */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isCenterHovered || focusedNodeId
              ? "opacity-100"
              : "opacity-60 dark:opacity-75"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.07) 45%, transparent 75%)",
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full opacity-25 dark:opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12%" cy="22%" r="1" className="fill-sky-400" />
          <circle cx="28%" cy="85%" r="1.2" className="fill-indigo-400" />
          <circle cx="72%" cy="16%" r="1" className="fill-blue-400" />
          <circle cx="88%" cy="78%" r="1.5" className="fill-cyan-400" />
          <circle cx="45%" cy="32%" r="0.8" className="fill-purple-400" />
          <circle cx="65%" cy="80%" r="1" className="fill-sky-300" />
        </svg>
      </div>

      {/* 2. Interactive Parallax Motion Layer */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
        }}
      >
        {/* Horizontal SVG Digital DNA Helix (Flowing Strands, Rungs, Connecting Rays) */}
        <CareerDNAHelix
          nodes={nodes}
          focusedNodeId={focusedNodeId}
          isCenterHovered={isCenterHovered}
          reducedMotion={reducedMotion}
        />

        {/* Central "CAREER DNA" Identity Core */}
        <CareerDNACore
          isHovered={isCenterHovered}
          onHover={setIsCenterHovered}
          onClick={() => setActiveNodeId(null)}
          reducedMotion={reducedMotion}
        />

        {/* Capability Capsules (Arranged above and below the DNA Helix) */}
        {nodes.map((node) => {
          const isNodeActive = activeNodeId === node.id;
          const isNodeHovered = hoveredNodeId === node.id;

          let isDimmed = false;
          if (focusedNodeId !== null && focusedNodeId !== node.id) {
            const focusedItem = nodeMap.get(focusedNodeId);
            const isDirectNeighbor =
              node.connectedTo.includes(focusedNodeId) ||
              Boolean(focusedItem?.connectedTo.includes(node.id));
            if (!isDirectNeighbor) {
              isDimmed = true;
            }
          }

          return (
            <CareerDNANode
              key={node.id}
              node={node}
              isHovered={isNodeHovered}
              isActive={isNodeActive}
              isDimmed={isDimmed}
              onHover={setHoveredNodeId}
              onClick={(id) => {
                setActiveNodeId((prev) => (prev === id ? null : id));
              }}
              reducedMotion={reducedMotion}
            />
          );
        })}
      </div>

      {/* 3. Bottom Interactive Hint Bar (Hidden while inspecting a node) */}
      {!activeNodeItem && (
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center pointer-events-none px-4 z-20">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-border/50 shadow-2xs">
            Hover to illuminate DNA helix rungs • Click any pillar to inspect evidence
          </span>
        </div>
      )}

      {/* 4. Unclipped Career DNA Insight Panel */}
      {activeNodeItem && (
        <CareerDNAInsightPanel
          node={activeNodeItem}
          onClose={() => setActiveNodeId(null)}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}
