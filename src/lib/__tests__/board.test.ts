import { describe, it, expect } from 'vitest';
import { generateBoard, posKey, BOARD_SIZE } from '../board';

describe('generateBoard', () => {
  it('generates exactly 121 positions', () => {
    const board = generateBoard();
    expect(board.size).toBe(121);
  });

  it('all positions satisfy q + r + s = 0', () => {
    const board = generateBoard();
    for (const cell of board.values()) {
      expect(cell.pos.q + cell.pos.r + cell.pos.s).toBe(0);
    }
  });

  it('each corner triangle has exactly 10 cells', () => {
    const board = generateBoard();
    for (let corner = 0; corner < 6; corner++) {
      const count = [...board.values()].filter(c => c.corner === corner).length;
      expect(count).toBe(10);
    }
  });

  it('center area has 61 cells (121 - 6*10)', () => {
    const board = generateBoard();
    const centerCount = [...board.values()].filter(c => c.corner === null).length;
    expect(centerCount).toBe(61);
  });
});

describe('posKey', () => {
  it('creates consistent string key from hex position', () => {
    expect(posKey({ q: 1, r: -2, s: 1 })).toBe('1,-2,1');
    expect(posKey({ q: 0, r: 0, s: 0 })).toBe('0,0,0');
  });
});
