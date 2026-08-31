// components/RoomCode.jsx
"use client";

import { useState } from "react";
import { Copy, Check, Share2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function RoomCode({ roomId }) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    const url = `${window.location.origin}/room/${roomId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Tic Tac Toe room!",
          text: `Join my Tic Tac Toe game with room code: ${roomId}`,
          url: url,
        });
        return;
      } catch {
        // Fallback to clipboard if share sheet dismissed/cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-1.5 text-violet-300/80 text-xs font-bold uppercase tracking-widest">
        <Sparkles size={13} className="text-violet-400" />
        <span>Lobby Access Code</span>
      </div>

      {/* Code Card */}
      <div className="w-full flex items-center justify-between bg-[#070817] border border-white/15 rounded-xl p-3 sm:p-4 shadow-inner">
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xl sm:text-2xl font-black tracking-widest text-white pl-1">
          {roomId.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="w-8 h-10 sm:w-9 sm:h-11 rounded-lg bg-white/[0.08] border border-white/12 flex items-center justify-center text-violet-300 shadow-sm font-mono"
            >
              {char}
            </motion.span>
          ))}
        </div>

        <button
          onClick={handleCopyCode}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            codeCopied
              ? "bg-emerald-500/25 border border-emerald-400/50 text-emerald-300"
              : "bg-violet-600/35 hover:bg-violet-600/50 border border-violet-400/40 text-violet-200"
          }`}
        >
          {codeCopied ? <Check size={15} /> : <Copy size={15} />}
          <span>{codeCopied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Share action button */}
      <button
        onClick={handleShareLink}
        className="btn-game-secondary w-full"
      >
        {linkCopied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} className="text-rose-400" />}
        <span>{linkCopied ? "Invite Link Copied!" : "Share Invite Link"}</span>
      </button>
    </div>
  );
}