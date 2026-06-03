<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { listVideos, type Video } from '$lib/api';
  import { partitionVideos } from '$lib/catalog';
  import { STORY_MAX_SECONDS, REEL_MAX_SECONDS } from '$lib/config';
  import { searchQuery, matchesQuery } from '$lib/search';
  import StoriesRail from '$lib/components/StoriesRail.svelte';
  import ReelsRail from '$lib/components/ReelsRail.svelte';
  import HeroFeature from '$lib/components/HeroFeature.svelte';
  import VideoGrid from '$lib/components/VideoGrid.svelte';

  let videos: Video[] = [];
  let loading = true;
  let errorMsg = '';

  async function load() {
    loading = true;
    errorMsg = '';
    try {
      videos = await listVideos();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      errorMsg = msg === '401'
        ? 'API key inválida — verifique as configurações.'
        : 'Serviço indisponível. Tente novamente.';
    } finally {
      loading = false;
    }
  }

  onMount(load);
  function watch(id: string) { goto(`/watch/${id}`); }

  $: parts = partitionVideos(videos, { storyMax: STORY_MAX_SECONDS, reelMax: REEL_MAX_SECONDS });
  $: filteredCatalog = parts.catalog.filter((v) => matchesQuery(v.title, $searchQuery));
  $: filteredReels = parts.reels.filter((v) => matchesQuery(v.title, $searchQuery));
  $: hero = filteredCatalog[0];
  $: gridVideos = filteredCatalog.slice(1);
</script>

<svelte:head><title>VOD — Catálogo</title></svelte:head>

{#if loading}
  <div class="catalog">
    <div class="skeleton hero-skeleton" aria-label="Carregando..." />
    <div class="grid-skel">
      {#each { length: 8 } as _}<div class="skeleton card-skel" />{/each}
    </div>
  </div>
{:else if errorMsg}
  <div class="empty" role="alert">
    <p>{errorMsg}</p>
    <button on:click={load} class="btn">Tentar novamente</button>
  </div>
{:else if videos.length === 0}
  <div class="empty">
    <p>Nenhum vídeo disponível.</p>
    <button on:click={load} class="btn">Atualizar</button>
  </div>
{:else}
  <div class="catalog">
    <!-- Stories não são filtradas pela busca: aparecem independentemente das queries do catálogo -->
    <StoriesRail stories={parts.stories} />
    <ReelsRail reels={filteredReels} onSelect={watch} />

    {#if hero}
      <HeroFeature video={hero} onSelect={watch} />
    {/if}

    <section class="more">
      <div class="sechead"><h2>Todos os vídeos</h2><span class="count">{filteredCatalog.length} vídeos</span></div>
      {#if gridVideos.length > 0}
        <VideoGrid videos={gridVideos} onSelect={watch} />
      {:else if !hero && $searchQuery}
        <p class="hint">Nenhum resultado para "{$searchQuery}".</p>
      {:else if !hero}
        <p class="hint">Nenhum vídeo no catálogo.</p>
      {:else}
        <p class="hint">Sem mais vídeos.</p>
      {/if}
    </section>
  </div>
{/if}

<style>
  .catalog { max-width: 1200px; margin: 0 auto; padding: 20px 24px 56px; }
  .more { margin-top: 28px; }
  .sechead { display: flex; align-items: baseline; justify-content: space-between; margin: 0 2px 14px; }
  .sechead h2 { font-size: 0.95rem; font-weight: 600; }
  .count { font-size: 0.72rem; color: var(--text-muted); }
  .hint { font-size: 0.82rem; color: var(--text-muted); padding: 8px 2px; }

  .hero-skeleton { aspect-ratio: 21/9; border-radius: 12px; margin-bottom: 28px; }
  .grid-skel { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
  .card-skel { aspect-ratio: 16/9; }

  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: 60vh; color: var(--text-muted); }
  .btn { background: var(--bg-elev); color: var(--text); border: 1px solid var(--border); padding: 8px 20px; border-radius: var(--radius); font-size: 0.85rem; }
</style>
