import { describe, it, expect } from 'vitest';
import { matchesQuery, normalize } from '$lib/search';

describe('normalize', () => {
  it('strips diacritics and lowercases', () => expect(normalize('Coração')).toBe('coracao'));
});

describe('matchesQuery', () => {
  it('matches accent-insensitively', () => expect(matchesQuery('Coração', 'coracao')).toBe(true));
  it('matches substring', () => expect(matchesQuery('Deep dive', 'dive')).toBe(true));
  it('returns true for empty query', () => expect(matchesQuery('whatever', '   ')).toBe(true));
  it('returns false on no match', () => expect(matchesQuery('abc', 'xyz')).toBe(false));
});
