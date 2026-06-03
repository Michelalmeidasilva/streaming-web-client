<!-- src/lib/components/StoriesRail.svelte -->
<script lang="ts">
  import type { Video } from '$lib/api';
  import { loadSeen, markSeen } from '$lib/stories';
  import StoryViewer from './StoryViewer.svelte';

  export let stories: Video[];

  let seen = loadSeen();
  let openAt: number | null = null;

  function open(i: number) { openAt = i; }
  function close() { openAt = null; seen = loadSeen(); }
  function handleSeen(id: string) { markSeen(id); }
</script>

{#if stories.length > 0}
  <section class="stories-section">
    <div class="rail">
      {#each stories as story, i (story.id)}
        <button class="story" on:click={() => open(i)} aria-label="Ver story {story.title}">
          <span class="ring" class:seen={seen.has(story.id)}>
            <span class="inner">
              <img src={story.thumbnail_url ?? '/default-thumbnail.png'} alt={story.title || 'Miniatura do vídeo'} loading="lazy" />
            </span>
          </span>
          <span class="label">{story.title}</span>
        </button>
      {/each}
    </div>
  </section>
{/if}

{#if openAt !== null}
  <StoryViewer {stories} startIndex={openAt} onClose={close} onSeen={handleSeen} />
{/if}

<style>
  .stories-section { margin-bottom: 22px; border-bottom: 1px solid var(--border); padding-bottom: 18px; }
  .rail { display: flex; gap: 16px; overflow-x: auto; padding: 2px; }
  .story { display: flex; flex-direction: column; align-items: center; gap: 7px; width: 72px; flex: none; }
  .ring { width: 60px; height: 60px; border-radius: 50%; padding: 2px; background: conic-gradient(from 210deg, #4ea8ff, #3b82f6, #7dd3fc, #4ea8ff); }
  .ring.seen { background: #2a3340; }
  .inner { display: block; width: 100%; height: 100%; border-radius: 50%; border: 2px solid var(--bg); overflow: hidden; background: linear-gradient(135deg, #1a2734, #121a23); }
  .inner img { width: 100%; height: 100%; object-fit: cover; }
  .label { font-size: 0.65rem; color: var(--text-muted); max-width: 72px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
