// components/PlayerStatus.jsx
"use client";

import { Crown, CheckCircle2, Loader2 } from "lucide-react";

function PlayerCard({ symbol, connected, isCurrentTurn, isMe, label }) {
  const isX = symbol === "X";

  const theme = isX
    ? {
        bg: "from-violet-950/50 via-purple-900/30 to-slate-900/70",
        border: "border-violet-500/35",
        activeBorder: "border-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.4)] ring-1 ring-violet-400/50",
        text: "text-violet-400 font-display",
        boxBg: "bg-violet-500/20 border-violet-500/40 shadow-inner",
        badgeBg: "bg-violet-500/30 text-violet-200 border-violet-400/50",
        dot: "bg-violet-400",
      }
    : {
        bg: "from-rose-950/50 via-pink-900/30 to-slate-900/70",
        border: "border-rose-500/35",
        activeBorder: "border-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.4)] ring-1 ring-rose-400/50",
        text: "text-rose-400 font-display",
        boxBg: "bg-rose-500/20 border-rose-500/40 shadow-inner",
        badgeBg: "bg-rose-500/30 text-rose-200 border-rose-400/50",
        dot: "bg-rose-400",
      };

  return (
    <div
      className={`
        relative flex-1 flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-xl
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
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center font-black text-2xl sm:text-3xl flex-shrink-0 ${theme.boxBg} ${theme.text}`}>
          {symbol}
        </div>
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
              {isMe ? "You" : label}
            </span>
            {isMe && <Crown size={13} className="text-amber-400 flex-shrink-0" />}
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
        <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded border uppercase flex-shrink-0 ml-1.5 ${theme.badgeBg}`}>
          TURN
        </span>
      )}
    </div>
  );
}

export default function PlayerStatus({ players, currentTurn, mySymbol }) {
  return (
    <div className="w-full max-w-sm sm:max-w-md flex items-center gap-2.5 sm:gap-3.5 mx-auto">
      <PlayerCard
        symbol="X"
        connected={players?.X?.connected ?? false}
        isCurrentTurn={currentTurn === "X"}
        isMe={mySymbol === "X"}
        label="Host"
      />

      <div className="text-white/40 text-xs sm:text-sm font-mono font-black tracking-widest px-1">VS</div>

      <PlayerCard
        symbol="O"
        connected={players?.O?.connected ?? false}
        isCurrentTurn={currentTurn === "O"}
        isMe={mySymbol === "O"}
        label="Guest"
      />
    </div>
  );
}

