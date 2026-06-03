// This app ships as a static SPA (adapter-static with `fallback: 'index.html'`)
// and uses the Shaka player, which reads `document` at import time. The catalog
// now transitively imports the player (StoriesRail → StoryViewer), so disable
// SSR app-wide: `npm run dev` and prerendering must never evaluate browser-only
// modules on the server. Production was already client-rendered (SPA fallback);
// this makes dev match production.
export const ssr = false;
export const prerender = false;
