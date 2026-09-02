// lib/kqLogic.js

export const TARGET_SCORE = 200;
export const DEFAULT_GRID_SIZE = 8; // 8x8 = 64 cells

export const PIECE_TYPES = {
  KING: {
    id: "KING",
    name: "King",
    emoji: "👑",
    count: 1,
    score: 100,
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/40",
  },
  QUEEN: {
    id: "QUEEN",
    name: "Queen",
    emoji: "👸",
    count: 1,
    score: 50,
    color: "text-purple-400",
    bg: "bg-purple-500/20 border-purple-500/40",
  },
  COMMANDER: {
    id: "COMMANDER",
    name: "Commander",
    emoji: "🛡️",
    count: 1,
    score: 20,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20 border-cyan-500/40",
  },
  ARCHER: {
    id: "ARCHER",
    name: "Archer",
    emoji: "🏹",
    count: 2,
    score: 10,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20 border-emerald-500/40",
  },
  SOLDIER: {
    id: "SOLDIER",
    name: "Soldier",
    emoji: "⚔️",
    count: 5,
    score: 2,
    color: "text-rose-400",
    bg: "bg-rose-500/20 border-rose-500/40",
  },
};

// Total fleet pieces = 1 King + 1 Queen + 1 Commander + 2 Archers + 5 Soldiers = 10 pieces
export const TOTAL_FLEET_PIECES = Object.values(PIECE_TYPES).reduce((acc, p) => acc + p.count, 0); // 10

export function getInitialFleetList() {
  const list = [];
  Object.values(PIECE_TYPES).forEach((piece) => {
    for (let i = 0; i < piece.count; i++) {
      list.push({ ...piece, instanceId: `${piece.id}_${i}` });
    }
  });
  return list;
}

export function generateRandomPlacement(gridSize = DEFAULT_GRID_SIZE) {
  const totalCells = gridSize * gridSize;
  const availableIndices = Array.from({ length: totalCells }, (_, i) => i);
  
  // Shuffle indices
  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }

  const fleet = getInitialFleetList();
  const placementMap = {};

  fleet.forEach((piece, idx) => {
    const cellIdx = availableIndices[idx];
    placementMap[cellIdx] = piece.id;
  });

  return placementMap;
}

export function checkKQWinner(scores, targetScore = TARGET_SCORE) {
  if ((scores?.P1 ?? 0) >= targetScore) return "P1";
  if ((scores?.P2 ?? 0) >= targetScore) return "P2";
  return null;
}
