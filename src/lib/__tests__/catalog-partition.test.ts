import { describe, it, expect } from 'vitest';
import { partitionVideos, parseThreshold } from '$lib/catalog';
import type { Video } from '$lib/api';

const v = (id: string, duration: number): Video =>
  ({ id, title: `v${id}`, duration, thumbnail_url: null, format: 'hls' });

describe('partitionVideos', () => {
  const t = { storyMax: 30, reelMax: 90 };

  it('classifies by duration with inclusive upper bounds', () => {
    const r = partitionVideos([v('a', 30), v('b', 31), v('c', 90), v('d', 91)], t);
    expect(r.stories.map((x) => x.id)).toEqual(['a']);
    expect(r.reels.map((x) => x.id)).toEqual(['b', 'c']);
    expect(r.catalog.map((x) => x.id)).toEqual(['d']);
  });

  it('preserves input order within each bucket', () => {
    const r = partitionVideos([v('a', 200), v('b', 100)], t);
    expect(r.catalog.map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('handles empty input', () => {
    const r = partitionVideos([], t);
    expect(r).toEqual({ stories: [], reels: [], catalog: [] });
  });
});

describe('parseThreshold', () => {
  it('parses positive integers', () => expect(parseThreshold('45', 30)).toBe(45));
  it('falls back on undefined', () => expect(parseThreshold(undefined, 30)).toBe(30));
  it('falls back on non-numeric', () => expect(parseThreshold('abc', 30)).toBe(30));
  it('falls back on zero/negative', () => {
    expect(parseThreshold('0', 30)).toBe(30);
    expect(parseThreshold('-5', 30)).toBe(30);
  });
});
