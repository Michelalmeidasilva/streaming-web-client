import shaka from 'shaka-player/dist/shaka-player.ui';
import type { VodPlayerOptions, VodPlayerEventName, VodPlayerMountOptions } from './types';

export class VodPlayer {
  private player: InstanceType<typeof shaka.Player>;
  private listeners = new Map<VodPlayerEventName, Function>();

  constructor(container: string | HTMLElement, private options: VodPlayerOptions) {
    const el = typeof container === 'string'
      ? (document.querySelector(container) as HTMLElement)
      : container;

    if (!el) throw new Error(`VodPlayer: container "${container}" not found`);

    const video = document.createElement('video');
    video.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(video);

    shaka.polyfill.installAll();
    this.player = new shaka.Player();

    this.player.attach(video).then(() => {
      this.player.getNetworkingEngine()!.registerRequestFilter(
        (_type: unknown, request: { headers: Record<string, string> }) => {
          request.headers['X-API-Key'] = this.options.apiKey;
        }
      );

      new shaka.ui.Overlay(this.player, el, video);

      this.player.addEventListener('error', (event: { detail: unknown }) => {
        this.listeners.get('error')?.(event.detail);
      });

      this.player.addEventListener('buffering', (event: { detail: { buffering: boolean } }) => {
        this.listeners.get('buffering')?.(event.detail.buffering);
      });
    });
  }

  async load(manifestUrl: string): Promise<void> {
    await this.player.load(manifestUrl);
    this.listeners.get('loaded')?.({});
  }

  destroy(): void {
    this.player.destroy();
  }

  on(event: VodPlayerEventName, handler: Function): void {
    this.listeners.set(event, handler);
  }

  static mount(
    container: string | HTMLElement,
    options: VodPlayerMountOptions
  ): VodPlayer {
    const { manifestUrl, ...playerOptions } = options;
    const player = new VodPlayer(container, playerOptions);
    player.load(manifestUrl);
    return player;
  }
}
