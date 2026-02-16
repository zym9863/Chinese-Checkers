<script lang="ts">
  import { gameState, gameConfig } from '../lib/stores';
  import { getCornerAssignments, oppositeCorner } from '../lib/board';
  import { PLAYER_COLORS } from '../lib/types';
  import type { Player, CornerIndex } from '../lib/types';

  const COLOR_CSS: Record<string, string> = {
    red: 'var(--color-red)',
    blue: 'var(--color-blue)',
    green: 'var(--color-green)',
    yellow: 'var(--color-yellow)',
    purple: 'var(--color-purple)',
    orange: 'var(--color-orange)',
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
  <!-- Decorative Elements -->
  <div class="decoration decoration-1"></div>
  <div class="decoration decoration-2"></div>
  <div class="decoration decoration-3"></div>
  
  <div class="menu-card">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <div class="logo-ring"></div>
        <div class="logo-inner">
          <span class="logo-icon">棋</span>
        </div>
      </div>
      <h1 class="title">跳棋</h1>
      <p class="subtitle">Chinese Checkers</p>
    </div>

    <!-- Player Count Section -->
    <div class="section">
      <h3 class="section-title">
        <span class="section-icon">◈</span>
        玩家数量
      </h3>
      <div class="player-count-group">
        {#each [2, 3, 4, 6] as count, i}
          <button
            class="count-btn"
            class:active={playerCount === count}
            onclick={() => selectPlayerCount(count)}
            style="animation-delay: {i * 50}ms"
          >
            <span class="count-number">{count}</span>
            <span class="count-label">人</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Player Settings Section -->
    <div class="section">
      <h3 class="section-title">
        <span class="section-icon">◈</span>
        玩家设置
      </h3>
      <div class="player-list">
        {#each players as player, i}
          <div 
            class="player-row" 
            style="animation-delay: {i * 80}ms"
          >
            <div class="player-color-wrapper">
              <span class="color-dot" style="background: {COLOR_CSS[player.color]}"></span>
              <span class="color-glow" style="background: {COLOR_CSS[player.color]}"></span>
            </div>
            <span class="player-name">{player.name}</span>
            <label class="ai-toggle">
              <input
                type="checkbox"
                checked={aiFlags[i]}
                onchange={() => toggleAI(i)}
              />
              <span class="toggle-slider">
                <span class="toggle-label">AI</span>
              </span>
            </label>
          </div>
        {/each}
      </div>
    </div>

    <!-- Start Button -->
    <button class="start-btn" onclick={startGame}>
      <span class="btn-bg"></span>
      <span class="btn-content">
        <span class="btn-icon">▶</span>
        <span class="btn-text">开始游戏</span>
      </span>
    </button>
  </div>
  
  <!-- Footer -->
  <div class="footer">
    <p>经典策略 · 智慧对弈</p>
  </div>
</div>

<style>
  .menu-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: var(--space-xl);
    position: relative;
    overflow: hidden;
  }

  /* ── Decorative Background Elements ─────────────────────────────────────── */
  .decoration {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0.5;
  }

  .decoration-1 {
    width: 600px;
    height: 600px;
    top: -200px;
    right: -200px;
    background: radial-gradient(circle, rgba(212, 160, 90, 0.08) 0%, transparent 70%);
    animation: float 8s ease-in-out infinite;
  }

  .decoration-2 {
    width: 400px;
    height: 400px;
    bottom: -100px;
    left: -100px;
    background: radial-gradient(circle, rgba(91, 101, 143, 0.1) 0%, transparent 70%);
    animation: float 10s ease-in-out infinite reverse;
  }

  .decoration-3 {
    width: 300px;
    height: 300px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(212, 160, 90, 0.03) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
  }

  /* ── Main Card ──────────────────────────────────────────────────────────── */
  .menu-card {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(255, 255, 255, 0.01) 100%
    );
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl);
    padding: var(--space-3xl) var(--space-2xl);
    max-width: 480px;
    width: 100%;
    text-align: center;
    box-shadow:
      0 24px 80px rgba(0, 0, 0, 0.5),
      0 0 1px rgba(255, 255, 255, 0.1) inset,
      0 1px 0 rgba(255, 255, 255, 0.05) inset;
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }

  .menu-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(212, 160, 90, 0.3) 50%,
      transparent 100%
    );
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── Header ─────────────────────────────────────────────────────────────── */
  .header {
    margin-bottom: var(--space-2xl);
  }

  .logo-container {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto var(--space-lg);
  }

  .logo-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(212, 160, 90, 0.3);
    border-radius: 50%;
    animation: spin 20s linear infinite;
  }

  .logo-ring::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: var(--color-gold);
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 10px var(--color-gold);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .logo-inner {
    position: absolute;
    inset: 8px;
    background: linear-gradient(135deg, rgba(212, 160, 90, 0.15) 0%, rgba(184, 134, 11, 0.1) 100%);
    border: 1px solid rgba(212, 160, 90, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-icon {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold);
    background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .title {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--space-xs);
    background: linear-gradient(
      135deg,
      var(--color-text-primary) 0%,
      var(--color-gold) 50%,
      var(--color-text-primary) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.15em;
    animation: shimmer 3s linear infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }

  .subtitle {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: var(--font-weight-light);
    color: var(--color-text-muted);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin: 0;
  }

  /* ── Sections ───────────────────────────────────────────────────────────── */
  .section {
    margin-bottom: var(--space-xl);
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin: 0 0 var(--space-md);
  }

  .section-icon {
    color: var(--color-gold);
    font-size: 0.6rem;
  }

  /* ── Player Count Buttons ───────────────────────────────────────────────── */
  .player-count-group {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
  }

  .count-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  .count-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(212, 160, 90, 0.3);
    transform: translateY(-2px);
  }

  .count-btn.active {
    background: linear-gradient(135deg, rgba(212, 160, 90, 0.2) 0%, rgba(184, 134, 11, 0.15) 100%);
    border-color: var(--color-gold);
    box-shadow: 0 0 20px rgba(212, 160, 90, 0.2);
  }

  .count-number {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    line-height: 1;
  }

  .count-btn.active .count-number {
    color: var(--color-gold);
  }

  .count-label {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  /* ── Player List ────────────────────────────────────────────────────────── */
  .player-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .player-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
    transition: all var(--transition-base);
  }

  .player-row:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .player-color-wrapper {
    position: relative;
    width: 24px;
    height: 24px;
  }

  .color-dot {
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  .color-glow {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    opacity: 0.4;
    filter: blur(4px);
    animation: pulse 2s ease-in-out infinite;
  }

  .player-name {
    flex: 1;
    text-align: left;
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  /* ── AI Toggle ──────────────────────────────────────────────────────────── */
  .ai-toggle {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .ai-toggle input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: relative;
    width: 48px;
    height: 26px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    left: 3px;
    width: 18px;
    height: 18px;
    background: var(--color-text-muted);
    border-radius: 50%;
    transition: all var(--transition-spring);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .ai-toggle input:checked + .toggle-slider {
    background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-amber) 100%);
    border-color: var(--color-gold);
  }

  .ai-toggle input:checked + .toggle-slider::before {
    left: calc(100% - 21px);
    background: white;
  }

  .toggle-label {
    font-size: 0.65rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
  }

  .ai-toggle input:checked + .toggle-slider .toggle-label {
    color: white;
  }

  /* ── Start Button ───────────────────────────────────────────────────────── */
  .start-btn {
    position: relative;
    width: 100%;
    padding: var(--space-md) var(--space-xl);
    margin-top: var(--space-md);
    border-radius: var(--radius-lg);
    cursor: pointer;
    overflow: hidden;
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards;
  }

  .btn-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-amber) 50%, var(--color-copper) 100%);
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
    transition: all var(--transition-base);
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .start-btn:hover .btn-bg {
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(212, 160, 90, 0.4);
  }

  .start-btn:active .btn-bg {
    transform: scale(0.98);
  }

  .btn-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
  }

  .btn-icon {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .btn-text {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    color: white;
    letter-spacing: 0.15em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* ── Footer ─────────────────────────────────────────────────────────────── */
  .footer {
    margin-top: var(--space-xl);
    text-align: center;
    animation: fadeIn 1s ease 0.6s backwards;
  }

  .footer p {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    letter-spacing: 0.2em;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .menu-card {
      padding: var(--space-xl) var(--space-lg);
    }

    .title {
      font-size: 2.25rem;
    }

    .count-btn {
      width: 56px;
      height: 56px;
    }

    .count-number {
      font-size: 1.25rem;
    }
  }
</style>