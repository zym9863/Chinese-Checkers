import type { HexPos, Cell } from './types';
import { posKey } from './board';

/** The 6 hex directions in cube coordinates */
export const HEX_DIRECTIONS: HexPos[] = [
  { q: 1, r: -1, s: 0 },
  { q: 1, r: 0, s: -1 },
  { q: 0, r: 1, s: -1 },
  { q: -1, r: 1, s: 0 },
  { q: -1, r: 0, s: 1 },
  { q: 0, r: -1, s: 1 },
];

export function addPos(a: HexPos, b: HexPos): HexPos {
  return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
}

function scalePos(pos: HexPos, k: number): HexPos {
  return { q: pos.q * k, r: pos.r * k, s: pos.s * k };
}

export function isAdjacent(a: HexPos, b: HexPos): boolean {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  const ds = Math.abs(a.s - b.s);
  return Math.max(dq, dr, ds) === 1;
}

/** Get all adjacent positions that exist on the board */
export function getAdjacentPositions(pos: HexPos, board: Map<string, Cell>): HexPos[] {
  return HEX_DIRECTIONS
    .map(d => addPos(pos, d))
    .filter(p => board.has(posKey(p)));
}

/** Get all single-jump landing positions from a given origin (short + equal-distance long jumps). */
export function getJumpTargets(pos: HexPos, board: Map<string, Cell>): HexPos[] {
  const jumps: HexPos[] = [];
  const seen = new Set<string>();

  for (const dir of HEX_DIRECTIONS) {
    // Distance k=1 is the classic short jump; k>1 are equal-distance long jumps.
    for (let k = 1; ; k++) {
      const mid = addPos(pos, scalePos(dir, k));
      const land = addPos(pos, scalePos(dir, 2 * k));

      const midCell = board.get(posKey(mid));
      const landCell = board.get(posKey(land));
      if (!midCell || !landCell) break; // past board edge in this direction
      if (!midCell.piece || landCell.piece) continue;

      // Between start and landing there must be exactly one piece: the midpoint piece.
      let clearPath = true;
      for (let t = 1; t < 2 * k; t++) {
        if (t === k) continue;
        const between = addPos(pos, scalePos(dir, t));
        const betweenCell = board.get(posKey(between));
        if (!betweenCell || betweenCell.piece) {
          clearPath = false;
          break;
        }
      }

      if (!clearPath) continue;

      const key = posKey(land);
      if (!seen.has(key)) {
        seen.add(key);
        jumps.push(land);
      }
    }
  }
  return jumps;
}

/** Get all valid moves for a piece at the given position (adjacent + chain jumps) */
export function getValidMoves(pos: HexPos, board: Map<string, Cell>): HexPos[] {
  const moves: HexPos[] = [];

  // Adjacent moves to empty cells
  for (const adj of getAdjacentPositions(pos, board)) {
    const cell = board.get(posKey(adj))!;
    if (!cell.piece) {
      moves.push(adj);
    }
  }

  // Chain jumps (BFS)
  const visited = new Set<string>();
  visited.add(posKey(pos));
  const queue = [pos];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const jumpTarget of getJumpTargets(current, board)) {
      const key = posKey(jumpTarget);
      if (!visited.has(key)) {
        visited.add(key);
        moves.push(jumpTarget);
        queue.push(jumpTarget); // continue chain from landing
      }
    }
  }

  return moves;
}

/** Check if a player has won (all their pieces are in the target corner) */
export function checkWin(
  board: Map<string, Cell>,
  playerColor: string,
  targetCorner: number
): boolean {
  const targetCells = [...board.values()].filter(c => c.corner === targetCorner);
  return targetCells.every(c => c.piece === playerColor);
}
