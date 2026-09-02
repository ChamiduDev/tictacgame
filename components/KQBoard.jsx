// components/KQBoard.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PIECE_TYPES, DEFAULT_GRID_SIZE, TOTAL_FLEET_PIECES, generateRandomPlacement } from "@/lib/kqLogic";
import { Shield, Sparkles, Shuffle, CheckCircle2, Eye, EyeOff, Target, Zap, Swords, Play } from "lucide-react";

export default function KQBoard({
  mode = "placement", // "placement" | "battle"
  myPlayerId = "P1",
  myPlacement = {},
  opponentAttacks = {}, // attacks done by opponent against my board
  myAttacks = {}, // attacks done by me against opponent's board
  myScores = 0,
  opponentScores = 0,
  currentTurn,
  isBonusTurn,
  isReady = false,
  onUpdatePlacement,
  onConfirmReady,
  onAttackCell,
}) {
  const [selectedPieceId, setSelectedPieceId] = useState("KING");
  const [activeTab, setActiveTab] = useState("attack"); // "attack" | "defend"
  const [slashingCell, setSlashingCell] = useState(null);

  const isMyTurn = currentTurn === myPlayerId;
  const totalCells = DEFAULT_GRID_SIZE * DEFAULT_GRID_SIZE;

  // Calculate placed count for each piece type
  const getPlacedCounts = () => {
    const counts = { KING: 0, QUEEN: 0, COMMANDER: 0, ARCHER: 0, SOLDIER: 0 };
    Object.values(myPlacement || {}).forEach((pieceId) => {
      if (counts[pieceId] !== undefined) counts[pieceId]++;
    });
    return counts;
  };

  const placedCounts = getPlacedCounts();
  const currentTotalPlaced = Object.keys(myPlacement || {}).length;

  const handleCellPlacementClick = (cellIdx) => {
    if (isReady) return;
    const currentOnCell = myPlacement[cellIdx];

    // If clicking cell that already contains selected piece, remove it
    if (currentOnCell === selectedPieceId) {
      const updated = { ...myPlacement };
      delete updated[cellIdx];
      onUpdatePlacement(updated);
      return;
    }

    const pieceConfig = PIECE_TYPES[selectedPieceId];
    const placed = placedCounts[selectedPieceId] || 0;

    // STRICT LIMIT ENFORCEMENT: Block placing more than allowed limit
    if (placed >= pieceConfig.count) {
      return;
    }

    const updated = { ...myPlacement, [cellIdx]: selectedPieceId };
    onUpdatePlacement(updated);

    // Auto-advance selection to next unfulfilled piece type
    if (placed + 1 >= pieceConfig.count) {
      const nextAvailable = Object.values(PIECE_TYPES).find(
        (p) => p.id !== selectedPieceId && (placedCounts[p.id] || 0) < p.count
      );
      if (nextAvailable) {
        setSelectedPieceId(nextAvailable.id);
      }
    }
  };

  const handleRandomize = () => {
    if (isReady) return;
    const randomMap = generateRandomPlacement(DEFAULT_GRID_SIZE);
    onUpdatePlacement(randomMap);
  };

  const isPlacementComplete = () => {
    return currentTotalPlaced === TOTAL_FLEET_PIECES; // 10 pieces
  };

  const handleAttackClick = (cellIdx) => {
    if (!isMyTurn || myAttacks[cellIdx] !== undefined) return;
    setSlashingCell(cellIdx);
    setTimeout(() => setSlashingCell(null), 600);
    onAttackCell(cellIdx);
  };

  // --------------------------------------------------------------------------
  // RENDER PLACEMENT MODE
  // --------------------------------------------------------------------------
  if (mode === "placement") {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4.5 p-5 sm:p-7 bg-[#0a0c1e]/95 border border-white/15 rounded-2xl backdrop-blur-2xl shadow-2xl">
        {/* Placement Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Shield size={20} className="text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Character Fleet Setup</h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
            Placed: {currentTotalPlaced} / {TOTAL_FLEET_PIECES}
          </span>
        </div>

        {/* Piece Selector Tray */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#060819] p-2.5 rounded-xl border border-white/10">
          {Object.values(PIECE_TYPES).map((piece) => {
            const placed = placedCounts[piece.id] || 0;
            const isFull = placed >= piece.count;
            const isSelected = selectedPieceId === piece.id;

            return (
              <button
                key={piece.id}
                onClick={() => !isFull && setSelectedPieceId(piece.id)}
                disabled={isReady || (isFull && !isSelected)}
                className={`
                  flex flex-col items-center justify-between p-2 rounded-xl border transition-all relative
                  ${
                    isSelected
                      ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-md ring-1 ring-amber-400/50 cursor-pointer"
                      : isFull
                      ? "border-white/5 bg-white/[0.01] text-white/30 cursor-not-allowed opacity-50"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 cursor-pointer"
                  }
                `}
              >
                <span className="text-2xl sm:text-3xl">{piece.emoji}</span>
                <span className="text-[10px] font-bold font-mono text-white/90 mt-1">{piece.score}pt</span>
                <span
                  className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md mt-1 ${
                    isFull
                      ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-black"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {isFull ? `Max (${placed}/${piece.count})` : `${placed}/${piece.count}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* 8x8 Placement Grid */}
        <div className="grid grid-cols-8 gap-1 sm:gap-1.5 w-full aspect-square bg-[#060819] p-2 rounded-xl border border-white/12 shadow-inner">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const pieceIdOnCell = myPlacement[idx];
            const pieceConfig = pieceIdOnCell ? PIECE_TYPES[pieceIdOnCell] : null;

            return (
              <button
                key={idx}
                onClick={() => handleCellPlacementClick(idx)}
                disabled={isReady}
                className={`
                  aspect-square rounded-lg border flex items-center justify-center text-lg sm:text-2xl transition-all relative
                  ${
                    pieceConfig
                      ? `${pieceConfig.bg} text-white shadow-sm scale-[0.98]`
                      : "bg-white/[0.02] border-white/8 hover:bg-white/[0.08] hover:border-white/20"
                  }
                `}
              >
                {pieceConfig ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {pieceConfig.emoji}
                  </motion.span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Placement Action Controls with Start Game Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleRandomize}
            disabled={isReady}
            className="btn-game-secondary flex-1 !min-h-[2.875rem] text-xs font-bold"
          >
            <Shuffle size={16} /> Randomize Setup
          </button>

          <button
            onClick={onConfirmReady}
            disabled={isReady || !isPlacementComplete()}
            className={`btn-game-primary btn-game-amber flex-1 !min-h-[2.875rem] text-xs font-bold ${
              isReady ? "!bg-emerald-600 !text-white" : ""
            }`}
          >
            {isReady ? (
              <><CheckCircle2 size={16} className="text-emerald-300" /> Waiting for Opponent… 🔒</>
            ) : (
              <><Play size={16} /> Start Game</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER BATTLE MODE
  // --------------------------------------------------------------------------
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4 p-5 sm:p-7 bg-[#0a0c1e]/95 border border-white/15 rounded-2xl backdrop-blur-2xl shadow-2xl">
      {/* Mode Toggle Tabs */}
      <div className="flex items-center justify-between bg-[#060819] p-1.5 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveTab("attack")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "attack"
              ? "bg-amber-500/25 border border-amber-400/40 text-amber-300 shadow-sm"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Target size={15} /> Attack Enemy Grid
        </button>
        <button
          onClick={() => setActiveTab("defend")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "defend"
              ? "bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 shadow-sm"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Shield size={15} /> Your Defense Grid
        </button>
      </div>

      {/* Tab 1: ATTACK ENEMY GRID */}
      {activeTab === "attack" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-1 font-semibold text-white/70">
            <span className="flex items-center gap-1.5">
              <EyeOff size={14} className="text-amber-400" />
              <span>Click cells to attack & capture hidden characters</span>
            </span>
            {isBonusTurn && isMyTurn && (
              <span className="text-amber-400 font-bold font-mono flex items-center gap-1 animate-pulse">
                <Zap size={13} /> Bonus Turn!
              </span>
            )}
          </div>

          {/* 8x8 Attack Grid */}
          <div className="grid grid-cols-8 gap-1 sm:gap-1.5 w-full aspect-square bg-[#060819] p-2 rounded-xl border border-white/12 shadow-inner">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const attackInfo = myAttacks[idx];
              const isAttacked = attackInfo !== undefined;
              const isHit = attackInfo?.hit === true;
              const hitPieceConfig = isHit && attackInfo?.pieceId ? PIECE_TYPES[attackInfo.pieceId] : null;

              const canClickCell = isMyTurn && !isAttacked;
              const isSlashingThisCell = slashingCell === idx;

              return (
                <button
                  key={idx}
                  onClick={() => canClickCell && handleAttackClick(idx)}
                  disabled={!canClickCell}
                  className={`
                    aspect-square rounded-lg border flex flex-col items-center justify-center text-lg sm:text-2xl transition-all relative overflow-hidden
                    ${
                      isHit
                        ? "bg-gradient-to-br from-amber-500/35 via-orange-500/30 to-amber-600/35 border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.5)] z-10"
                        : isAttacked
                        ? "bg-white/[0.02] border-white/8 opacity-60 text-white/30"
                        : canClickCell
                        ? "bg-white/[0.04] border-white/10 hover:bg-amber-500/15 hover:border-amber-400/50 cursor-pointer active:scale-95"
                        : "bg-white/[0.03] border-white/8 cursor-default"
                    }
                  `}
                >
                  {/* Sword Slash Animation */}
                  <AnimatePresence>
                    {isSlashingThisCell && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1.4, rotate: 45 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,1)]"
                      >
                        <Swords size={28} className="stroke-[3]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isHit ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <span>{hitPieceConfig?.emoji || "💥"}</span>
                      {attackInfo?.score && (
                        <span className="text-[9px] font-black font-mono text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-400/50 mt-0.5">
                          +{attackInfo.score}
                        </span>
                      )}
                    </motion.div>
                  ) : isAttacked ? (
                    <span className="text-xs text-white/30 font-mono">💧</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: YOUR DEFENSE GRID */}
      {activeTab === "defend" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-1 font-semibold text-white/70">
            <span className="flex items-center gap-1.5">
              <Eye size={14} className="text-indigo-400" />
              <span>Inspect your piece placements & incoming opponent attacks</span>
            </span>
          </div>

          {/* 8x8 Defense Grid */}
          <div className="grid grid-cols-8 gap-1 sm:gap-1.5 w-full aspect-square bg-[#060819] p-2 rounded-xl border border-white/12 shadow-inner">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const myPieceId = myPlacement[idx];
              const pieceConfig = myPieceId ? PIECE_TYPES[myPieceId] : null;

              const opponentAttack = opponentAttacks[idx];
              const isOpponentHit = opponentAttack?.hit === true;
              const isOpponentMiss = opponentAttack && !isOpponentHit;

              return (
                <div
                  key={idx}
                  className={`
                    aspect-square rounded-lg border flex flex-col items-center justify-center text-lg sm:text-2xl transition-all relative overflow-hidden
                    ${
                      isOpponentHit
                        ? "bg-rose-500/35 border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.5)] z-10"
                        : pieceConfig
                        ? `${pieceConfig.bg} text-white`
                        : "bg-white/[0.02] border-white/8"
                    }
                  `}
                >
                  {pieceConfig ? (
                    <span className={isOpponentHit ? "line-through opacity-70" : ""}>
                      {pieceConfig.emoji}
                    </span>
                  ) : isOpponentMiss ? (
                    <span className="text-xs text-cyan-400/50 font-mono">💧</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
