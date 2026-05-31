import { DISTRIBUTION_URL, API_KEY, FETCH_TIMEOUT_MS } from './config';

export interface Video {
  id: string;
  title: string;
  duration: number;
  thumbnail_url: string | null;
  format: 'dash' | 'hls';
}

export interface ManifestResponse {
  manifest_url: string;
  type: 'dash' | 'hls';
}

async function apiFetch(path: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(`${DISTRIBUTION_URL}${path}`, {
      headers: { 'X-API-Key': API_KEY },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function listVideos(): Promise<Video[]> {
  const res = await apiFetch('/api/v1/videos');
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export async function getManifest(id: string): Promise<ManifestResponse> {
  const res = await apiFetch(`/api/v1/manifests/${id}`);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}
