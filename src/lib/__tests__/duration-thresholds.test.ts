import { describe, it, expect } from 'vitest';
import { STORY_MAX_SECONDS, REEL_MAX_SECONDS } from '$lib/config';
import { partitionVideos } from '$lib/catalog';
import type { Video } from '$lib/api';

const v = (id: string, duration: number): Video =>
  ({ id, title: `v${id}`, duration, thumbnail_url: null, format: 'hls' });

// Product rule: Story <= 90s · Reel 90–250s · Vídeo > 250s (upper bounds inclusive).
describe('duration thresholds (config-driven scenarios)', () => {
  it('exposes the product thresholds', () => {
    expect(STORY_MAX_SECONDS).toBe(90);
    expect(REEL_MAX_SECONDS).toBe(250);
  });

  it('routes each scenario to the correct bucket using config thresholds', () => {
    const r = partitionVideos(
      [v('story', 90), v('reelLow', 91), v('reelHigh', 250), v('video', 251)],
      { storyMax: STORY_MAX_SECONDS, reelMax: REEL_MAX_SECONDS }
    );
    expect(r.stories.map((x) => x.id)).toEqual(['story']);
    expect(r.reels.map((x) => x.id)).toEqual(['reelLow', 'reelHigh']);
    expect(r.catalog.map((x) => x.id)).toEqual(['video']);
  });

  it('keeps a 200s reel out of the normal videos catalog', () => {
    const r = partitionVideos([v('mid', 200)], {
      storyMax: STORY_MAX_SECONDS,
      reelMax: REEL_MAX_SECONDS,
    });
    expect(r.reels.map((x) => x.id)).toEqual(['mid']);
    expect(r.catalog).toEqual([]);
  });
});
