## [Unreleased] 2026-06-03
### Changed
- Hero and catalog card components in `+page.svelte` now fall back to
  `static/default-thumbnail.png` when `thumbnail_url` is null (was an empty
  placeholder div). The component already consumed `thumbnail_url` from
  `GET /api/v1/videos`; this change ensures a visible image is always shown.
- Redesign completo do cliente web para estilo Vimeo (tema escuro refinado,
  tokens de cor, tipografia Schibsted Grotesk, nav com blur, motion contido).
- Página de player reconstruída com título, chips de metadados e lista "A seguir".

### Added
- Surfaces **Reels** e **Stories** derivados de `duration` (limiares via
  `PUBLIC_STORY_MAX_SECONDS` / `PUBLIC_REEL_MAX_SECONDS`).
- Viewer imersivo de Stories (barras de progresso, auto-avanço, navegação por toque/teclado).
- Rota `/reels`: feed vertical com scroll-snap.
- Busca client-side no catálogo (filtro por título, acento-insensível).

### Fixed
- SSR desabilitado app-wide (`src/routes/+layout.ts`, `ssr = false`) — o app é uma
  SPA estática e o Shaka acessa `document` na importação, o que quebrava `npm run dev`.

## [Unreleased] 2026-05-31 — End-to-end playback integration

### Fixed
- `getManifest()` prefers **HLS** (`manifest_url=hls, type=hls`), falling back to DASH
  if HLS is absent. (Briefly preferred DASH as a workaround for Shaka error 3014 caused
  by the HLS master advertising a non-existent audio track; that root cause was fixed in
  streaming-transcode `WriteHLSMaster`, so HLS is preferred again.)
- `getManifest()` now calls the distribution's real endpoint `GET /api/v1/manifest/:id`
  (singular) and maps the `{videoId,status,hls,dash,cached}` response to the player's
  `{manifest_url, type}` shape (prefers HLS). It previously called a non-existent
  plural `/api/v1/manifests/:id` with a mismatched shape.
- Renamed `svelte.config.ts` → `svelte.config.js` so the production Docker build
  (`npm run build` under Node 20) can load the SvelteKit config (Node could not
  import the `.ts` config, breaking the image build).

## [Unreleased] 2026-05-31

### Added
- Dockerfile multi-stage (Node 20 build → nginx 1.27 serve) para deploy containerizado
- `nginx.conf` com SPA fallback (`try_files $uri /index.html`), cache de assets e headers de segurança
- `.dockerignore` excluindo node_modules, build/ e .svelte-kit/
- Serviço `streaming-web-client` no `infra/docker-compose.yml` na porta 5173
- Implementação completa da PWA: catálogo dark-style (hero + grid), player page com Shaka Player
- SDK `@vod/player` em `packages/player/` — VodPlayer (Shaka wrapper), SveltePlayer.svelte, build ESM/CJS/UMD
- `api.ts` — client do streaming-distribution com header `X-API-Key` e timeout de 10s
- Service worker + `manifest.webmanifest` para suporte PWA
- 20 testes unitários (Vitest): 8 SDK + 6 api + 6 catálogo
