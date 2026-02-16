<script lang="ts">
  import { gameState, gameConfig, selectedPiece } from '../lib/stores';

  function handleUndo() {
    selectedPiece.set({ pos: null, validMoves: [] });
    gameState.undoMove();
  }

  function handleRestart() {
    selectedPiece.set({ pos: null, validMoves: [] });
    const config = $gameConfig;
    if (config.players.length > 0) {
      gameState.startGame(config);
    }
  }

  function handleBackToMenu() {
    selectedPiece.set({ pos: null, validMoves: [] });
    gameState.resetToMenu();
  }
</script>

<div class="controls-panel">
  <button class="control-btn undo-btn" onclick={handleUndo}>
    <span class="btn-icon">↩</span>
    <span class="btn-text">悔棋</span>
  </button>
  
  <button class="control-btn restart-btn" onclick={handleRestart}>
    <span class="btn-icon">⟳</span>
    <span class="btn-text">重新开始</span>
  </button>
  
  <button class="control-btn back-btn" onclick={handleBackToMenu}>
    <span class="btn-icon">◀</span>
    <span class="btn-text">返回菜单</span>
  </button>
</div>

<style>
  .controls-panel {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    flex-wrap: wrap;
    padding: var(--space-md) 0;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
    position: relative;
    overflow: hidden;
  }

  .control-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .control-btn:hover::before {
    opacity: 1;
  }

  .control-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-icon {
    font-size: 1rem;
    color: var(--color-text-muted);
    transition: color var(--transition-base);
  }

  .btn-text {
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    letter-spacing: 0.05em;
    transition: color var(--transition-base);
  }

  .control-btn:hover .btn-icon,
  .control-btn:hover .btn-text {
    color: var(--color-text-primary);
  }

  /* Undo Button - Special styling */
  .undo-btn:hover {
    border-color: rgba(52, 152, 219, 0.4);
  }

  .undo-btn:hover .btn-icon {
    color: var(--color-blue-light);
  }

  /* Restart Button - Special styling */
  .restart-btn:hover {
    border-color: rgba(39, 174, 96, 0.4);
  }

  .restart-btn:hover .btn-icon {
    color: var(--color-green-light);
  }

  /* Back Button - Special styling */
  .back-btn {
    background: rgba(231, 76, 60, 0.08);
    border-color: rgba(231, 76, 60, 0.2);
  }

  .back-btn:hover {
    background: rgba(231, 76, 60, 0.15);
    border-color: rgba(231, 76, 60, 0.4);
  }

  .back-btn:hover .btn-icon {
    color: var(--color-red-light);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .controls-panel {
      gap: var(--space-sm);
    }

    .control-btn {
      padding: var(--space-sm) var(--space-md);
    }

    .btn-text {
      font-size: 0.85rem;
    }
  }
</style>