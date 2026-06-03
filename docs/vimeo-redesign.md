# Redesign Vimeo-Style — streaming-web-client

## Motivação

A interface anterior era um dark UI genérico: hero simples, grid plano, sem hierarquia de conteúdo. O redesign adota a estética do Vimeo — tons de preto profundo, tipografia refinada, acento sky-blue, motion contido — e introduz superfícies específicas para conteúdo curto (Stories e Reels), transformando o catálogo em uma experiência de descoberta.

---

## Partição de Conteúdo: Stories, Reels e Catálogo

### Decisão

Criar superfícies distintas sem alterar a API. O campo `duration` (segundos) já existe em `GET /api/v1/videos`; limiares configuráveis via env vars permitem ajuste operacional sem rebuild do código.

### Regra de Partição

| Categoria | Intervalo de duração | Superfície |
|---|---|---|
| **Story** | `duration <= PUBLIC_STORY_MAX_SECONDS` (padrão 30 s) | Rail horizontal + viewer com barras de progresso |
| **Reel** | `STORY_MAX < duration <= PUBLIC_REEL_MAX_SECONDS` (padrão 90 s) | Rail horizontal + rota `/reels` (scroll-snap) |
| **Catálogo** | `duration > PUBLIC_REEL_MAX_SECONDS` | Hero em destaque + grid geral |

A partição é não-sobreponíveis: cada vídeo pertence a exatamente uma categoria.

### Caveat: Thumbnails em Formato Retrato

As superfícies de Stories e Reels usam molduras 9:16. O campo `thumbnail_url` retorna imagens 16:9 (não existe campo de thumbnail retrato na API). A renderização usa `object-fit: cover` centrado — as bordas laterais são cortadas. Quando `thumbnail_url` é `null`, o fallback é `/default-thumbnail.png`.

---

## Mapa de Componentes e Módulos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/format.ts` | Formatação de duração (`formatDuration`) e derivação de categoria (`getVideoType`) |
| `src/lib/catalog.ts` | Fetch de `GET /api/v1/videos`; partição em stories/reels/catalog |
| `src/lib/search.ts` | Filtro client-side por título (acento-insensível via `normalize('NFD')`) |
| `src/lib/stories.ts` | Lógica de auto-avanço e estado do viewer de Stories |
| `src/lib/components/` | Componentes Svelte reutilizáveis (cards, rails, chips, nav, etc.) |
| `src/routes/+page.svelte` | Catálogo: stories rail + reels rail + hero em destaque + grid + busca |
| `src/routes/watch/[id]/+page.svelte` | Player: Shaka Player + título + chips de metadados + lista "A seguir" |
| `src/routes/reels/+page.svelte` | Feed vertical imersivo com scroll-snap |

---

## Sistema Visual

- **Tokens de cor** (`src/app.css`): fundo near-black (`#0a0a0a` / `#111`), acento sky-blue `#4ea8ff`, superfícies em `#1a1a1a` / `#222`.
- **Tipografia:** Schibsted Grotesk (Google Fonts), carregada via `<link>` no layout.
- **Glow:** `box-shadow` com `rgba(78,168,255,0.35)` em elementos interativos ativos.
- **Nav:** `backdrop-filter: blur(12px)` + `position: sticky` — permanece legível sobre qualquer conteúdo.
- **Motion:** todas as transições e animações verificam `@media (prefers-reduced-motion: reduce)` — nenhum movimento intrusivo para usuários com essa preferência.

---

## Decisão: SPA Estática (`ssr = false`)

O SvelteKit, por padrão, tenta executar SSR (server-side rendering) para cada rota. O Shaka Player acessa `document` diretamente no momento da importação do módulo, o que lança `ReferenceError: document is not defined` em ambiente Node (SSR), quebrando o servidor de dev e o build.

**Solução:** `src/routes/+layout.ts` exporta:

```typescript
export const ssr = false;
export const prerender = false;
```

Isso instrui o SvelteKit a tratar todo o app como SPA client-side. Em produção, o `adapter-static` com `fallback: index.html` garante que o nginx sirva `index.html` para qualquer rota desconhecida, mantendo a navegação client-side funcional após reload direto de URL.

**Trade-off aceito:** sem SSR, crawlers que não executam JavaScript não indexam o conteúdo. Para uma plataforma privada/interna de VOD, isso é aceitável.
