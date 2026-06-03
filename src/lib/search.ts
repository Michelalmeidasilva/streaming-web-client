import { writable } from 'svelte/store';

/** Live catalog filter text, shared between the nav input and the catalog page. */
export const searchQuery = writable('');

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function matchesQuery(title: string, query: string): boolean {
  const q = normalize(query);
  return q === '' ? true : normalize(title).includes(q);
}
