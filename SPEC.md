# streaming-web-client — SPEC

**Stack:** SvelteKit 2 · Vite · PWA · Shaka Player 4 · TypeScript  
**Port:** 5173 (dev) / 80 (Docker, nginx)  
**Status:** Implementado

---

## Responsabilidade

Consumer-facing PWA para visualização de vídeos DASH/HLS. Consome manifests servidos pelo `streaming-distribution` e reproduz via Shaka Player com bitrate adaptativo. Também publica o SDK `@vod/player` para embed em qualquer framework.

## Dois Artefatos

| Artefato | Path | Descrição |
|---|---|---|
| PWA (SvelteKit) | `src/` | Catálogo dark-style + tela de player. Instalável como PWA. |
| `@vod/player` SDK | `packages/player/` | TypeScript puro. ESM + CJS + UMD. |

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Catálogo de vídeos (hero + grid) |
| `/watch/[id]` | Player page com Shaka Player |

## Integração com streaming-distribution

Endpoints consumidos (assumidos — SPEC do distribution vazio):

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/v1/videos` | Lista vídeos disponíveis |
| GET | `/api/v1/manifests/:id` | Retorna `{ manifest_url, type }` |

Header obrigatório: `X-API-Key: <pk_xxx>` em todas as chamadas.

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PUBLIC_DISTRIBUTION_URL` | URL do streaming-distribution | `http://localhost:8082` |
| `PUBLIC_API_KEY` | API key para autenticação | `pk_dev` |

> **Nota:** Prefixo `PUBLIC_` expõe ao cliente SvelteKit (`$env/static/public`). Valores são embutidos no build estático.

## SDK @vod/player — API Pública

```typescript
class VodPlayer {
  constructor(container: string | HTMLElement, options: VodPlayerOptions)
  load(manifestUrl: string): Promise<void>
  destroy(): void
  on(event: 'error' | 'loaded' | 'buffering', handler: Function): void
  static mount(container, options & { manifestUrl }): VodPlayer
}
```

Exports: ESM (`dist/index.esm.js`), CJS (`dist/index.cjs.js`), UMD (`dist/vod-player.umd.js`).

## Docker

Build multi-stage: Node 20 (build SvelteKit) → nginx 1.27 (serve estático).  
Porta: `5173:80`.  
`PUBLIC_*` vars passadas como `build args` (embutidas no bundle).

## Comandos

```bash
npm run dev          # dev server :5173
npm run build        # build PWA + SDK
npm run build:sdk    # rebuild apenas o @vod/player
npm test             # 20 testes (Vitest)
docker build -t streaming-web-client .
```
