<script lang="ts">
  import { gameState } from './lib/stores';
  import MenuScreen from './components/MenuScreen.svelte';
  import GameScreen from './components/GameScreen.svelte';
</script>

<main class="app">
  {#if $gameState.phase === 'menu'}
    <MenuScreen />
  {:else}
    <GameScreen />
  {/if}
</main>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.6s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
