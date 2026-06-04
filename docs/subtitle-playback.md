# Subtitle playback

## Motivation
Render the WebVTT subtitle tracks the pipeline produced, for both the watch page
(`SveltePlayer` with Shaka UI) and Stories (`StoryPlayer`, controls-less).

## Design
- `getManifest` returns `subtitles: SubtitleTrack[]` (`{ url, language?, label?,
  default? }`) from the distribution playback response.
- The tracks are **side-loaded** after `player.load()` via Shaka's
  `addTextTrackAsync(url, language, 'subtitle', 'text/vtt', undefined, label)`,
  so they work whether or not the manifest advertises them (HLS master does;
  DASH does not). The track flagged `default` is selected and made visible.
- Wiring:
  - `VodPlayer.load(manifestUrl, subtitles)` → `SveltePlayer` `subtitles` prop →
    watch route passes `manifest.subtitles`.
  - `StoryPlayer` `subtitles` prop → `StoryViewer` passes `m.subtitles` from
    `getManifest`.

## Caveats
- Failure to load a single track is non-fatal (logged); playback continues.
- In `SveltePlayer` the Shaka UI overlay provides the captions toggle;
  `StoryPlayer` has no controls, so it just enables the default track.
