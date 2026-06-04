# streaming-distribution integration

**Date:** 2026-05-31
**Status:** Implemented

## API consumed

| Method | Path | Response | Used by |
|---|---|---|---|
| GET | `/api/v1/videos` | `[{id,title,duration,thumbnail_url,format}]` | catalog (`/`) |
| GET | `/api/v1/manifest/:id` | `{videoId,status,hls,dash,cached}` | player (`/watch/[id]`) |

All requests send header `X-API-Key: <PUBLIC_API_KEY>`.

## getManifest mapping

The distribution returns both HLS and DASH URLs in a single object. The player
expects `{ manifest_url, type }`, so `src/lib/api.ts` maps the response,
preferring HLS:

```ts
const data = await res.json(); // { videoId, status, hls, dash, cached }
return { manifest_url: data.hls, type: 'hls' };
```

Shaka Player then loads `manifest_url`. Because distribution runs in public-URL
mode (`CDN_BASE=http://localhost:9000/videos`), the manifest and all relative
child playlists/segments are public MinIO URLs and resolve directly in the
browser (MinIO returns permissive CORS headers).

## Build note: `svelte.config.js`

The SvelteKit config must be `svelte.config.js` (not `.ts`): the production
Docker build runs `npm run build` under Node 20, which cannot import a
TypeScript config file (`ERR_UNKNOWN_FILE_EXTENSION ".ts"`). `vite.config.ts`
and `vitest.config.ts` remain TypeScript because Vite loads them through esbuild.

## Env

| Var | Default | Notes |
|---|---|---|
| `PUBLIC_DISTRIBUTION_URL` | `http://localhost:8082` | baked into the static build |
| `PUBLIC_API_KEY` | `pk_dev` | sent as `X-API-Key` |

## Verified end-to-end (2026-05-31)

Uploaded `beauty-medium-001.mp4` (h264) and `similar-fashion-rocha-activewear-008.webm`
(vp9→h264) through the real upload pipeline; both appear in the catalog and the
player at `/watch/<id>` loads the HLS manifest (duration shown, segments 200).
