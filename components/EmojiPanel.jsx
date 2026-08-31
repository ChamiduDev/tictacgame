// components/EmojiPanel.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";

const EMOJIS = ["😂", "😎", "😡", "😱", "🎉", "👍"];

export default function EmojiPanel({ onSendEmoji, incomingEmoji }) {
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  useEffect(() => {
    if (!incomingEmoji?.value || !incomingEmoji?.timestamp) return;

    const id = `${incomingEmoji.timestamp}-${Math.random()}`;
    const xPos = 15 + Math.random() * 70; // Stay safely within viewport padding

    setFloatingEmojis((prev) => [
      ...prev,
      { id, emoji: incomingEmoji.value, x: xPos },
    ]);

    const timer = setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 2500);

    return () => clearTimeout(timer);
  }, [incomingEmoji?.timestamp]);

  return (
    <>
      {/* Floating animated emoji overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map(({ id, emoji, x }) => (
            <motion.div
              key={id}
              className="absolute bottom-28 text-5xl sm:text-6xl select-none filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
              style={{ left: `${x}%` }}
              initial={{ y: 0, opacity: 1, scale: 0.4, rotate: Math.random() * 20 - 10 }}
              animate={{ y: -320, opacity: [1, 1, 0], scale: [0.4, 1.4, 1.2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: "easeOut" }}
            >
              {emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Compact game emote tray */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs sm:max-w-sm flex items-center justify-between gap-1 sm:gap-2 bg-[#0d0f22]/90 border border-white/12 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-xl shadow-lg"
      >
        <div className="hidden sm:flex items-center gap-1.5 text-white/40 text-[11px] font-bold uppercase tracking-wider pl-1 select-none">
          <Smile size={13} className="text-violet-400" />
          <span>React</span>
        </div>

        <div className="flex items-center justify-around w-full sm:w-auto gap-0.5 sm:gap-1.5">
          {EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              onClick={() => onSendEmoji(emoji)}
              whileHover={{ scale: 1.22, y: -2 }}
              whileTap={{ scale: 0.88 }}
              className="text-xl sm:text-2xl p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-150 cursor-pointer select-none touch-manipulation"
              title={`React with ${emoji}`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  );
}

