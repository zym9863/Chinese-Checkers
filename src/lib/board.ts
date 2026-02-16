import type { HexPos, CornerIndex, Cell, PlayerColor } from './types';

/** Radius of the central hexagonal region */
export const BOARD_SIZE = 4;

/** Total number of cells on the board: 61 (center) + 6*10 (tips) = 121 */
export const TOTAL_CELLS = 121;

/**
 * Outward-pointing unit vectors for each corner of the star.
 * Index = CornerIndex (0 = top, clockwise).
 */
export const CORNER_DIRECTIONS: readonly HexPos[] = [
  { q: 0, r: -1, s: 1 },  // 0: top
  { q: 1, r: -1, s: 0 },  // 1: top-right
  { q: 1, r: 0, s: -1 },  // 2: bottom-right
  { q: 0, r: 1, s: -1 },  // 3: bottom
  { q: -1, r: 1, s: 0 },  // 4: bottom-left
  { q: -1, r: 0, s: 1 },  // 5: top-left
];

/** Create a string key from a hex position for use in Maps */
export function posKey(pos: HexPos): string {
  return `${pos.q},${pos.r},${pos.s}`;
}

/** Parse a string key back into a hex position */
export function parseKey(key: string): HexPos {
  const [q, r, s] = key.split(',').map(Number);
  return { q, r, s };
}

/** Get the opposite corner (across the board) */
export function oppositeCorner(corner: CornerIndex): CornerIndex {
  return ((corner + 3) % 6) as CornerIndex;
}

/**
 * Rotate a cube coordinate 60 degrees clockwise.
 * (q, r, s) -> (-r, -s, -q)
 */
function rotateCW(pos: HexPos): HexPos {
  return { q: -pos.r, r: -pos.s, s: -pos.q };
}

/**
 * Rotate a cube coordinate by n * 60 degrees clockwise.
 */
function rotateN(pos: HexPos, n: number): HexPos {
  let result = pos;
  for (let i = 0; i < n; i++) {
    result = rotateCW(result);
  }
  return result;
}

/**
 * Generate the base triangle cells for corner 0 (top).
 *
 * The triangle extends upward (in the -r, +s direction) from the hex boundary.
 * At depth d (1..4) from the hex edge, there are (5-d) cells.
 * Row pattern:
 *   d=1: 4 cells, d=2: 3 cells, d=3: 2 cells, d=4: 1 cell
 *   Total = 4+3+2+1 = 10
 *
 * Cell at depth d, width w: (w, -(4+d), 4+d-w) for w = 0..(4-d)
 */
function generateCorner0Cells(): HexPos[] {
  const cells: HexPos[] = [];
  for (let d = 1; d <= BOARD_SIZE; d++) {
    for (let w = 0; w <= BOARD_SIZE - d; w++) {
      cells.push({ q: w, r: -(BOARD_SIZE + d), s: BOARD_SIZE + d - w });
    }
  }
  return cells;
}

/**
 * Generate the complete Chinese Checkers board.
 *
 * The board consists of:
 * - A central hexagon of radius 4 (61 cells where max(|q|,|r|,|s|) <= 4)
 * - 6 triangular tips of depth 4 pointing outward (10 cells each = 60 total)
 * - Total: 121 cells
 */
export function generateBoard(): Map<string, Cell> {
  const board = new Map<string, Cell>();

  // 1. Generate central hexagon (radius 4, 61 cells)
  for (let q = -BOARD_SIZE; q <= BOARD_SIZE; q++) {
    for (let r = -BOARD_SIZE; r <= BOARD_SIZE; r++) {
      const s = -q - r;
      if (Math.abs(s) <= BOARD_SIZE) {
        const pos: HexPos = { q, r, s };
        const key = posKey(pos);
        board.set(key, { pos, corner: null, piece: null });
      }
    }
  }

  // 2. Generate 6 triangular tips
  const corner0Cells = generateCorner0Cells();

  for (let ci = 0; ci < 6; ci++) {
    for (const basePos of corner0Cells) {
      const pos = rotateN(basePos, ci);
      const key = posKey(pos);
      board.set(key, { pos, corner: ci as CornerIndex, piece: null });
    }
  }

  return board;
}

/**
 * Get the corner assignments for a given number of players.
 * Players are evenly distributed around the board.
 */
export function getCornerAssignments(playerCount: number): CornerIndex[] {
  switch (playerCount) {
    case 2:
      return [0, 3]; // top and bottom (opposite)
    case 3:
      return [0, 2, 4]; // every other corner
    case 4:
      return [0, 1, 3, 4]; // two pairs of adjacent corners
    case 6:
      return [0, 1, 2, 3, 4, 5]; // all corners
    default:
      throw new Error(`Unsupported player count: ${playerCount}`);
  }
}

/**
 * Place initial pieces on the board for the given players.
 * Each player's pieces are placed in their home corner triangle.
 */
export function placeInitialPieces(
  board: Map<string, Cell>,
  corners: CornerIndex[],
  colors: PlayerColor[],
): void {
  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i];
    const color = colors[i];
    for (const cell of board.values()) {
      if (cell.corner === corner) {
        cell.piece = color;
      }
    }
  }
}
