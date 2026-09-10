// components/TrianglesPlayerStatus.jsx
"use client";

import { Crown, CheckCircle2, Loader2, Trophy, Sparkles } from "lucide-react";

function PlayerCard({ playerId, connected, isCurrentTurn, isMe, label, score, isWinner }) {
  const isP1 = playerId === "P1";

  const theme = isP1
    ? {
        bg: "from-cyan-950/50 via-teal-900/30 to-slate-900/70",
        border: "border-cyan-500/35",
        activeBorder: "border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50",
        text: "text-cyan-400 font-display",
        scoreBg: "bg-cyan-500/20 border-cyan-500/40 text-cyan-200",
        badgeBg: "bg-cyan-500/30 text-cyan-200 border-cyan-400/50",
        dot: "bg-cyan-400",
        labelColor: "text-cyan-300",
      }
    : {
        bg: "from-fuchsia-950/50 via-pink-900/30 to-slate-900/70",
        border: "border-fuchsia-500/35",
        activeBorder: "border-fuchsia-400 shadow-[0_0_24px_rgba(217,70,239,0.4)] ring-1 ring-fuchsia-400/50",
        text: "text-fuchsia-400 font-display",
        scoreBg: "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-200",
        badgeBg: "bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400/50",
        dot: "bg-fuchsia-400",
        labelColor: "text-fuchsia-300",
      };

  return (
    <div
      className={`
        relative flex-1 flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl
        bg-gradient-to-r ${theme.bg} border backdrop-blur-md transition-all duration-300
        ${isCurrentTurn ? theme.activeBorder : `${theme.border} opacity-85`}
      `}
    >
      {/* Active Turn Indicator Pulse */}
      {isCurrentTurn && (
        <span className="absolute -top-1.5 left-4 flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.dot}`} />
          <span className={`relative inline-flex rounded-full h-3 w-3 ${theme.dot}`} />
        </span>
      )}

      {/* Symbol Box & Info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center font-black text-xl sm:text-2xl flex-shrink-0 font-mono shadow-md ${theme.scoreBg}`}>
          {score}
        </div>
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
              {isMe ? "You" : label}
            </span>
            {isMe && <Crown size={13} className="text-amber-400 flex-shrink-0" />}
            {isWinner && <Trophy size={13} className="text-amber-400 flex-shrink-0 animate-bounce" />}
          </div>
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold mt-0.5">
            {connected ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={11} /> Ready
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                <Loader2 size={11} className="animate-spin" /> Waiting…
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Turn Badge */}
      {isCurrentTurn && (
        <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md border uppercase flex-shrink-0 ml-2 ${theme.badgeBg}`}>
          TURN
        </span>
      )}
    </div>
  );
}

export default function TrianglesPlayerStatus({ players, currentTurn, myPlayerId, scores, winner }) {
  return (
    <div className="w-full max-w-sm sm:max-w-md flex items-center gap-2.5 sm:gap-3.5 mx-auto">
      <PlayerCard
        playerId="P1"
        connected={players?.P1?.connected ?? false}
        isCurrentTurn={currentTurn === "P1"}
        isMe={myPlayerId === "P1"}
        label="Host (Cyan)"
        score={scores?.P1 ?? 0}
        isWinner={winner === "P1"}
      />

      <div className="text-white/40 text-xs sm:text-sm font-mono font-black tracking-widest px-1 flex flex-col items-center">
        <span>VS</span>
      </div>

      <PlayerCard
        playerId="P2"
        connected={players?.P2?.connected ?? false}
        isCurrentTurn={currentTurn === "P2"}
        isMe={myPlayerId === "P2"}
        label="Guest (Magenta)"
        score={scores?.P2 ?? 0}
        isWinner={winner === "P2"}
      />
    </div>
  );
}
