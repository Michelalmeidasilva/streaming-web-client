import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** Flush all pending microtasks (vi.runAllMicrotasksAsync not available in vitest 1.x) */
const flushMicrotasks = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const mockRegisterFilter = vi.fn();
const mockAttach = vi.fn().mockResolvedValue(undefined);
const mockLoad = vi.fn().mockResolvedValue(undefined);
const mockDestroy = vi.fn().mockResolvedValue(undefined);
const mockAddEventListener = vi.fn();
const mockGetNetworkingEngine = vi.fn(() => ({
  registerRequestFilter: mockRegisterFilter,
}));

vi.mock('shaka-player/dist/shaka-player.ui', () => ({
  default: {
    polyfill: { installAll: vi.fn() },
    Player: vi.fn().mockImplementation(() => ({
      attach: mockAttach,
      getNetworkingEngine: mockGetNetworkingEngine,
      load: mockLoad,
      destroy: mockDestroy,
      addEventListener: mockAddEventListener,
    })),
    ui: {
      Overlay: vi.fn().mockImplementation(() => ({
        getControls: vi.fn(() => ({})),
      })),
    },
  },
}));

import { VodPlayer } from '../VodPlayer';

describe('VodPlayer', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('cria video element no container', () => {
    new VodPlayer(container, { apiKey: 'pk_test' });
    expect(container.querySelector('video')).not.toBeNull();
  });

  it('registra filtro de X-API-Key no networking engine', async () => {
    new VodPlayer(container, { apiKey: 'pk_test' });
    await flushMicrotasks();
    expect(mockRegisterFilter).toHaveBeenCalledOnce();
    const filter = mockRegisterFilter.mock.calls[0][0] as Function;
    const fakeRequest = { headers: {} as Record<string, string> };
    filter(0, fakeRequest);
    expect(fakeRequest.headers['X-API-Key']).toBe('pk_test');
  });

  it('load() chama shaka.load com a URL correta', async () => {
    const player = new VodPlayer(container, { apiKey: 'pk_test' });
    await flushMicrotasks();
    await player.load('https://cdn/video.mpd');
    expect(mockLoad).toHaveBeenCalledWith('https://cdn/video.mpd');
  });

  it('destroy() chama shaka.destroy', async () => {
    const player = new VodPlayer(container, { apiKey: 'pk_test' });
    await flushMicrotasks();
    player.destroy();
    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  it('on("error") registra handler invocado ao receber evento error', async () => {
    const player = new VodPlayer(container, { apiKey: 'pk_test' });
    await flushMicrotasks();
    const handler = vi.fn();
    player.on('error', handler);
    const errorCall = mockAddEventListener.mock.calls.find(([name]) => name === 'error');
    expect(errorCall).toBeDefined();
    errorCall![1]({ detail: { code: 1001, message: 'Network error' } });
    expect(handler).toHaveBeenCalledWith({ code: 1001, message: 'Network error' });
  });

  it('on("loaded") handler é invocado após load()', async () => {
    const player = new VodPlayer(container, { apiKey: 'pk_test' });
    await flushMicrotasks();
    const handler = vi.fn();
    player.on('loaded', handler);
    await player.load('https://cdn/video.mpd');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('mount() estático cria player e inicia load', async () => {
    VodPlayer.mount(container, {
      apiKey: 'pk_test',
      manifestUrl: 'https://cdn/video.mpd',
    });
    await flushMicrotasks();
    expect(mockLoad).toHaveBeenCalledWith('https://cdn/video.mpd');
  });

  it('aceita container por seletor CSS string', () => {
    container.id = 'player-root';
    expect(() => new VodPlayer('#player-root', { apiKey: 'pk_test' })).not.toThrow();
  });
});
