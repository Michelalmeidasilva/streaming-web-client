<!-- src/lib/components/StoryViewer.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Video } from '$lib/api';
  import { getManifest } from '$lib/api';
  import { API_KEY } from '$lib/config';
  import { fmtDuration } from '$lib/format';
  import StoryPlayer from '@vod/player/svelte/story';

  export let stories: Video[];
  export let startIndex = 0;
  export let onClose: () => void;
  export let onSeen: (id: string) => void;

  let index = startIndex;
  let progress = 0; // 0..1 of current story, driven by real playback
  let manifestUrl = '';
  let subtitles: import('$lib/api').SubtitleTrack[] = [];
  // Fallback: if a story's manifest fails to load, skip it after a short delay
  // instead of hanging on the skeleton forever (there is no playback timer now).
  let failTimer: ReturnType<typeof setTimeout> | undefined;
  const FAIL_SKIP_MS = 3000;

  $: current = stories[index];

  async function start(i: number) {
    clearTimeout(failTimer);
    index = i;
    progress = 0;
    manifestUrl = '';
    subtitles = [];
    const story = stories[i];
    if (!story) return onClose();
    onSeen(story.id);
    try {
      const m = await getManifest(story.id);
      if (index !== i) return; // navigated away while loading — discard
      manifestUrl = m.manifest_url;
      subtitles = m.subtitles;
    } catch {
      if (index !== i) return;
      manifestUrl = '';
      failTimer = setTimeout(() => { if (index === i) next(); }, FAIL_SKIP_MS);
    }
  }

  function handleTime(currentSeconds: number, durationSeconds: number) {
    progress = durationSeconds > 0 ? Math.min(1, currentSeconds / durationSeconds) : 0;
  }
  function handleEnded() {
    next();
  }

  function next() {
    clearTimeout(failTimer);
    if (index < stories.length - 1) start(index + 1);
    else onClose();
  }
  function prev() {
    clearTimeout(failTimer);
    if (index > 0) start(index - 1);
    else { progress = 0; start(index); } // restart current
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }

  onMount(() => { start(startIndex); window.addEventListener('keydown', onKey); });
  onDestroy(() => { clearTimeout(failTimer); window.removeEventListener('keydown', onKey); });
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Stories">
  <button class="close" on:click={onClose} aria-label="Fechar">✕</button>
  <button class="zone left" on:click={prev} aria-label="Anterior" />
  <button class="zone right" on:click={next} aria-label="Próximo" />

  <div class="stage">
    {#if manifestUrl}
      {#key current.id}
        <StoryPlayer
          {manifestUrl}
          {subtitles}
          apiKey={API_KEY}
          muted
          onTime={handleTime}
          onEnded={handleEnded}
          onError={next}
        />
      {/key}
    {:else}
      <div class="loading skeleton" />
    {/if}
  </div>

  <div class="footer">
    {#if current}
      <div class="info">
        <p class="t">{current.title}</p>
        <p class="m">{fmtDuration(current.duration)} · {current.format.toUpperCase()}</p>
      </div>
    {/if}
    <div class="bars">
      {#each stories as _, i}
        <div class="bar" data-testid="story-bar">
          <span style="width:{i < index ? 100 : i === index ? progress * 100 : 0}%" />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .overlay { position: fixed; inset: 0; z-index: 100; background: #05080b; display: flex; flex-direction: column; align-items: center; }
  .close { position: absolute; top: 22px; right: 14px; z-index: 4; font-size: 1.1rem; color: #fff; }
  .zone { position: absolute; top: 0; bottom: 0; width: 32%; z-index: 2; background: none; }
  .zone.left { left: 0; } .zone.right { right: 0; }
  .stage { width: min(440px, 100vw); aspect-ratio: 9/16; max-height: 100vh; margin: auto; display: flex; align-items: center; }
  .stage :global(.story-player) { aspect-ratio: 9/16 !important; height: 100%; }
  .loading { width: 100%; height: 100%; }

  /* Footer holds the title/meta and the segmented progress bars, anchored at the bottom. */
  .footer { position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; padding: 0 18px 16px; pointer-events: none; }
  .info { margin-bottom: 10px; }
  .info .t { font-size: 1rem; font-weight: 600; }
  .info .m { font-size: 0.72rem; color: #cdd6df; margin-top: 4px; }
  .bars { display: flex; gap: 4px; }
  .bar { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.3); overflow: hidden; }
  .bar span { display: block; height: 100%; background: #fff; transition: width 0.1s linear; }
</style>
