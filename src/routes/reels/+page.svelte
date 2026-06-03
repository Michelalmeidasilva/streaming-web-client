<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { listVideos, getManifest, type Video } from '$lib/api';
  import { partitionVideos } from '$lib/catalog';
  import { STORY_MAX_SECONDS, REEL_MAX_SECONDS, API_KEY } from '$lib/config';
  import { fmtDuration } from '$lib/format';
  import SveltePlayer from '@vod/player/svelte';

  let reels: Video[] = [];
  let manifests: Record<string, string> = {};
  let active = 0;
  let loading = true;

  async function loadManifest(v: Video) {
    if (manifests[v.id]) return;
    try {
      const m = await getManifest(v.id);
      manifests = { ...manifests, [v.id]: m.manifest_url };
    } catch { /* skip a failed reel */ }
  }

  function onScroll(e: Event) {
    const el = e.target as HTMLElement;
    if (!el.clientHeight) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== active && reels[i]) { active = i; loadManifest(reels[i]); }
  }

  onMount(async () => {
    try {
      const all = await listVideos();
      reels = partitionVideos(all, { storyMax: STORY_MAX_SECONDS, reelMax: REEL_MAX_SECONDS }).reels;
      if (reels[0]) await loadManifest(reels[0]);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Reels — VOD</title></svelte:head>

{#if loading}
  <div class="full skeleton" aria-label="Carregando reels..." />
{:else if reels.length === 0}
  <div class="empty">
    <p>Nenhum reel disponível.</p>
    <button type="button" class="btn" on:click={() => goto('/')}>← Voltar ao catálogo</button>
  </div>
{:else}
  <div class="feed" on:scroll={onScroll}>
    {#each reels as v, i (v.id)}
      <section class="slide">
        <div class="stage">
          {#if i === active && manifests[v.id]}
            {#key v.id}<SveltePlayer manifestUrl={manifests[v.id]} apiKey={API_KEY} autoplay muted />{/key}
          {:else}
            <div class="poster"><img src={v.thumbnail_url ?? '/default-thumbnail.png'} alt={v.title || 'Miniatura do vídeo'} /></div>
          {/if}
          <div class="info">
            <p class="t">{v.title}</p>
            <p class="m">{fmtDuration(v.duration)} · {v.format.toUpperCase()}</p>
          </div>
        </div>
      </section>
    {/each}
  </div>
{/if}

<style>
  .feed { height: calc(100vh - var(--nav-h)); overflow-y: auto; scroll-snap-type: y mandatory; }
  .slide { height: calc(100vh - var(--nav-h)); scroll-snap-align: start; display: flex; align-items: center; justify-content: center; }
  .stage { position: relative; width: min(440px, 100vw); aspect-ratio: 9/16; max-height: 100%; background: #05080b; border-radius: 12px; overflow: hidden; }
  .stage :global(.player-wrapper) { aspect-ratio: 9/16 !important; height: 100%; }
  .poster { position: absolute; inset: 0; }
  .poster img { width: 100%; height: 100%; object-fit: cover; }
  .info { position: absolute; left: 0; right: 0; bottom: 16px; padding: 0 16px; }
  .info .t { font-size: 1rem; font-weight: 600; }
  .info .m { font-size: 0.72rem; color: #cdd6df; margin-top: 4px; }
  .full { width: min(440px, 100vw); aspect-ratio: 9/16; margin: 24px auto; }
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: 60vh; color: var(--text-muted); }
  .btn { background: var(--bg-elev); color: var(--text); border: 1px solid var(--border); padding: 8px 20px; border-radius: var(--radius); }
</style>
