<script lang="ts">
  import { gameState, gameConfig } from '../lib/stores';
  import { getCornerAssignments, oppositeCorner } from '../lib/board';
  import { PLAYER_COLORS } from '../lib/types';
  import type { Player, CornerIndex } from '../lib/types';

  const COLOR_CSS: Record<string, string> = {
    red: '#e74c3c',
    blue: '#2196f3',
    green: '#4caf50',
    yellow: '#ffc107',
    purple: '#9c27b0',
    orange: '#ff9800',
  };

  const COLOR_NAMES: Record<string, string> = {
    red: '红',
    blue: '蓝',
    green: '绿',
    yellow: '黄',
    purple: '紫',
    orange: '橙',
  };

  let playerCount = $state(2);
  let aiFlags = $state<boolean[]>([false, false, false, false, false, false]);

  let players = $derived.by(() => {
    const corners = getCornerAssignments(playerCount);
    return corners.map((corner, i) => ({
      color: PLAYER_COLORS[i],
      corner,
      targetCorner: oppositeCorner(corner),
      isAI: aiFlags[i],
      name: `${COLOR_NAMES[PLAYER_COLORS[i]]}方`,
    }));
  });

  function selectPlayerCount(count: number) {
    playerCount = count;
    // Reset AI flags
    aiFlags = [false, false, false, false, false, false];
  }

  function toggleAI(index: number) {
    aiFlags[index] = !aiFlags[index];
  }

  function startGame() {
    const config = {
      playerCount,
      players: players.map((p, i) => ({
        ...p,
        isAI: aiFlags[i],
      })),
    };
    gameConfig.set(config);
    gameState.startGame(config);
  }
</script>

<div class="menu-container">
  <div class="menu-card">
    <h1 class="title">跳棋</h1>
    <p class="subtitle">中国跳棋</p>

    <div class="section">
      <h3 class="section-title">玩家数量</h3>
      <div class="player-count-group">
        {#each [2, 3, 4, 6] as count}
          <button
            class="count-btn"
            class:active={playerCount === count}
            onclick={() => selectPlayerCount(count)}
          >
            {count}人
          </button>
        {/each}
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">玩家设置</h3>
      <div class="player-list">
        {#each players as player, i}
          <div class="player-row">
            <span class="color-dot" style="background-color: {COLOR_CSS[player.color]}"></span>
            <span class="player-name">{player.name}</span>
            <label class="ai-toggle">
              <input
                type="checkbox"
                checked={aiFlags[i]}
                onchange={() => toggleAI(i)}
              />
              <span class="ai-label">AI</span>
            </label>
          </div>
        {/each}
      </div>
    </div>

    <button class="start-btn" onclick={startGame}>
      开始游戏
    </button>
  </div>
</div>

<style>
  .menu-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .menu-card {
    background: linear-gradient(135deg, #d4a05a 0%, #c8903e 50%, #b5834a 100%);
    border-radius: 20px;
    padding: 2.5rem 3rem;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2);
    max-width: 440px;
    width: 100%;
    text-align: center;
    border: 2px solid #a87238;
  }

  .title {
    font-size: 3rem;
    margin: 0 0 0.2rem;
    color: #3a1f04;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
    letter-spacing: 0.1em;
  }

  .subtitle {
    font-size: 1rem;
    color: #5a3d20;
    margin: 0 0 1.5rem;
    letter-spacing: 0.15em;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1rem;
    color: #3a1f04;
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .player-count-group {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .count-btn {
    background: linear-gradient(180deg, #7a5535 0%, #5a3d20 100%);
    color: #e8d5b8;
    border: 2px solid #4a2d12;
    border-radius: 10px;
    padding: 0.5rem 1.2rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    font-weight: 600;
  }

  .count-btn:hover {
    background: linear-gradient(180deg, #8a6545 0%, #6a4d30 100%);
    transform: translateY(-1px);
    border-color: #d4a05a;
  }

  .count-btn.active {
    background: linear-gradient(180deg, #e74c3c 0%, #c0392b 100%);
    border-color: #ff6b5a;
    color: #fff;
    box-shadow:
      0 3px 12px rgba(231, 76, 60, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .player-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    padding: 0.6rem 1rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .color-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  .player-name {
    flex: 1;
    text-align: left;
    color: #3a1f04;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .ai-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }

  .ai-toggle input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #e74c3c;
    cursor: pointer;
  }

  .ai-label {
    color: #5a3d20;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .start-btn {
    background: linear-gradient(180deg, #e74c3c 0%, #c0392b 100%);
    color: #fff;
    border: 2px solid #ff6b5a;
    border-radius: 14px;
    padding: 0.85rem 2.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.1em;
    box-shadow:
      0 4px 16px rgba(231, 76, 60, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    margin-top: 0.5rem;
  }

  .start-btn:hover {
    background: linear-gradient(180deg, #ff6b5a 0%, #e74c3c 100%);
    transform: translateY(-2px);
    box-shadow:
      0 6px 20px rgba(231, 76, 60, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .start-btn:active {
    transform: translateY(0px);
    box-shadow:
      0 2px 8px rgba(231, 76, 60, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
</style>
