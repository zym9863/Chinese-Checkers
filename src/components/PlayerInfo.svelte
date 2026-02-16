<script lang="ts">
  import { gameState } from '../lib/stores';

  const COLOR_CSS: Record<string, string> = {
    red: '#e74c3c',
    blue: '#2196f3',
    green: '#4caf50',
    yellow: '#ffc107',
    purple: '#9c27b0',
    orange: '#ff9800',
  };
</script>

<div class="player-info-panel">
  <h3 class="panel-title">玩家</h3>
  <div class="player-list">
    {#each $gameState.players as player, i}
      <div class="player-row" class:active={i === $gameState.currentPlayerIndex}>
        <span class="color-dot" style="background-color: {COLOR_CSS[player.color]}"></span>
        <span class="player-name">
          {player.name}
          {#if player.isAI}
            <span class="ai-badge">(AI)</span>
          {/if}
        </span>
        {#if i === $gameState.currentPlayerIndex}
          <span class="turn-indicator">◀</span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .player-info-panel {
    background: linear-gradient(135deg, #d4a05a 0%, #c8903e 50%, #b5834a 100%);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border: 2px solid #a87238;
    min-width: 180px;
  }

  .panel-title {
    font-size: 1rem;
    color: #3a1f04;
    margin: 0 0 0.75rem;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .player-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .player-row.active {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
  }

  .color-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  .player-name {
    flex: 1;
    color: #3a1f04;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .ai-badge {
    color: #6a4d30;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .turn-indicator {
    color: #3a1f04;
    font-size: 0.85rem;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
