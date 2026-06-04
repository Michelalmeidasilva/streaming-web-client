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
  <a href="/" class="logo"><span class="mk" aria-hidden="true">▶</span><span class="wordmark">Streaming</span></a>
  <div class="links">
    <a href="/" class:on={$page.url.pathname === '/'}>Início</a>
    <a href="/reels" class:on={$page.url.pathname === '/reels'}>Reels</a>
  </div>
  <div class="find">
    <span class="find-icon" aria-hidden="true">⌕</span>
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
    position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 22px;
    height: var(--nav-h); padding: 0 22px;
    background: linear-gradient(180deg, rgba(18,24,31,0.85), rgba(14,18,23,0.62));
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px -16px rgba(0,0,0,0.8);
  }
  .logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 0.98rem; letter-spacing: -0.02em; transition: opacity 0.2s ease; }
  .logo:hover { opacity: 0.85; }
  .mk {
    display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;
    border-radius: 7px; background: linear-gradient(135deg, #5fb2ff, #3b82f6);
    color: var(--accent-ink); font-size: 0.62rem;
    box-shadow: 0 4px 14px -3px rgba(78,168,255,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .logo:hover .mk { transform: scale(1.06); box-shadow: 0 6px 18px -3px rgba(78,168,255,0.7), 0 0 0 1px rgba(255,255,255,0.12) inset; }
  .wordmark { background: linear-gradient(180deg, #ffffff, #b9c4d0); -webkit-background-clip: text; background-clip: text; color: transparent; }

  .links { display: flex; gap: 6px; font-size: 0.82rem; }
  .links a {
    position: relative; padding: 6px 10px; border-radius: 7px; color: var(--text-muted);
    transition: color 0.2s ease, background 0.2s ease;
  }
  .links a:hover { color: var(--text); background: rgba(255,255,255,0.04); }
  .links a.on { color: var(--text); }
  .links a.on::after {
    content: ''; position: absolute; left: 10px; right: 10px; bottom: -2px; height: 2px;
    border-radius: 2px; background: linear-gradient(90deg, #5fb2ff, #3b82f6);
    box-shadow: 0 0 8px rgba(78,168,255,0.6);
  }

  .find {
    margin-left: auto; display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 9px;
    padding: 7px 12px; color: var(--text-muted);
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .find:focus-within {
    border-color: var(--accent); background: rgba(78,168,255,0.06);
    box-shadow: 0 0 0 3px rgba(78,168,255,0.15);
  }
  .find-icon { font-size: 0.95rem; line-height: 1; transition: color 0.2s ease; }
  .find:focus-within .find-icon { color: var(--accent); }
  .find input { background: none; border: none; outline: none; color: var(--text); font-size: 0.78rem; width: 170px; }
  .find input::placeholder { color: var(--text-muted); }
  main { min-height: calc(100vh - var(--nav-h)); }
  @media (max-width: 560px) { .find input { width: 100px; } .links { display: none; } }
</style>
