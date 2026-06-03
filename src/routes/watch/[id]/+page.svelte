<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getManifest, listVideos, type ManifestResponse, type Video } from '$lib/api';
  import { API_KEY } from '$lib/config';
  import { fmtDuration } from '$lib/format';
  import SveltePlayer from '@vod/player/svelte';
  import UpNextList from '$lib/components/UpNextList.svelte';

  const id = $page.params.id;

  let manifest: ManifestResponse | null = null;
  let current: Video | null = null;
  let upNext: Video[] = [];
  let loading = true;
  let errorMsg = '';

  onMount(async () => {
    const [m, list] = await Promise.allSettled([getManifest(id), listVideos()]);
    if (m.status === 'fulfilled') manifest = m.value;
    else errorMsg = m.reason instanceof Error && m.reason.message === '404'
      ? 'Vídeo não encontrado.'
      : 'Não foi possível carregar o vídeo.';
    if (list.status === 'fulfilled') {
      current = list.value.find((v) => v.id === id) ?? null;
      upNext = list.value.filter((v) => v.id !== id).slice(0, 12);
    }
    loading = false;
  });

  function watch(vid: string) { goto(`/watch/${vid}`); }
</script>

<svelte:head><title>{current ? current.title : 'Reproduzindo'} — VOD</title></svelte:head>

<div class="watch">
  <button class="back" on:click={() => goto('/')}>← Voltar ao catálogo</button>

  {#if loading}
    <div class="skeleton player-skel" aria-label="Carregando player..." />
  {:else if errorMsg}
    <div class="player-error" role="alert">
      <p>{errorMsg}</p>
      <button on:click={() => goto('/')} class="btn">← Voltar ao catálogo</button>
    </div>
  {:else if manifest}
    <div class="wgrid">
      <div class="main">
        <div class="player">
          <SveltePlayer manifestUrl={manifest.manifest_url} apiKey={API_KEY} autoplay={false} />
        </div>
        <h1 class="wtitle">{current ? current.title : 'Vídeo'}</h1>
        <div class="chips">
          <span class="chip acc">{manifest.type.toUpperCase()}</span>
          <span class="chip">Bitrate adaptativo</span>
          {#if current}<span class="chip">{fmtDuration(current.duration)}</span>{/if}
          <span class="chip">Shaka Player</span>
        </div>
      </div>
      {#if upNext.length > 0}
        <UpNextList videos={upNext} onSelect={watch} />
      {/if}
    </div>
  {/if}
</div>

<style>
  .watch { max-width: 1180px; margin: 0 auto; padding: 16px 24px 56px; }
  .back { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; }
  .back:hover { color: var(--text); }
  .wgrid { display: grid; grid-template-columns: 1fr 300px; gap: 26px; }
  .player { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
  .wtitle { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.01em; margin-top: 16px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 11px; }
  .chip { font-size: 0.72rem; color: var(--text-muted); background: var(--bg-elev); border: 1px solid var(--border); padding: 4px 10px; border-radius: 7px; }
  .chip.acc { color: var(--accent); border-color: rgba(78,168,255,0.3); background: rgba(78,168,255,0.08); }
  .player-skel { aspect-ratio: 16/9; border-radius: 12px; }
  .player-error { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; aspect-ratio: 16/9; background: var(--bg-elev); border-radius: 12px; color: var(--text-muted); }
  .btn { background: var(--bg-elev-2); color: var(--text); border: 1px solid var(--border); padding: 8px 20px; border-radius: var(--radius); }
  @media (max-width: 860px) { .wgrid { grid-template-columns: 1fr; } }
</style>
