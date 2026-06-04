# Faixas de duração: Story / Reel / Vídeo

## Motivação

Os vídeos do catálogo são classificados em três categorias mutuamente
exclusivas com base na duração. A regra de produto foi atualizada para:

- **Reel** — vídeos **acima de 90s e até 250s**.
- **Vídeo (streaming normal)** — vídeos **acima de 250s**.
- **Story** — vídeos **até 90s** (absorve a antiga faixa curta de reels).

## Regra de partição (limites superiores inclusivos)

| Categoria | Condição              | Superfície na UI |
|-----------|-----------------------|------------------|
| Story     | `duration <= 90`      | Rail de stories + viewer headless |
| Reel      | `90 < duration <= 250`| Rail de reels + rota `/reels` (scroll-snap vertical) |
| Vídeo     | `duration > 250`      | Hero em destaque + grid do catálogo |

Bordas: 90s → Story · 91s → Reel · 250s → Reel · 251s → Vídeo.

Antes: Story `<=30` · Reel `30–90` · Vídeo `>90`.

## Design

A classificação vive em uma única função pura,
`partitionVideos(videos, { storyMax, reelMax })` em `src/lib/catalog.ts`. Ela é
**genérica sobre os thresholds** — a mudança de faixas não altera a lógica,
apenas os valores que a alimentam.

Os thresholds são resolvidos em `src/lib/config.ts` a partir das variáveis
`PUBLIC_*`, com uma guarda que exige `reelMax > storyMax` (caso contrário ambos
voltam aos defaults). Todos os consumidores (`/` e `/reels`) importam
`STORY_MAX_SECONDS` / `REEL_MAX_SECONDS` de `config` — não há números mágicos
espalhados nos componentes.

## Configuração

| Variável                   | Default | Descrição |
|----------------------------|---------|-----------|
| `PUBLIC_STORY_MAX_SECONDS`  | `90`    | Duração máxima (inclusive) para Story |
| `PUBLIC_REEL_MAX_SECONDS`   | `250`   | Duração máxima (inclusive) para Reel |

Como são `PUBLIC_*`, os valores são **embutidos no build** (SvelteKit
`$env/static/public`). Em Docker, passar como `build args` e rebuildar — não
basta alterar `.env`/`env_file` em runtime.

## Validação

Cobertura em `src/lib/__tests__/`:

- `duration-thresholds.test.ts` — prova, via thresholds resolvidos de `config`,
  que 90s → story, 91s/250s → reel, 251s → vídeo, e que um reel de 200s não
  vaza para o catálogo de vídeos.
- `catalog-partition.test.ts` — bordas da função pura com `{90, 250}`.
- `catalog.test.ts` / `reels-route.test.ts` — fixtures atualizadas para as novas
  faixas.

`npm test` cobre todos os cenários (66 testes).

## Caveats

- Limites são **inclusivos** no topo de cada faixa, mantendo a convenção
  pré-existente do código.
- Thumbnails continuam 16:9 (caveat pré-existente, inalterado por esta mudança).
