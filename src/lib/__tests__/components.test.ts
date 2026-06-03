import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import type { Video } from '$lib/api';
import VideoGrid from '$lib/components/VideoGrid.svelte';

const v = (id: string, title: string, duration: number): Video =>
  ({ id, title, duration, thumbnail_url: null, format: 'hls' });

describe('VideoGrid', () => {
  it('renders a card per video and calls onSelect with id', async () => {
    const onSelect = vi.fn();
    render(VideoGrid, { videos: [v('1', 'Alpha', 540), v('2', 'Beta', 120)], onSelect });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    await fireEvent.click(screen.getByLabelText('Assistir Alpha'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
