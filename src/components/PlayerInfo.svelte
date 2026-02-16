<script lang="ts">
  import { gameState } from '../lib/stores';

  const COLOR_CSS: Record<string, string> = {
    red: 'var(--color-red)',
    blue: 'var(--color-blue)',
    green: 'var(--color-green)',
    yellow: 'var(--color-yellow)',
    purple: 'var(--color-purple)',
    orange: 'var(--color-orange)',
  };
</script>

<div class="player-info-panel">
  <div class="panel-header">
    <h3 class="panel-title">玩家</h3>
    <div class="panel-divider"></div>
  </div>
  
  <div class="player-list">
    {#each $gameState.players as player, i}
      <div 
        class="player-row" 
        class:active={i === $gameState.currentPlayerIndex}
        style="animation-delay: {i * 60}ms"
      >
        <div class="player-color-wrapper">
          <span class="color-dot" style="background: {COLOR_CSS[player.color]}"></span>
          {#if i === $gameState.currentPlayerIndex}
            <span class="color-pulse" style="background: {COLOR_CSS[player.color]}"></span>
          {/if}
        </div>
        
        <div class="player-info">
          <span class="player-name">{player.name}</span>
          {#if player.isAI}
            <span class="ai-badge">AI</span>
          {/if}
        </div>
        
        {#if i === $gameState.currentPlayerIndex}
          <div class="turn-indicator">
            <span class="turn-arrow">▸</span>
            <span class="turn-text">回合</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .player-info-panel {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(255, 255, 255, 0.01) 100%
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    min-width: 200px;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.3),
      0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  .panel-header {
    margin-bottom: var(--space-md);
  }

  .panel-title {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin: 0 0 var(--space-sm);
    text-align: center;
  }

  .panel-divider {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(212, 160, 90, 0.3) 50%,
      transparent 100%
    );
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .player-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid transparent;
    transition: all var(--transition-base);
    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
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

  .player-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .player-row.active {
    background: linear-gradient(
      135deg,
      rgba(212, 160, 90, 0.12) 0%,
      rgba(212, 160, 90, 0.06) 100%
    );
    border-color: rgba(212, 160, 90, 0.3);
    box-shadow: 0 0 20px rgba(212, 160, 90, 0.1);
  }

  .player-color-wrapper {
    position: relative;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .color-dot {
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
    z-index: 1;
  }

  .color-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    opacity: 0.5;
    filter: blur(4px);
    animation: pulse 1.5s ease-in-out infinite;
    z-index: 0;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.3); opacity: 0; }
  }

  .player-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    min-width: 0;
  }

  .player-name {
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .player-row.active .player-name {
    color: var(--color-gold);
  }

  .ai-badge {
    font-size: 0.65rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-muted);
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    letter-spacing: 0.05em;
  }

  .turn-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-amber) 100%);
    border-radius: var(--radius-sm);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .turn-arrow {
    font-size: 0.7rem;
    color: white;
  }

  .turn-text {
    font-size: 0.7rem;
    font-weight: var(--font-weight-semibold);
    color: white;
    letter-spacing: 0.05em;
  }

  /* Responsive */
  @media (max-width: 960px) {
    .player-info-panel {
      width: 100%;
      min-width: auto;
    }

    .player-list {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }

    .player-row {
      flex: 1;
      min-width: 140px;
    }
  }

  @media (max-width: 480px) {
    .player-info-panel {
      padding: var(--space-md);
    }

    .player-row {
      min-width: 100%;
    }
  }
</style>