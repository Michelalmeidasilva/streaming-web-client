<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { VodPlayer } from './VodPlayer';
  import type { VodPlayerOptions } from './types';

  export let manifestUrl: string;
  export let apiKey: string;
  export let autoplay = false;
  export let muted = false;

  let container: HTMLDivElement;
  let player: VodPlayer;
  let error = '';

  onMount(async () => {
    player = new VodPlayer(container, { apiKey, autoplay, muted });
    player.on('error', (detail: { message: string }) => {
      error = detail.message ?? 'Erro ao reproduzir o vídeo.';
    });
    try {
      await player.load(manifestUrl);
    } catch {
      error = 'Não foi possível carregar o vídeo.';
    }
  });

  onDestroy(() => player?.destroy());
</script>

<div class="player-wrapper" bind:this={container}>
  {#if error}
    <div class="player-error" role="alert">
      <span>⚠ {error}</span>
    </div>
  {/if}
</div>

<style>
  .player-wrapper {
    position: relative;
    width: 100%;
    background: #000;
    aspect-ratio: 16 / 9;
  }
  .player-error {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    color: #ef4444;
    font-size: 0.9rem;
    font-family: sans-serif;
  }
</style>
