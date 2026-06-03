import type { Video } from './api';

export interface Thresholds {
  storyMax: number;
  reelMax: number;
}

export interface Partitioned {
  stories: Video[];
  reels: Video[];
  catalog: Video[];
}

/** Split videos into stories (<=storyMax), reels (<=reelMax), catalog (rest). */
export function partitionVideos(
  videos: Video[],
  { storyMax, reelMax }: Thresholds
): Partitioned {
  const stories: Video[] = [];
  const reels: Video[] = [];
  const catalog: Video[] = [];

  for (const v of videos) {
    if (v.duration <= storyMax) {
      stories.push(v);
    } else if (v.duration <= reelMax) {
      reels.push(v);
    } else {
      catalog.push(v);
    }
  }

  return { stories, reels, catalog };
}

/** Parse a positive-integer env string, else return fallback. */
export function parseThreshold(raw: string | undefined, fallback: number): number {
  if (raw == null) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
