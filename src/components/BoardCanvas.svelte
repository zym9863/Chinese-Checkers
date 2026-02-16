<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, selectedPiece, triggerAIMove } from '../lib/stores';
  import { drawBoard, drawPieceAt, hexToPixel, pixelToHex } from '../lib/renderer';
  import { getValidMoves } from '../lib/rules';
  import { posKey } from '../lib/board';
  import type { HexPos, PlayerColor } from '../lib/types';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const WIDTH = 700;
  const HEIGHT = 700;

  // ── Animation state (Svelte 5 runes) ──────────────────────────────────
  let animating = $state(false);
  let animFromPixel = $state({ x: 0, y: 0 });
  let animToPixel = $state({ x: 0, y: 0 });
  let animColor = $state<PlayerColor>('red');
  let animFromPos = $state<HexPos | null>(null);
  let animProgress = $state(0);
  let animStartTime = $state(0);

  // Pending move to execute after animation completes
  let pendingFrom = $state<HexPos | null>(null);
  let pendingTo = $state<HexPos | null>(null);
  let pendingIsAI = $state(false);

  // Guard to prevent duplicate AI trigger scheduling
  let aiTriggerScheduled = false;

  const ANIM_DURATION = 200; // ms

  function render(excludePos?: HexPos | null) {
    if (!ctx) return;
    drawBoard(ctx, WIDTH, HEIGHT, $gameState.board, $selectedPiece.pos, $selectedPiece.validMoves, excludePos);
  }

  function animationFrame(timestamp: number) {
    if (!animating) return;

    const elapsed = timestamp - animStartTime;
    animProgress = Math.min(elapsed / ANIM_DURATION, 1);

    // Ease-out cubic for smooth deceleration
    const t = 1 - Math.pow(1 - animProgress, 3);

    // Interpolate pixel position
    const currentX = animFromPixel.x + (animToPixel.x - animFromPixel.x) * t;
    const currentY = animFromPixel.y + (animToPixel.y - animFromPixel.y) * t;

    // Render board without the moving piece at its source
    render(animFromPos);

    // Draw the piece at the interpolated position
    drawPieceAt(ctx, currentX, currentY, animColor);

    if (animProgress < 1) {
      requestAnimationFrame(animationFrame);
    } else {
      // Animation complete: execute the actual move
      completeAnimation();
    }
  }

  function completeAnimation() {
    const from = pendingFrom;
    const to = pendingTo;

    // Clear animation state
    animating = false;
    animFromPos = null;
    pendingFrom = null;
    pendingTo = null;
    pendingIsAI = false;

    if (from && to) {
      gameState.makeMove(from, to);
      selectedPiece.set({ pos: null, validMoves: [] });
      // AI trigger is handled by the $effect watching gameState
    }
  }

  /** Callback passed to triggerAIMove to animate AI moves */
  function aiAnimateCallback(from: HexPos, to: HexPos) {
    makeAnimatedMove(from, to, true);
  }

  /**
   * Start an animated move from one position to another.
   * Can be called for both human and AI moves.
   */
  export function makeAnimatedMove(from: HexPos, to: HexPos, isAI: boolean = false) {
    if (animating) return; // Ignore if already animating

    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    // Get the piece color from the board before moving
    const fromCell = $gameState.board.get(posKey(from));
    if (!fromCell || !fromCell.piece) return;

    // Save pixel positions and piece color
    animFromPixel = hexToPixel(from, centerX, centerY);
    animToPixel = hexToPixel(to, centerX, centerY);
    animColor = fromCell.piece;
    animFromPos = from;

    // Save the pending move
    pendingFrom = from;
    pendingTo = to;
    pendingIsAI = isAI;

    // Clear selection immediately for visual feedback
    selectedPiece.set({ pos: null, validMoves: [] });

    // Start animation
    animating = true;
    animProgress = 0;
    animStartTime = performance.now();
    requestAnimationFrame(animationFrame);
  }

  function handleClick(e: MouseEvent) {
    if ($gameState.phase !== 'playing') return;
    if (animating) return; // Block clicks during animation

    // Block clicks if current player is AI
    const currentPlayer = $gameState.players[$gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    const clickedPos = pixelToHex(px, py, WIDTH / 2, HEIGHT / 2, $gameState.board);
    if (!clickedPos) {
      selectedPiece.set({ pos: null, validMoves: [] });
      return;
    }

    const sel = $selectedPiece;
    const clickedCell = $gameState.board.get(posKey(clickedPos));

    if (sel.pos && sel.validMoves.some(m => posKey(m) === posKey(clickedPos))) {
      // Valid move selected: start animated move
      makeAnimatedMove(sel.pos, clickedPos, false);
      return;
    }

    if (clickedCell?.piece === currentPlayer.color) {
      const moves = getValidMoves(clickedPos, $gameState.board);
      selectedPiece.set({ pos: clickedPos, validMoves: moves });
      return;
    }

    selectedPiece.set({ pos: null, validMoves: [] });
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    render();
  });

  // Use $effect for Svelte 5 reactivity
  $effect(() => {
    if (ctx && $gameState && !animating) render();
  });
  $effect(() => {
    if (ctx && $selectedPiece && !animating) render();
  });

  // Auto-trigger AI move when it's an AI player's turn
  $effect(() => {
    const state = $gameState;
    if (state.phase === 'playing' && !animating && ctx) {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.isAI && !aiTriggerScheduled) {
        aiTriggerScheduled = true;
        setTimeout(() => {
          aiTriggerScheduled = false;
          triggerAIMove(aiAnimateCallback);
        }, 300);
      }
    }
  });
</script>

<canvas
  bind:this={canvas}
  width={WIDTH}
  height={HEIGHT}
  onclick={handleClick}
  class="game-canvas"
></canvas>

<style>
  .game-canvas {
    max-width: 100%;
    height: auto;
    cursor: pointer;
    border-radius: var(--radius-lg);
    display: block;
  }
</style>