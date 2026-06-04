# Dev server: `server.fs.allow` para o pacote `@vod/player`

## Motivação

Rodar `npm run dev` resultava em **"500 Internal Error" em todas as rotas**
(`/`, `/reels`, `/watch/:id`), embora o build de produção (`npm run build` /
imagem Docker com nginx) funcionasse normalmente.

## Diagnóstico

Com SSR desabilitado app-wide (`src/routes/+layout.ts`, `ssr = false`), o
servidor de dev sempre devolve o shell HTML com **200** — a falha é puramente
client-side. O console do browser mostrava:

```
TypeError: Failed to fetch dynamically imported module:
http://localhost:5173/.svelte-kit/generated/client/nodes/2.js
```

Seguindo a cadeia de imports módulo a módulo no dev server, o único elo
quebrado era o fonte do player:

```
[200] /src/lib/components/StoryViewer.svelte
[403] /packages/player/src/SveltePlayer.svelte  ← "outside of Vite serving allow list"
```

## Causa-raiz

`@vod/player/svelte` (exports map → `packages/player/src/SveltePlayer.svelte`) é
importado por:

- catálogo `/` → `StoriesRail` → `StoryViewer`
- rota `/reels`
- rota `/watch/[id]`

A dependência é resolvida pelo symlink de workspace
`node_modules/@vod/player → ../../packages/player`. O Vite resolve o symlink para
o caminho real e, no **dev server**, valida esse caminho contra `server.fs.allow`.
O plugin do SvelteKit configura uma allow-list restrita (`src/lib`, `src/routes`,
`.svelte-kit`, `node_modules`, …) que **não** inclui `packages/`. Resultado: Vite
responde **403 Restricted** ao fonte `.svelte` do player, o import dinâmico da
rota falha e o SvelteKit renderiza a página de erro **500**. Como o player é
importado por todas as rotas, todas quebram.

`server.fs.allow` é um guard **somente de dev**. O `vite build` empacota via
Rollup (sem essa checagem), por isso o build de produção/SPA sempre funcionou.

## Correção

`vite.config.ts`:

```ts
server: {
  fs: {
    allow: ['./packages'],
  },
},
```

Isso adiciona o diretório `packages/` à allow-list herdada do SvelteKit (os arrays
são concatenados pelo Vite), liberando o fonte Svelte do `@vod/player`.

## Verificação

- `GET /packages/player/src/SveltePlayer.svelte` → **200** (era 403).
- Render headless de `/`, `/reels`, `/watch/:id` → catálogo/página reais, **sem**
  a página "500 Internal Error".

## Caveats

- Após alterar `vite.config.ts`, **reinicie o dev server** (instâncias já em
  execução podem estar usando a config anterior).
- Se outros pacotes de workspace com fonte Svelte/TS forem adicionados em
  `packages/*`, eles já ficam cobertos por `./packages`.
