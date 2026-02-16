import { describe, it, expect, beforeEach } from 'vitest';
import { getValidMoves, isAdjacent, getAdjacentPositions, getJumpTargets } from '../rules';
import { generateBoard, posKey, placeInitialPieces } from '../board';
import type { Cell, HexPos } from '../types';

describe('isAdjacent', () => {
  it('returns true for neighboring hex positions', () => {
    const a: HexPos = { q: 0, r: 0, s: 0 };
    const b: HexPos = { q: 1, r: -1, s: 0 };
    expect(isAdjacent(a, b)).toBe(true);
  });

  it('returns false for non-adjacent positions', () => {
    const a: HexPos = { q: 0, r: 0, s: 0 };
    const b: HexPos = { q: 2, r: -1, s: -1 };
    expect(isAdjacent(a, b)).toBe(false);
  });
});

describe('getAdjacentPositions', () => {
  it('returns only positions that exist on the board', () => {
    const board = generateBoard();
    const center: HexPos = { q: 0, r: 0, s: 0 };
    const adjacent = getAdjacentPositions(center, board);
    expect(adjacent.length).toBe(6); // center has all 6 neighbors
  });
});

describe('getJumpTargets', () => {
  it('finds a jump over an adjacent occupied cell to an empty cell', () => {
    const board = generateBoard();
    const origin: HexPos = { q: 0, r: 0, s: 0 };
    const midPos: HexPos = { q: 1, r: -1, s: 0 };
    const landPos: HexPos = { q: 2, r: -2, s: 0 };
    // Place a piece to jump over
    board.get(posKey(midPos))!.piece = 'red';
    const jumps = getJumpTargets(origin, board);
    const jumpKeys = jumps.map(p => posKey(p));
    expect(jumpKeys).toContain(posKey(landPos));
  });

  it('does not allow jumping over empty cells', () => {
    const board = generateBoard();
    const origin: HexPos = { q: 0, r: 0, s: 0 };
    const jumps = getJumpTargets(origin, board);
    expect(jumps.length).toBe(0);
  });
});

describe('getValidMoves', () => {
  it('includes adjacent empty cells', () => {
    const board = generateBoard();
    const origin: HexPos = { q: 0, r: 0, s: 0 };
    board.get(posKey(origin))!.piece = 'red';
    const moves = getValidMoves(origin, board);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('includes chain jumps', () => {
    const board = generateBoard();
    const origin: HexPos = { q: 0, r: 0, s: 0 };
    board.get(posKey(origin))!.piece = 'red';
    // Place pieces to allow chain jump
    board.get(posKey({ q: 1, r: -1, s: 0 }))!.piece = 'blue';
    board.get(posKey({ q: 3, r: -3, s: 0 }))!.piece = 'green';
    const moves = getValidMoves(origin, board);
    const moveKeys = moves.map(p => posKey(p));
    // Should be able to jump to (2,-2,0) and then chain-jump to (4,-4,0)
    expect(moveKeys).toContain('2,-2,0');
    expect(moveKeys).toContain('4,-4,0');
  });
});
