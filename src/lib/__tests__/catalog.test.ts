import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Page from '../../routes/+page.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$lib/api', () => ({ listVideos: vi.fn(), getManifest: vi.fn() }));
vi.mock('@vod/player/svelte', () => ({ default: vi.fn() }));

import { listVideos, type Video } from '$lib/api';
import { goto } from '$app/navigation';
import { searchQuery } from '$lib/search';

const mockVideos: Video[] = [
  { id: '1', title: 'Big Buck Bunny', duration: 540, thumbnail_url: null, format: 'dash' },
  { id: '2', title: 'Elephant Dream', duration: 660, thumbnail_url: null, format: 'dash' },
];

describe('+page.svelte (Catálogo)', () => {
  beforeEach(() => { vi.clearAllMocks(); searchQuery.set(''); });

  it('mostra skeleton durante carregamento', () => {
    vi.mocked(listVideos).mockReturnValue(new Promise(() => {}));
    render(Page);
    expect(screen.getByLabelText('Carregando...')).toBeInTheDocument();
  });

  it('renderiza hero e grid após carregar vídeos', async () => {
    vi.mocked(listVideos).mockResolvedValue(mockVideos);
    render(Page);
    await waitFor(() => expect(screen.getByText('Big Buck Bunny')).toBeInTheDocument());
    expect(screen.getByText('Elephant Dream')).toBeInTheDocument();
  });

  it('mostra mensagem de vazio quando API retorna []', async () => {
    vi.mocked(listVideos).mockResolvedValue([]);
    render(Page);
    await waitFor(() => expect(screen.getByText('Nenhum vídeo disponível.')).toBeInTheDocument());
  });

  it('mostra erro de API key em 401', async () => {
    vi.mocked(listVideos).mockRejectedValue(new Error('401'));
    render(Page);
    await waitFor(() =>
      expect(screen.getByText(/API key inválida/i)).toBeInTheDocument()
    );
  });

  it('mostra erro genérico em falha de rede', async () => {
    vi.mocked(listVideos).mockRejectedValue(new Error('network'));
    render(Page);
    await waitFor(() =>
      expect(screen.getByText(/Serviço indisponível/i)).toBeInTheDocument()
    );
  });

  it('navega para /watch/:id ao clicar no hero', async () => {
    vi.mocked(listVideos).mockResolvedValue(mockVideos);
    render(Page);
    await waitFor(() => screen.getByLabelText('Assistir Big Buck Bunny'));
    await fireEvent.click(screen.getByLabelText('Assistir Big Buck Bunny'));
    expect(goto).toHaveBeenCalledWith('/watch/1');
  });

  it('mostra stories e reels conforme a duração', async () => {
    vi.mocked(listVideos).mockResolvedValue([
      { id: 's', title: 'Curtinho', duration: 12, thumbnail_url: null, format: 'hls' },
      { id: 'r', title: 'Reelzinho', duration: 60, thumbnail_url: null, format: 'hls' },
      { id: 'l', title: 'Longo', duration: 600, thumbnail_url: null, format: 'hls' },
    ]);
    render(Page);
    await waitFor(() => expect(screen.getByText('Longo')).toBeInTheDocument());
    expect(screen.getByLabelText('Ver story Curtinho')).toBeInTheDocument();
    expect(screen.getByText('Reelzinho')).toBeInTheDocument();
    expect(screen.getByText('Reels')).toBeInTheDocument();
  });

  it('filtra o grid pelo termo de busca', async () => {
    vi.mocked(listVideos).mockResolvedValue([
      { id: '1', title: 'Onboarding', duration: 600, thumbnail_url: null, format: 'hls' },
      { id: '2', title: 'Webinar', duration: 700, thumbnail_url: null, format: 'hls' },
    ]);
    render(Page);
    await waitFor(() => expect(screen.getByText('Onboarding')).toBeInTheDocument());
    searchQuery.set('webin');
    await waitFor(() => expect(screen.queryByText('Onboarding')).toBeNull());
    expect(screen.getByText('Webinar')).toBeInTheDocument();
  });
});
