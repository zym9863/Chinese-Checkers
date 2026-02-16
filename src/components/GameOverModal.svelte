<script lang="ts">
  import { gameState, gameConfig, selectedPiece } from '../lib/stores';

  const COLOR_CSS: Record<string, string> = {
    red: '#e74c3c',
    blue: '#2196f3',
    green: '#4caf50',
    yellow: '#ffc107',
    purple: '#9c27b0',
    orange: '#ff9800',
  };

  const COLOR_NAMES: Record<string, string> = {
    red: '红方',
    blue: '蓝方',
    green: '绿方',
    yellow: '黄方',
    purple: '紫方',
    orange: '橙方',
  };

  let winnerColor = $derived($gameState.winner);
  let winnerName = $derived(winnerColor ? COLOR_NAMES[winnerColor] : '');
  let winnerCss = $derived(winnerColor ? COLOR_CSS[winnerColor] : '#fff');

  function handlePlayAgain() {
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

{#if $gameState.phase === 'gameOver'}
  <div class="modal-overlay">
    <div class="modal-card">
      <h2 class="modal-title">游戏结束</h2>
      <div class="winner-info">
        <span class="winner-dot" style="background-color: {winnerCss}"></span>
        <span class="winner-name" style="color: {winnerCss}">{winnerName}</span>
        <span class="winner-text">获胜!</span>
      </div>
      <div class="modal-buttons">
        <button class="modal-btn play-again-btn" onclick={handlePlayAgain}>
          再来一局
        </button>
        <button class="modal-btn menu-btn" onclick={handleBackToMenu}>
          返回菜单
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-card {
    background: linear-gradient(135deg, #d4a05a 0%, #c8903e 50%, #b5834a 100%);
    border-radius: 20px;
    padding: 2.5rem 3rem;
    box-shadow:
      0 16px 48px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2);
    border: 2px solid #a87238;
    text-align: center;
    min-width: 300px;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: scale(0.9) translateY(-20px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  .modal-title {
    font-size: 1.8rem;
    color: #3a1f04;
    margin: 0 0 1.5rem;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
    letter-spacing: 0.1em;
  }

  .winner-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .winner-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.3),
      inset 0 -3px 6px rgba(0, 0, 0, 0.2),
      inset 0 3px 6px rgba(255, 255, 255, 0.3);
  }

  .winner-name {
    font-size: 1.5rem;
    font-weight: 700;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .winner-text {
    font-size: 1.5rem;
    color: #3a1f04;
    font-weight: 600;
  }

  .modal-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .modal-btn {
    border-radius: 12px;
    padding: 0.7rem 1.8rem;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.05em;
  }

  .play-again-btn {
    background: linear-gradient(180deg, #e74c3c 0%, #c0392b 100%);
    color: #fff;
    border: 2px solid #ff6b5a;
    box-shadow:
      0 4px 12px rgba(231, 76, 60, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .play-again-btn:hover {
    background: linear-gradient(180deg, #ff6b5a 0%, #e74c3c 100%);
    transform: translateY(-2px);
    box-shadow:
      0 6px 16px rgba(231, 76, 60, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .menu-btn {
    background: linear-gradient(180deg, #7a5535 0%, #5a3d20 100%);
    color: #e8d5b8;
    border: 2px solid #4a2d12;
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .menu-btn:hover {
    background: linear-gradient(180deg, #8a6545 0%, #6a4d30 100%);
    transform: translateY(-2px);
    border-color: #d4a05a;
    box-shadow:
      0 5px 14px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .modal-btn:active {
    transform: translateY(0px);
  }
</style>
