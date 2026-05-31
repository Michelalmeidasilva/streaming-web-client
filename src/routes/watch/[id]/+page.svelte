<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getManifest, type ManifestResponse } from '$lib/api';
  import SveltePlayer from '@vod/player/svelte';
  import { API_KEY } from '$lib/config';

  const id = $page.params.id;

  let manifest: ManifestResponse | null = null;
  let loading = true;
  let errorMsg = '';

  onMount(async () => {
    try {
      manifest = await getManifest(id);
    } catch (e: unknown) {
      errorMsg = e instanceof Error && e.message === '404'
        ? 'Vídeo não encontrado.'
        : 'Não foi possível carregar o vídeo.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Reproduzindo — VOD Platform</title>
</svelte:head>

<div class="player-page">
  <button class="btn-back" on:click={() => goto('/')}>← Voltar</button>

  {#if loading}
    <div class="skeleton player-skeleton" aria-label="Carregando player..." />
  {:else if errorMsg}
    <div class="player-error" role="alert">
      <p>{errorMsg}</p>
      <button on:click={() => goto('/')} class="btn-back-err">← Voltar ao catálogo</button>
    </div>
  {:else if manifest}
    <div class="player-container">
      <SveltePlayer
        manifestUrl={manifest.manifest_url}
        apiKey={API_KEY}
        autoplay={false}
      />
    </div>
    <div class="meta">
      <span class="badge">{manifest.type.toUpperCase()}</span>
      <p class="meta-hint">Bitrate adaptativo · Powered by Shaka Player</p>
    </div>
  {/if}
</div>

<style>
  .player-page { max-width: 1000px; margin: 0 auto; padding: 16px 24px 48px; }

  .btn-back {
    display: inline-flex; align-items: center; gap: 4px;
    background: none; color: var(--text-muted);
    font-size: 0.85rem; margin-bottom: 20px;
    padding: 4px 0;
  }
  .btn-back:hover { color: var(--text); }

  .player-container { border-radius: var(--radius); overflow: hidden; }

  .meta {
    display: flex; align-items: center; gap: 12px;
    margin-top: 16px; padding: 0 4px;
  }
  .badge {
    background: var(--accent); color: #fff;
    font-size: 0.65rem; font-weight: 700;
    padding: 2px 8px; border-radius: 3px;
  }
  .meta-hint { font-size: 0.8rem; color: var(--text-muted); }

  .skeleton { background: var(--bg-card); border-radius: var(--radius); animation: pulse 1.5s ease-in-out infinite; }
  .player-skeleton { aspect-ratio: 16/9; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  .player-error {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px; aspect-ratio: 16/9;
    background: var(--bg-card); border-radius: var(--radius);
    color: var(--text-muted);
  }
  .btn-back-err {
    background: var(--bg-surface); color: var(--text);
    border: 1px solid var(--border); padding: 8px 20px;
    border-radius: var(--radius);
  }
</style>
