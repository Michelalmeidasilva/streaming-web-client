<!-- src/lib/components/VideoGrid.svelte -->
<script lang="ts">
  import type { Video } from '$lib/api';
  import VideoCard from './VideoCard.svelte';
  export let videos: Video[];
  export let onSelect: (id: string) => void;
</script>

<div class="grid">
  {#each videos as video, i (video.id)}
    <div class="rise" style="--i:{Math.min(i, 12)}">
      <VideoCard {video} {onSelect} />
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid; gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
</style>
