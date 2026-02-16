import { describe, it, expect } from 'vitest';
import { evaluateBoard, findBestMove } from '../ai';
import { generateBoard, posKey, placeInitialPieces } from '../board';
import type { Player } from '../types';

describe('evaluateBoard', () => {
  it('returns a positive score for initial board state', () => {
    const board = generateBoard();
    placeInitialPieces(board, [0, 3], ['red', 'blue']);
    const player: Player = {
      color: 'red', corner: 0, targetCorner: 3, isAI: true, name: 'AI'
    };
    const score = evaluateBoard(board, player);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThan(0);
  });
});

describe('findBestMove', () => {
  it('returns a valid move for the current player', () => {
    const board = generateBoard();
    placeInitialPieces(board, [0, 3], ['red', 'blue']);
    const player: Player = {
      color: 'red', corner: 0, targetCorner: 3, isAI: true, name: 'AI'
    };
    const move = findBestMove(board, player, 1);
    expect(move).not.toBeNull();
    expect(move!.from).toBeDefined();
    expect(move!.to).toBeDefined();
    expect(board.get(posKey(move!.from))!.piece).toBe('red');
  });
});
