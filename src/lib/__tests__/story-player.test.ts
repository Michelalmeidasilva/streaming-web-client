import { render } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockLoad = vi.fn().mockResolvedValue(undefined);
const mockAttach = vi.fn().mockResolvedValue(undefined);
const mockRegister = vi.fn();
const mockOverlay = vi.fn();

vi.mock('shaka-player/dist/shaka-player.ui', () => ({
  default: {
    polyfill: { installAll: vi.fn() },
    Player: vi.fn().mockImplementation(() => ({
      attach: mockAttach,
      getNetworkingEngine: () => ({ registerRequestFilter: mockRegister }),
      load: mockLoad,
      destroy: vi.fn(),
      addEventListener: vi.fn(),
    })),
    ui: { Overlay: mockOverlay },
  },
}));

import StoryPlayer from '@vod/player/svelte/story';

/** Flush pending microtasks so onMount's async body runs. */
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe('StoryPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a bare video (no shaka UI overlay) and loads the manifest', async () => {
    const { container } = render(StoryPlayer, { manifestUrl: 'm.mpd', apiKey: 'pk' });
    await flush();
    expect(container.querySelector('video')).not.toBeNull();
    expect(mockLoad).toHaveBeenCalledWith('m.mpd');
    expect(mockOverlay).not.toHaveBeenCalled();
  });

  it('registers the X-API-Key request filter', async () => {
    render(StoryPlayer, { manifestUrl: 'm.mpd', apiKey: 'pk_secret' });
    await flush();
    expect(mockRegister).toHaveBeenCalledTimes(1);
    const filter = mockRegister.mock.calls[0][0] as (
      t: unknown,
      r: { headers: Record<string, string> },
    ) => void;
    const req = { headers: {} as Record<string, string> };
    filter(0, req);
    expect(req.headers['X-API-Key']).toBe('pk_secret');
  });

  it('forwards timeupdate as onTime(current, duration)', async () => {
    const onTime = vi.fn();
    const { container } = render(StoryPlayer, { manifestUrl: 'm.mpd', apiKey: 'pk', onTime });
    await flush();
    const video = container.querySelector('video')!;
    Object.defineProperty(video, 'currentTime', { value: 3, configurable: true });
    Object.defineProperty(video, 'duration', { value: 12, configurable: true });
    video.dispatchEvent(new Event('timeupdate'));
    expect(onTime).toHaveBeenCalledWith(3, 12);
  });

  it('forwards ended as onEnded', async () => {
    const onEnded = vi.fn();
    const { container } = render(StoryPlayer, { manifestUrl: 'm.mpd', apiKey: 'pk', onEnded });
    await flush();
    const video = container.querySelector('video')!;
    video.dispatchEvent(new Event('ended'));
    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});
