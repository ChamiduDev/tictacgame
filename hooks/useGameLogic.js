// hooks/useGameLogic.js
"use client";

/**
 * Determines the win streak required for a given grid size.
 * 3×3 → 3-in-a-row
 * 4×4 & 5×5 → 4-in-a-row
 * 6×6 → 5-in-a-row
 */
export function getWinStreak(gridSize) {
  if (gridSize <= 3) return 3;
  if (gridSize <= 5) return 4;
  return 5;
}

/**
 * Checks if there is a winner on the board.
 *
 * @param {string[]} board - flat array of length gridSize*gridSize ("X", "O", or "")
 * @param {number} gridSize - N for an N×N board
 * @param {number} winStreak - consecutive marks needed to win
 * @returns {{ winner: string|null, winningCells: number[] }}
 */
export function checkWinner(board, gridSize, winStreak) {
  const n = gridSize;

  /**
   * Given an ordered list of cell indices, slide a window of `winStreak`
   * and return the first winning window, or null.
   */
  function checkLine(indices) {
    for (let start = 0; start <= indices.length - winStreak; start++) {
      const window = indices.slice(start, start + winStreak);
      const first = board[window[0]];
      if (first && window.every((i) => board[i] === first)) {
        return { winner: first, winningCells: window };
      }
    }
    return null;
  }

  // ── Rows ────────────────────────────────────────────────────────────────
  for (let r = 0; r < n; r++) {
    const indices = Array.from({ length: n }, (_, c) => r * n + c);
    const result = checkLine(indices);
    if (result) return result;
  }

  // ── Columns ─────────────────────────────────────────────────────────────
  for (let c = 0; c < n; c++) {
    const indices = Array.from({ length: n }, (_, r) => r * n + c);
    const result = checkLine(indices);
    if (result) return result;
  }

  // ── Main diagonals (top-left → bottom-right) ─────────────────────────
  // Diagonal starting at (r, c)
  for (let r = 0; r <= n - winStreak; r++) {
    for (let c = 0; c <= n - winStreak; c++) {
      const indices = Array.from({ length: winStreak }, (_, k) => (r + k) * n + (c + k));
      const result = checkLine(indices);
      if (result) return result;
    }
  }

  // ── Anti-diagonals (top-right → bottom-left) ─────────────────────────
  for (let r = 0; r <= n - winStreak; r++) {
    for (let c = winStreak - 1; c < n; c++) {
      const indices = Array.from({ length: winStreak }, (_, k) => (r + k) * n + (c - k));
      const result = checkLine(indices);
      if (result) return result;
    }
  }

  // ── Draw detection ────────────────────────────────────────────────────
  if (board.every((cell) => cell !== "")) {
    return { winner: "draw", winningCells: [] };
  }

  return { winner: null, winningCells: [] };
}

/**
 * Generates an initial empty board for a given grid size.
 * @param {number} gridSize
 * @returns {string[]}
 */
export function createEmptyBoard(gridSize) {
  return Array(gridSize * gridSize).fill("");
}

/**
 * Generates a random 6-character alphanumeric room code.
 * Excludes visually ambiguous characters (0, O, 1, I, L).
 * @returns {string}
 */
export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
