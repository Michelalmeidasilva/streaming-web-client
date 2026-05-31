<script lang="ts">
  import '../app.css';
  import 'shaka-player/dist/controls.css';
</script>

<nav>
  <a href="/" class="logo">
    <div class="logo-icon" aria-hidden="true">▶</div>
    <span>VOD</span>
  </a>
</nav>

<main>
  <slot />
</main>

<style>
  nav {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 12px 24px;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.05em;
    color: var(--text);
  }

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--accent);
    border-radius: 4px;
    font-size: 0.75rem;
  }

  main {
    min-height: calc(100vh - 53px);
  }
</style>
