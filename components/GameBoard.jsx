// components/GameBoard.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

const SYMBOL_COLORS = {
  X: "text-violet-400 font-display",
  O: "text-rose-400 font-display",
};

const SYMBOL_SHADOWS = {
  X: "drop-shadow-[0_0_16px_rgba(167,139,250,0.85)]",
  O: "drop-shadow-[0_0_16px_rgba(251,113,133,0.85)]",
};

export default function GameBoard({
  board = [],
  moves = {},
  gridSize = 3,
  winningCells = [],
  currentTurn,
  mySymbol,
  gameStatus,
  onCellClick,
}) {
  const isMyTurn = currentTurn === mySymbol;
  const canClick = isMyTurn && gameStatus === "playing";

  // Calculate cell font size and corner radius adaptively
  const getCellStyles = () => {
    if (gridSize <= 3) return { fontSize: "text-4xl sm:text-5xl", radius: "rounded-xl" };
    if (gridSize <= 4) return { fontSize: "text-3xl sm:text-4xl", radius: "rounded-xl" };
    if (gridSize <= 5) return { fontSize: "text-2xl sm:text-3xl", radius: "rounded-lg" };
    return { fontSize: "text-lg sm:text-2xl", radius: "rounded-lg" };
  };

  const cellStyle = getCellStyles();

  return (
    <div className="w-full max-w-[min(90vw,460px)] mx-auto p-5 sm:p-7 bg-[#0a0c1e]/90 border border-white/15 rounded-2xl backdrop-blur-2xl shadow-[0_20px_50px_-8px_rgba(0,0,0,0.85)] relative">
      {/* Outer Glow Ring when it's user turn */}
      {canClick && (
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500/25 via-fuchsia-500/15 to-rose-500/25 blur-sm pointer-events-none -z-10 animate-pulse" />
      )}

      <div
        className="w-full grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: gridSize <= 3 ? "12px" : gridSize <= 4 ? "10px" : gridSize <= 5 ? "8px" : "6px",
        }}
      >
        <AnimatePresence>
          {(board || []).map((cell, index) => {
            const isWinning = winningCells.includes(index);
            const isOldest =
              gridSize === 3 &&
              cell !== "" &&
              moves?.[cell]?.length >= 3 &&
              moves[cell][0] === index;

            const row = Math.floor(index / gridSize);
            const col = index % gridSize;

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: (row * gridSize + col) * 0.015,
                  type: "spring",
                  stiffness: 380,
                  damping: 24,
                }}
                onClick={() => canClick && !cell && onCellClick(index)}
                className={`
                  relative aspect-square w-full flex items-center justify-center
                  font-black select-none transition-all duration-150
                  touch-manipulation overflow-hidden ${cellStyle.radius}
                  ${isWinning
                    ? "bg-gradient-to-br from-amber-500/35 via-orange-500/30 to-amber-600/35 border-2 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.6)] z-10"
                    : isOldest
                    ? "bg-amber-500/10 border-2 border-dashed border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    : "bg-white/[0.04] border border-white/10 hover:bg-white/[0.09] hover:border-white/20 active:bg-white/[0.14]"
                  }
                  ${canClick && !cell ? "cursor-pointer hover:border-violet-400/50 hover:bg-violet-500/10 active:scale-[0.95]" : "cursor-default"}
                `}
                whileHover={canClick && !cell ? { scale: 1.02 } : {}}
                whileTap={canClick && !cell ? { scale: 0.95 } : {}}
              >
                {/* Cell Inner Bevel Shadow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

                {/* Oldest Mark Vanish Tag */}
                {isOldest && !isWinning && (
                  <span className="absolute top-1 right-1 text-[9px] font-mono font-bold text-amber-300 uppercase px-1 rounded bg-amber-500/30 border border-amber-400/40 z-10">
                    Fading
                  </span>
                )}

                {/* Touch / Hover preview ghost symbol */}
                {canClick && !cell && (
                  <span
                    className={`absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-25 transition-opacity duration-150 ${SYMBOL_COLORS[mySymbol]} ${cellStyle.fontSize}`}
                    aria-hidden="true"
                  >
                    {mySymbol}
                  </span>
                )}

                {/* Placed symbol */}
                <AnimatePresence>
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: isOldest ? 0.5 : 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 22 }}
                      className={`${SYMBOL_COLORS[cell]} ${SYMBOL_SHADOWS[cell]} ${cellStyle.fontSize} ${
                        isWinning ? "animate-bounce" : isOldest ? "animate-pulse opacity-50" : ""
                      }`}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Winning cell shimmer overlay */}
                {isWinning && (
                  <motion.div
                    className="absolute inset-0 bg-amber-400/15 pointer-events-none"
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

