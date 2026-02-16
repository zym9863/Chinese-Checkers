import { findBestMove } from './ai';
import type { Cell, Player } from './types';

self.onmessage = (e: MessageEvent) => {
  const { boardData, player, opponent, depth } = e.data;
  const board = new Map<string, Cell>(boardData);
  const move = findBestMove(board, player, depth, opponent);
  self.postMessage({ move });
};
