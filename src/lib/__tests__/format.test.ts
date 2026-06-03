import { describe, it, expect } from 'vitest';
import { fmtDuration, fmtClock } from '$lib/format';

describe('fmtDuration', () => {
  it('formats minutes and seconds', () => expect(fmtDuration(522)).toBe('8 min 42 s'));
  it('omits seconds when zero', () => expect(fmtDuration(540)).toBe('9 min'));
  it('formats sub-minute', () => expect(fmtDuration(48)).toBe('48 s'));
  it('formats zero', () => expect(fmtDuration(0)).toBe('0 s'));
  it('formats hours and omits seconds', () => expect(fmtDuration(3725)).toBe('1 h 2 min'));
});

describe('fmtClock', () => {
  it('pads sub-minute', () => expect(fmtClock(48)).toBe('0:48'));
  it('formats minutes', () => expect(fmtClock(522)).toBe('8:42'));
  it('formats hours', () => expect(fmtClock(3725)).toBe('1:02:05'));
});
