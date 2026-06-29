import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vod/player/svelte', () => ({ default: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
// Writable page store so tests can simulate route-param navigation (the bug:
// navigating /watch/1 -> /watch/2 reuses the component and must reload).
const h = vi.hoisted(() => {
  let val: unknown = { params: { id: '1' } };
  const subs = new Set<(v: unknown) => void>();
  return {
    pageStore: {
      subscribe(fn: (v: unknown) => void) { fn(val); subs.add(fn); return () => subs.delete(fn); },
      setId(id: string) { val = { params: { id } }; subs.forEach((fn) => fn(val)); },
    },
  };
});
vi.mock('$app/stores', () => ({ page: h.pageStore }));
vi.mock('$lib/api', () => ({ getManifest: vi.fn(), listVideos: vi.fn() }));

import { getManifest, listVideos, type Video } from '$lib/api';
import Watch from '../../routes/watch/[id]/+page.svelte';

const list: Video[] = [
  { id: '1', title: 'Atual', duration: 500, thumbnail_url: null, format: 'hls' },
  { id: '2', title: 'Outro', duration: 600, thumbnail_url: null, format: 'dash' },
];

describe('watch page', () => {
  beforeEach(() => { vi.clearAllMocks(); h.pageStore.setId('1'); });

  it('shows current title and an A-seguir list excluding the current video', async () => {
    vi.mocked(getManifest).mockResolvedValue({ manifest_url: 'http://x/m.m3u8', type: 'hls' });
    vi.mocked(listVideos).mockResolvedValue(list);
    render(Watch);
    await waitFor(() => expect(screen.getByText('Atual')).toBeInTheDocument());
    expect(screen.getByText('A seguir')).toBeInTheDocument();
    expect(screen.getByText('Outro')).toBeInTheDocument();
    expect(screen.getByLabelText('Assistir Outro')).toBeInTheDocument();
  });

  it('reloads the video when the route param changes (A seguir click)', async () => {
    vi.mocked(getManifest).mockResolvedValue({ manifest_url: 'http://x/m.m3u8', type: 'hls' });
    vi.mocked(listVideos).mockResolvedValue(list);
    render(Watch);
    await waitFor(() => expect(screen.getByText('Atual')).toBeInTheDocument());
    expect(getManifest).toHaveBeenCalledWith('1');

    // Simulate clicking an "A seguir" item -> goto(/watch/2) -> page param changes.
    h.pageStore.setId('2');
    await waitFor(() => expect(getManifest).toHaveBeenCalledWith('2'));
    await waitFor(() => expect(screen.getByText('Outro')).toBeInTheDocument());
  });

  it('shows an error when the manifest fails', async () => {
    vi.mocked(getManifest).mockRejectedValue(new Error('404'));
    vi.mocked(listVideos).mockResolvedValue(list);
    render(Watch);
    await waitFor(() => expect(screen.getByText('Vídeo não encontrado.')).toBeInTheDocument());
  });
});
