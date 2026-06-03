import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$env/static/public', () => ({
  PUBLIC_DISTRIBUTION_URL: 'http://localhost:8082',
  PUBLIC_API_KEY: 'pk_test',
  PUBLIC_STORY_MAX_SECONDS: '30',
  PUBLIC_REEL_MAX_SECONDS: '90',
}));

import { listVideos, getManifest } from '../api';

const mockFetch = vi.fn();

describe('api.ts', () => {
  beforeEach(() => { vi.stubGlobal('fetch', mockFetch); vi.clearAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  describe('listVideos()', () => {
    it('chama /api/v1/videos com X-API-Key correto', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1', title: 'Test', duration: 60, thumbnail_url: null, format: 'dash' }],
      });

      await listVideos();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8082/api/v1/videos',
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-API-Key': 'pk_test' }),
        })
      );
    });

    it('retorna array de vídeos em sucesso', async () => {
      const videos = [{ id: '1', title: 'Test', duration: 60, thumbnail_url: null, format: 'dash' }];
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => videos });

      const result = await listVideos();
      expect(result).toEqual(videos);
    });

    it('lança erro com código HTTP em resposta não-ok', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
      await expect(listVideos()).rejects.toThrow('401');
    });
  });

  describe('getManifest()', () => {
    it('chama /api/v1/manifests/:id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ manifest_url: 'https://cdn/video.mpd', type: 'dash' }),
      });

      await getManifest('abc123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8082/api/v1/manifests/abc123',
        expect.anything()
      );
    });

    it('retorna manifest_url e type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ manifest_url: 'https://cdn/v.mpd', type: 'dash' }),
      });

      const result = await getManifest('abc123');
      expect(result).toEqual({ manifest_url: 'https://cdn/v.mpd', type: 'dash' });
    });

    it('lança erro em 404', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(getManifest('missing')).rejects.toThrow('404');
    });
  });
});
