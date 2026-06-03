import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vod/player/svelte', () => ({ default: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/stores', () => ({ page: { subscribe: (fn: (v: unknown) => void) => { fn({ url: new URL('http://localhost/reels') }); return () => {}; } } }));
vi.mock('$lib/api', () => ({ listVideos: vi.fn(), getManifest: vi.fn() }));

import { listVideos, getManifest, type Video } from '$lib/api';
import Reels from '../../routes/reels/+page.svelte';

const list: Video[] = [
  { id: 'a', title: 'Reel A', duration: 40, thumbnail_url: null, format: 'hls' },
  { id: 'b', title: 'Reel B', duration: 600, thumbnail_url: null, format: 'hls' },
  { id: 'c', title: 'Reel C', duration: 70, thumbnail_url: null, format: 'hls' },
];

describe('reels route', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows only reel-duration videos', async () => {
    vi.mocked(listVideos).mockResolvedValue(list);
    // Reject manifest so the (mocked) player is never instantiated in jsdom;
    // the poster renders instead. Partition assertions are unaffected.
    vi.mocked(getManifest).mockRejectedValue(new Error('skip-player'));
    render(Reels);
    await waitFor(() => expect(screen.getByText('Reel A')).toBeInTheDocument());
    expect(screen.getByText('Reel C')).toBeInTheDocument();
    expect(screen.queryByText('Reel B')).toBeNull();
  });

  it('shows empty state when there are no reels', async () => {
    vi.mocked(listVideos).mockResolvedValue([list[1]]);
    render(Reels);
    await waitFor(() => expect(screen.getByText('Nenhum reel disponível.')).toBeInTheDocument());
  });
});
