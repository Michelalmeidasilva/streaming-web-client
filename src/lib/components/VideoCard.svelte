<!-- src/lib/components/VideoCard.svelte -->
<script lang="ts">
  import type { Video } from '$lib/api';
  import { fmtDuration, fmtClock } from '$lib/format';
  export let video: Video;
  export let onSelect: (id: string) => void;
</script>

<button class="card" on:click={() => onSelect(video.id)} aria-label="Assistir {video.title}">
  <div class="thumb">
    <img src={video.thumbnail_url ?? '/default-thumbnail.png'} alt={video.title || 'Miniatura do vídeo'} loading="lazy" />
    <span class="fmt">{video.format.toUpperCase()}</span>
    <span class="dur">{fmtClock(video.duration)}</span>
  </div>
  <p class="title">{video.title}</p>
  <p class="sub">{fmtDuration(video.duration)}</p>
</button>

<style>
  .card { display: flex; flex-direction: column; gap: 9px; text-align: left; width: 100%; }
  .thumb {
    position: relative; aspect-ratio: 16/9; border-radius: var(--radius);
    overflow: hidden; background: var(--bg-elev); border: 1px solid var(--border);
    transition: transform 0.18s ease, border-color 0.18s ease;
  }
  .thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
  .card:hover .thumb { transform: translateY(-3px); border-color: #2c3a49; }
  .card:hover .thumb img { transform: scale(1.04); }
  .fmt {
    position: absolute; top: 7px; left: 7px; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.06em; padding: 2px 6px; border-radius: 5px;
    background: rgba(78,168,255,0.16); color: var(--accent);
  }
  .dur {
    position: absolute; bottom: 7px; right: 7px; font-size: 0.65rem;
    padding: 2px 6px; border-radius: 5px; background: rgba(6,9,12,0.82); color: #fff;
  }
  .title {
    font-size: 0.85rem; font-weight: 500; line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .sub { font-size: 0.72rem; color: var(--text-muted); }
</style>
