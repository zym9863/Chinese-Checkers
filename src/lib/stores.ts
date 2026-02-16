import { writable, derived, get } from 'svelte/store';
import type { GameState, GameConfig, HexPos, Player, PlayerColor, CornerIndex, Move } from './types';
import { PLAYER_COLORS } from './types';
import { generateBoard, posKey, oppositeCorner, getCornerAssignments, placeInitialPieces } from './board';
import { getValidMoves, checkWin } from './rules';
import { findBestMove } from './ai';

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

/**
 * Trigger AI move if the current player is an AI.
 * @param animateCallback - Optional callback to animate the move.
 *   If provided, the callback receives (from, to) and is responsible for
 *   executing the move (via makeAnimatedMove). If not provided, the move
 *   is executed directly.
 */
export function triggerAIMove(
  animateCallback?: (from: HexPos, to: HexPos) => void,
) {
  const state = get(gameState);
  if (state.phase !== 'playing') return;
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer.isAI) return;

  // Find opponent (next non-AI player or first opponent)
  const opponentIndex = (state.currentPlayerIndex + 1) % state.players.length;
  const opponent = state.players[opponentIndex];

  // Use direct call (simpler than worker for now)
  const move = findBestMove(state.board, currentPlayer, 2, opponent);
  if (move) {
    setTimeout(() => {
      if (animateCallback) {
        animateCallback(move.from, move.to);
      } else {
        gameState.makeMove(move.from, move.to);
        // Check if next player is also AI
        triggerAIMove(animateCallback);
      }
    }, 300); // Small delay for visual feedback
  }
}
