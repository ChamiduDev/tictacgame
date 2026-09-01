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
  Smile,
  Trophy,
  Sparkles,
  CheckCircle2,
  Swords,
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
      className={`absolute rounded-full blur-3xl opacity-[0.12] pointer-events-none ${className}`}
      animate={{ y: [0, -24, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Sheet({ children, onClose, title, icon: Icon, accentColor }) {
  const accent = {
    violet: "from-violet-600/25 via-purple-600/15 to-transparent border-violet-500/30 text-violet-200",
    rose: "from-rose-600/25 via-pink-600/15 to-transparent border-rose-500/30 text-rose-200",
    amber: "from-amber-600/25 via-orange-600/15 to-transparent border-amber-500/30 text-amber-200",
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
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Spacious, Centered Game Modal Card */}
      <motion.div
        className="relative z-10 w-full max-w-[min(94vw,470px)] mx-auto bg-[#0a0c1e]/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${accent[accentColor]} border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-wide font-display text-white">
                {title}
              </h2>
              <p className="text-white/50 text-xs mt-0.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Realtime Lobby Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 active:bg-white/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
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

function CreateTicTacToeSheet({ onClose }) {
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
        gameType: "tictactoe",
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
    <Sheet onClose={onClose} title="Create Tic Tac Toe" icon={Gamepad2} accentColor="violet">
      <div className="flex flex-col gap-5">
        <div>
          {/* Header Label */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-xs font-bold uppercase tracking-wider font-mono">
              SELECT ARENA SIZE
            </span>
            <span className="text-violet-300 text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20">
              {finalSize}×{finalSize} Arena
            </span>
          </div>

          {/* Grid Selection Cards */}
          <div className="grid grid-cols-2 gap-3">
            {GRID_OPTIONS.map(({ size, label, tag, desc }) => {
              const isActive = !useCustom && selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setUseCustom(false); }}
                  className={`flex flex-col text-left p-3.5 rounded-lg border transition-all duration-150 cursor-pointer relative overflow-hidden group
                    ${isActive
                      ? "border-violet-500/60 bg-violet-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-white/70"}`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-2xl font-black text-white font-mono tracking-tight">{label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isActive ? "text-violet-200 bg-violet-500/30" : "text-white/40 bg-white/5"}`}>
                      {tag}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white/50">{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Grid Size Selector */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setUseCustom(!useCustom)}
            className={`flex items-center justify-between text-xs font-bold px-3.5 py-3 rounded-lg border transition-all cursor-pointer
              ${useCustom
                ? "text-violet-300 bg-violet-500/15 border-violet-500/40"
                : "text-white/70 border-white/10 bg-white/[0.03] hover:text-white hover:border-white/20"}`}
          >
            <div className="flex items-center gap-2">
              <Hash size={15} className="text-violet-400" />
              <span>Custom Grid Size (N × N)</span>
            </div>
            <span className="text-xs text-white/40 font-mono font-bold">3 to 6</span>
          </button>

          <AnimatePresence>
            {useCustom && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 p-2 bg-[#07091d] border border-white/10 rounded-lg">
                  <input
                    type="number"
                    min={3}
                    max={6}
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="Enter 3, 4, 5, or 6"
                    className="w-full bg-transparent px-3 py-2 text-white placeholder-white/30 focus:outline-none text-center text-base font-bold tracking-widest font-mono"
                    autoFocus
                  />
                  <div className="flex items-center gap-1 pr-1">
                    {[3, 4, 5, 6].map((s) => (
                      <button
                        key={s}
                        onClick={() => setCustomSize(s.toString())}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-all cursor-pointer
                          ${parseInt(customSize) === s ? "bg-violet-600 text-white border-violet-400" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"}`}
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

        {/* Rule Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/10 rounded-lg text-xs">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider font-mono">VICTORY THRESHOLD</span>
            <span className="text-white/90 font-medium">
              Match target: <strong className="text-violet-300 font-bold">{getWinStreak(finalSize)} IN A ROW</strong> ({finalSize}×{finalSize} grid).
            </span>
          </div>
        </div>

        {error && (
          <div className="text-rose-400 text-xs font-medium text-center bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
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
              <span>Launch Tic Tac Toe Room</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </Sheet>
  );
}

function CreateRPSSheet({ onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const roomId = generateRoomCode();
      await set(roomRef(roomId), {
        gameType: "rps",
        status: "waiting",
        round: 1,
        players: { P1: { connected: true }, P2: { connected: false } },
        choices: { P1: null, P2: null },
        scores: { P1: 0, P2: 0 },
        roundResult: null,
        emoji: null,
        createdAt: Date.now(),
      });
      router.push(`/rps/${roomId}?player=P1`);
    } catch {
      setError("Failed to create RPS room. Check your Firebase config in .env.local");
      setLoading(false);
    }
  };

  return (
    <Sheet onClose={onClose} title="Create Rock Paper Scissors" icon={Swords} accentColor="amber">
      <div className="flex flex-col gap-5">
        {/* Banner info */}
        <div className="flex flex-col gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✊✋✌️</span>
            <div>
              <h3 className="text-base font-bold text-white font-display">2-Player Showdown</h3>
              <p className="text-white/50 text-xs mt-0.5">Simultaneous secret selection & live outcome reveals.</p>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2 text-xs text-white/80 font-medium">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span><strong>Secret Selection:</strong> Choices are locked until both players submit.</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span><strong>Live Scoreboard:</strong> Play endless rounds with automatic score tracking.</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span><strong>Live Reactions:</strong> Express yourself with real-time animated emojis.</span>
          </div>
        </div>

        {error && (
          <div className="text-rose-400 text-xs font-medium text-center bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Launch Room CTA Button */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-game-primary !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!from-amber-400 hover:!to-orange-500 !text-black font-extrabold w-full mt-1 group"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Launching RPS Room…</>
          ) : (
            <>
              <span>Launch RPS Arena Room</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
      
      // Determine if RPS room or Tic-Tac-Toe room
      if (room.gameType === "rps") {
        if (room.players?.P2?.connected) { setError("RPS Room is full! Both players are connected."); setLoading(false); return; }
        await update(roomRef(trimmed), { "players/P2/connected": true, status: "playing" });
        router.push(`/rps/${trimmed}?player=P2`);
      } else {
        if (room.status === "finished") { setError("This game has already ended."); setLoading(false); return; }
        if (room.players?.O?.connected) { setError("Room is full! Both players are connected."); setLoading(false); return; }
        await update(roomRef(trimmed), { "players/O/connected": true, status: "playing" });
        router.push(`/room/${trimmed}?symbol=O`);
      }
    } catch {
      setError("Failed to join room. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Sheet onClose={onClose} title="Join Game Room" icon={Users} accentColor="rose">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            Enter 6-Character Room Code
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="XXXXXX"
            className="w-full bg-[#080a1e] border border-white/20 rounded-lg px-4 py-3.5
              text-white placeholder-white/20 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400
              text-center text-3xl sm:text-4xl font-black tracking-[0.3em] font-mono uppercase
              transition-all duration-150"
            autoFocus
          />
        </div>

        {error && (
          <div className="text-rose-400 text-xs font-medium text-center bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        <p className="text-white/50 text-xs text-center font-medium leading-relaxed">
          Supports room codes for both <strong>Tic Tac Toe</strong> & <strong>Rock Paper Scissors Duo</strong>.
        </p>

        <button
          onClick={handleJoin}
          disabled={loading || code.length < 4}
          className="btn-game-primary btn-game-rose w-full mt-1"
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
    { icon: Zap, label: "Real-time sync", color: "text-violet-400", bg: "bg-violet-500/10" },
    { icon: Swords, label: "RPS & Tic-Tac-Toe", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: Smile, label: "Live reactions", color: "text-rose-400", bg: "bg-rose-500/10" },
    { icon: Trophy, label: "Live Scoreboard", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-game-grid px-4 py-10 sm:px-6 sm:py-16">
      {/* Glow Orbs */}
      <FloatingOrb className="w-[450px] h-[450px] bg-violet-600 top-[-15%] left-[-15%]" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-rose-600 bottom-[-15%] right-[-15%]" delay={2.5} />
      <FloatingOrb className="w-[300px] h-[300px] bg-amber-600 top-[40%] right-[10%]" delay={4.5} />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 text-center w-full max-w-sm sm:max-w-xl">

        {/* Header Badge & Title */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3.5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-violet-300 text-xs font-bold tracking-widest uppercase">
            <Sparkles size={12} className="text-amber-400" />
            <span>MULTIPLAYER GAME ARENA V2.5</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-display">
              <span className="text-white">DUO</span>
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent px-2">BATTLE</span>
              <span className="text-white">HUB</span>
            </h1>
            <p className="text-white/60 text-xs sm:text-sm font-medium max-w-sm mx-auto leading-relaxed">
              Play multiplayer Tic-Tac-Toe or challenge friends in fast-paced Rock Paper Scissors Duo!
            </p>
          </div>
        </motion.div>

        {/* Feature Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full"
        >
          {features.map(({ icon: Icon, label, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-lg border bg-[#0d0f26]/80 border-white/10 backdrop-blur-md shadow-sm"
            >
              <div className={`p-1.5 rounded-md ${bg}`}>
                <Icon size={15} className={color} />
              </div>
              <span className="text-white/80 text-xs font-semibold tracking-wide truncate">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Section Header */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-2.5 pt-1 my-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/50 font-mono">
            CHOOSE GAME MODE OR JOIN
          </span>
          <span className="text-[11px] text-violet-300 font-mono font-bold">2-Player Multiplayer</span>
        </div>

        {/* Game Mode Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
        >
          {/* Card 1: Tic Tac Toe */}
          <div className="flex flex-col text-left p-5 sm:p-6 rounded-xl border border-white/10 bg-[#0d0f26]/80 hover:border-violet-500/50 hover:bg-[#121535]/90 transition-all duration-200 group relative shadow-lg">
            {/* Header info */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-300 text-xl font-bold font-display">
                ❌⭕
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 uppercase font-mono">
                3x3 to 6x6
              </span>
            </div>
            
            <h3 className="text-base font-bold text-white font-display group-hover:text-violet-300 transition-colors">
              Tic Tac Toe Arena
            </h3>
            <p className="text-xs text-white/50 font-medium mt-1 mb-5 leading-relaxed">
              Classic and expanded grid tactical battle with custom win streaks.
            </p>

            {/* Inner padded button */}
            <div className="mt-auto pt-3 border-t border-white/10">
              <button
                onClick={() => setModal("create-tictactoe")}
                className="w-full py-2.5 px-3 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Gamepad2 size={15} /> Create Room
              </button>
            </div>
          </div>

          {/* Card 2: Rock Paper Scissors Duo */}
          <div className="flex flex-col text-left p-5 sm:p-6 rounded-xl border border-white/10 bg-[#0d0f26]/80 hover:border-amber-500/50 hover:bg-[#19142b]/90 transition-all duration-200 group relative shadow-lg">
            {/* Header info */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-300 text-lg">
                ✊✋✌️
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase font-mono">
                NEW MODE
              </span>
            </div>

            <h3 className="text-base font-bold text-white font-display group-hover:text-amber-300 transition-colors">
              Rock Paper Scissors Duo
            </h3>
            <p className="text-xs text-white/50 font-medium mt-1 mb-5 leading-relaxed">
              2-player simultaneous secret moves & instant reveal showdowns.
            </p>

            {/* Inner padded button */}
            <div className="mt-auto pt-3 border-t border-white/10">
              <button
                onClick={() => setModal("create-rps")}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Swords size={15} /> Create RPS Room
              </button>
            </div>
          </div>
        </motion.div>

        {/* PROMINENT JOIN ROOM CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full flex flex-col gap-2 pt-1"
        >
          <button
            onClick={() => setModal("join")}
            className="btn-game-primary btn-game-rose w-full text-sm sm:text-base tracking-wider shadow-lg"
          >
            <Users size={20} />
            <span>JOIN ROOM WITH CODE</span>
          </button>
          <span className="text-white/40 text-[11px] font-mono">
            Enter a 6-character room code to join an active Tic-Tac-Toe or RPS Duo match
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/30 text-xs tracking-wider font-mono pt-2"
        >
          Next.js · Firebase Realtime DB · Framer Motion
        </motion.p>
      </div>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {modal === "create-tictactoe" && <CreateTicTacToeSheet onClose={() => setModal(null)} />}
        {modal === "create-rps" && <CreateRPSSheet onClose={() => setModal(null)} />}
        {modal === "join" && <JoinGameSheet onClose={() => setModal(null)} />}
      </AnimatePresence>
    </main>
  );
}