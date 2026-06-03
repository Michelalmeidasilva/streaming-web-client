# Thumbnail Fallback

## Motivation

`GET /api/v1/videos` returns `thumbnail_url: null` for videos that have not yet
been processed or whose transcode worker has not yet uploaded a poster frame. Before
this change, `+page.svelte` rendered an empty `<div>` in place of the poster image,
producing a blank box in the hero and catalog grid — a visible layout gap on every
fresh upload.

## Implementation

`static/default-thumbnail.png` is a neutral dark placeholder image bundled with
the app (served by nginx at `/default-thumbnail.png`).

In `+page.svelte`, wherever `thumbnail_url` is used as an `<img src>`:

```svelte
<img
  src={video.thumbnail_url ?? '/default-thumbnail.png'}
  alt={video.title}
/>
```

The hero banner and every catalog card use this pattern. No Svelte store or API
change is required — the fallback is purely presentational.

## Behavior

| `thumbnail_url` value | Displayed image |
|---|---|
| `"https://…/thumbnails/<id>.jpg"` | Real poster frame from storage |
| `null` | `default-thumbnail.png` (static asset) |

## Caveats

- The fallback image is a static asset; it is included in the nginx Docker image
  at build time. Replacing it requires a new Docker build.
- When streaming-distribution returns `thumbnail_url` as a presigned URL, the URL
  will expire. For local development, use CDN mode (`CDN_BASE` set on the
  distribution) to get permanent public URLs.
