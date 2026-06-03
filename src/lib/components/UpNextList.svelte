<!-- src/lib/components/UpNextList.svelte -->
<script lang="ts">
  import type { Video } from '$lib/api';
  import { fmtDuration } from '$lib/format';
  export let videos: Video[];
  export let onSelect: (id: string) => void;
</script>

<aside class="upnext">
  <h2 class="title">A seguir</h2>
  {#each videos as video (video.id)}
    <button class="row" on:click={() => onSelect(video.id)} aria-label="Assistir {video.title}">
      <div class="th">
        <img src={video.thumbnail_url ?? '/default-thumbnail.png'} alt={video.title || 'Miniatura do vídeo'} loading="lazy" />
      </div>
      <div class="meta">
        <p class="n">{video.title}</p>
        <p class="d">{fmtDuration(video.duration)} · {video.format.toUpperCase()}</p>
      </div>
    </button>
  {/each}
</aside>

<style>
  .upnext { display: flex; flex-direction: column; gap: 12px; }
  .title { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px; }
  .row { display: flex; gap: 10px; text-align: left; }
  .th { width: 104px; flex: none; aspect-ratio: 16/9; border-radius: 7px; overflow: hidden; background: var(--bg-elev); border: 1px solid var(--border); }
  .th img { width: 100%; height: 100%; object-fit: cover; }
  .meta { min-width: 0; }
  .n { font-size: 0.78rem; font-weight: 500; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .d { font-size: 0.66rem; color: var(--text-muted); margin-top: 3px; }
</style>
