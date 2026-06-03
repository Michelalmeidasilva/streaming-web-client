import { describe, it, expect, beforeEach } from 'vitest';
import { loadSeen, markSeen } from '$lib/stories';

describe('stories seen-state', () => {
  beforeEach(() => localStorage.clear());

  it('returns empty set initially', () => {
    expect(loadSeen().size).toBe(0);
  });

  it('persists seen ids across loads', () => {
    markSeen('a');
    markSeen('b');
    const seen = loadSeen();
    expect(seen.has('a')).toBe(true);
    expect(seen.has('b')).toBe(true);
  });

  it('is idempotent', () => {
    markSeen('a');
    markSeen('a');
    expect(loadSeen().size).toBe(1);
  });
});
