// app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { set } from "firebase/database";
import { roomRef } from "@/lib/firebase";
import { generateRoomCode, createEmptyBoard, getWinStreak } from "@/hooks/useGameLogic";
import {
  Gamepad2,
  Users,
  X,
  ArrowRight,
  Hash,
  Loader2,
  Zap,
  Globe,
  Smile,
  Trophy,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const GRID_OPTIONS = [
  { size: 3, label: "3×3", tag: "Classic", desc: "3 in a row" },
  { size: 4, label: "4×4", tag: "Advanced", desc: "4 in a row" },
  { size: 5, label: "5×5", tag: "Expert", desc: "4 in a row" },
  { size: 6, label: "6×6", tag: "Master", desc: "5 in a row" },
];

function FloatingOrb({ className, delay }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-[0.15] pointer-events-none ${className}`}
      animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Sheet({ children, onClose, title, icon: Icon, accentColor }) {
  const accent = {
    violet: "from-violet-600/35 via-purple-600/20 to-transparent border-violet-500/40 text-violet-200",
    rose: "from-rose-600/35 via-pink-600/20 to-transparent border-rose-500/40 text-rose-200",
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Spacious, Centered Game Modal Card */}
      <motion.div
        className="relative z-10 w-full max-w-[min(94vw,470px)] mx-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/30 via-[#0b0e24] to-[#060818] border border-violet-500/40 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] overflow-hidden my-auto flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 14 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        {/* Top Glow Ambient Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />

        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${accent[accentColor]} border-b border-white/12 px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Icon size={22} className="text-violet-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-100 to-violet-300">
                {title}
              </h2>
              <p className="text-violet-300/60 text-xs sm:text-sm mt-0.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Realtime Lobby Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 active:bg-white/20 border border-white/12 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[82vh]">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function CreateGameSheet({ onClose }) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(3);
  const [customSize, setCustomSize] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalSize = useCustom
    ? Math.min(6, Math.max(3, parseInt(customSize) || 3))
    : selectedSize;

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const roomId = generateRoomCode();
      const winStreak = getWinStreak(finalSize);
      await set(roomRef(roomId), {
        gridSize: finalSize,
        winStreak,
        board: createEmptyBoard(finalSize),
        currentTurn: "X",
        players: { X: { connected: true }, O: { connected: false } },
        status: "waiting",
        winner: null,
        winningCells: [],
        emoji: null,
        createdAt: Date.now(),
      });
      router.push(`/room/${roomId}?symbol=X`);
    } catch {
      setError("Failed to create room. Check your Firebase config in .env.local");
      setLoading(false);
    }
  };

  return (
    <Sheet onClose={onClose} title="Create Game" icon={Gamepad2} accentColor="violet">
      <div className="flex flex-col gap-6">
        <div>
          {/* Header Label */}
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-violet-300/80 text-xs font-extrabold uppercase tracking-widest font-mono">
              SELECT ARENA SIZE
            </span>
            <span className="text-violet-300 text-xs sm:text-sm font-bold font-mono px-3 py-1 rounded-lg bg-violet-500/20 border border-violet-400/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
              {finalSize}×{finalSize} Arena
            </span>
          </div>

          {/* Grid Selection Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
            {GRID_OPTIONS.map(({ size, label, tag, desc }) => {
              const isActive = !useCustom && selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setUseCustom(false); }}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group
                    ${isActive
                      ? "border-violet-400 bg-gradient-to-b from-violet-600/35 via-violet-900/30 to-[#0c0e2e] shadow-[0_0_24px_rgba(139,92,246,0.4)] text-violet-200"
                      : "border-white/12 bg-[#0c0f28] hover:bg-[#13173d] hover:border-white/25 text-white/70"}`}
                >
                  {/* Top Bevel Stroke for Active Card */}
                  {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-300 via-fuchsia-400 to-violet-300" />}

                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:scale-105 transition-transform">{label}</span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${isActive ? "text-violet-200 bg-violet-500/30 border-violet-400/50 shadow-sm" : "text-white/40 border-white/10 bg-white/5"}`}>
                      {tag}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white/60">{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Grid Size Selector */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setUseCustom(!useCustom)}
            className={`flex items-center justify-between text-xs sm:text-sm font-bold px-4 py-3.5 rounded-xl border transition-all cursor-pointer
              ${useCustom
                ? "text-violet-300 bg-violet-500/20 border-violet-400/60 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                : "text-white/70 border-white/12 bg-[#0c0f28] hover:text-white hover:border-white/25"}`}
          >
            <div className="flex items-center gap-2.5">
              <Hash size={16} className="text-violet-400" />
              <span>Custom Grid Size (N × N)</span>
            </div>
            <span className="text-xs text-white/50 font-mono font-bold">3 to 6</span>
          </button>

          <AnimatePresence>
            {useCustom && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-2 bg-[#07091d] border border-violet-500/40 rounded-xl">
                  <input
                    type="number"
                    min={3}
                    max={6}
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="Enter 3, 4, 5, or 6"
                    className="w-full bg-transparent px-3 py-2.5 text-white placeholder-white/30 focus:outline-none text-center text-lg font-bold tracking-widest font-mono"
                    autoFocus
                  />
                  <div className="flex items-center gap-1 pr-1">
                    {[3, 4, 5, 6].map((s) => (
                      <button
                        key={s}
                        onClick={() => setCustomSize(s.toString())}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer
                          ${parseInt(customSize) === s ? "bg-violet-600 text-white border-violet-400 shadow-sm" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"}`}
                      >
                        {s}x{s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Esports Rule Banner */}
        <div className="flex items-center gap-3.5 px-4 py-4 bg-gradient-to-r from-violet-950/40 via-purple-950/25 to-[#090b22] border border-violet-500/30 rounded-xl text-xs sm:text-sm shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest font-mono">VICTORY THRESHOLD</span>
            <span className="text-white/90 font-medium">
              Match target: <strong className="text-violet-300 font-extrabold">{getWinStreak(finalSize)} IN A ROW</strong> ({finalSize}×{finalSize} grid).
            </span>
          </div>
        </div>

        {error && (
          <div className="text-rose-400 text-xs sm:text-sm font-semibold text-center bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5">
            {error}
          </div>
        )}

        {/* Launch Room CTA Button */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-game-primary w-full mt-1 group"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Creating Room…</>
          ) : (
            <>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              <span>Launch Room</span>
            </>
          )}
        </button>
      </div>
    </Sheet>
  );
}

function JoinGameSheet({ onClose }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) { setError("Enter a valid room code"); return; }
    setLoading(true);
    setError("");
    try {
      const { get, update } = await import("firebase/database");
      const snapshot = await get(roomRef(trimmed));
      if (!snapshot.exists()) { setError("Room not found — check the code!"); setLoading(false); return; }
      const room = snapshot.val();
      if (room.status === "finished") { setError("This game has already ended."); setLoading(false); return; }
      if (room.players?.O?.connected) { setError("Room is full! Both players are connected."); setLoading(false); return; }
      await update(roomRef(trimmed), { "players/O/connected": true, status: "playing" });
      router.push(`/room/${trimmed}?symbol=O`);
    } catch {
      setError("Failed to join. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Sheet onClose={onClose} title="Join Game" icon={Users} accentColor="rose">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2.5">
            Enter 6-Character Room Code
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="XXXXXX"
            className="w-full bg-[#080a1e] border border-white/20 rounded-xl px-4 py-4
              text-white placeholder-white/20 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20
              text-center text-3xl sm:text-4xl font-black tracking-[0.35em] font-mono uppercase
              transition-all duration-200"
            autoFocus
          />
        </div>

        {error && (
          <div className="text-rose-400 text-xs sm:text-sm font-semibold text-center bg-rose-500/10 border border-rose-500/25 rounded-xl p-3">
            {error}
          </div>
        )}

        <p className="text-white/50 text-xs sm:text-sm text-center font-medium leading-relaxed">
          Ask the host player for their unique room code to connect instantly.
        </p>

        <button
          onClick={handleJoin}
          disabled={loading || code.length < 4}
          className="btn-game-primary btn-game-rose w-full mt-2"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Connecting…</>
          ) : (
            <><ArrowRight size={18} /> Join Room</>
          )}
        </button>
      </div>
    </Sheet>
  );
}

export default function HomePage() {
  const [modal, setModal] = useState(null);

  const features = [
    { icon: Zap, label: "Real-time sync", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { icon: Globe, label: "Any grid size", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { icon: Smile, label: "Live reactions", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { icon: Trophy, label: "Win detection", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-game-grid px-4 py-10 sm:px-6 sm:py-16">
      {/* Glow Orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-violet-600 top-[-15%] left-[-15%]" delay={0} />
      <FloatingOrb className="w-[450px] h-[450px] bg-rose-600 bottom-[-15%] right-[-15%]" delay={2.5} />
      <FloatingOrb className="w-[350px] h-[350px] bg-indigo-600 top-[40%] right-[10%]" delay={4.5} />

      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 text-center w-full max-w-sm sm:max-w-md">

        {/* Header Badge & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/35 text-violet-300 text-xs font-bold tracking-widest uppercase">
            <Sparkles size={13} className="text-violet-400" />
            <span>REALTIME ARENA V2.0</span>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none font-display">
              <span className="text-white">TIC</span>
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent px-1.5">TAC</span>
              <span className="text-white">TOE</span>
            </h1>
            <p className="text-white/60 text-sm sm:text-base font-medium max-w-xs mx-auto leading-relaxed">
              Real-time multiplayer battles with customizable grid sizes and live emoji reactions.
            </p>
          </div>
        </motion.div>

        {/* Feature Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 sm:gap-3.5 w-full"
        >
          {features.map(({ icon: Icon, label, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-xl border bg-[#0d0f26]/85 border-white/12 backdrop-blur-md shadow-sm transition-all hover:border-white/25"
            >
              <div className={`p-1.5 sm:p-2 rounded-lg border ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <span className="text-white/80 text-xs sm:text-sm font-bold tracking-wide truncate">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col gap-3.5 w-full"
        >
          {/* Create Game Button */}
          <button
            onClick={() => setModal("create")}
            className="btn-game-primary w-full"
          >
            <Gamepad2 size={20} />
            <span>Create Game</span>
          </button>

          {/* Join with Code Button */}
          <button
            onClick={() => setModal("join")}
            className="btn-game-secondary w-full"
          >
            <Users size={20} className="text-rose-400" />
            <span>Join with Code</span>
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/35 text-xs tracking-wider font-mono"
        >
          Next.js · Firebase · Framer Motion
        </motion.p>
      </div>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {modal === "create" && <CreateGameSheet onClose={() => setModal(null)} />}
        {modal === "join" && <JoinGameSheet onClose={() => setModal(null)} />}
      </AnimatePresence>
    </main>
  );
}