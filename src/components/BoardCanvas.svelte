<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, selectedPiece } from '../lib/stores';
  import { drawBoard, pixelToHex } from '../lib/renderer';
  import { getValidMoves } from '../lib/rules';
  import { posKey } from '../lib/board';
  import type { HexPos } from '../lib/types';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const WIDTH = 700;
  const HEIGHT = 700;

  function render() {
    if (!ctx) return;
    drawBoard(ctx, WIDTH, HEIGHT, $gameState.board, $selectedPiece.pos, $selectedPiece.validMoves);
  }

  function handleClick(e: MouseEvent) {
    if ($gameState.phase !== 'playing') return;
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
    const currentPlayer = $gameState.players[$gameState.currentPlayerIndex];

    if (sel.pos && sel.validMoves.some(m => posKey(m) === posKey(clickedPos))) {
      gameState.makeMove(sel.pos, clickedPos);
      selectedPiece.set({ pos: null, validMoves: [] });
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
    if (ctx && $gameState) render();
  });
  $effect(() => {
    if (ctx && $selectedPiece) render();
  });
</script>

<canvas
  bind:this={canvas}
  width={WIDTH}
  height={HEIGHT}
  onclick={handleClick}
  style="max-width: 100%; cursor: pointer; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);"
/>
