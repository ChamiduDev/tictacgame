// lib/trianglesLogic.js

export const TRIANGLES_GRID_OPTIONS = [
  { size: 3, label: "Small (9 Δ)", desc: "Quick 9-triangle match (~2 mins)" },
  { size: 4, label: "Medium (16 Δ)", desc: "Standard 16-triangle arena (~4 mins)" },
  { size: 5, label: "Large (25 Δ)", desc: "Strategic 25-triangle battle (~6 mins)" },
];

/**
 * Normalizes two dot indices to produce a consistent edge ID string.
 */
export function getEdgeId(r1, c1, r2, c2) {
  if (r1 < r2 || (r1 === r2 && c1 < c2)) {
    return `${r1}_${c1}--${r2}_${c2}`;
  }
  return `${r2}_${c2}--${r1}_${c1}`;
}

/**
 * Generates the geometry (dots, edges, triangles, SVG viewBox) for a given pyramid level count N.
 * @param {number} numLevels - Number of triangle levels (3 for 9 triangles, 4 for 16, 5 for 25)
 */
export function generateTrianglesGeometry(numLevels = 4) {
  const spacing = 90;
  const heightFactor = Math.sqrt(3) / 2; // ~0.866
  const rowHeight = spacing * heightFactor;

  const width = (numLevels + 1) * spacing + 120;
  const height = numLevels * rowHeight + 140;
  const centerX = width / 2;
  const startY = 70;

  // 1. Calculate Dot Positions
  const dots = [];
  const dotMap = {};

  for (let r = 0; r <= numLevels; r++) {
    for (let c = 0; c <= r; c++) {
      const id = `${r}_${c}`;
      const x = centerX + (c - r / 2) * spacing;
      const y = startY + r * rowHeight;
      const dotObj = { id, r, c, x, y };
      dots.push(dotObj);
      dotMap[id] = dotObj;
    }
  }

  // 2. Generate Edges & Triangles
  const edges = [];
  const edgeMap = {};
  const triangles = [];

  // Helper to register an edge
  function addEdge(r1, c1, r2, c2) {
    const id = getEdgeId(r1, c1, r2, c2);
    if (!edgeMap[id]) {
      const d1 = dotMap[`${r1}_${c1}`];
      const d2 = dotMap[`${r2}_${c2}`];
      const edgeObj = {
        id,
        r1, c1, r2, c2,
        x1: d1.x, y1: d1.y,
        x2: d2.x, y2: d2.y,
      };
      edgeMap[id] = edgeObj;
      edges.push(edgeObj);
    }
    return id;
  }

  // Generate Upward Triangles U(r, c)
  for (let r = 0; r < numLevels; r++) {
    for (let c = 0; c <= r; c++) {
      const e1 = addEdge(r, c, r + 1, c);     // Down-Left
      const e2 = addEdge(r, c, r + 1, c + 1); // Down-Right
      const e3 = addEdge(r + 1, c, r + 1, c + 1); // Bottom-Horizontal

      const dTop = dotMap[`${r}_${c}`];
      const dLeft = dotMap[`${r + 1}_${c}`];
      const dRight = dotMap[`${r + 1}_${c + 1}`];

      const cx = (dTop.x + dLeft.x + dRight.x) / 3;
      const cy = (dTop.y + dLeft.y + dRight.y) / 3;

      triangles.push({
        id: `U_${r}_${c}`,
        type: "up",
        edges: [e1, e2, e3],
        points: `${dTop.x},${dTop.y} ${dLeft.x},${dLeft.y} ${dRight.x},${dRight.y}`,
        cx, cy,
      });
    }
  }

  // Generate Downward Triangles D(r, c)
  for (let r = 1; r < numLevels; r++) {
    for (let c = 0; c < r; c++) {
      const e1 = addEdge(r, c, r, c + 1);     // Top-Horizontal
      const e2 = addEdge(r, c, r + 1, c + 1); // Down-Right from left top
      const e3 = addEdge(r, c + 1, r + 1, c + 1); // Down-Left from right top

      const dLeftTop = dotMap[`${r}_${c}`];
      const dRightTop = dotMap[`${r}_${c + 1}`];
      const dBottom = dotMap[`${r + 1}_${c + 1}`];

      const cx = (dLeftTop.x + dRightTop.x + dBottom.x) / 3;
      const cy = (dLeftTop.y + dRightTop.y + dBottom.y) / 3;

      triangles.push({
        id: `D_${r}_${c}`,
        type: "down",
        edges: [e1, e2, e3],
        points: `${dLeftTop.x},${dLeftTop.y} ${dRightTop.x},${dRightTop.y} ${dBottom.x},${dBottom.y}`,
        cx, cy,
      });
    }
  }

  return {
    numLevels,
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    dots,
    edges,
    edgeMap,
    triangles,
    totalTriangles: triangles.length,
  };
}

/**
 * Checks line move, completed triangles, scores, and turn updates.
 */
export function evaluateTrianglesMove(currentGameState, lineId, playerId) {
  const drawnLines = { ...(currentGameState.lines || {}), [lineId]: playerId };
  const claimedTriangles = { ...(currentGameState.triangles || {}) };
  const currentScores = { P1: 0, P2: 0, ...(currentGameState.scores || {}) };

  const geometry = generateTrianglesGeometry(currentGameState.gridSize || 4);
  let trianglesCompletedThisTurn = 0;

  geometry.triangles.forEach((tri) => {
    // If not claimed yet, check if all 3 edges are drawn
    if (!claimedTriangles[tri.id]) {
      const allDrawn = tri.edges.every((edgeId) => Boolean(drawnLines[edgeId]));
      if (allDrawn) {
        claimedTriangles[tri.id] = playerId;
        currentScores[playerId] = (currentScores[playerId] || 0) + 1;
        trianglesCompletedThisTurn++;
      }
    }
  });

  const totalClaimed = Object.keys(claimedTriangles).length;
  const isFinished = totalClaimed >= geometry.totalTriangles;

  let winner = null;
  if (isFinished) {
    if (currentScores.P1 > currentScores.P2) winner = "P1";
    else if (currentScores.P2 > currentScores.P1) winner = "P2";
    else winner = "draw";
  }

  // Bonus turn if player completed at least 1 triangle, otherwise switch turns
  const nextTurn = trianglesCompletedThisTurn > 0 ? playerId : (playerId === "P1" ? "P2" : "P1");

  return {
    lines: drawnLines,
    triangles: claimedTriangles,
    scores: currentScores,
    currentTurn: nextTurn,
    status: isFinished ? "finished" : "playing",
    winner,
    gotBonusTurn: trianglesCompletedThisTurn > 0 && !isFinished,
    trianglesCompletedThisTurn,
  };
}
