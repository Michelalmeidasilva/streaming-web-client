import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import type { Video } from '$lib/api';
import VideoGrid from '$lib/components/VideoGrid.svelte';
import HeroFeature from '$lib/components/HeroFeature.svelte';
import ReelsRail from '$lib/components/ReelsRail.svelte';
import StoryViewer from '$lib/components/StoryViewer.svelte';
import StoriesRail from '$lib/components/StoriesRail.svelte';
import UpNextList from '$lib/components/UpNextList.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('@vod/player/svelte', () => ({ default: vi.fn() }));
vi.mock('$lib/api', () => ({ getManifest: vi.fn().mockRejectedValue(new Error('no-manifest')) }));

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

describe('StoryViewer', () => {
  it('renders current story title and a progress bar per story', () => {
    render(StoryViewer, {
      stories: [v('s1', 'Story One', 12), v('s2', 'Story Two', 8)],
      startIndex: 0,
      onClose: vi.fn(),
      onSeen: vi.fn(),
    });
    expect(screen.getByText('Story One')).toBeInTheDocument();
    expect(screen.getAllByTestId('story-bar')).toHaveLength(2);
  });

  it('calls onSeen for the opening story', () => {
    const onSeen = vi.fn();
    render(StoryViewer, { stories: [v('s1', 'Story One', 12)], startIndex: 0, onClose: vi.fn(), onSeen });
    expect(onSeen).toHaveBeenCalledWith('s1');
  });
});

describe('StoriesRail', () => {
  it('renders nothing when there are no stories', () => {
    const { container } = render(StoriesRail, { stories: [] });
    expect(container.querySelector('.stories-section')).toBeNull();
  });

  it('renders a bubble per story and opens the viewer on click', async () => {
    render(StoriesRail, { stories: [v('s1', 'Hotfix', 12)] });
    const btn = screen.getByLabelText('Ver story Hotfix');
    expect(btn).toBeInTheDocument();
    await fireEvent.click(btn);
    expect(screen.getByRole('dialog', { name: 'Stories' })).toBeInTheDocument();
  });
});

describe('UpNextList', () => {
  it('lists videos and calls onSelect with id', async () => {
    const onSelect = vi.fn();
    render(UpNextList, { videos: [v('n1', 'Next One', 500), v('n2', 'Next Two', 600)], onSelect });
    expect(screen.getByText('A seguir')).toBeInTheDocument();
    await fireEvent.click(screen.getByLabelText('Assistir Next Two'));
    expect(onSelect).toHaveBeenCalledWith('n2');
  });
});
