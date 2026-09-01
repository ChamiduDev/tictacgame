// lib/rpsLogic.js

export const RPS_CHOICES = [
  {
    id: "rock",
    label: "Rock",
    emoji: "✊",
    iconName: "Hand",
    color: "from-amber-500/20 via-orange-600/20 to-red-600/20",
    border: "border-amber-400/50",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.35)]",
    activeBg: "bg-gradient-to-br from-amber-500/30 to-amber-700/40 text-amber-200 border-amber-300",
    desc: "Beats Scissors",
  },
  {
    id: "paper",
    label: "Paper",
    emoji: "✋",
    iconName: "Hand",
    color: "from-blue-500/20 via-cyan-600/20 to-teal-600/20",
    border: "border-cyan-400/50",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.35)]",
    activeBg: "bg-gradient-to-br from-cyan-500/30 to-blue-700/40 text-cyan-200 border-cyan-300",
    desc: "Beats Rock",
  },
  {
    id: "scissors",
    label: "Scissors",
    emoji: "✌️",
    iconName: "Scissors",
    color: "from-purple-500/20 via-fuchsia-600/20 to-pink-600/20",
    border: "border-fuchsia-400/50",
    glow: "shadow-[0_0_30px_rgba(217,70,239,0.35)]",
    activeBg: "bg-gradient-to-br from-fuchsia-500/30 to-pink-700/40 text-fuchsia-200 border-fuchsia-300",
    desc: "Beats Paper",
  },
];

/**
 * Evaluates the outcome of a Rock Paper Scissors round.
 * @param {string} p1Choice - 'rock', 'paper', or 'scissors'
 * @param {string} p2Choice - 'rock', 'paper', or 'scissors'
 * @returns {{ winner: 'P1' | 'P2' | 'draw', explanation: string }}
 */
export function evaluateRPS(p1Choice, p2Choice) {
  if (!p1Choice || !p2Choice) {
    return { winner: null, explanation: "" };
  }

  if (p1Choice === p2Choice) {
    const choiceLabel = RPS_CHOICES.find((c) => c.id === p1Choice)?.label || p1Choice;
    return {
      winner: "draw",
      explanation: `Both players chose ${choiceLabel}! It's a draw.`,
    };
  }

  const winRules = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  const actionText = {
    rock: "crushes",
    paper: "covers",
    scissors: "cuts",
  };

  if (winRules[p1Choice] === p2Choice) {
    const p1Obj = RPS_CHOICES.find((c) => c.id === p1Choice);
    const p2Obj = RPS_CHOICES.find((c) => c.id === p2Choice);
    return {
      winner: "P1",
      explanation: `${p1Obj.label} ${actionText[p1Choice]} ${p2Obj.label}! Host wins the round.`,
    };
  } else {
    const p1Obj = RPS_CHOICES.find((c) => c.id === p1Choice);
    const p2Obj = RPS_CHOICES.find((c) => c.id === p2Choice);
    return {
      winner: "P2",
      explanation: `${p2Obj.label} ${actionText[p2Choice]} ${p1Obj.label}! Guest wins the round.`,
    };
  }
}
