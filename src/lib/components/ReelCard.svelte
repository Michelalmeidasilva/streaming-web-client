<!-- src/lib/components/ReelCard.svelte -->
<script lang="ts">
  import type { Video } from '$lib/api';
  import { fmtClock } from '$lib/format';
  export let video: Video;
  export let onSelect: (id: string) => void;
</script>

<button class="reel" on:click={() => onSelect(video.id)} aria-label="Assistir reel {video.title}">
  <div class="rth">
    <img src={video.thumbnail_url ?? '/default-thumbnail.png'} alt={video.title || 'Miniatura do vídeo'} loading="lazy" />
    <span class="rd">{fmtClock(video.duration)}</span>
    <span class="rp">▶</span>
    <div class="rg" />
    <p class="rt">{video.title}</p>
  </div>
</button>

<style>
  .reel { width: 132px; flex: none; }
  .rth {
    position: relative; aspect-ratio: 9/16; border-radius: var(--radius);
    overflow: hidden; background: var(--bg-elev); border: 1px solid var(--border);
    display: flex; align-items: flex-end; transition: transform 0.18s ease;
  }
  .reel:hover .rth { transform: translateY(-3px); }
  .rth img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .rg { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,9,12,0.85), transparent 55%); }
  .rt { position: relative; padding: 8px; font-size: 0.7rem; font-weight: 500; line-height: 1.25; text-align: left; }
  .rd { position: absolute; top: 7px; right: 7px; z-index: 1; background: rgba(6,9,12,0.75); font-size: 0.6rem; padding: 1px 5px; border-radius: 4px; }
  .rp { position: absolute; top: 7px; left: 7px; z-index: 1; font-size: 0.8rem; opacity: 0.85; }
</style>
