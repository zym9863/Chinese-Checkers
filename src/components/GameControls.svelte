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
  <button class="control-btn" onclick={handleUndo}>
    悔棋
  </button>
  <button class="control-btn" onclick={handleRestart}>
    重新开始
  </button>
  <button class="control-btn back-btn" onclick={handleBackToMenu}>
    返回菜单
  </button>
</div>

<style>
  .controls-panel {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0.75rem 0;
  }

  .control-btn {
    background: linear-gradient(180deg, #7a5535 0%, #5a3d20 100%);
    color: #e8d5b8;
    border: 2px solid #4a2d12;
    border-radius: 12px;
    padding: 0.6rem 1.4rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    letter-spacing: 0.05em;
  }

  .control-btn:hover {
    background: linear-gradient(180deg, #8a6545 0%, #6a4d30 100%);
    transform: translateY(-1px);
    border-color: #d4a05a;
    box-shadow:
      0 5px 14px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .control-btn:active {
    transform: translateY(1px);
    box-shadow:
      0 1px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .back-btn {
    background: linear-gradient(180deg, #6b3a3a 0%, #4a2020 100%);
    border-color: #5a2828;
  }

  .back-btn:hover {
    background: linear-gradient(180deg, #7b4a4a 0%, #5a3030 100%);
    border-color: #c0392b;
  }
</style>
