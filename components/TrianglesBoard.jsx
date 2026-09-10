// components/TrianglesBoard.jsx
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateTrianglesGeometry } from "@/lib/trianglesLogic";
import { Zap, Sparkles } from "lucide-react";

export default function TrianglesBoard({
  gridSize = 4,
  lines = {},
  triangles = {},
  currentTurn = "P1",
  myPlayerId = "P1",
  status = "playing",
  onMakeMove,
  gotBonusTurn = false,
}) {
  const geometry = useMemo(() => generateTrianglesGeometry(gridSize), [gridSize]);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const isMyTurn = status === "playing" && currentTurn === myPlayerId;

  const handleEdgeClick = (edgeId) => {
    if (!isMyTurn || lines[edgeId]) return;
    onMakeMove(edgeId);
  };

  return (
    <div className="relative w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center select-none">
      
      {/* Turn & Bonus Notification Banner */}
      <div className="h-10 mb-3 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {gotBonusTurn && isMyTurn ? (
            <motion.div
              key="bonus"
              initial={{ scale: 0.8, opacity: 0, y: -5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -5 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-500/25 border border-amber-400/50 text-amber-300 font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
            >
              <Zap size={16} className="text-amber-400 fill-amber-400" />
              <span>EXTRA TURN BONUS! DRAW AGAIN</span>
            </motion.div>
          ) : isMyTurn ? (
            <motion.div
              key="myturn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs sm:text-sm font-bold tracking-wide text-cyan-300 flex items-center gap-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span>Your Turn — Select an available line</span>
            </motion.div>
          ) : (
            <motion.div
              key="waitingturn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs sm:text-sm font-semibold text-white/50 flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10"
            >
              <span>Opponent is choosing a line…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main SVG Interactive Game Board */}
      <div className="relative w-full aspect-square max-h-[520px] bg-[#090b20]/90 rounded-3xl border border-white/15 p-2 sm:p-4 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
        
        <svg
          viewBox={geometry.viewBox}
          className="w-full h-full touch-none overflow-visible"
        >
          <defs>
            {/* Player 1 Cyan Fill Gradient */}
            <linearGradient id="p1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.75" />
            </linearGradient>

            {/* Player 2 Magenta Fill Gradient */}
            <linearGradient id="p2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c026d3" stopOpacity="0.75" />
            </linearGradient>

            {/* Cyan Glow Filter - userSpaceOnUse ensures horizontal lines (height 0) do not get clipped */}
            <filter id="cyanGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Magenta Glow Filter - userSpaceOnUse ensures horizontal lines (height 0) do not get clipped */}
            <filter id="magentaGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Triangles Layer (Fills & Scores) */}
          {geometry.triangles.map((tri) => {
            const owner = triangles[tri.id];
            const isP1 = owner === "P1";
            const isP2 = owner === "P2";

            return (
              <g key={tri.id}>
                <polygon
                  points={tri.points}
                  fill={isP1 ? "url(#p1Grad)" : isP2 ? "url(#p2Grad)" : "rgba(255,255,255,0.02)"}
                  stroke={isP1 ? "#22d3ee" : isP2 ? "#e879f9" : "rgba(255,255,255,0.06)"}
                  strokeWidth={owner ? "2" : "1"}
                  className="transition-all duration-500 ease-out"
                />

                {/* Owner Badge / Symbol inside completed triangle */}
                {owner && (
                  <g transform={`translate(${tri.cx}, ${tri.cy})`}>
                    <circle
                      r="13"
                      fill={isP1 ? "#0891b2" : "#c026d3"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="shadow-lg"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="900"
                      fontFamily="monospace"
                    >
                      {isP1 ? "P1" : "P2"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. Edges Layer (Lines & Touch Hitboxes) */}
          {geometry.edges.map((edge) => {
            const owner = lines[edge.id];
            const isDrawn = Boolean(owner);
            const isP1 = owner === "P1";
            const isP2 = owner === "P2";

            const isHovered = hoveredEdge === edge.id && isMyTurn && !isDrawn;

            const strokeColor = isP1
              ? "#06b6d4"
              : isP2
              ? "#d946ef"
              : isHovered
              ? (myPlayerId === "P1" ? "#67e8f9" : "#f0abfc")
              : "rgba(255,255,255,0.12)";

            return (
              <g key={edge.id}>
                {/* Thick Invisible Touch/Click Hitbox */}
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="transparent"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className={!isDrawn && isMyTurn ? "cursor-pointer" : "cursor-default"}
                  onMouseEnter={() => setHoveredEdge(edge.id)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() => handleEdgeClick(edge.id)}
                />

                {/* Visible Animated Line */}
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={strokeColor}
                  strokeWidth={isDrawn ? "6" : isHovered ? "5" : "2"}
                  strokeLinecap="round"
                  filter={isP1 ? "url(#cyanGlow)" : isP2 ? "url(#magentaGlow)" : undefined}
                  className="transition-all duration-300 pointer-events-none"
                  strokeDasharray={!isDrawn && !isHovered ? "4 4" : undefined}
                />
              </g>
            );
          })}

          {/* 3. Dots Layer (Lattice Vertices) */}
          {geometry.dots.map((dot) => (
            <g key={dot.id} transform={`translate(${dot.x}, ${dot.y})`} className="pointer-events-none">
              <circle
                r="7"
                fill="#0f172a"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
              />
              <circle
                r="3"
                fill="#ffffff"
              />
            </g>
          ))}
        </svg>

      </div>
    </div>
  );
}
