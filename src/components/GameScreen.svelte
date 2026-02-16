<script lang="ts">
  import BoardCanvas from './BoardCanvas.svelte';
  import PlayerInfo from './PlayerInfo.svelte';
  import GameControls from './GameControls.svelte';
  import GameOverModal from './GameOverModal.svelte';
</script>

<div class="game-layout">
  <div class="game-main">
    <div class="board-area">
      <BoardCanvas />
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
    gap: 1.5rem;
    padding: 1.5rem;
    min-height: 100vh;
    max-width: 1100px;
    margin: 0 auto;
  }

  .game-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .board-area {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .controls-area {
    width: 100%;
  }

  .sidebar {
    padding-top: 1rem;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    .game-layout {
      flex-direction: column;
      align-items: center;
    }

    .sidebar {
      padding-top: 0;
      width: 100%;
      max-width: 400px;
    }
  }
</style>
