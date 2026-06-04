export interface VodPlayerOptions {
  apiKey: string;
  autoplay?: boolean;
  muted?: boolean;
  uiLocale?: string;
}

// SubtitleTrack is a sidecar WebVTT track side-loaded after the manifest via
// Shaka's addTextTrackAsync, so subtitles work even when the manifest does not
// advertise them.
export interface SubtitleTrack {
  url: string;
  language?: string;
  label?: string;
  default?: boolean;
}

export interface VodPlayerMountOptions extends VodPlayerOptions {
  manifestUrl: string;
  subtitles?: SubtitleTrack[];
}

export type VodPlayerEventName = 'error' | 'loaded' | 'buffering';

export interface VodPlayerErrorDetail {
  code: number;
  message: string;
}
