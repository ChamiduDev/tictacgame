// components/RPSBoard.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RPS_CHOICES } from "@/lib/rpsLogic";
import { Lock, Sparkles, Trophy, Handshake, ArrowRight, ShieldCheck } from "lucide-react";

export default function RPSBoard({
  choices,
  myChoice,
  myPlayerId,
  status,
  roundResult,
  round,
  onMakeChoice,
  onNextRound,
}) {
  const opponentId = myPlayerId === "P1" ? "P2" : "P1";
  const opponentChoice = choices?.[opponentId];
  const hasMyChoice = Boolean(myChoice);
  const hasOpponentChoice = Boolean(opponentChoice);

  const isRevealed = status === "revealed" && roundResult;

  return (
    <div className="w-full max-w-[min(92vw,480px)] mx-auto p-4 sm:p-6 bg-[#0a0c1e]/90 border border-white/15 rounded-2xl backdrop-blur-2xl shadow-[0_24px_60px_-8px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col justify-between gap-5 min-h-[380px]">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Round Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-xs sm:text-sm font-extrabold font-mono text-white tracking-wider">
            ROUND {round || 1} SHOWDOWN
          </span>
        </div>
        <div className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
          {isRevealed ? "Round Completed" : hasMyChoice && hasOpponentChoice ? "Revealing Result..." : "Secret Selection"}
        </div>
      </div>

      {/* Main Game State Views */}
      <AnimatePresence mode="wait">
        {isRevealed ? (
          /* REVEALED SHOWDOWN VIEW */
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-5 my-auto"
          >
            {/* Showdown Comparison */}
            <div className="flex items-center justify-around w-full py-3">
              {/* My Revealed Move */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-violet-300 uppercase tracking-widest font-mono">
                  You ({myPlayerId})
                </span>
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-violet-600/30 to-purple-900/40 border-2 border-violet-400 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                >
                  {RPS_CHOICES.find((c) => c.id === choices?.[myPlayerId])?.emoji}
                </motion.div>
                <span className="text-sm font-black text-white capitalize font-mono">
                  {choices?.[myPlayerId]}
                </span>
              </div>

              {/* VS Badge */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 animate-pulse">
                  VS
                </span>
              </div>

              {/* Opponent Revealed Move */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-widest font-mono">
                  Opponent ({opponentId})
                </span>
                <motion.div
                  initial={{ scale: 0, rotate: 30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20, delay: 0.1 }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-rose-600/30 to-pink-900/40 border-2 border-rose-400 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_30px_rgba(244,63,94,0.5)]"
                >
                  {RPS_CHOICES.find((c) => c.id === choices?.[opponentId])?.emoji}
                </motion.div>
                <span className="text-sm font-black text-white capitalize font-mono">
                  {choices?.[opponentId]}
                </span>
              </div>
            </div>

            {/* Winner Announcement Banner */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`w-full p-4 rounded-xl border text-center flex flex-col items-center gap-1 shadow-lg ${
                roundResult.winner === myPlayerId
                  ? "bg-gradient-to-r from-emerald-950/80 via-teal-900/70 to-emerald-950/80 border-emerald-500/50 text-emerald-200"
                  : roundResult.winner === "draw"
                  ? "bg-gradient-to-r from-amber-950/80 via-yellow-900/70 to-amber-950/80 border-amber-500/50 text-amber-200"
                  : "bg-gradient-to-r from-rose-950/80 via-red-900/70 to-rose-950/80 border-rose-500/50 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2 font-black text-lg sm:text-xl font-display tracking-wide">
                {roundResult.winner === myPlayerId ? (
                  <><Trophy size={20} className="text-emerald-400" /> YOU WON THIS ROUND!</>
                ) : roundResult.winner === "draw" ? (
                  <><Handshake size={20} className="text-amber-400" /> ROUND DRAW!</>
                ) : (
                  <>OPPONENT WON THIS ROUND</>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-white/80">
                {roundResult.explanation}
              </p>
            </motion.div>

            {/* Next Round CTA */}
            <button
              onClick={onNextRound}
              className="btn-game-primary w-full group mt-1"
            >
              <span>Next Round</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          /* SELECTION VIEW */
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 my-auto"
          >
            {/* Status indicator note */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className={hasMyChoice ? "text-emerald-400" : "text-amber-400"} />
                <span className="text-white/80">
                  {hasMyChoice ? "Your choice is locked! 🔒" : "Choose your weapon:"}
                </span>
              </div>
              <div className="text-white/50 text-[11px] font-mono">
                {hasOpponentChoice ? "Opponent locked 🔒" : "Opponent choosing…"}
              </div>
            </div>

            {/* Choice Buttons Grid */}
            <div className="grid grid-cols-3 gap-3">
              {RPS_CHOICES.map(({ id, label, emoji, color, border, glow, activeBg, desc }) => {
                const isSelected = myChoice === id;
                return (
                  <motion.button
                    key={id}
                    onClick={() => onMakeChoice(id)}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none touch-manipulation min-h-[140px] sm:min-h-[160px]
                      ${isSelected ? `${activeBg} ${glow} shadow-xl scale-[1.03]` : `bg-gradient-to-b ${color} ${border} hover:border-white/30 text-white/80`}
                    `}
                  >
                    {/* Top Selection Check Badge */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                        <Lock size={10} /> Locked
                      </span>
                    )}

                    <span className="text-4xl sm:text-5xl my-auto drop-shadow-md transition-transform group-hover:scale-110">
                      {emoji}
                    </span>

                    <div className="flex flex-col items-center gap-0.5 mt-2">
                      <span className="text-sm sm:text-base font-black font-display tracking-wider text-white">
                        {label}
                      </span>
                      <span className="text-[10px] font-semibold text-white/50 text-center">
                        {desc}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Waiting for opponent prompt */}
            {hasMyChoice && !hasOpponentChoice && (
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-300 animate-pulse">
                <Lock size={14} /> Waiting for opponent to locked in their move…
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
