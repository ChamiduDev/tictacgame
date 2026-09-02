// components/KQPlayerStatus.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Zap, ShieldAlert, CheckCircle2, Loader2, Trophy } from "lucide-react";
import { TARGET_SCORE } from "@/lib/kqLogic";

export default function KQPlayerStatus({
  players,
  scores,
  currentTurn,
  myPlayerId,
  status,
  isBonusTurn,
  ready,
}) {
  const p1Score = scores?.P1 || 0;
  const p2Score = scores?.P2 || 0;

  const p1Progress = Math.min(100, (p1Score / TARGET_SCORE) * 100);
  const p2Progress = Math.min(100, (p2Score / TARGET_SCORE) * 100);

  const isP1Turn = currentTurn === "P1";
  const isMyTurn = currentTurn === myPlayerId;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
      {/* Top Players Score HUD */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* P1 HUD Card */}
        <div
          className={`
            relative p-3.5 sm:p-4 rounded-xl border backdrop-blur-xl transition-all duration-300 flex flex-col gap-2.5
            ${
              isP1Turn && status === "playing"
                ? "bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900/90 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40"
                : "bg-gradient-to-r from-amber-950/30 to-slate-900/70 border-amber-500/20 opacity-85"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                👑
              </div>
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                    {myPlayerId === "P1" ? "You (P1)" : "Host (P1)"}
                  </span>
                  {myPlayerId === "P1" && <Crown size={13} className="text-amber-400 flex-shrink-0" />}
                </div>
                <span className="text-[11px] font-semibold text-amber-300/80 mt-0.5">
                  {status === "placement"
                    ? ready?.P1 ? "Placement Locked 🔒" : "Positioning Pieces…"
                    : isP1Turn ? "Active Attacker" : "Defending"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0 pl-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">SCORE</span>
              <span className="text-lg sm:text-2xl font-black font-mono text-amber-400">{p1Score}</span>
            </div>
          </div>

          {/* Progress Bar towards 200 pts */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${p1Progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* P2 HUD Card */}
        <div
          className={`
            relative p-3.5 sm:p-4 rounded-xl border backdrop-blur-xl transition-all duration-300 flex flex-col gap-2.5
            ${
              !isP1Turn && status === "playing"
                ? "bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900/90 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/40"
                : "bg-gradient-to-r from-cyan-950/30 to-slate-900/70 border-cyan-500/20 opacity-85"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                👸
              </div>
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                    {myPlayerId === "P2" ? "You (P2)" : "Guest (P2)"}
                  </span>
                  {myPlayerId === "P2" && <Crown size={13} className="text-cyan-400 flex-shrink-0" />}
                </div>
                <span className="text-[11px] font-semibold text-cyan-300/80 mt-0.5">
                  {status === "placement"
                    ? ready?.P2 ? "Placement Locked 🔒" : "Positioning Pieces…"
                    : !isP1Turn ? "Active Attacker" : "Defending"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0 pl-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70">SCORE</span>
              <span className="text-lg sm:text-2xl font-black font-mono text-cyan-400">{p2Score}</span>
            </div>
          </div>

          {/* Progress Bar towards 200 pts */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${p2Progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Bonus Turn Alert Banner */}
      <AnimatePresence>
        {status === "playing" && isBonusTurn && isMyTurn && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -6 }}
            className="w-full bg-gradient-to-r from-amber-500/25 via-orange-500/30 to-amber-500/25 border-2 border-amber-400 rounded-xl px-4 py-2 flex items-center justify-center gap-2 text-amber-200 text-xs sm:text-sm font-extrabold font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse"
          >
            <Zap size={16} className="text-amber-300 fill-amber-300" />
            <span>⚡ BONUS TURN UNLOCKED! ATTACK AGAIN!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
