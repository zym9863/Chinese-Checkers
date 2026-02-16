<script lang="ts">
  import { gameState, gameConfig, selectedPiece } from '../lib/stores';

  const COLOR_CSS: Record<string, string> = {
    red: 'var(--color-red)',
    blue: 'var(--color-blue)',
    green: 'var(--color-green)',
    yellow: 'var(--color-yellow)',
    purple: 'var(--color-purple)',
    orange: 'var(--color-orange)',
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
  let winnerCss = $derived(winnerColor ? COLOR_CSS[winnerColor] : 'var(--color-gold)');

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
  <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-backdrop"></div>
    
    <!-- Confetti decoration -->
    <div class="confetti">
      {#each Array(20) as _, i}
        <div class="confetti-piece" style="animation-delay: {i * 0.1}s; --delay: {i * 0.1}s"></div>
      {/each}
    </div>
    
    <div class="modal-card">
      <!-- Trophy icon -->
      <div class="trophy-container">
        <div class="trophy-glow"></div>
        <div class="trophy">🏆</div>
      </div>
      
      <h2 id="modal-title" class="modal-title">游戏结束</h2>
      
      <div class="winner-section">
        <div class="winner-badge">
          <div class="winner-dot" style="background: {winnerCss}"></div>
          <div class="winner-glow" style="background: {winnerCss}"></div>
        </div>
        <span class="winner-name" style="color: {winnerCss}">{winnerName}</span>
        <span class="winner-text">获胜!</span>
      </div>
      
      <div class="modal-buttons">
        <button class="modal-btn primary-btn" onclick={handlePlayAgain}>
          <span class="btn-icon">⟳</span>
          <span class="btn-text">再来一局</span>
        </button>
        <button class="modal-btn secondary-btn" onclick={handleBackToMenu}>
          <span class="btn-icon">◀</span>
          <span class="btn-text">返回菜单</span>
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
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-modal);
    padding: var(--space-lg);
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(5, 8, 15, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Confetti Animation */
  .confetti {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    top: -20px;
    left: calc(50% + (var(--delay) * 30px - 100px));
    background: var(--color-gold);
    opacity: 0;
    animation: confettiFall 3s ease-out forwards;
    animation-delay: var(--delay);
  }

  .confetti-piece:nth-child(odd) {
    background: var(--color-red);
    border-radius: 50%;
  }

  .confetti-piece:nth-child(3n) {
    background: var(--color-blue);
    width: 8px;
    height: 8px;
  }

  .confetti-piece:nth-child(4n) {
    background: var(--color-green);
  }

  @keyframes confettiFall {
    0% {
      opacity: 1;
      transform: translateY(0) rotate(0deg);
    }
    100% {
      opacity: 0;
      transform: translateY(100vh) rotate(720deg);
    }
  }

  .modal-card {
    position: relative;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.03) 50%,
      rgba(255, 255, 255, 0.01) 100%
    );
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-xl);
    padding: var(--space-3xl) var(--space-2xl);
    min-width: 340px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow:
      0 32px 80px rgba(0, 0, 0, 0.5),
      0 0 1px rgba(255, 255, 255, 0.15) inset;
    animation: modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(212, 160, 90, 0.5) 50%,
      transparent 100%
    );
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(30px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Trophy */
  .trophy-container {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto var(--space-lg);
  }

  .trophy-glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle, rgba(212, 160, 90, 0.3) 0%, transparent 70%);
    animation: trophyGlow 2s ease-in-out infinite;
  }

  @keyframes trophyGlow {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 0.8; }
  }

  .trophy {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    animation: trophyBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
  }

  @keyframes trophyBounce {
    from {
      opacity: 0;
      transform: scale(0) rotate(-20deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  .modal-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-xl);
    letter-spacing: 0.1em;
    animation: fadeInUp 0.5s ease 0.4s backwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Winner Section */
  .winner-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    margin-bottom: var(--space-2xl);
    animation: fadeInUp 0.5s ease 0.5s backwards;
  }

  .winner-badge {
    position: relative;
    width: 36px;
    height: 36px;
  }

  .winner-dot {
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 -3px 6px rgba(0, 0, 0, 0.2),
      inset 0 3px 6px rgba(255, 255, 255, 0.3);
    z-index: 1;
  }

  .winner-glow {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    filter: blur(8px);
    opacity: 0.6;
    animation: winnerPulse 1.5s ease-in-out infinite;
  }

  @keyframes winnerPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.3); opacity: 0.3; }
  }

  .winner-name {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .winner-text {
    font-family: var(--font-body);
    font-size: 1.25rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }

  /* Buttons */
  .modal-buttons {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    animation: fadeInUp 0.5s ease 0.6s backwards;
  }

  .modal-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
    position: relative;
    overflow: hidden;
  }

  .btn-icon {
    font-size: 1rem;
  }

  .btn-text {
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.05em;
  }

  /* Primary Button */
  .primary-btn {
    background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-amber) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 16px rgba(212, 160, 90, 0.3);
  }

  .primary-btn .btn-icon,
  .primary-btn .btn-text {
    color: white;
  }

  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(212, 160, 90, 0.4);
  }

  .primary-btn:active {
    transform: translateY(0);
  }

  /* Secondary Button */
  .secondary-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .secondary-btn .btn-icon {
    color: var(--color-text-muted);
  }

  .secondary-btn .btn-text {
    color: var(--color-text-secondary);
  }

  .secondary-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .secondary-btn:hover .btn-icon,
  .secondary-btn:hover .btn-text {
    color: var(--color-text-primary);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .modal-card {
      padding: var(--space-xl) var(--space-lg);
      min-width: auto;
    }

    .modal-title {
      font-size: 1.5rem;
    }

    .winner-section {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .modal-buttons {
      flex-direction: column;
    }

    .modal-btn {
      justify-content: center;
    }
  }
</style>