// app/room/[id]/page.js
"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { onValue, update } from "firebase/database";
import { roomRef, roomPath } from "@/lib/firebase";
import { checkWinner, createEmptyBoard } from "@/hooks/useGameLogic";
import GameBoard from "@/components/GameBoard";
import EmojiPanel from "@/components/EmojiPanel";
import RoomCode from "@/components/RoomCode";
import GameOverModal from "@/components/GameOverModal";
import PlayerStatus from "@/components/PlayerStatus";
import { ArrowLeft, Wifi, WifiOff, Loader2, Sparkles } from "lucide-react";

function LoadingScreen({ message }) {
  return (
    <div className="h-[100dvh] bg-[#060713] bg-game-grid flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-white/60 bg-[#0d0f22]/90 border border-white/12 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <motion.div
          className="w-9 h-9 rounded-full border-2 border-violet-500/30 border-t-violet-400"
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
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-violet-400"
                animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-bold text-white/70 font-display tracking-wide">Waiting for Opponent to Join…</span>
        </div>

        <div className="w-full bg-[#0d0f22]/90 border border-white/12 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
          <RoomCode roomId={roomId} />
        </div>
      </motion.div>
    </div>
  );
}

function TurnBanner({ isMyTurn, mySymbol, currentTurn }) {
  const isX = currentTurn === "X";
  const theme = isX
    ? "from-violet-950/70 via-violet-900/40 to-purple-950/70 border-violet-500/50 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
    : "from-rose-950/70 via-rose-900/40 to-pink-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${isMyTurn}-${currentTurn}`}
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`flex items-center justify-center gap-2.5 px-5 py-2 rounded-xl bg-gradient-to-r border text-xs sm:text-sm font-bold tracking-wider ${theme}`}
      >
        {isMyTurn ? (
          <>
            <Sparkles size={14} className="animate-spin text-amber-400" />
            <span>YOUR TURN ({mySymbol})</span>
          </>
        ) : (
          <>
            <Loader2 size={14} className="animate-spin opacity-50" />
            <span>OPPONENT&apos;S TURN ({currentTurn})</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function RoomContent() {
  const { id: roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const symbolParam = searchParams.get("symbol");
  const [mySymbol] = useState(symbolParam === "O" ? "O" : "X");

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [incomingEmoji, setIncomingEmoji] = useState(null);

  const lastEmojiTimestamp = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const ref = roomRef(roomId);
    const unsubscribe = onValue(
      ref,
      (snapshot) => {
        if (!isMountedRef.current) return;
        if (!snapshot.exists()) {
          setError("Room not found or has expired.");
          setLoading(false);
          return;
        }
        const data = snapshot.val();

        if (data.gameType === "rps") {
          router.replace(`/rps/${roomId}${symbolParam ? `?player=${symbolParam === "X" ? "P1" : "P2"}` : ""}`);
          return;
        }

        if (data.emoji?.timestamp && data.emoji.timestamp !== lastEmojiTimestamp.current) {
          lastEmojiTimestamp.current = data.emoji.timestamp;
          setIncomingEmoji({ ...data.emoji });
        }

        setGameState(data);
        setLoading(false);

        if (data.status === "finished" && data.winner) {
          setTimeout(() => {
            if (isMountedRef.current) setShowModal(true);
          }, 500);
        }
      },
      () => {
        if (!isMountedRef.current) return;
        setError("Network error connecting to room.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId, symbolParam, router]);

  useEffect(() => {
    if (!roomId || !mySymbol) return;
    update(roomPath(roomId, `players/${mySymbol}`), { connected: true }).catch(() => {});

    const handleUnload = () => {
      update(roomPath(roomId, `players/${mySymbol}`), { connected: false }).catch(() => {});
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [roomId, mySymbol]);

  const handleCellClick = useCallback(
    async (index) => {
      if (!gameState) return;
      const { board = [], moves = {}, currentTurn, gridSize, winStreak, status } = gameState;

      if (status !== "playing" || currentTurn !== mySymbol || board[index] !== "") return;

      const newBoard = [...board];
      const currentMoves = {
        X: [...(moves?.X || [])],
        O: [...(moves?.O || [])],
      };
      const playerMoves = currentMoves[mySymbol] || [];

      // For 3x3 grid, max 3 marks per player. On 4th mark, automatically remove oldest mark.
      if (gridSize === 3 && playerMoves.length >= 3) {
        const oldestIndex = playerMoves.shift();
        newBoard[oldestIndex] = "";
      }

      playerMoves.push(index);
      currentMoves[mySymbol] = playerMoves;
      newBoard[index] = mySymbol;

      const { winner, winningCells } = checkWinner(newBoard, gridSize, winStreak);

      const updates = {
        board: newBoard,
        moves: currentMoves,
        currentTurn: mySymbol === "X" ? "O" : "X",
      };

      if (winner && winner !== "draw") {
        updates.winner = winner;
        updates.winningCells = winningCells;
        updates.status = "finished";
      }

      try {
        await update(roomRef(roomId), updates);
      } catch (err) {
        console.error("Move update error:", err);
      }
    },
    [gameState, mySymbol, roomId]
  );

  const handleSendEmoji = useCallback(
    async (emoji) => {
      try {
        await update(roomRef(roomId), {
          emoji: { value: emoji, sentBy: mySymbol, timestamp: Date.now() },
        });
      } catch (err) {
        console.error("Emoji error:", err);
      }
    },
    [roomId, mySymbol]
  );

  const handlePlayAgain = useCallback(async () => {
    if (!gameState) return;
    setShowModal(false);
    try {
      await update(roomRef(roomId), {
        board: createEmptyBoard(gameState.gridSize || 3),
        moves: { X: [], O: [] },
        currentTurn: "X",
        status: "playing",
        winner: null,
        winningCells: [],
        emoji: null,
      });
    } catch (err) {
      console.error("Play again error:", err);
    }
  }, [gameState, roomId]);

  const handleExit = useCallback(async () => {
    try {
      await update(roomPath(roomId, `players/${mySymbol}`), { connected: false });
    } catch {}
    router.push("/");
  }, [roomId, mySymbol, router]);

  if (loading) return <LoadingScreen message="CONNECTING TO ROOM…" />;
  if (error) return <ErrorScreen message={error} onHome={() => router.push("/")} />;
  if (!gameState) return <LoadingScreen message="LOADING MATCH DATA…" />;

  const { board = [], moves = {}, gridSize = 3, winStreak = 3, currentTurn, players, status, winner, winningCells = [] } = gameState;

  if (status === "waiting" && mySymbol === "X") {
    return <WaitingScreen roomId={roomId} />;
  }

  const isMyTurn = currentTurn === mySymbol;

  return (
    <main className="relative h-[100dvh] bg-[#060713] bg-game-grid flex flex-col justify-between items-center px-3.5 py-4 sm:px-6 sm:py-6 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-rose-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center justify-between h-full py-1 gap-2.5 sm:gap-3.5">
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleExit}
            className="btn-game-secondary !h-9 !px-3 text-xs font-bold"
          >
            <ArrowLeft size={14} /> Exit
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0c24] border border-white/15 text-xs font-mono text-violet-300 font-bold shadow-sm">
            <Wifi size={12} className="text-emerald-400 animate-pulse" />
            <span>ROOM: {roomId}</span>
          </div>

          <div className="text-white/60 text-xs font-mono font-bold">
            {gridSize}×{gridSize} · Win: {winStreak}
          </div>
        </div>

        {/* Players Status HUD */}
        <div className="w-full flex-shrink-0">
          <PlayerStatus players={players} currentTurn={currentTurn} mySymbol={mySymbol} />
        </div>

        {/* Turn Status Banner */}
        <div className="w-full flex justify-center flex-shrink-0">
          {status === "playing" && (
            <TurnBanner isMyTurn={isMyTurn} mySymbol={mySymbol} currentTurn={currentTurn} />
          )}
        </div>

        {/* Centered Game Board Container */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 my-auto">
          <GameBoard
            board={board}
            moves={moves}
            gridSize={gridSize}
            winningCells={winningCells || []}
            currentTurn={currentTurn}
            mySymbol={mySymbol}
            gameStatus={status}
            onCellClick={handleCellClick}
          />
        </div>

        {/* Bottom Reaction Bar */}
        <div className="w-full flex justify-center flex-shrink-0">
          <EmojiPanel onSendEmoji={handleSendEmoji} incomingEmoji={incomingEmoji} />
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {showModal && winner && (
          <GameOverModal
            winner={winner}
            mySymbol={mySymbol}
            gridSize={gridSize}
            onPlayAgain={handlePlayAgain}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<LoadingScreen message="CONNECTING TO ROOM…" />}>
      <RoomContent />
    </Suspense>
  );
}
