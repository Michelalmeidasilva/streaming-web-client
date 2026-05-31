# Docker — streaming-web-client

## Decisão de Design

O `streaming-web-client` usa **build multi-stage** com nginx para servir os arquivos estáticos gerados pelo SvelteKit (`adapter-static`).

- **Stage 1 (builder):** Node 20 Alpine — instala deps via npm workspaces, roda `npm run build` (SDK + PWA)
- **Stage 2 (serve):** nginx 1.27 Alpine — serve o diretório `build/` gerado

### Por que nginx e não Node?

O `adapter-static` gera arquivos HTML/JS/CSS pré-renderizados — não precisa de runtime Node. Nginx é menor (~25MB vs ~180MB) e adequado para servir PWAs estáticas com cache correto.

### Por que PUBLIC_ vars como build args?

`$env/static/public` do SvelteKit embute os valores no bundle JavaScript em build-time (não são runtime env vars). Para alterar a URL do `streaming-distribution` em produção, é necessário re-buildar a imagem com os novos args.

## Executar com docker-compose

```bash
cd infra
docker compose up --build streaming-web-client
```

Acesso: http://localhost:5173

## Executar standalone

```bash
cd streaming-web-client

docker build \
  --build-arg PUBLIC_DISTRIBUTION_URL=http://localhost:8082 \
  --build-arg PUBLIC_API_KEY=pk_dev \
  -t streaming-web-client .

docker run -p 5173:80 streaming-web-client
```

## Customizar para produção

```bash
docker build \
  --build-arg PUBLIC_DISTRIBUTION_URL=https://distribution.meudominio.com \
  --build-arg PUBLIC_API_KEY=pk_live_xxx \
  -t streaming-web-client:prod .
```

## Configuração nginx

O `nginx.conf` implementa:
- **SPA fallback:** `try_files $uri $uri/ /index.html` — necessário para roteamento client-side do SvelteKit
- **Cache assets:** `Cache-Control: public, immutable` com `expires 1y` para arquivos com hash no nome (`_app/*.js`)
- **Sem cache HTML:** `Cache-Control: no-cache` para `index.html` — garante que o browser sempre busca a versão mais recente
- **Headers de segurança:** `X-Frame-Options` e `X-Content-Type-Options`

## Dependências em Runtime

O container serve apenas o frontend estático. Em runtime, o browser faz chamadas para:
- `streaming-distribution` (via `PUBLIC_DISTRIBUTION_URL`) — lista vídeos e manifests
- CDN/MinIO (URL retornada pelo distribution) — segmentos DASH/HLS

O `streaming-distribution` não precisa estar no mesmo compose para o container rodar, mas os vídeos não carregarão sem ele.
