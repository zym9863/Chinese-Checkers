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
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #1a1a2e;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #e8d5b8;
    min-height: 100vh;
  }

  :global(#app) {
    max-width: none;
    margin: 0;
    padding: 0;
    text-align: left;
  }

  .app {
    min-height: 100vh;
  }
</style>
