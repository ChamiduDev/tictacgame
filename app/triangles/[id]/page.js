// app/triangles/[id]/page.js
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { onValue, update } from "firebase/database";
import { roomRef } from "@/lib/firebase";
import { evaluateTrianglesMove } from "@/lib/trianglesLogic";
import TrianglesBoard from "@/components/TrianglesBoard";
import TrianglesPlayerStatus from "@/components/TrianglesPlayerStatus";
import EmojiPanel from "@/components/EmojiPanel";
import RoomCode from "@/components/RoomCode";
import { ArrowLeft, WifiOff, Loader2, Sparkles, Trophy, RotateCcw } from "lucide-react";

function LoadingScreen({ message }) {
  return (
    <div className="h-[100dvh] bg-[#060713] bg-game-grid flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-white/60 bg-[#0d0f22]/90 border border-white/12 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <motion.div
          className="w-9 h-9 rounded-full border-2 border-cyan-500/30 border-t-cyan-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-xs sm:text-sm font-bold tracking-wide font-mono text-white/70">{message}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onHome }) {
  return (
    <div className="h-[100dvh] bg-[#060713] bg-game-grid flex items-center justify-center p-5">
      <div className="flex flex-col items-center gap-4 text-center max-w-xs w-full bg-[#0d0f22]/90 border border-white/12 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <WifiOff size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white font-display">Connection Error</h2>
          <p className="text-white/50 text-xs leading-relaxed">{message}</p>
        </div>
        <motion.button
          onClick={onHome}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 rounded-xl text-white font-bold text-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Return to Home
        </motion.button>
      </div>
    </div>
  );
}

function WaitingScreen({ roomId }) {
  return (
    <div className="h-[100dvh] bg-[#060713] bg-game-grid flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 text-center max-w-sm w-full"
      >
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-3xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            🔺
          </div>
          <span className="text-base sm:text-lg font-black text-white font-display tracking-wide">
            TRICKY TRIANGLES DUO
          </span>
          <span className="text-xs sm:text-sm font-bold text-cyan-300/80 font-mono tracking-wide">
            Waiting for Opponent to Join…
          </span>
        </div>

        <div className="w-full bg-[#0d0f22]/90 border border-white/12 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
          <RoomCode roomId={roomId} />
        </div>
      </motion.div>
    </div>
  );
}

function TrianglesGameOverModal({ gameState, myPlayerId, onReset, onHome }) {
  const winner = gameState?.winner;
  const isP1Win = winner === "P1";
  const isP2Win = winner === "P2";
  const isDraw = winner === "draw";
  const isIWin = winner === myPlayerId;

  const emoji = isDraw ? "🤝" : isIWin ? "🥳" : "😭";
  const title = isDraw ? "Game Tied!" : isIWin ? "Victory!" : "Defeat!";
  const subtitle = isDraw
    ? "Both players scored equal triangles!"
    : isIWin
    ? "Fantastic tactics! You claimed the most triangles!"
    : `${isP1Win ? "Host (Cyan)" : "Guest (Magenta)"} claimed the most triangles this match.`;

  const scores = gameState?.scores || { P1: 0, P2: 0 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm bg-[#0d0f22] border border-white/15 rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center shadow-2xl gap-5"
      >
        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl shadow-lg ${
          isDraw ? "bg-amber-500/20 border-amber-400/40 text-amber-300" : isIWin ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300" : "bg-rose-500/20 border-rose-400/40 text-rose-300"
        }`}>
          {emoji}
        </div>

        <div>
          <h2 className={`text-2xl font-black tracking-wide ${
            isDraw ? "text-amber-300" : isIWin ? "text-emerald-400" : "text-rose-400"
          }`}>
            {title}
          </h2>
          <p className="text-white/60 text-xs sm:text-sm mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Final Score Tally */}
        <div className="w-full grid grid-cols-2 gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex flex-col items-center p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-[10px] font-mono font-bold text-cyan-300">P1 (CYAN)</span>
            <span className="text-2xl font-black text-cyan-400 font-mono mt-0.5">{scores.P1}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20">
            <span className="text-[10px] font-mono font-bold text-fuchsia-300">P2 (MAGENTA)</span>
            <span className="text-2xl font-black text-fuchsia-400 font-mono mt-0.5">{scores.P2}</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5 pt-2 border-t border-white/10">
          <button
            onClick={onReset}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} /> Play Again
          </button>
          <button
            onClick={onHome}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Leave to Lobby
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TrianglesRoomContent() {
  const { id: roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const playerParam = searchParams.get("player");
  const [myPlayerId] = useState(playerParam === "P2" ? "P2" : "P1");

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incomingEmoji, setIncomingEmoji] = useState(null);
  const [gotBonusTurn, setGotBonusTurn] = useState(false);

  const lastEmojiTimestamp = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Subscribe to room updates
  useEffect(() => {
    if (!roomId) return;

    const ref = roomRef(roomId);
    const unsubscribe = onValue(
      ref,
      (snapshot) => {
        if (!isMountedRef.current) return;
        if (!snapshot.exists()) {
          setError("Tricky Triangles room not found or expired.");
          setLoading(false);
          return;
        }
        const data = snapshot.val();

        // Check for new live emoji
        if (data.emoji?.timestamp && data.emoji.timestamp !== lastEmojiTimestamp.current) {
          lastEmojiTimestamp.current = data.emoji.timestamp;
          setIncomingEmoji({ ...data.emoji });
        }

        setGameState(data);
        setLoading(false);
      },
      (err) => {
        if (!isMountedRef.current) return;
        setError(err.message || "Failed to load room data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const handleMakeMove = async (edgeId) => {
    if (!gameState || gameState.status !== "playing" || gameState.currentTurn !== myPlayerId) return;

    const result = evaluateTrianglesMove(gameState, edgeId, myPlayerId);

    if (result.gotBonusTurn) {
      setGotBonusTurn(true);
      setTimeout(() => setGotBonusTurn(false), 2500);
    }

    try {
      await update(roomRef(roomId), {
        lines: result.lines,
        triangles: result.triangles,
        scores: result.scores,
        currentTurn: result.currentTurn,
        status: result.status,
        winner: result.winner,
      });
    } catch {
      setError("Failed to record move.");
    }
  };

  const handleResetGame = async () => {
    if (!gameState) return;
    try {
      await update(roomRef(roomId), {
        lines: {},
        triangles: {},
        scores: { P1: 0, P2: 0 },
        currentTurn: "P1",
        status: "playing",
        winner: null,
      });
    } catch {
      setError("Failed to reset game.");
    }
  };

  const handleSendEmoji = async (emoji) => {
    try {
      await update(roomRef(roomId), {
        emoji: { value: emoji, sentBy: myPlayerId, timestamp: Date.now() },
      });
    } catch (err) {
      console.error("Emoji update error:", err);
    }
  };

  if (loading) return <LoadingScreen message="Connecting to Tricky Triangles Arena…" />;
  if (error) return <ErrorScreen message={error} onHome={() => router.push("/")} />;

  const isWaiting = gameState?.status === "waiting" || !gameState?.players?.P2?.connected;
  if (isWaiting) return <WaitingScreen roomId={roomId} />;

  return (
    <div className="relative min-h-[100dvh] bg-[#060713] bg-game-grid flex flex-col justify-between items-center p-3 sm:p-6 select-none overflow-x-hidden">
      
      {/* Header Bar */}
      <header className="w-full max-w-lg flex items-center justify-between py-2 border-b border-white/10 mb-2">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Exit
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-widest text-cyan-300 font-mono uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg">
            {gameState.gridSize === 3 ? "9 Triangles" : gameState.gridSize === 5 ? "25 Triangles" : "16 Triangles"}
          </span>
        </div>

        {/* Room code is hidden once match starts */}
        <div className="w-20" />
      </header>

      {/* Main Game Content Area */}
      <main className="w-full max-w-lg flex flex-col items-center gap-4 my-auto">
        <TrianglesPlayerStatus
          players={gameState.players}
          currentTurn={gameState.currentTurn}
          myPlayerId={myPlayerId}
          scores={gameState.scores}
          winner={gameState.winner}
        />

        <TrianglesBoard
          gridSize={gameState.gridSize || 4}
          lines={gameState.lines || {}}
          triangles={gameState.triangles || {}}
          currentTurn={gameState.currentTurn}
          myPlayerId={myPlayerId}
          status={gameState.status}
          onMakeMove={handleMakeMove}
          gotBonusTurn={gotBonusTurn}
        />
      </main>

      {/* Floating Live Reactions Panel */}
      <EmojiPanel onSendEmoji={handleSendEmoji} incomingEmoji={incomingEmoji} />

      {/* Game Over Victory Modal */}
      {gameState.status === "finished" && (
        <TrianglesGameOverModal
          gameState={gameState}
          myPlayerId={myPlayerId}
          onReset={handleResetGame}
          onHome={() => router.push("/")}
        />
      )}
    </div>
  );
}

export default function TrianglesRoomPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Arena…" />}>
      <TrianglesRoomContent />
    </Suspense>
  );
}
