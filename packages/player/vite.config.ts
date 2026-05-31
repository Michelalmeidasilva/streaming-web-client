import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VodPlayer',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format: string) => {
        if (format === 'es') return 'index.esm.js';
        if (format === 'cjs') return 'index.cjs.js';
        return 'vod-player.umd.js';
      },
    },
    rollupOptions: {
      external: ['svelte'],
      output: {
        globals: { svelte: 'Svelte' },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
