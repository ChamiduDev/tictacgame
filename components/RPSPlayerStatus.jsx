// components/RPSPlayerStatus.jsx
"use client";

import { Crown, CheckCircle2, Loader2, Lock, ShieldAlert } from "lucide-react";

function RPSPlayerCard({ playerId, label, connected, hasChosen, score, isMe, status }) {
  const isP1 = playerId === "P1";

  const theme = isP1
    ? {
        bg: "from-amber-950/40 via-orange-900/25 to-slate-900/80",
        border: "border-amber-500/35",
        activeBorder: "border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50",
        text: "text-amber-400 font-display",
        boxBg: "bg-amber-500/20 border-amber-500/40 shadow-inner",
        badgeBg: "bg-amber-500/30 text-amber-200 border-amber-400/50",
        dot: "bg-amber-400",
        avatar: "✊",
      }
    : {
        bg: "from-cyan-950/40 via-blue-900/25 to-slate-900/80",
        border: "border-cyan-500/35",
        activeBorder: "border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50",
        text: "text-cyan-400 font-display",
        boxBg: "bg-cyan-500/20 border-cyan-500/40 shadow-inner",
        badgeBg: "bg-cyan-500/30 text-cyan-200 border-cyan-400/50",
        dot: "bg-cyan-400",
        avatar: "✌️",
      };

  return (
    <div
      className={`
        relative flex-1 flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-xl
        bg-gradient-to-r ${theme.bg} border backdrop-blur-md transition-all duration-300
        ${connected ? (hasChosen ? theme.activeBorder : theme.border) : `${theme.border} opacity-75`}
      `}
    >
      {/* Player info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 ${theme.boxBg}`}>
          {theme.avatar}
        </div>
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
              {isMe ? "You" : label}
            </span>
            {isMe && <Crown size={13} className="text-amber-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold mt-0.5">
            {!connected ? (
              <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                <Loader2 size={11} className="animate-spin" /> Waiting…
              </span>
            ) : hasChosen ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <Lock size={11} /> Locked 🔒
              </span>
            ) : status === "revealed" ? (
              <span className="text-white/60 flex items-center gap-1">
                <CheckCircle2 size={11} /> Round Ended
              </span>
            ) : (
              <span className="text-violet-300 flex items-center gap-1 animate-pulse">
                <ShieldAlert size={11} /> Choosing…
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Score Pill */}
      <div className="flex flex-col items-end flex-shrink-0 pl-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">SCORE</span>
        <span className={`text-lg sm:text-xl font-black font-mono ${theme.text}`}>
          {score ?? 0}
        </span>
      </div>
    </div>
  );
}

export default function RPSPlayerStatus({ players, choices, scores, myPlayerId, status }) {
  return (
    <div className="w-full max-w-sm sm:max-w-md flex items-center gap-2.5 sm:gap-3.5 mx-auto">
      <RPSPlayerCard
        playerId="P1"
        label="Host (P1)"
        connected={players?.P1?.connected ?? false}
        hasChosen={Boolean(choices?.P1)}
        score={scores?.P1 ?? 0}
        isMe={myPlayerId === "P1"}
        status={status}
      />

      <div className="text-white/40 text-xs sm:text-sm font-mono font-black tracking-widest px-1">
        VS
      </div>

      <RPSPlayerCard
        playerId="P2"
        label="Guest (P2)"
        connected={players?.P2?.connected ?? false}
        hasChosen={Boolean(choices?.P2)}
        score={scores?.P2 ?? 0}
        isMe={myPlayerId === "P2"}
        status={status}
      />
    </div>
  );
}
