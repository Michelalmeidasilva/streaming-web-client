<!-- packages/player/src/StoryPlayer.svelte -->
<!--
  Headless, control-less playback surface for Stories.
  Built on shaka (for DASH/HLS) but WITHOUT shaka.ui.Overlay, so there are no
  player controls. Forwards real <video> playback via callbacks so the viewer
  can drive a progress bar and auto-advance on the true end of the video.
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let manifestUrl: string;
  export let apiKey: string;
  export let muted = true;
  export let onTime: (currentSeconds: number, durationSeconds: number) => void = () => {};
  export let onEnded: () => void = () => {};
  export let onError: (message: string) => void = () => {};

  let container: HTMLDivElement;
  let video: HTMLVideoElement | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let player: any;

  function handleTime() {
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      onTime(video.currentTime, video.duration);
    }
  }
  function handleEnded() {
    onEnded();
  }

  onMount(async () => {
    video = document.createElement('video');
    video.muted = muted;
    video.setAttribute('playsinline', '');
    video.style.cssText = 'width:100%;height:100%;display:block;object-fit:cover';
    container.appendChild(video);

    video.addEventListener('timeupdate', handleTime);
    video.addEventListener('ended', handleEnded);

    const shaka = (await import('shaka-player/dist/shaka-player.ui')).default;
    shaka.polyfill.installAll();
    player = new shaka.Player();
    try {
      await player.attach(video);
      player.getNetworkingEngine()?.registerRequestFilter(
        (_type: unknown, request: { headers: Record<string, string> }) => {
          request.headers['X-API-Key'] = apiKey;
        },
      );
      player.addEventListener('error', (event: CustomEvent<{ message?: string }>) => {
        onError(event.detail?.message ?? 'Erro ao reproduzir o vídeo.');
      });
      await player.load(manifestUrl);
      try {
        await video.play?.();
      } catch {
        /* autoplay may be blocked — non-fatal; muted playback should still start */
      }
    } catch {
      onError('Não foi possível carregar o vídeo.');
    }
  });

  onDestroy(() => {
    if (video) {
      video.removeEventListener('timeupdate', handleTime);
      video.removeEventListener('ended', handleEnded);
    }
    player?.destroy();
  });
</script>

<div class="story-player" bind:this={container}></div>

<style>
  .story-player {
    position: relative;
    width: 100%;
    height: 100%;
    background: #05080b;
  }
</style>
