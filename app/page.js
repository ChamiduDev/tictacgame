// app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { set, get, update } from "firebase/database";
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
  Trophy,
  Smile,
  Sparkles,
  CheckCircle2,
  Swords,
  ShieldCheck,
  Play,
  Grid,
  Circle,
  Flame,
  Globe2,
} from "lucide-react";

const GRID_OPTIONS = [
  { size: 3, label: "3×3", tag: "Classic", desc: "3 in a row to win" },
  { size: 4, label: "4×4", tag: "Advanced", desc: "4 in a row to win" },
  { size: 5, label: "5×5", tag: "Expert", desc: "4 in a row to win" },
  { size: 6, label: "6×6", tag: "Master", desc: "5 in a row to win" },
];

function FloatingOrb({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-15 pointer-events-none ${className}`}
      animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function ModalSheet({ children, onClose, title, subtitle, icon: Icon, accentColor = "indigo" }) {
  const borderAccents = {
    indigo: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
    amber: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    rose: "border-rose-500/30 text-rose-400 bg-rose-500/10",
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

      {/* Modal Dialog Card using game-panel styling & generous inner padding */}
      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto game-panel !p-6 sm:!p-8 border border-white/15 shadow-2xl my-auto flex flex-col gap-6 sm:gap-7"
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        {/* Header inside the padded main card background */}
        <div className="flex items-center justify-between pb-5 sm:pb-6 border-b border-white/10 px-1">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-md ${borderAccents[accentColor]}`}>
              <Icon size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-white/50 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer flex-shrink-0 ml-3"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body with generous inner spacing from card edges */}
        <div className="max-h-[75vh] overflow-y-auto px-2 sm:px-3 py-1">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function CreateTicTacToeModal({ onClose }) {
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
    <ModalSheet
      onClose={onClose}
      title="Create Tic Tac Toe"
      subtitle="Setup grid size and match rules"
      icon={Gamepad2}
      accentColor="indigo"
    >
      <div className="flex flex-col gap-6 sm:gap-7">
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Select Grid Size</span>
            <span className="text-indigo-300 text-xs font-mono font-bold px-3 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30">
              {finalSize}×{finalSize} Grid
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {GRID_OPTIONS.map(({ size, label, tag, desc }) => {
              const isActive = !useCustom && selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setUseCustom(false); }}
                  className={`flex flex-col p-4 sm:p-5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? "border-indigo-500 bg-indigo-500/20 text-white shadow-md shadow-indigo-500/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/70 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xl font-bold font-mono text-white">{label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isActive ? "bg-indigo-500/30 text-indigo-200" : "bg-white/10 text-white/50"}`}>
                      {tag}
                    </span>
                  </div>
                  <span className="text-xs text-white/50">{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Grid Toggle */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setUseCustom(!useCustom)}
            className={`flex items-center justify-between text-xs font-semibold px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${
              useCustom
                ? "text-indigo-300 bg-indigo-500/15 border-indigo-500/40"
                : "text-white/70 border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Hash size={16} className="text-indigo-400" />
              <span>Custom Grid (3×3 to 6×6)</span>
            </div>
            <span className="text-xs text-white/40 font-mono">Select</span>
          </button>

          {useCustom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="flex items-center gap-2.5 p-3 bg-[#060819] border border-white/10 rounded-xl"
            >
              <input
                type="number"
                min={3}
                max={6}
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="Size"
                className="w-full bg-transparent px-3 py-2 text-white placeholder-white/30 focus:outline-none text-center font-bold font-mono text-base"
                autoFocus
              />
              <div className="flex items-center gap-1.5">
                {[3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    onClick={() => setCustomSize(s.toString())}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      parseInt(customSize) === s ? "bg-indigo-600 text-white border-indigo-400" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Victory Condition Info */}
        <div className="flex items-center gap-3.5 p-4.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs sm:text-sm">
          <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
          <span className="text-white/80">
            Win condition: <strong className="text-indigo-300 font-bold">{getWinStreak(finalSize)} IN A ROW</strong> on a {finalSize}×{finalSize} board.
          </span>
        </div>

        {error && (
          <div className="text-rose-400 text-xs sm:text-sm font-medium text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-game-primary w-full !min-h-[3.375rem] !text-sm sm:!text-base font-bold"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating Room…</>
            ) : (
              <>Create & Launch Room <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </ModalSheet>
  );
}

function CreateRPSModal({ onClose }) {
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
    <ModalSheet
      onClose={onClose}
      title="Create Rock Paper Scissors"
      subtitle="2-Player head-to-head showdown"
      icon={Swords}
      accentColor="amber"
    >
      <div className="flex flex-col gap-6 sm:gap-7">
        {/* Banner Card with generous inner padding & clear separation from outer border */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/25 flex items-start sm:items-center gap-4.5 shadow-lg relative overflow-hidden">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-md">
            <Swords size={24} className="text-amber-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-base sm:text-lg font-extrabold text-white tracking-wide">Instant Showdown Arena</h4>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-normal">
              Secret choices revealed simultaneously each round with real-time score tracking!
            </p>
          </div>
        </div>

        {/* Feature List Cards with consistent gap from outer background */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-4 p-4 sm:p-4.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0">
              <Zap size={18} />
            </div>
            <div className="flex flex-col text-xs sm:text-sm text-white/80">
              <strong className="text-white font-semibold">Simultaneous Selection</strong>
              <span className="text-white/60 text-xs mt-0.5">Choices stay hidden until both players pick.</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 sm:p-4.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-indigo-400/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-indigo-400/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 flex-shrink-0">
              <Trophy size={18} />
            </div>
            <div className="flex flex-col text-xs sm:text-sm text-white/80">
              <strong className="text-white font-semibold">Live Scoreboard</strong>
              <span className="text-white/60 text-xs mt-0.5">Real-time round counter and win tally.</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 sm:p-4.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-rose-400/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-rose-400/15 border border-rose-400/30 flex items-center justify-center text-rose-300 flex-shrink-0">
              <Smile size={18} />
            </div>
            <div className="flex flex-col text-xs sm:text-sm text-white/80">
              <strong className="text-white font-semibold">Live Animated Reactions</strong>
              <span className="text-white/60 text-xs mt-0.5">Express yourself with floating live emotes.</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-rose-400 text-xs sm:text-sm font-medium text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* CTA Launch Section with Clean Separation */}
        <div className="pt-4 sm:pt-5 border-t border-white/10">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-game-primary btn-game-amber w-full !min-h-[3.375rem] !text-sm sm:!text-base font-bold shadow-lg"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Launching RPS Arena…</>
            ) : (
              <>Launch RPS Room <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </ModalSheet>
  );
}

function JoinGameModal({ onClose }) {
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
      const snapshot = await get(roomRef(trimmed));
      if (!snapshot.exists()) { setError("Room not found — double check your code"); setLoading(false); return; }
      const room = snapshot.val();
      
      if (room.gameType === "rps") {
        if (room.players?.P2?.connected) { setError("RPS Room is full!"); setLoading(false); return; }
        await update(roomRef(trimmed), { "players/P2/connected": true, status: "playing" });
        router.push(`/rps/${trimmed}?player=P2`);
      } else {
        if (room.status === "finished") { setError("This game has already ended."); setLoading(false); return; }
        if (room.players?.O?.connected) { setError("Tic-Tac-Toe Room is full!"); setLoading(false); return; }
        await update(roomRef(trimmed), { "players/O/connected": true, status: "playing" });
        router.push(`/room/${trimmed}?symbol=O`);
      }
    } catch {
      setError("Failed to join room. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ModalSheet
      onClose={onClose}
      title="Join Room with Code"
      subtitle="Enter a 6-character room code"
      icon={Users}
      accentColor="rose"
    >
      <div className="flex flex-col gap-6 sm:gap-7">
        <div>
          <label className="block text-white/60 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
            Room Code
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="XXXXXX"
            className="w-full bg-[#060819] border border-white/20 rounded-xl px-6 py-4.5
              text-white placeholder-white/20 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20
              text-center text-3xl sm:text-4xl font-bold font-mono tracking-[0.3em] uppercase transition-all"
            autoFocus
          />
        </div>

        {error && (
          <div className="text-rose-400 text-xs sm:text-sm font-medium text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            {error}
          </div>
        )}

        <p className="text-white/50 text-xs sm:text-sm text-center leading-relaxed">
          Works for both <strong>Tic-Tac-Toe</strong> & <strong>Rock Paper Scissors Duo</strong> matches.
        </p>

        <div className="pt-3 border-t border-white/10">
          <button
            onClick={handleJoin}
            disabled={loading || code.length < 4}
            className="btn-game-primary btn-game-rose w-full !min-h-[3.25rem] !text-sm sm:!text-base font-bold"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Joining Room…</>
            ) : (
              <>Join Room <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </ModalSheet>
  );
}

export default function HomePage() {
  const [activeModal, setActiveModal] = useState(null);
  const [quickCode, setQuickCode] = useState("");
  const [quickError, setQuickError] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const router = useRouter();

  const handleQuickJoin = async (e) => {
    e.preventDefault();
    const trimmed = quickCode.trim().toUpperCase();
    if (trimmed.length < 4) {
      setQuickError("Enter a valid 6-character room code");
      return;
    }
    setQuickLoading(true);
    setQuickError("");
    try {
      const snapshot = await get(roomRef(trimmed));
      if (!snapshot.exists()) {
        setQuickError("Room not found");
        setQuickLoading(false);
        return;
      }
      const room = snapshot.val();
      if (room.gameType === "rps") {
        if (room.players?.P2?.connected) { setQuickError("Room is full"); setQuickLoading(false); return; }
        await update(roomRef(trimmed), { "players/P2/connected": true, status: "playing" });
        router.push(`/rps/${trimmed}?player=P2`);
      } else {
        if (room.status === "finished") { setQuickError("Game has ended"); setQuickLoading(false); return; }
        if (room.players?.O?.connected) { setQuickError("Room is full"); setQuickLoading(false); return; }
        await update(roomRef(trimmed), { "players/O/connected": true, status: "playing" });
        router.push(`/room/${trimmed}?symbol=O`);
      }
    } catch {
      setQuickError("Failed to connect");
      setQuickLoading(false);
    }
  };

  const highlights = [
    { icon: Zap, label: "Realtime Sync", desc: "Instant moves via Firebase DB", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { icon: Grid, label: "Custom Grids", desc: "3×3 up to 6×6 arenas", color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Swords, label: "RPS Showdowns", desc: "Secret simultaneous reveals", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: Smile, label: "Live Emojis", desc: "Realtime animated reactions", color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <main className="relative min-h-[100dvh] bg-game-grid flex flex-col justify-between items-center overflow-x-hidden">
      {/* Subtle Background Glows */}
      <FloatingOrb className="w-[500px] h-[500px] bg-indigo-600/25 -top-32 left-1/2 -translate-x-1/2" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-rose-600/15 bottom-10 right-10" delay={3} />

      {/* Top Navbar */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#070918]/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Play size={16} fill="currentColor" className="ml-0.5" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-extrabold tracking-tight text-white font-display">
                DUO<span className="text-indigo-400">BATTLE</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Arena
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveModal("join")}
            className="btn-game-secondary"
          >
            <Users size={14} /> Join with Code
          </button>
        </div>
      </header>

      {/* Centered Main Page Body */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center gap-10 sm:gap-14 my-auto">
        
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center gap-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles size={13} className="text-amber-400" />
            <span>2-Player Realtime Multiplayer</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Play Fast Online Games <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              With Anyone, Anywhere
            </span>
          </h1>

          <p className="text-white/60 text-sm sm:text-base font-normal leading-relaxed max-w-lg">
            Host custom game lobbies or join instantly using a 6-character room code. Fast, real-time multiplayer right in your browser.
          </p>
        </section>

        {/* Quick Join Input Section */}
        <section className="w-full max-w-lg">
          <form onSubmit={handleQuickJoin} className="game-panel !p-3 sm:!p-3.5 flex items-center gap-3 shadow-xl border border-white/15">
            <input
              type="text"
              maxLength={6}
              value={quickCode}
              onChange={(e) => {
                setQuickCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                setQuickError("");
              }}
              placeholder="ENTER ROOM CODE"
              className="w-full bg-transparent px-4 py-2.5 text-white placeholder-white/30 focus:outline-none text-center font-mono font-extrabold text-sm tracking-widest uppercase"
            />
            <button
              type="submit"
              disabled={quickLoading || quickCode.length < 4}
              className="btn-game-primary btn-game-rose !min-h-[2.875rem] !py-2.5 !px-6 !text-xs whitespace-nowrap flex-shrink-0"
            >
              {quickLoading ? <Loader2 size={16} className="animate-spin" /> : <>Join <ArrowRight size={14} /></>}
            </button>
          </form>
          {quickError && (
            <p className="text-rose-400 text-xs font-medium text-center mt-2.5">{quickError}</p>
          )}
        </section>
        
        {/* Game Mode Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          
          {/* Card 1: Tic Tac Toe Arena */}
          <div className="game-panel p-7 sm:p-9 flex flex-col justify-between border border-white/10 hover:border-indigo-500/40 hover:bg-[#0e122b]/95 transition-all duration-300 group">
            <div>
              {/* Card Header & Custom Vector Icon */}
              <div className="flex items-center justify-between mb-7">
                <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md flex-shrink-0">
                  <div className="grid grid-cols-2 gap-1.5 p-1">
                    <X size={15} className="text-indigo-400 stroke-[3]" />
                    <Circle size={15} className="text-purple-400 stroke-[3]" />
                    <Circle size={15} className="text-purple-400 stroke-[3]" />
                    <X size={15} className="text-indigo-400 stroke-[3]" />
                  </div>
                </div>
                <span className="text-xs font-semibold font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-md">
                  3×3 to 6×6
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                Tic-Tac-Toe Arena
              </h2>
              <p className="text-white/60 text-xs sm:text-sm mt-3 leading-relaxed font-normal">
                Strategic turn-based tactical battles on classic 3×3 or expanded 4×4, 5×5, and 6×6 boards with custom win streak targets.
              </p>
            </div>

            <div className="mt-9 pt-6 border-t border-white/10">
              <button
                onClick={() => setActiveModal("create-tictactoe")}
                className="btn-game-primary w-full !min-h-[3.25rem] !text-sm sm:!text-base"
              >
                <Gamepad2 size={18} /> Create Tic Tac Toe Room
              </button>
            </div>
          </div>

          {/* Card 2: Rock Paper Scissors Duo */}
          <div className="game-panel p-7 sm:p-9 flex flex-col justify-between border border-white/10 hover:border-amber-500/40 hover:bg-[#14122b]/95 transition-all duration-300 group">
            <div>
              {/* Card Header & Custom Vector Icon */}
              <div className="flex items-center justify-between mb-7">
                <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md flex-shrink-0">
                  <Swords size={24} className="text-amber-400 stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-md">
                  2-Player Showdown
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                Rock Paper Scissors Duo
              </h2>
              <p className="text-white/60 text-xs sm:text-sm mt-3 leading-relaxed font-normal">
                Simultaneous secret choice locking, instant round outcome reveals, endless score tracking, and animated emoji reactions.
              </p>
            </div>

            <div className="mt-9 pt-6 border-t border-white/10">
              <button
                onClick={() => setActiveModal("create-rps")}
                className="btn-game-primary btn-game-amber w-full !min-h-[3.25rem] !text-sm sm:!text-base"
              >
                <Flame size={18} /> Create RPS Room
              </button>
            </div>
          </div>

        </section>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 w-full">
          {highlights.map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className="game-panel p-5 sm:p-6 flex flex-col gap-3 border border-white/5">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={17} className={color} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">{label}</h3>
                <p className="text-white/50 text-[11px] sm:text-xs mt-1 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </section>

      </div>

      {/* Footer */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-[#070918]/80 px-4 py-5 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <Globe2 size={14} className="text-indigo-400" />
            <span>Fast Realtime Synchronization Powered by Firebase DB</span>
          </div>
          <span className="font-mono text-[11px]">DuoBattle Hub · Online Multiplayer</span>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {activeModal === "create-tictactoe" && (
          <CreateTicTacToeModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "create-rps" && (
          <CreateRPSModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "join" && (
          <JoinGameModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}