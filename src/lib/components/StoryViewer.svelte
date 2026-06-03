<!-- src/lib/components/StoryViewer.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Video } from '$lib/api';
  import { getManifest } from '$lib/api';
  import { API_KEY } from '$lib/config';
  import { fmtDuration } from '$lib/format';
  import SveltePlayer from '@vod/player/svelte';

  export let stories: Video[];
  export let startIndex = 0;
  export let onClose: () => void;
  export let onSeen: (id: string) => void;

  let index = startIndex;
  let progress = 0; // 0..1 of current story
  let manifestUrl = '';
  let timer: ReturnType<typeof setInterval> | undefined;
  const TICK = 50;

  $: current = stories[index];

  async function start(i: number) {
    index = i;
    progress = 0;
    manifestUrl = '';
    const story = stories[i];
    if (!story) return onClose();
    onSeen(story.id);
    try {
      const m = await getManifest(story.id);
      if (index !== i) return; // navigated away while loading — discard
      manifestUrl = m.manifest_url;
    } catch {
      if (index !== i) return;
      manifestUrl = '';
    }
    runTimer();
  }

  function runTimer() {
    clearInterval(timer);
    const durMs = Math.max(2000, (current?.duration ?? 5) * 1000);
    const startedAt = Date.now();
    timer = setInterval(() => {
      progress = Math.min(1, (Date.now() - startedAt) / durMs);
      if (progress >= 1) next();
    }, TICK);
  }

  function next() {
    clearInterval(timer);
    if (index < stories.length - 1) start(index + 1);
    else onClose();
  }
  function prev() {
    clearInterval(timer);
    if (index > 0) start(index - 1);
    else { progress = 0; runTimer(); } // restart current without re-marking seen
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }

  onMount(() => { start(startIndex); window.addEventListener('keydown', onKey); });
  onDestroy(() => { clearInterval(timer); window.removeEventListener('keydown', onKey); });
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Stories">
  <div class="bars">
    {#each stories as _, i}
      <div class="bar" data-testid="story-bar">
        <span style="width:{i < index ? 100 : i === index ? progress * 100 : 0}%" />
      </div>
    {/each}
  </div>

  <button class="close" on:click={onClose} aria-label="Fechar">✕</button>
  <button class="zone left" on:click={prev} aria-label="Anterior" />
  <button class="zone right" on:click={next} aria-label="Próximo" />

  <div class="stage">
    {#if manifestUrl}
      {#key current.id}
        <SveltePlayer {manifestUrl} apiKey={API_KEY} autoplay muted />
      {/key}
    {:else}
      <div class="loading skeleton" />
    {/if}
  </div>

  {#if current}
    <div class="info">
      <p class="t">{current.title}</p>
      <p class="m">{fmtDuration(current.duration)} · {current.format.toUpperCase()}</p>
    </div>
  {/if}
</div>

<style>
  .overlay { position: fixed; inset: 0; z-index: 100; background: #05080b; display: flex; flex-direction: column; align-items: center; }
  .bars { position: absolute; top: 10px; left: 12px; right: 12px; display: flex; gap: 4px; z-index: 3; }
  .bar { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.3); overflow: hidden; }
  .bar span { display: block; height: 100%; background: #fff; }
  .close { position: absolute; top: 22px; right: 14px; z-index: 4; font-size: 1.1rem; color: #fff; }
  .zone { position: absolute; top: 0; bottom: 0; width: 32%; z-index: 2; background: none; }
  .zone.left { left: 0; } .zone.right { right: 0; }
  .stage { width: min(440px, 100vw); aspect-ratio: 9/16; max-height: 100vh; margin: auto; display: flex; align-items: center; }
  .stage :global(.player-wrapper) { aspect-ratio: 9/16 !important; height: 100%; }
  .loading { width: 100%; height: 100%; }
  .info { position: absolute; left: 0; right: 0; bottom: 18px; padding: 0 18px; z-index: 3; pointer-events: none; }
  .info .t { font-size: 1rem; font-weight: 600; }
  .info .m { font-size: 0.72rem; color: #cdd6df; margin-top: 4px; }
</style>
