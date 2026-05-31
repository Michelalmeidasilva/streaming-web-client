export interface VodPlayerOptions {
  apiKey: string;
  autoplay?: boolean;
  muted?: boolean;
  uiLocale?: string;
}

export interface VodPlayerMountOptions extends VodPlayerOptions {
  manifestUrl: string;
}

export type VodPlayerEventName = 'error' | 'loaded' | 'buffering';

export interface VodPlayerErrorDetail {
  code: number;
  message: string;
}
