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
| `/` | Catálogo de vídeos (stories rail + reels rail + hero em destaque + grid + busca client-side) |
| `/watch/[id]` | Player page com Shaka Player, título, chips de metadados e lista "A seguir" |
| `/reels` | Feed vertical imersivo de reels (scroll-snap) |

## Reels & Stories (derivados de `duration`)

Os vídeos são particionados em três categorias mutuamente exclusivas com base na duração, configurável via variáveis de ambiente:

| Categoria | Condição | Uso na UI |
|---|---|---|
| **Story** | `duration <= PUBLIC_STORY_MAX_SECONDS` (padrão 90 s) | Rail de stories horizontal; viewer headless (`@vod/player/svelte/story`) sem controles, barra de progresso inferior dirigida pela reprodução real e auto-avanço no fim do vídeo |
| **Reel** | `PUBLIC_STORY_MAX_SECONDS < duration <= PUBLIC_REEL_MAX_SECONDS` (padrão 250 s) | Rail de reels horizontal + rota `/reels` (scroll-snap vertical) |
| **Catálogo** | `duration > PUBLIC_REEL_MAX_SECONDS` | Hero em destaque + grid geral |

**Regra de partição:** os intervalos são não-sobrepostos — um vídeo pertence a exatamente uma categoria.

**Caveat de thumbnail:** o campo `thumbnail_url` retorna imagens 16:9. As superfícies de Stories e Reels exibem molduras 9:16; as imagens são renderizadas com `object-fit: cover`, centralizadas, com as bordas laterais cortadas. Não existe campo de thumbnail retrato na API atual. Quando `thumbnail_url` é `null`, o fallback é `/default-thumbnail.png`.

**Busca no catálogo:** filtro client-side por título (acento-insensível via `normalize('NFD')`). Não há novo endpoint — a busca opera sobre a lista já carregada de `/api/v1/videos`.

## Integração com streaming-distribution

Endpoints consumidos (confirmados — ver `docs/distribution-integration.md`):

| Método | Path | Resposta do distribution | Uso |
|---|---|---|---|
| GET | `/api/v1/videos` | `[{id,title,duration,thumbnail_url,format}]` | catálogo (`/`) — `thumbnail_url` null → fallback `default-thumbnail.png` |
| GET | `/api/v1/manifest/:id` | `{videoId,status,hls,dash,cached}` | player (`/watch/[id]`) |

`getManifest()` mapeia a resposta do distribution para `{ manifest_url, type }`
(prefere HLS). Header obrigatório: `X-API-Key: <pk_xxx>` em todas as chamadas.

> Config: usar `svelte.config.js` (não `.ts`) — o build de produção em Docker
> (Node 20) não importa config TypeScript.

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PUBLIC_DISTRIBUTION_URL` | URL do streaming-distribution | `http://localhost:8082` |
| `PUBLIC_API_KEY` | API key para autenticação | `pk_dev` |
| `PUBLIC_STORY_MAX_SECONDS` | Duração máxima (inclusive) para classificar como Story | `90` |
| `PUBLIC_REEL_MAX_SECONDS` | Duração máxima (inclusive) para classificar como Reel | `250` |

> **Nota:** Prefixo `PUBLIC_` expõe ao cliente SvelteKit (`$env/static/public`). Valores são embutidos no build estático.

## Renderização (SPA)

O app é distribuído como SPA estática via adapter-static (`fallback: index.html`). O arquivo `src/routes/+layout.ts` exporta `ssr = false` e `prerender = false` porque o Shaka Player acessa `document` no momento da importação — o que quebra o ambiente SSR do SvelteKit. Toda navegação é client-side; o servidor (nginx em Docker) serve `index.html` para qualquer rota desconhecida.

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

Entry Svelte adicional: `@vod/player/svelte/story` exporta `StoryPlayer`, uma superfície de reprodução headless (sem `shaka.ui.Overlay`) para Stories, que encaminha `timeupdate`/`ended` do `<video>` via callbacks (`onTime`, `onEnded`, `onError`). O entry de streaming existente continua sendo `@vod/player/svelte` (`SveltePlayer`).

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
