<script lang="ts">
  import '../app.css';
  import 'shaka-player/dist/controls.css';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { searchQuery } from '$lib/search';

  function onInput(e: Event) {
    searchQuery.set((e.target as HTMLInputElement).value);
    if ($page.url.pathname !== '/') goto('/');
  }
</script>

<nav>
  <a href="/" class="logo"><span class="mk" aria-hidden="true">▶</span><span>vod</span></a>
  <div class="links">
    <a href="/" class:on={$page.url.pathname === '/'}>Início</a>
    <a href="/reels" class:on={$page.url.pathname === '/reels'}>Reels</a>
  </div>
  <div class="find">
    <span aria-hidden="true">⌕</span>
    <input
      type="search"
      placeholder="Buscar vídeos…"
      aria-label="Buscar vídeos"
      value={$searchQuery}
      on:input={onInput}
    />
  </div>
</nav>

<main><slot /></main>

<style>
  nav {
    position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 18px;
    height: var(--nav-h); padding: 0 22px;
    background: rgba(14,18,23,0.72); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
  }
  .logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.95rem; letter-spacing: -0.02em; }
  .mk { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, #4ea8ff, #3b82f6); color: var(--accent-ink); font-size: 0.6rem; }
  .links { display: flex; gap: 16px; font-size: 0.8rem; color: var(--text-muted); }
  .links a.on { color: var(--text); }
  .find { margin-left: auto; display: flex; align-items: center; gap: 7px; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; padding: 6px 11px; color: var(--text-muted); }
  .find input { background: none; border: none; outline: none; color: var(--text); font-size: 0.78rem; width: 160px; }
  .find input::placeholder { color: var(--text-muted); }
  main { min-height: calc(100vh - var(--nav-h)); }
  @media (max-width: 560px) { .find input { width: 100px; } .links { display: none; } }
</style>
