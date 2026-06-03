<!-- src/lib/components/ReelsRail.svelte -->
<script lang="ts">
  import type { Video } from '$lib/api';
  import { goto } from '$app/navigation';
  import ReelCard from './ReelCard.svelte';
  export let reels: Video[];
  export let onSelect: (id: string) => void;
</script>

{#if reels.length > 0}
  <section class="reels-section">
    <div class="head">
      <span class="ic" aria-hidden="true">⌖</span>
      <h2>Reels</h2>
      <button class="more" on:click={() => goto('/reels')}>Ver todos →</button>
    </div>
    <div class="rail">
      {#each reels as video (video.id)}
        <ReelCard {video} {onSelect} />
      {/each}
    </div>
  </section>
{/if}

<style>
  .reels-section { margin-bottom: 28px; }
  .head { display: flex; align-items: center; gap: 8px; margin: 0 2px 12px; }
  .head h2 { font-size: 0.95rem; font-weight: 600; }
  .ic { color: var(--accent); }
  .more { margin-left: auto; font-size: 0.72rem; color: var(--text-muted); }
  .more:hover { color: var(--text); }
  .rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; }
  .rail > :global(.reel) { scroll-snap-align: start; }
</style>
