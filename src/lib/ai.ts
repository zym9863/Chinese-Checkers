import type { HexPos, Cell, Player, Move } from './types';
import { posKey } from './board';
import { getValidMoves } from './rules';

function hexDistance(a: HexPos, b: HexPos): number {
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
}

function getTargetPositions(board: Map<string, Cell>, targetCorner: number): HexPos[] {
  return [...board.values()].filter(c => c.corner === targetCorner).map(c => c.pos);
}

/** Evaluate board from player's perspective. Lower = better (closer to winning). */
export function evaluateBoard(board: Map<string, Cell>, player: Player): number {
  const targets = getTargetPositions(board, player.targetCorner);
  const targetCenter: HexPos = {
    q: targets.reduce((s, t) => s + t.q, 0) / targets.length,
    r: targets.reduce((s, t) => s + t.r, 0) / targets.length,
    s: targets.reduce((s, t) => s + t.s, 0) / targets.length,
  };
  let totalDist = 0;
  for (const cell of board.values()) {
    if (cell.piece === player.color) {
      totalDist += hexDistance(cell.pos, {
        q: Math.round(targetCenter.q),
        r: Math.round(targetCenter.r),
        s: Math.round(targetCenter.s),
      });
    }
  }
  return totalDist;
}

function getPlayerPieces(board: Map<string, Cell>, color: string): HexPos[] {
  return [...board.values()].filter(c => c.piece === color).map(c => c.pos);
}

function cloneBoard(board: Map<string, Cell>): Map<string, Cell> {
  const copy = new Map<string, Cell>();
  for (const [key, cell] of board) copy.set(key, { ...cell });
  return copy;
}

function applyMove(board: Map<string, Cell>, from: HexPos, to: HexPos): void {
  const fromCell = board.get(posKey(from))!;
  const toCell = board.get(posKey(to))!;
  toCell.piece = fromCell.piece;
  fromCell.piece = null;
}

function minimax(
  board: Map<string, Cell>, player: Player, opponent: Player,
  depth: number, alpha: number, beta: number, maximizing: boolean
): number {
  if (depth === 0) {
    return evaluateBoard(board, opponent) - evaluateBoard(board, player);
  }
  const currentColor = maximizing ? player.color : opponent.color;
  const pieces = getPlayerPieces(board, currentColor);
  if (maximizing) {
    let maxEval = -Infinity;
    for (const piece of pieces) {
      for (const move of getValidMoves(piece, board)) {
        const newBoard = cloneBoard(board);
        applyMove(newBoard, piece, move);
        const val = minimax(newBoard, player, opponent, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const piece of pieces) {
      for (const move of getValidMoves(piece, board)) {
        const newBoard = cloneBoard(board);
        applyMove(newBoard, piece, move);
        const val = minimax(newBoard, player, opponent, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, val);
        beta = Math.min(beta, val);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function findBestMove(
  board: Map<string, Cell>, player: Player, depth: number = 2, opponent?: Player
): Move | null {
  const pieces = getPlayerPieces(board, player.color);
  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  const opp = opponent ?? {
    color: 'blue' as any, corner: player.targetCorner as any,
    targetCorner: player.corner, isAI: false, name: 'Opponent',
  };
  for (const piece of pieces) {
    for (const move of getValidMoves(piece, board)) {
      const newBoard = cloneBoard(board);
      applyMove(newBoard, piece, move);
      const score = minimax(newBoard, player, opp, depth - 1, -Infinity, Infinity, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = { from: piece, to: move, player: player.color };
      }
    }
  }
  return bestMove;
}
