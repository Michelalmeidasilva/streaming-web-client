import shaka from 'shaka-player/dist/shaka-player.ui';
import type { VodPlayerOptions, VodPlayerEventName, VodPlayerMountOptions, SubtitleTrack } from './types';

export class VodPlayer {
  private player: InstanceType<typeof shaka.Player>;
  private listeners = new Map<VodPlayerEventName, Function>();
  private readyPromise: Promise<void>;

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

    this.readyPromise = this.player.attach(video).then(() => {
      this.player.getNetworkingEngine()!.registerRequestFilter(
        (_type: unknown, request: { headers: Record<string, string> }) => {
          request.headers['X-API-Key'] = this.options.apiKey;
        }
      );

      new shaka.ui.Overlay(this.player, el, video);

      this.player.addEventListener('error', ((event: CustomEvent<unknown>) => {
        this.listeners.get('error')?.(event.detail);
      }) as EventListener);

      this.player.addEventListener('buffering', ((event: CustomEvent<{ buffering: boolean }>) => {
        this.listeners.get('buffering')?.(event.detail.buffering);
      }) as EventListener);
    });
  }

  async load(manifestUrl: string, subtitles: SubtitleTrack[] = []): Promise<void> {
    await this.readyPromise;
    await this.player.load(manifestUrl);
    await this.loadSubtitles(subtitles);
    this.listeners.get('loaded')?.({});
  }

  // Side-loads sidecar WebVTT tracks and enables the default one. Failures are
  // non-fatal: subtitles enhance playback, they are not required for it.
  private async loadSubtitles(subtitles: SubtitleTrack[]): Promise<void> {
    let enabledDefault = false;
    for (const track of subtitles) {
      if (!track?.url) continue;
      try {
        const added = await this.player.addTextTrackAsync(
          track.url,
          track.language ?? 'und',
          'subtitle',
          'text/vtt',
          undefined,
          track.label ?? track.language,
        );
        if (track.default && !enabledDefault) {
          this.player.selectTextTrack(added);
          this.player.setTextTrackVisibility(true);
          enabledDefault = true;
        }
      } catch (err) {
        console.warn('VodPlayer: failed to load subtitle track', track.url, err);
      }
    }
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
    const { manifestUrl, subtitles, ...playerOptions } = options;
    const player = new VodPlayer(container, playerOptions);
    player.load(manifestUrl, subtitles);
    return player;
  }
}
