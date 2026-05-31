import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Page from '../../routes/+page.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$lib/api', () => ({
  listVideos: vi.fn(),
}));

import { listVideos, type Video } from '$lib/api';
import { goto } from '$app/navigation';

const mockVideos: Video[] = [
  { id: '1', title: 'Big Buck Bunny', duration: 540, thumbnail_url: null, format: 'dash' },
  { id: '2', title: 'Elephant Dream', duration: 660, thumbnail_url: null, format: 'dash' },
];

describe('+page.svelte (Catálogo)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

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
});
