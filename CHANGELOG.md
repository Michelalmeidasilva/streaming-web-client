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
