<script lang="ts">
  import BoardCanvas from './BoardCanvas.svelte';
  import PlayerInfo from './PlayerInfo.svelte';
  import GameControls from './GameControls.svelte';
  import GameOverModal from './GameOverModal.svelte';
</script>

<div class="game-layout">
  <div class="game-main">
    <div class="board-area">
      <div class="board-frame">
        <div class="board-glow"></div>
        <BoardCanvas />
      </div>
    </div>
    <div class="controls-area">
      <GameControls />
    </div>
  </div>
  <aside class="sidebar">
    <PlayerInfo />
  </aside>
</div>

<GameOverModal />

<style>
  .game-layout {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: var(--space-xl);
    padding: var(--space-xl);
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .game-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .board-area {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .board-frame {
    position: relative;
    padding: var(--space-md);
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(255, 255, 255, 0.01) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-xl);
    box-shadow:
      0 24px 64px rgba(0, 0, 0, 0.4),
      0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  .board-glow {
    position: absolute;
    inset: -1px;
    border-radius: var(--radius-xl);
    background: linear-gradient(
      135deg,
      rgba(212, 160, 90, 0.1) 0%,
      transparent 50%,
      rgba(212, 160, 90, 0.05) 100%
    );
    pointer-events: none;
    z-index: -1;
  }

  .controls-area {
    width: 100%;
    max-width: 700px;
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
  }

  .sidebar {
    padding-top: var(--space-md);
    flex-shrink: 0;
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
  }

  @media (max-width: 960px) {
    .game-layout {
      flex-direction: column;
      align-items: center;
      padding: var(--space-md);
      gap: var(--space-lg);
    }

    .sidebar {
      padding-top: 0;
      width: 100%;
      max-width: 500px;
    }

    .board-frame {
      padding: var(--space-sm);
    }
  }

  @media (max-width: 480px) {
    .game-layout {
      padding: var(--space-sm);
    }

    .board-frame {
      padding: var(--space-xs);
      border-radius: var(--radius-lg);
    }
  }
</style>