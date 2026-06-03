<!-- src/lib/components/HeroFeature.svelte -->
<script lang="ts">
  import type { Video } from '$lib/api';
  import { fmtDuration } from '$lib/format';
  export let video: Video;
  export let onSelect: (id: string) => void;
</script>

<button class="hero" on:click={() => onSelect(video.id)} aria-label="Assistir {video.title}">
  <div class="thumb">
    <img src={video.thumbnail_url ?? '/default-thumbnail.png'} alt={video.title || 'Miniatura do vídeo'} />
    <div class="grad" />
    <div class="ov">
      <span class="tag">● Em destaque</span>
      <h1 class="title">{video.title}</h1>
      <p class="meta">{fmtDuration(video.duration)} · {video.format.toUpperCase()} · bitrate adaptativo</p>
      <span class="play">▶ Assistir</span>
    </div>
  </div>
</button>

<style>
  .hero { display: block; width: 100%; border-radius: 12px; overflow: hidden; }
  .thumb { position: relative; aspect-ratio: 21/9; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; }
  .grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,11,15,0.92) 0%, rgba(8,11,15,0.2) 55%, transparent 100%); }
  .ov { position: absolute; left: 0; bottom: 0; padding: 26px; text-align: left; }
  .tag { display: inline-block; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  .title { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 700; letter-spacing: -0.02em; }
  .meta { font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; }
  .play { display: inline-block; margin-top: 14px; background: var(--accent); color: var(--accent-ink); font-weight: 600; font-size: 0.85rem; padding: 9px 18px; border-radius: 8px; }
</style>
