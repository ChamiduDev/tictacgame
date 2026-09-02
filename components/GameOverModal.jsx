// components/GameOverModal.jsx
"use client";

import { motion } from "framer-motion";
import { Trophy, Handshake, RotateCcw, Home, Frown } from "lucide-react";

const CONFETTI_EMOJIS = ["🎉", "✨", "🌟", "🎊", "💥", "⭐", "🏆", "🔥"];

function ConfettiPiece({ emoji, delay }) {
  const x = (Math.random() - 0.5) * 280;
  const rotation = (Math.random() - 0.5) * 720;

  return (
    <motion.span
      className="absolute text-3xl select-none pointer-events-none"
      style={{ left: "50%", top: "35%" }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
      animate={{
        x,
        y: -140 - Math.random() * 120,
        opacity: [1, 1, 0],
        rotate: rotation,
        scale: [0, 1.4, 1],
      }}
      transition={{ delay, duration: 1.8, ease: "easeOut" }}
    >
      {emoji}
    </motion.span>
  );
}

export default function GameOverModal({ winner, mySymbol, gridSize, onPlayAgain, onExit }) {
  const isWinner = winner === mySymbol;
  const isDraw = winner === "draw";

  const title = isDraw
    ? "Draw Game!"
    : isWinner
    ? "VICTORY!"
    : "DEFEAT";

  const subtitle = isDraw
    ? "Evenly matched battle!"
    : isWinner
    ? "Outstanding tactics! You dominated."
    : `${winner} won this round. Rematch?`;

  const theme = isDraw
    ? {
        bg: "from-amber-950/90 via-amber-900/80 to-[#060713]",
        border: "border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)]",
        iconBg: "bg-amber-500/20 border-amber-500/40 text-amber-400",
        btn: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold shadow-[0_4px_20px_rgba(245,158,11,0.4)]",
      }
    : isWinner
    ? {
        bg: "from-emerald-950/90 via-teal-900/80 to-[#060713]",
        border: "border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)]",
        iconBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
        btn: "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold shadow-[0_4px_20px_rgba(16,185,129,0.4)]",
      }
    : {
        bg: "from-rose-950/90 via-red-900/80 to-[#060713]",
        border: "border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.25)]",
        iconBg: "bg-rose-500/20 border-rose-500/40 text-rose-400",
        btn: "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold shadow-[0_4px_20px_rgba(244,63,94,0.4)]",
      };

  const icon = isDraw ? (
    <Handshake size={32} />
  ) : isWinner ? (
    <Trophy size={32} />
  ) : (
    <Frown size={32} />
  );

  const confettiEmojis = isWinner
    ? Array.from({ length: 12 }, (_, i) => ({
        emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
        delay: i * 0.08,
      }))
    : [];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal Card */}
      <motion.div
        className={`relative z-10 flex flex-col items-center gap-6 p-7 sm:p-9 rounded-2xl
          bg-gradient-to-b ${theme.bg} border ${theme.border}
          backdrop-blur-2xl max-w-sm sm:max-w-md w-full text-center overflow-hidden shadow-2xl`}
        initial={{ scale: 0.85, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
      >
        {/* Confetti particles */}
        {confettiEmojis.map((c, i) => (
          <ConfettiPiece key={i} emoji={c.emoji} delay={c.delay} />
        ))}

        {/* Icon Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 400 }}
          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border flex items-center justify-center ${theme.iconBg} shadow-md`}
        >
          {icon}
        </motion.div>

        {/* Header Text */}
        <div className="space-y-2 px-2">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-wider">{title}</h2>
          <p className="text-white/60 text-sm sm:text-base font-medium max-w-xs mx-auto leading-relaxed">{subtitle}</p>
        </div>

        {/* Board tag */}
        <div className="px-4 py-2 bg-white/[0.06] border border-white/12 rounded-xl text-xs font-bold text-white/80 font-mono tracking-wider">
          {gridSize}×{gridSize} MATCH FINISHED
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full mt-3">
          <button
            onClick={onPlayAgain}
            className={`btn-game-primary flex-1 text-sm sm:text-base ${
              isDraw
                ? "!bg-gradient-to-b !from-amber-500 !to-orange-600 !shadow-[0_6px_24px_rgba(245,158,11,0.45)] !text-black"
                : isWinner
                ? "!bg-gradient-to-b !from-emerald-500 !to-teal-600 !shadow-[0_6px_24px_rgba(16,185,129,0.45)] !text-black"
                : "btn-game-rose"
            }`}
          >
            <RotateCcw size={16} />
            <span>Play Again</span>
          </button>

          <button
            onClick={onExit}
            className="btn-game-secondary flex-1 text-sm sm:text-base"
          >
            <Home size={16} />
            <span>Exit Lobby</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}