// app/rps/[id]/page.js
"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { onValue, update } from "firebase/database";
import { roomRef, roomPath } from "@/lib/firebase";
import { evaluateRPS } from "@/lib/rpsLogic";
import RPSBoard from "@/components/RPSBoard";
import RPSPlayerStatus from "@/components/RPSPlayerStatus";
import EmojiPanel from "@/components/EmojiPanel";
import RoomCode from "@/components/RoomCode";
import { ArrowLeft, Wifi, WifiOff, Loader2, Sparkles, Swords } from "lucide-react";

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
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            ✊✋✌️
          </div>
          <span className="text-base sm:text-lg font-black text-white font-display tracking-wide">
            ROCK PAPER SCISSORS DUO
          </span>
          <span className="text-xs sm:text-sm font-bold text-amber-300/80 font-mono tracking-wide">
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

function RPSRoomContent() {
  const { id: roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const playerParam = searchParams.get("player");
  const [myPlayerId] = useState(playerParam === "P2" ? "P2" : "P1");

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incomingEmoji, setIncomingEmoji] = useState(null);

  const lastEmojiTimestamp = useRef(0);
  const isEvaluatingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Subscribe to room state updates
  useEffect(() => {
    if (!roomId) return;

    const ref = roomRef(roomId);
    const unsubscribe = onValue(
      ref,
      async (snapshot) => {
        if (!isMountedRef.current) return;
        if (!snapshot.exists()) {
          setError("RPS Room not found or expired.");
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

        // Auto evaluate round when both choices are present and status is "playing"
        if (
          data.status === "playing" &&
          data.choices?.P1 &&
          data.choices?.P2 &&
          !isEvaluatingRef.current
        ) {
          isEvaluatingRef.current = true;
          const result = evaluateRPS(data.choices.P1, data.choices.P2);
          const currentScores = data.scores || { P1: 0, P2: 0 };
          const newScores = { ...currentScores };

          if (result.winner === "P1") newScores.P1 = (newScores.P1 || 0) + 1;
          if (result.winner === "P2") newScores.P2 = (newScores.P2 || 0) + 1;

          try {
            await update(roomRef(roomId), {
              status: "revealed",
              roundResult: result,
              scores: newScores,
            });
          } catch (err) {
            console.error("Error updating RPS evaluation:", err);
          } finally {
            isEvaluatingRef.current = false;
          }
        }
      },
      () => {
        if (!isMountedRef.current) return;
        setError("Network error connecting to room.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

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

  // Handle making a selection (Rock, Paper, or Scissors)
  const handleMakeChoice = useCallback(
    async (choiceId) => {
      if (!gameState || gameState.status !== "playing") return;
      try {
        await update(roomRef(roomId), {
          [`choices/${myPlayerId}`]: choiceId,
        });
      } catch (err) {
        console.error("RPS Choice error:", err);
      }
    },
    [gameState, roomId, myPlayerId]
  );

  // Handle restarting next round
  const handleNextRound = useCallback(async () => {
    if (!gameState) return;
    try {
      await update(roomRef(roomId), {
        choices: { P1: null, P2: null },
        roundResult: null,
        status: "playing",
        round: (gameState.round || 1) + 1,
      });
    } catch (err) {
      console.error("Next round error:", err);
    }
  }, [gameState, roomId]);

  // Handle emoji reactions
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

  const handleExit = useCallback(async () => {
    try {
      await update(roomPath(roomId, `players/${myPlayerId}`), { connected: false });
    } catch {}
    router.push("/");
  }, [roomId, myPlayerId, router]);

  if (loading) return <LoadingScreen message="CONNECTING TO RPS ARENA…" />;
  if (error) return <ErrorScreen message={error} onHome={() => router.push("/")} />;
  if (!gameState) return <LoadingScreen message="LOADING RPS MATCH DATA…" />;

  const { players, choices, scores, status, roundResult, round } = gameState;

  if (status === "waiting" && myPlayerId === "P1") {
    return <WaitingScreen roomId={roomId} />;
  }

  return (
    <main className="relative h-[100dvh] bg-[#060713] bg-game-grid flex flex-col justify-between items-center px-3.5 py-4 sm:px-6 sm:py-6 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-amber-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl" />
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

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0c24] border border-amber-500/30 text-xs font-mono text-amber-300 font-bold shadow-sm">
            <Swords size={13} className="text-amber-400" />
            <span>RPS ROOM: {roomId}</span>
          </div>

          <div className="text-white/60 text-xs font-mono font-bold flex items-center gap-1">
            <Wifi size={12} className="text-emerald-400 animate-pulse" /> Live
          </div>
        </div>

        {/* Players Status HUD */}
        <div className="w-full flex-shrink-0">
          <RPSPlayerStatus
            players={players}
            choices={choices}
            scores={scores}
            myPlayerId={myPlayerId}
            status={status}
          />
        </div>

        {/* Main RPS Game Board Container */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 my-auto">
          <RPSBoard
            choices={choices}
            myChoice={choices?.[myPlayerId]}
            myPlayerId={myPlayerId}
            status={status}
            roundResult={roundResult}
            round={round || 1}
            onMakeChoice={handleMakeChoice}
            onNextRound={handleNextRound}
          />
        </div>

        {/* Bottom Reaction Bar */}
        <div className="w-full flex justify-center flex-shrink-0">
          <EmojiPanel onSendEmoji={handleSendEmoji} incomingEmoji={incomingEmoji} />
        </div>
      </div>
    </main>
  );
}

export default function RPSRoomPage() {
  return (
    <Suspense fallback={<LoadingScreen message="CONNECTING TO RPS ARENA…" />}>
      <RPSRoomContent />
    </Suspense>
  );
}
