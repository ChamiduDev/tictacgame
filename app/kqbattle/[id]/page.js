// app/kqbattle/[id]/page.js
"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { onValue, update } from "firebase/database";
import { roomRef, roomPath } from "@/lib/firebase";
import { checkKQWinner, generateRandomPlacement, TARGET_SCORE } from "@/lib/kqLogic";
import KQBoard from "@/components/KQBoard";
import KQPlayerStatus from "@/components/KQPlayerStatus";
import RoomCode from "@/components/RoomCode";
import EmojiPanel from "@/components/EmojiPanel";
import GameOverModal from "@/components/GameOverModal";
import { ArrowLeft, Wifi, WifiOff, ShieldAlert, Sparkles, Loader2 } from "lucide-react";

function LoadingScreen({ message }) {
  return (
    <div className="h-[100dvh] bg-[#060713] bg-game-grid flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-white/60 bg-[#0d0f22]/90 border border-white/12 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <motion.div
          className="w-9 h-9 rounded-full border-2 border-amber-500/30 border-t-amber-400"
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
                className="w-2.5 h-2.5 rounded-full bg-amber-400"
                animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-bold text-white/70 font-display tracking-wide">Waiting for Player 2 to Join Room…</span>
        </div>

        <div className="w-full bg-[#0d0f22]/90 border border-white/12 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
          <RoomCode roomId={roomId} />
        </div>
      </motion.div>
    </div>
  );
}

function KQContent() {
  const { id: roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const playerParam = searchParams.get("player");
  const [myPlayerId] = useState(playerParam === "P2" ? "P2" : "P1");

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
  }, [roomId, router]);

  // Handle player connection status
  useEffect(() => {
    if (!roomId || !myPlayerId) return;
    update(roomPath(roomId, `players/${myPlayerId}`), { connected: true }).catch(() => {});

    const handleUnload = () => {
      update(roomPath(roomId, `players/${myPlayerId}`), { connected: false }).catch(() => {});
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [roomId, myPlayerId]);

  // Update placement in Firebase
  const handleUpdatePlacement = useCallback(
    async (placementMap) => {
      try {
        await update(roomPath(roomId, `placements/${myPlayerId}`), placementMap);
      } catch (err) {
        console.error("Placement update error:", err);
      }
    },
    [roomId, myPlayerId]
  );

  // Confirm placement & lock ready state
  const handleConfirmReady = useCallback(async () => {
    if (!gameState) return;
    const { ready = {} } = gameState;
    const nextReady = { ...ready, [myPlayerId]: true };

    const updates = {
      [`ready/${myPlayerId}`]: true,
    };

    // If both players have locked placement, transition game status to "playing"
    if (nextReady.P1 && nextReady.P2) {
      updates.status = "playing";
    }

    try {
      await update(roomRef(roomId), updates);
    } catch (err) {
      console.error("Confirm ready error:", err);
    }
  }, [gameState, roomId, myPlayerId]);

  // Handle cell attack in Battle Mode
  const handleAttackCell = useCallback(
    async (cellIdx) => {
      if (!gameState) return;
      const {
        placements = {},
        attacks = {},
        scores = { P1: 0, P2: 0 },
        currentTurn,
        status,
      } = gameState;

      if (status !== "playing" || currentTurn !== myPlayerId) return;

      const attackerId = myPlayerId;
      const defenderId = attackerId === "P1" ? "P2" : "P1";

      const defenderPlacements = placements[defenderId] || {};
      const attackerAttacks = { ...(attacks[attackerId] || {}) };

      // Prevent re-attacking an already attacked cell
      if (attackerAttacks[cellIdx] !== undefined) return;

      const hitPieceId = defenderPlacements[cellIdx];
      const isHit = Boolean(hitPieceId);

      const updates = {};
      const newScores = { ...scores };

      if (isHit) {
        const pieceScores = { KING: 100, QUEEN: 50, KNIGHT: 25, ARCHER: 10, SOLDIER: 5 };
        const pointGain = pieceScores[hitPieceId] || 5;
        newScores[attackerId] = (newScores[attackerId] || 0) + pointGain;

        attackerAttacks[cellIdx] = { hit: true, pieceId: hitPieceId, score: pointGain };
        
        updates[`scores/${attackerId}`] = newScores[attackerId];
        updates[`attacks/${attackerId}/${cellIdx}`] = { hit: true, pieceId: hitPieceId, score: pointGain };
        updates.isBonusTurn = true;

        const winner = checkKQWinner(newScores, TARGET_SCORE);
        if (winner) {
          updates.winner = winner;
          updates.status = "finished";
        }
      } else {
        attackerAttacks[cellIdx] = { hit: false };
        updates[`attacks/${attackerId}/${cellIdx}`] = { hit: false };
        updates.currentTurn = defenderId;
        updates.isBonusTurn = false;
      }

      try {
        await update(roomRef(roomId), updates);
      } catch (err) {
        console.error("Attack cell error:", err);
      }
    },
    [gameState, myPlayerId, roomId]
  );

  const handleSendEmoji = useCallback(
    async (emoji) => {
      try {
        await update(roomRef(roomId), {
          emoji: { value: emoji, sentBy: myPlayerId, timestamp: Date.now() },
        });
      } catch (err) {
        console.error("Emoji error:", err);
      }
    },
    [roomId, myPlayerId]
  );

  const handlePlayAgain = useCallback(async () => {
    if (!gameState) return;
    setShowModal(false);
    try {
      await update(roomRef(roomId), {
        status: "placement",
        ready: { P1: false, P2: false },
        placements: { P1: {}, P2: {} },
        attacks: { P1: {}, P2: {} },
        scores: { P1: 0, P2: 0 },
        currentTurn: "P1",
        isBonusTurn: false,
        winner: null,
        emoji: null,
      });
    } catch (err) {
      console.error("Play again error:", err);
    }
  }, [gameState, roomId]);

  const handleExit = useCallback(async () => {
    try {
      await update(roomPath(roomId, `players/${myPlayerId}`), { connected: false });
    } catch {}
    router.push("/");
  }, [roomId, myPlayerId, router]);

  if (loading) return <LoadingScreen message="CONNECTING TO BATTLE ROOM…" />;
  if (error) return <ErrorScreen message={error} onHome={() => router.push("/")} />;
  if (!gameState) return <LoadingScreen message="LOADING MATCH DATA…" />;

  const {
    players = {},
    status = "placement",
    ready = {},
    placements = {},
    attacks = {},
    scores = { P1: 0, P2: 0 },
    currentTurn = "P1",
    isBonusTurn = false,
    winner = null,
  } = gameState;

  const myPlacement = placements[myPlayerId] || {};
  const myAttacks = attacks[myPlayerId] || {};
  const opponentId = myPlayerId === "P1" ? "P2" : "P1";
  const opponentAttacks = attacks[opponentId] || {};

  const myReady = ready[myPlayerId] ?? false;

  if (!players.P2?.connected && myPlayerId === "P1") {
    return <WaitingScreen roomId={roomId} />;
  }

  return (
    <main className="relative h-[100dvh] bg-[#060713] bg-game-grid flex flex-col justify-between items-center px-3.5 py-4 sm:px-6 sm:py-6 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-amber-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center justify-between h-full py-1 gap-2.5 sm:gap-3.5">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleExit}
            className="btn-game-secondary !h-9 !px-3 text-xs font-bold"
          >
            <ArrowLeft size={14} /> Exit
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0c24] border border-white/15 text-xs font-mono text-amber-300 font-bold shadow-sm">
            <Wifi size={12} className="text-emerald-400 animate-pulse" />
            <span>ROOM: {roomId}</span>
          </div>

          <div className="text-white/60 text-xs font-mono font-bold">
            Target: 200 pts
          </div>
        </div>

        {/* Players Score Status HUD */}
        <div className="w-full flex-shrink-0">
          <KQPlayerStatus
            players={players}
            scores={scores}
            currentTurn={currentTurn}
            myPlayerId={myPlayerId}
            status={status}
            isBonusTurn={isBonusTurn}
            ready={ready}
          />
        </div>

        {/* Centered Board Container (Placement or Battle Mode) */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 my-auto">
          <KQBoard
            mode={status === "placement" ? "placement" : "battle"}
            myPlayerId={myPlayerId}
            myPlacement={myPlacement}
            myAttacks={myAttacks}
            opponentAttacks={opponentAttacks}
            myScores={scores[myPlayerId] || 0}
            opponentScores={scores[opponentId] || 0}
            currentTurn={currentTurn}
            isBonusTurn={isBonusTurn}
            isReady={myReady}
            onUpdatePlacement={handleUpdatePlacement}
            onConfirmReady={handleConfirmReady}
            onAttackCell={handleAttackCell}
          />
        </div>

        {/* Bottom Reaction Bar */}
        <div className="w-full flex justify-center flex-shrink-0">
          <EmojiPanel onSendEmoji={handleSendEmoji} incomingEmoji={incomingEmoji} />
        </div>
      </div>

      {/* Game Over Victory Modal */}
      <AnimatePresence>
        {showModal && winner && (
          <GameOverModal
            winner={winner}
            mySymbol={myPlayerId}
            gridSize={8}
            onPlayAgain={handlePlayAgain}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function KQBattlePage() {
  return (
    <Suspense fallback={<LoadingScreen message="CONNECTING TO BATTLE ROOM…" />}>
      <KQContent />
    </Suspense>
  );
}
