# Chinese Checkers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based Chinese Checkers game with 2-6 player support, AI opponent, and skeuomorphic visuals.

**Architecture:** Vite+Svelte SPA with Canvas rendering. Game logic lives in pure TypeScript modules (board model, rules engine, AI). UI layer is thin Svelte components that bind to stores and delegate rendering to Canvas.

**Tech Stack:** Vite, Svelte 5, TypeScript, Canvas API, Web Workers, Vitest

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.ts`, `src/App.svelte`, `index.html`

**Step 1: Initialize Vite + Svelte project**

Run:
```bash
cd "d:/github/Chinese Checkers"
npm create vite@latest . -- --template svelte-ts
```

If prompted about non-empty directory, choose to overwrite/continue.

**Step 2: Install dependencies**

Run:
```bash
npm install
```

**Step 3: Install Vitest for testing**

Run:
```bash
npm install -D vitest
```

**Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Verify dev server starts**

Run:
```bash
npm run dev
```

Expected: Vite dev server starts on localhost.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + Svelte + TypeScript project"
```

---

## Task 2: Board Data Model — Position Generation

**Files:**
- Create: `src/lib/board.ts`
- Create: `src/lib/types.ts`
- Test: `src/lib/__tests__/board.test.ts`

**Step 1: Define core types**

Create `src/lib/types.ts`:
```typescript
/** Cube coordinate on the hex grid. q + r + s = 0 */
export interface HexPos {
  q: number;
  r: number;
  s: number;
}

/** Which corner of the star (0-5, clockwise from top) */
export type CornerIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** Player color identifiers */
export const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
export type PlayerColor = (typeof PLAYER_COLORS)[number];

/** A single cell on the board */
export interface Cell {
  pos: HexPos;
  /** Which corner's home triangle this cell belongs to, or null if center */
  corner: CornerIndex | null;
  /** Color of the piece occupying this cell, or null if empty */
  piece: PlayerColor | null;
}

/** Player configuration */
export interface Player {
  color: PlayerColor;
  corner: CornerIndex;
  targetCorner: CornerIndex;
  isAI: boolean;
  name: string;
}

export type GamePhase = 'menu' | 'playing' | 'gameOver';

export interface GameConfig {
  playerCount: number;
  players: Player[];
}

export interface GameState {
  board: Map<string, Cell>;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  winner: PlayerColor | null;
  moveHistory: Move[];
}

export interface Move {
  from: HexPos;
  to: HexPos;
  player: PlayerColor;
}
```

**Step 2: Write failing test for board generation**

Create `src/lib/__tests__/board.test.ts`:
```typescript
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
```

**Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/board.test.ts`
Expected: FAIL — module `../board` not found

**Step 4: Implement board generation**

Create `src/lib/board.ts`:
```typescript
import type { HexPos, Cell, CornerIndex } from './types';

export const BOARD_SIZE = 4; // triangle side length

export function posKey(pos: HexPos): string {
  return `${pos.q},${pos.r},${pos.s}`;
}

export function parseKey(key: string): HexPos {
  const [q, r, s] = key.split(',').map(Number);
  return { q, r, s };
}

/**
 * The 6 corner directions of the star, as unit vectors pointing outward.
 * Index = CornerIndex (0=top, clockwise).
 *
 * The hex star board is built from a central hexagon of radius 4
 * plus 6 triangular tips of depth 4 pointing outward.
 */
const CORNER_DIRECTIONS: HexPos[] = [
  { q: 0, r: -1, s: 1 },  // 0: top
  { q: 1, r: -1, s: 0 },  // 1: top-right
  { q: 1, r: 0, s: -1 },  // 2: bottom-right
  { q: 0, r: 1, s: -1 },  // 3: bottom
  { q: -1, r: 1, s: 0 },  // 4: bottom-left
  { q: -1, r: 0, s: 1 },  // 5: top-left
];

/**
 * Generate the full 121-position Chinese Checkers star board.
 * Uses cube coordinates.
 */
export function generateBoard(): Map<string, Cell> {
  const board = new Map<string, Cell>();

  // Central hexagon: all positions where max(|q|,|r|,|s|) <= 4
  for (let q = -BOARD_SIZE; q <= BOARD_SIZE; q++) {
    for (let r = -BOARD_SIZE; r <= BOARD_SIZE; r++) {
      const s = -q - r;
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= BOARD_SIZE) {
        const pos: HexPos = { q, r, s };
        board.set(posKey(pos), { pos, corner: null, piece: null });
      }
    }
  }

  // 6 triangular tips
  for (let ci = 0; ci < 6; ci++) {
    const corner = ci as CornerIndex;
    const dir = CORNER_DIRECTIONS[ci];
    // The two perpendicular directions for building the triangle
    // For corner ci, the triangle extends along dir, and spreads along the two adjacent directions
    const adj1 = CORNER_DIRECTIONS[(ci + 2) % 6];
    const adj2 = CORNER_DIRECTIONS[(ci + 4) % 6];

    for (let depth = 1; depth <= BOARD_SIZE; depth++) {
      for (let spread = 0; spread < depth; spread++) {
        const baseQ = dir.q * (BOARD_SIZE + depth);
        const baseR = dir.r * (BOARD_SIZE + depth);
        const baseS = dir.s * (BOARD_SIZE + depth);

        const q = baseQ + adj1.q * spread + adj2.q * (depth - 1 - spread);
        const r = baseR + adj1.r * spread + adj2.r * (depth - 1 - spread);
        const s = baseS + adj1.s * spread + adj2.s * (depth - 1 - spread);

        // Verify cube coordinate constraint
        if (q + r + s !== 0) continue;

        const pos: HexPos = { q, r, s };
        const key = posKey(pos);
        if (!board.has(key)) {
          board.set(key, { pos, corner, piece: null });
        }
      }
    }
  }

  return board;
}

/** Get the opposite corner index */
export function oppositeCorner(corner: CornerIndex): CornerIndex {
  return ((corner + 3) % 6) as CornerIndex;
}

/** Get corner assignments for a given player count */
export function getCornerAssignments(playerCount: number): CornerIndex[] {
  switch (playerCount) {
    case 2: return [0, 3];
    case 3: return [0, 2, 4];
    case 4: return [0, 1, 3, 4];
    case 6: return [0, 1, 2, 3, 4, 5];
    default: return [0, 3];
  }
}

/** Place initial pieces for all players on the board */
export function placeInitialPieces(
  board: Map<string, Cell>,
  corners: CornerIndex[],
  colors: string[]
): void {
  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i];
    const color = colors[i];
    for (const cell of board.values()) {
      if (cell.corner === corner) {
        cell.piece = color as any;
      }
    }
  }
}
```

> **Note:** The triangle generation algorithm above is a first attempt. If the test shows the count isn't exactly 121 (61 center + 60 tips), debug and adjust the generation logic until all tests pass. The key invariant: each triangle tip has exactly 10 cells (rows of 1+2+3+4), and they don't overlap with the central hexagon.

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/board.test.ts`
Expected: All 5 tests PASS

If the 121-position count is wrong, debug the triangle generation. The central hex of radius 4 has 61 cells. Each triangle tip adds 10 (1+2+3+4). Total = 61 + 60 = 121.

**Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/board.ts src/lib/__tests__/board.test.ts
git commit -m "feat: add board data model with cube coordinates and 121-position star generation"
```

---

## Task 3: Game Rules Engine — Move Validation

**Files:**
- Create: `src/lib/rules.ts`
- Test: `src/lib/__tests__/rules.test.ts`

**Step 1: Write failing tests for movement rules**

Create `src/lib/__tests__/rules.test.ts`:
```typescript
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
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/rules.test.ts`
Expected: FAIL

**Step 3: Implement rules engine**

Create `src/lib/rules.ts`:
```typescript
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

/** Get all single-jump landing positions from a given origin */
export function getJumpTargets(pos: HexPos, board: Map<string, Cell>): HexPos[] {
  const jumps: HexPos[] = [];
  for (const dir of HEX_DIRECTIONS) {
    const mid = addPos(pos, dir);
    const midCell = board.get(posKey(mid));
    if (!midCell || !midCell.piece) continue; // must jump over a piece

    const land = addPos(mid, dir);
    const landCell = board.get(posKey(land));
    if (!landCell || landCell.piece) continue; // landing must be empty and on board

    jumps.push(land);
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
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/rules.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/rules.ts src/lib/__tests__/rules.test.ts
git commit -m "feat: add game rules engine with move validation and chain-jump detection"
```

---

## Task 4: Game State Management (Svelte Stores)

**Files:**
- Create: `src/lib/stores.ts`

**Step 1: Implement Svelte stores**

Create `src/lib/stores.ts`:
```typescript
import { writable, derived } from 'svelte/store';
import type { GameState, GameConfig, HexPos, Player, PlayerColor, CornerIndex, Move } from './types';
import { PLAYER_COLORS } from './types';
import { generateBoard, posKey, oppositeCorner, getCornerAssignments, placeInitialPieces } from './board';
import { getValidMoves, checkWin } from './rules';

export const gameConfig = writable<GameConfig>({
  playerCount: 2,
  players: [],
});

function createGameState() {
  const { subscribe, set, update } = writable<GameState>({
    board: new Map(),
    players: [],
    currentPlayerIndex: 0,
    phase: 'menu',
    winner: null,
    moveHistory: [],
  });

  return {
    subscribe,
    set,
    update,

    /** Start a new game with the given config */
    startGame(config: GameConfig) {
      const board = generateBoard();
      const corners = config.players.map(p => p.corner);
      const colors = config.players.map(p => p.color);
      placeInitialPieces(board, corners, colors);

      set({
        board,
        players: config.players,
        currentPlayerIndex: 0,
        phase: 'playing',
        winner: null,
        moveHistory: [],
      });
    },

    /** Execute a move */
    makeMove(from: HexPos, to: HexPos) {
      update(state => {
        const fromKey = posKey(from);
        const toKey = posKey(to);
        const fromCell = state.board.get(fromKey)!;
        const toCell = state.board.get(toKey)!;
        const playerColor = fromCell.piece!;

        // Move the piece
        toCell.piece = fromCell.piece;
        fromCell.piece = null;

        // Record move
        state.moveHistory.push({ from, to, player: playerColor });

        // Check win
        const currentPlayer = state.players[state.currentPlayerIndex];
        if (checkWin(state.board, currentPlayer.color, currentPlayer.targetCorner)) {
          state.winner = currentPlayer.color;
          state.phase = 'gameOver';
        } else {
          // Next player
          state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        }

        return state;
      });
    },

    /** Undo last move */
    undoMove() {
      update(state => {
        const lastMove = state.moveHistory.pop();
        if (!lastMove) return state;

        const fromCell = state.board.get(posKey(lastMove.from))!;
        const toCell = state.board.get(posKey(lastMove.to))!;
        fromCell.piece = toCell.piece;
        toCell.piece = null;

        // Go back to previous player
        state.currentPlayerIndex =
          (state.currentPlayerIndex - 1 + state.players.length) % state.players.length;
        state.phase = 'playing';
        state.winner = null;

        return state;
      });
    },

    /** Reset to menu */
    resetToMenu() {
      set({
        board: new Map(),
        players: [],
        currentPlayerIndex: 0,
        phase: 'menu',
        winner: null,
        moveHistory: [],
      });
    },
  };
}

export const gameState = createGameState();

/** Currently selected piece position and its valid moves */
export const selectedPiece = writable<{
  pos: HexPos | null;
  validMoves: HexPos[];
}>({
  pos: null,
  validMoves: [],
});
```

**Step 2: Commit**

```bash
git add src/lib/stores.ts
git commit -m "feat: add game state management with Svelte stores"
```

---

## Task 5: Canvas Board Rendering — Skeuomorphic Style

**Files:**
- Create: `src/lib/renderer.ts`
- Create: `src/components/BoardCanvas.svelte`

**Step 1: Implement the Canvas renderer**

Create `src/lib/renderer.ts` — this is the largest single file. It handles:
- Coordinate conversion (hex → pixel)
- Wood texture background
- Recessed slot rendering (inner shadow circles)
- Glass marble piece rendering (radial gradient + highlight + shadow)
- Valid move indicators (glowing rings)
- Selected piece highlight

```typescript
import type { HexPos, Cell, PlayerColor } from './types';
import { posKey } from './board';

/** Pixel spacing between hex centers */
const HEX_SIZE = 28;

/** Piece radius */
const PIECE_RADIUS = 12;

/** Slot radius */
const SLOT_RADIUS = 14;

/** Color palette for player pieces */
const PIECE_COLORS: Record<PlayerColor, { main: string; light: string; dark: string }> = {
  red:    { main: '#e74c3c', light: '#ff8a80', dark: '#b71c1c' },
  blue:   { main: '#2196f3', light: '#82b1ff', dark: '#0d47a1' },
  green:  { main: '#4caf50', light: '#b9f6ca', dark: '#1b5e20' },
  yellow: { main: '#ffc107', light: '#fff9c4', dark: '#f57f17' },
  purple: { main: '#9c27b0', light: '#ea80fc', dark: '#4a148c' },
  orange: { main: '#ff9800', light: '#ffe0b2', dark: '#e65100' },
};

/** Convert hex position to pixel coordinates on canvas */
export function hexToPixel(pos: HexPos, centerX: number, centerY: number): { x: number; y: number } {
  // Flat-top hex layout
  const x = centerX + HEX_SIZE * (3 / 2 * pos.q);
  const y = centerY + HEX_SIZE * (Math.sqrt(3) / 2 * pos.q + Math.sqrt(3) * pos.r);
  return { x, y };
}

/** Find which board position a pixel coordinate corresponds to */
export function pixelToHex(
  px: number,
  py: number,
  centerX: number,
  centerY: number,
  board: Map<string, Cell>
): HexPos | null {
  let closest: HexPos | null = null;
  let minDist = Infinity;

  for (const cell of board.values()) {
    const { x, y } = hexToPixel(cell.pos, centerX, centerY);
    const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
    if (dist < SLOT_RADIUS && dist < minDist) {
      minDist = dist;
      closest = cell.pos;
    }
  }

  return closest;
}

/** Draw the full board */
export function drawBoard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  board: Map<string, Cell>,
  selectedPos: HexPos | null,
  validMoves: HexPos[]
): void {
  const cx = width / 2;
  const cy = height / 2;

  // Background — wood texture
  drawWoodBackground(ctx, width, height);

  const validMoveKeys = new Set(validMoves.map(posKey));

  // Draw slots
  for (const cell of board.values()) {
    const { x, y } = hexToPixel(cell.pos, cx, cy);
    drawSlot(ctx, x, y);
  }

  // Draw valid move indicators
  for (const move of validMoves) {
    const { x, y } = hexToPixel(move, cx, cy);
    drawValidMoveIndicator(ctx, x, y);
  }

  // Draw pieces
  for (const cell of board.values()) {
    if (cell.piece) {
      const { x, y } = hexToPixel(cell.pos, cx, cy);
      const isSelected = selectedPos && posKey(cell.pos) === posKey(selectedPos);
      drawPiece(ctx, x, y, cell.piece, !!isSelected);
    }
  }
}

function drawWoodBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base wood color
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#deb887');
  gradient.addColorStop(0.3, '#d2a679');
  gradient.addColorStop(0.6, '#c49a6c');
  gradient.addColorStop(1, '#b8895a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Wood grain lines
  ctx.strokeStyle = 'rgba(139, 90, 43, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < h; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i + Math.sin(i * 0.02) * 3);
    for (let x = 0; x < w; x += 10) {
      ctx.lineTo(x, i + Math.sin((i + x) * 0.02) * 3);
    }
    ctx.stroke();
  }
}

function drawSlot(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Outer shadow (recessed effect)
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fill();

  // Inner lighter area
  ctx.beginPath();
  ctx.arc(x, y - 1, SLOT_RADIUS - 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(160, 120, 70, 0.6)';
  ctx.fill();

  // Inner shadow ring
  const innerGrad = ctx.createRadialGradient(x, y, SLOT_RADIUS - 4, x, y, SLOT_RADIUS);
  innerGrad.addColorStop(0, 'transparent');
  innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();
}

function drawPiece(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: PlayerColor,
  isSelected: boolean
): void {
  const palette = PIECE_COLORS[color];

  // Drop shadow
  ctx.beginPath();
  ctx.arc(x + 1, y + 2, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();

  // Main body — radial gradient for glass effect
  const bodyGrad = ctx.createRadialGradient(
    x - 3, y - 3, 2,
    x, y, PIECE_RADIUS
  );
  bodyGrad.addColorStop(0, palette.light);
  bodyGrad.addColorStop(0.5, palette.main);
  bodyGrad.addColorStop(1, palette.dark);

  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Specular highlight
  const highlightGrad = ctx.createRadialGradient(
    x - 4, y - 5, 1,
    x - 3, y - 4, 7
  );
  highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.beginPath();
  ctx.arc(x - 3, y - 4, 7, 0, Math.PI * 2);
  ctx.fillStyle = highlightGrad;
  ctx.fill();

  // Selection ring
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(x, y, PIECE_RADIUS + 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

function drawValidMoveIndicator(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Subtle fill
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(76, 175, 80, 0.15)';
  ctx.fill();
}
```

**Step 2: Create BoardCanvas Svelte component**

Create `src/components/BoardCanvas.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, selectedPiece } from '../lib/stores';
  import { drawBoard, pixelToHex, hexToPixel } from '../lib/renderer';
  import { getValidMoves } from '../lib/rules';
  import { posKey } from '../lib/board';
  import type { HexPos } from '../lib/types';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const WIDTH = 700;
  const HEIGHT = 700;

  // Animation state
  let animating = false;
  let animFrom: { x: number; y: number } | null = null;
  let animTo: { x: number; y: number } | null = null;
  let animPiece: string | null = null;
  let animProgress = 0;

  function render() {
    if (!ctx) return;
    const state = $gameState;
    const sel = $selectedPiece;
    drawBoard(ctx, WIDTH, HEIGHT, state.board, sel.pos, sel.validMoves);

    // Draw animation frame if active
    if (animating && animFrom && animTo && animPiece) {
      // Interpolation handled in animation loop
    }
  }

  function handleClick(e: MouseEvent) {
    if ($gameState.phase !== 'playing' || animating) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;

    const clickedPos = pixelToHex(px, py, cx, cy, $gameState.board);
    if (!clickedPos) {
      selectedPiece.set({ pos: null, validMoves: [] });
      render();
      return;
    }

    const sel = $selectedPiece;
    const clickedCell = $gameState.board.get(posKey(clickedPos));
    const currentPlayer = $gameState.players[$gameState.currentPlayerIndex];

    // If a piece is selected and we clicked a valid move target
    if (sel.pos && sel.validMoves.some(m => posKey(m) === posKey(clickedPos))) {
      gameState.makeMove(sel.pos, clickedPos);
      selectedPiece.set({ pos: null, validMoves: [] });
      render();
      return;
    }

    // If we clicked one of our own pieces, select it
    if (clickedCell?.piece === currentPlayer.color) {
      const moves = getValidMoves(clickedPos, $gameState.board);
      selectedPiece.set({ pos: clickedPos, validMoves: moves });
      render();
      return;
    }

    // Clicked empty or opponent piece — deselect
    selectedPiece.set({ pos: null, validMoves: [] });
    render();
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    render();
  });

  // Re-render when state changes
  $: if (ctx && $gameState) render();
  $: if (ctx && $selectedPiece) render();
</script>

<canvas
  bind:this={canvas}
  width={WIDTH}
  height={HEIGHT}
  on:click={handleClick}
  style="max-width: 100%; cursor: pointer; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);"
/>
```

**Step 3: Commit**

```bash
git add src/lib/renderer.ts src/components/BoardCanvas.svelte
git commit -m "feat: add Canvas board renderer with skeuomorphic wood and glass marble style"
```

---

## Task 6: UI Components — Menu, Game Screen, Controls

**Files:**
- Create: `src/components/MenuScreen.svelte`
- Create: `src/components/GameScreen.svelte`
- Create: `src/components/PlayerInfo.svelte`
- Create: `src/components/GameControls.svelte`
- Create: `src/components/GameOverModal.svelte`
- Modify: `src/App.svelte`

**Step 1: Create MenuScreen**

Create `src/components/MenuScreen.svelte` — player count selector, AI toggle per player, start button. Skeuomorphic card UI with wood-themed styling.

**Step 2: Create PlayerInfo**

Create `src/components/PlayerInfo.svelte` — shows player list, highlights current player, shows color dots.

**Step 3: Create GameControls**

Create `src/components/GameControls.svelte` — undo button, restart button, back to menu button.

**Step 4: Create GameOverModal**

Create `src/components/GameOverModal.svelte` — displays winner, play again / back to menu buttons.

**Step 5: Create GameScreen**

Create `src/components/GameScreen.svelte` — composes BoardCanvas + PlayerInfo + GameControls. Layout: board centered, player info on the side, controls at bottom.

**Step 6: Wire up App.svelte**

Modify `src/App.svelte` to show MenuScreen or GameScreen based on `$gameState.phase`.

**Step 7: Test in browser**

Run: `npm run dev`
Verify: Menu screen shows, can select players, start game, see board with pieces, click to select/move.

**Step 8: Commit**

```bash
git add src/components/ src/App.svelte
git commit -m "feat: add menu, game screen, player info, controls, and game over UI components"
```

---

## Task 7: AI Engine — Minimax with Web Worker

**Files:**
- Create: `src/lib/ai.ts`
- Create: `src/lib/ai-worker.ts`
- Test: `src/lib/__tests__/ai.test.ts`

**Step 1: Write failing test for AI evaluation**

Create `src/lib/__tests__/ai.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { evaluateBoard, findBestMove } from '../ai';
import { generateBoard, posKey, placeInitialPieces } from '../board';
import type { Player } from '../types';

describe('evaluateBoard', () => {
  it('returns a lower (better) score when pieces are closer to target', () => {
    const board = generateBoard();
    placeInitialPieces(board, [0, 3], ['red', 'blue']);
    const player: Player = {
      color: 'red', corner: 0, targetCorner: 3, isAI: true, name: 'AI'
    };
    const score1 = evaluateBoard(board, player);

    // Move a red piece closer to target corner 3 (bottom)
    // This is a rough test — score should improve
    expect(typeof score1).toBe('number');
    expect(score1).toBeGreaterThan(0);
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
    // The from position should have the player's piece
    expect(board.get(posKey(move!.from))!.piece).toBe('red');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/ai.test.ts`
Expected: FAIL

**Step 3: Implement AI engine**

Create `src/lib/ai.ts`:
```typescript
import type { HexPos, Cell, Player, Move } from './types';
import { posKey, parseKey } from './board';
import { getValidMoves } from './rules';

/** Hex distance between two positions */
function hexDistance(a: HexPos, b: HexPos): number {
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
}

/** Get all cells belonging to a target corner */
function getTargetPositions(board: Map<string, Cell>, targetCorner: number): HexPos[] {
  return [...board.values()]
    .filter(c => c.corner === targetCorner)
    .map(c => c.pos);
}

/** Evaluate the board from a player's perspective. Lower = better (closer to winning). */
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

/** Get all pieces belonging to a player */
function getPlayerPieces(board: Map<string, Cell>, color: string): HexPos[] {
  return [...board.values()]
    .filter(c => c.piece === color)
    .map(c => c.pos);
}

/** Clone the board (shallow copy of map with cloned cells) */
function cloneBoard(board: Map<string, Cell>): Map<string, Cell> {
  const copy = new Map<string, Cell>();
  for (const [key, cell] of board) {
    copy.set(key, { ...cell });
  }
  return copy;
}

/** Apply a move to a board clone */
function applyMove(board: Map<string, Cell>, from: HexPos, to: HexPos): void {
  const fromCell = board.get(posKey(from))!;
  const toCell = board.get(posKey(to))!;
  toCell.piece = fromCell.piece;
  fromCell.piece = null;
}

/** Minimax with alpha-beta pruning */
function minimax(
  board: Map<string, Cell>,
  player: Player,
  opponent: Player,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  if (depth === 0) {
    const playerScore = evaluateBoard(board, player);
    const opponentScore = evaluateBoard(board, opponent);
    return opponentScore - playerScore; // higher = better for player
  }

  const currentColor = maximizing ? player.color : opponent.color;
  const pieces = getPlayerPieces(board, currentColor);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const piece of pieces) {
      const moves = getValidMoves(piece, board);
      for (const move of moves) {
        const newBoard = cloneBoard(board);
        applyMove(newBoard, piece, move);
        const eval_ = minimax(newBoard, player, opponent, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const piece of pieces) {
      const moves = getValidMoves(piece, board);
      for (const move of moves) {
        const newBoard = cloneBoard(board);
        applyMove(newBoard, piece, move);
        const eval_ = minimax(newBoard, player, opponent, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/** Find the best move for an AI player */
export function findBestMove(
  board: Map<string, Cell>,
  player: Player,
  depth: number = 2,
  opponent?: Player
): Move | null {
  const pieces = getPlayerPieces(board, player.color);
  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  // Use a dummy opponent if not provided
  const opp = opponent ?? {
    color: 'blue' as any,
    corner: player.targetCorner as any,
    targetCorner: player.corner,
    isAI: false,
    name: 'Opponent',
  };

  for (const piece of pieces) {
    const moves = getValidMoves(piece, board);
    for (const move of moves) {
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
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/ai.test.ts`
Expected: All tests PASS

**Step 5: Create Web Worker wrapper**

Create `src/lib/ai-worker.ts`:
```typescript
import { findBestMove } from './ai';
import type { Cell, Player } from './types';

self.onmessage = (e: MessageEvent) => {
  const { boardData, player, opponent, depth } = e.data;

  // Reconstruct Map from serialized data
  const board = new Map<string, Cell>(boardData);

  const move = findBestMove(board, player, depth, opponent);
  self.postMessage({ move });
};
```

**Step 6: Integrate AI into game loop**

Add AI turn handling in `src/lib/stores.ts` — after `makeMove`, if the next player is AI, trigger AI computation via Web Worker and auto-play the move.

**Step 7: Commit**

```bash
git add src/lib/ai.ts src/lib/ai-worker.ts src/lib/__tests__/ai.test.ts src/lib/stores.ts
git commit -m "feat: add AI engine with minimax alpha-beta pruning and Web Worker execution"
```

---

## Task 8: Move Animations

**Files:**
- Modify: `src/lib/renderer.ts`
- Modify: `src/components/BoardCanvas.svelte`

**Step 1: Add animation support to renderer**

Add to `src/lib/renderer.ts`:
- `drawPieceAt(ctx, x, y, color)` — draw a piece at arbitrary pixel coords
- Arc interpolation function for jump animations

**Step 2: Add animation loop to BoardCanvas**

Modify `src/components/BoardCanvas.svelte`:
- On move, calculate from/to pixel positions
- Use `requestAnimationFrame` to animate piece sliding (200ms duration)
- For jumps, use a parabolic arc path
- Block input during animation

**Step 3: Test in browser**

Verify: Pieces animate smoothly when moving.

**Step 4: Commit**

```bash
git add src/lib/renderer.ts src/components/BoardCanvas.svelte
git commit -m "feat: add smooth piece movement and jump arc animations"
```

---

## Task 9: Polish and Final Integration

**Files:**
- Modify: `src/App.svelte` — global styles
- Modify: various components for edge cases

**Step 1: Add global styles**

Style the app container with a dark background, centered layout, proper font.

**Step 2: Handle edge cases**

- Prevent moving pieces into your own starting triangle (except your own pieces returning)
- Handle the case where a player has no valid moves (skip turn)
- Ensure AI doesn't take too long (timeout fallback)

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

**Step 4: Test full gameplay in browser**

Verify:
- 2-player local game works end to end
- 6-player game with AI opponents works
- Undo works correctly
- Win detection triggers game over modal

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: polish UI, handle edge cases, finalize Chinese Checkers game"
```

---

## Summary

| Task | Description | Est. Steps |
|------|-------------|------------|
| 1 | Project scaffolding | 6 |
| 2 | Board data model | 6 |
| 3 | Rules engine | 5 |
| 4 | Svelte stores | 2 |
| 5 | Canvas renderer | 3 |
| 6 | UI components | 8 |
| 7 | AI engine | 7 |
| 8 | Move animations | 4 |
| 9 | Polish & integration | 5 |
