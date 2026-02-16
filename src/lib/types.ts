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
