// src/lib/stories.ts

const KEY = 'vod:stories-seen';

/** Load the set of story video ids already viewed (SSR-safe). */
export function loadSeen(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/** Mark a story as seen and persist (SSR-safe). */
export function markSeen(id: string): void {
  if (typeof localStorage === 'undefined') return;
  const seen = loadSeen();
  seen.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}
