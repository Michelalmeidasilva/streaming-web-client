# Stories Playback

## Motivation

Stories must behave like real stories: a short clip autoplays cleanly (no scrubber
or player controls), a thin progress bar at the bottom fills as the video actually
plays, and when the video truly ends the viewer advances to the next story —
closing after the last one.

The previous implementation faked progress with a fixed `setInterval` derived from
the `duration` metadata, embedded the full streaming player (with shaka controls),
and placed the indicator bar at the top. This desynchronized the bar from real
playback and did not look like a story.

## Duration-based routing (unchanged)

Routing by duration was already correct and remains:

- `duration <= 30s`  → **Story** (`StoryViewer` + `StoryPlayer`)
- `duration <= 90s`  → **Reel** (vertical reels feed)
- `duration  > 90s`  → **Normal streaming player** (`/watch/[id]`, `SveltePlayer`)

Thresholds live in `src/lib/config.ts` (`STORY_MAX_SECONDS=30`, `REEL_MAX_SECONDS=90`,
env-overridable) and the split is implemented by `partitionVideos` in
`src/lib/catalog.ts` (inclusive upper bounds).

## Components

### `@vod/player/svelte/story` — `StoryPlayer`

A headless, control-less playback surface built on shaka but **without**
`shaka.ui.Overlay`. It is separate from the streaming `SveltePlayer` and keeps the
shaka dependency encapsulated in the `@vod/player` package. (shaka is dynamically
imported inside `onMount` so it lazy-loads and stays out of the mock-hoisting path
during tests.)

Props:

| Prop          | Type                                          | Default | Notes                                  |
| ------------- | --------------------------------------------- | ------- | -------------------------------------- |
| `manifestUrl` | `string`                                      | —       | DASH/HLS manifest.                     |
| `apiKey`      | `string`                                      | —       | Sent as `X-API-Key` request header.    |
| `muted`       | `boolean`                                     | `true`  | Required for reliable autoplay.        |
| `onTime`      | `(currentSeconds, durationSeconds) => void`   | no-op   | From native `<video>` `timeupdate`.    |
| `onEnded`     | `() => void`                                  | no-op   | From native `<video>` `ended`.         |
| `onError`     | `(message: string) => void`                   | no-op   | Load/playback error.                   |

### `StoryViewer`

Drives the experience: `onTime` sets `progress = currentTime / duration`; `onEnded`
(and `onError`) advance to the next story; after the last story the viewer closes.
The segmented progress bars (one per story) sit at the bottom, beneath the
title/meta. Manual navigation (tap zones, ArrowLeft/ArrowRight) and `onSeen`
marking are preserved.

## Caveats

- If a story's manifest fails to load there is no playback timer to advance it, so
  the viewer skips the story after a 3s fallback (`FAIL_SKIP_MS`).
- Autoplay relies on `muted = true`; browsers block unmuted autoplay.
