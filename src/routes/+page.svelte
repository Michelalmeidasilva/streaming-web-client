<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { listVideos, type Video } from '$lib/api';

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

  function watch(id: string) {
    goto(`/watch/${id}`);
  }

  function fmtDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}min${s > 0 ? ` ${s}s` : ''}`;
  }
</script>

<svelte:head>
  <title>VOD Platform — Catálogo</title>
</svelte:head>

{#if loading}
  <div class="catalog">
    <div class="skeleton hero-skeleton" aria-label="Carregando..." />
    <div class="grid">
      {#each { length: 6 } as _}
        <div class="skeleton card-skeleton" />
      {/each}
    </div>
  </div>
{:else if errorMsg}
  <div class="empty" role="alert">
    <p>{errorMsg}</p>
    <button on:click={load} class="btn-retry">Tentar novamente</button>
  </div>
{:else if videos.length === 0}
  <div class="empty">
    <p>Nenhum vídeo disponível.</p>
    <button on:click={load} class="btn-retry">Atualizar</button>
  </div>
{:else}
  {#each videos.slice(0, 1) as hero}
    <div class="catalog">
      <!-- Hero -->
      <button class="hero" on:click={() => watch(hero.id)} aria-label="Assistir {hero.title}">
        <div class="hero-thumb">
          {#if hero.thumbnail_url}
            <img src={hero.thumbnail_url} alt={hero.title} />
          {:else}
            <img src="/default-thumbnail.png" alt={hero.title} />
          {/if}
          <div class="hero-overlay">
            <div class="badge">{hero.format.toUpperCase()}</div>
            <h1 class="hero-title">{hero.title}</h1>
            <p class="hero-meta">{fmtDuration(hero.duration)}</p>
            <span class="btn-play">▶ Assistir</span>
          </div>
        </div>
      </button>

      <!-- Grid -->
      {#if videos.length > 1}
        <section class="more">
          <h2 class="section-title">Mais vídeos</h2>
          <div class="grid">
            {#each videos.slice(1) as video}
              <button
                class="card"
                on:click={() => watch(video.id)}
                aria-label="Assistir {video.title}"
              >
                <div class="card-thumb">
                  {#if video.thumbnail_url}
                    <img src={video.thumbnail_url} alt={video.title} />
                  {:else}
                    <img src="/default-thumbnail.png" alt={video.title} />
                  {/if}
                  <span class="card-duration">{fmtDuration(video.duration)}</span>
                </div>
                <p class="card-title">{video.title}</p>
              </button>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  {/each}
{/if}

<style>
  .catalog { max-width: 1200px; margin: 0 auto; padding: 0 24px 48px; }

  .hero {
    display: block;
    width: 100%;
    background: none;
    padding: 0;
    margin: 24px 0;
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
  }
  .hero-thumb { position: relative; aspect-ratio: 21/9; background: var(--bg-card); }
  .hero-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .thumb-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #1a1a2e, #16213e); }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%);
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 32px;
  }
  .badge {
    display: inline-block; background: var(--accent); color: #fff;
    font-size: 0.65rem; font-weight: 700; padding: 2px 8px;
    border-radius: 3px; margin-bottom: 8px; width: fit-content;
  }
  .hero-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 4px; }
  .hero-meta { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px; }
  .btn-play {
    display: inline-block; background: var(--accent); color: #fff;
    font-size: 0.9rem; font-weight: 600; padding: 10px 24px;
    border-radius: var(--radius); width: fit-content;
  }

  .more { margin-top: 32px; }
  .section-title {
    font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 16px;
  }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }

  .card { display: flex; flex-direction: column; gap: 8px; background: none; padding: 0; text-align: left; cursor: pointer; }
  .card-thumb { position: relative; aspect-ratio: 16/9; background: var(--bg-card); border-radius: var(--radius); overflow: hidden; }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .card-duration {
    position: absolute; bottom: 6px; left: 6px;
    background: rgba(0,0,0,0.75); color: #fff;
    font-size: 0.65rem; padding: 2px 6px; border-radius: 3px;
  }
  .card-title { font-size: 0.85rem; color: var(--text-muted); padding: 0 2px; }

  .skeleton { background: var(--bg-card); border-radius: var(--radius); animation: pulse 1.5s ease-in-out infinite; }
  .hero-skeleton { aspect-ratio: 21/9; margin: 24px 0; }
  .card-skeleton { aspect-ratio: 16/9; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  .empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px; min-height: 60vh;
    color: var(--text-muted);
  }
  .btn-retry {
    background: var(--bg-surface); color: var(--text);
    border: 1px solid var(--border); padding: 8px 20px;
    border-radius: var(--radius); font-size: 0.9rem;
  }
</style>
