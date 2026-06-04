import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      // The @vod/player workspace package is symlinked into node_modules and its
      // Svelte source (packages/player/src/SveltePlayer.svelte) resolves to a real
      // path outside SvelteKit's default dev allow-list. Without this, the dev
      // server returns 403 for the player source, the dynamic route import fails,
      // and every route renders "500 Internal Error".
      // (Dev-only: `vite build` bundles via Rollup and is unaffected.)
      allow: ['./packages'],
    },
  },
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },
      manifest: false,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
