import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import type { Video } from '$lib/api';
import VideoGrid from '$lib/components/VideoGrid.svelte';
import HeroFeature from '$lib/components/HeroFeature.svelte';
import ReelsRail from '$lib/components/ReelsRail.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

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

describe('HeroFeature', () => {
  it('shows title/meta and calls onSelect on click', async () => {
    const onSelect = vi.fn();
    render(HeroFeature, { video: v('9', 'Featured One', 750), onSelect });
    expect(screen.getByText('Featured One')).toBeInTheDocument();
    await fireEvent.click(screen.getByLabelText('Assistir Featured One'));
    expect(onSelect).toHaveBeenCalledWith('9');
  });
});

describe('ReelsRail', () => {
  it('renders nothing when there are no reels', () => {
    const { container } = render(ReelsRail, { reels: [], onSelect: vi.fn() });
    expect(container.querySelector('.reels-section')).toBeNull();
  });

  it('renders a reel card per video', () => {
    render(ReelsRail, { reels: [v('r1', 'Quick Tip', 48)], onSelect: vi.fn() });
    expect(screen.getByText('Quick Tip')).toBeInTheDocument();
    expect(screen.getByText('Reels')).toBeInTheDocument();
  });
});
