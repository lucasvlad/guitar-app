import { describe, expect, it } from 'vitest';
import { isNatural, LETTERS, NATURAL_PCS, noteName, pitchClass, semitonesUp } from './notes';

describe('pitchClass', () => {
  it('maps naturals', () => {
    LETTERS.forEach((letter, i) => expect(pitchClass({ letter, accidental: 0 })).toBe(NATURAL_PCS[i]));
  });
  it('wraps accidentals around the octave', () => {
    expect(pitchClass({ letter: 'C', accidental: -1 })).toBe(11);
    expect(pitchClass({ letter: 'B', accidental: 1 })).toBe(0);
    expect(pitchClass({ letter: 'E', accidental: 1 })).toBe(5);
    expect(pitchClass({ letter: 'F', accidental: -1 })).toBe(4);
    expect(pitchClass({ letter: 'F', accidental: 2 })).toBe(7);
    expect(pitchClass({ letter: 'B', accidental: -2 })).toBe(9);
    expect(pitchClass({ letter: 'C', accidental: -2 })).toBe(10);
  });
});

describe('isNatural', () => {
  it('is true only for white keys', () => {
    const naturals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(isNatural);
    expect(naturals).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });
});

describe('noteName', () => {
  it('uses Unicode accidentals', () => {
    expect(noteName({ letter: 'E', accidental: 0 })).toBe('E');
    expect(noteName({ letter: 'F', accidental: 1 })).toBe('F♯');
    expect(noteName({ letter: 'B', accidental: -1 })).toBe('B♭');
    expect(noteName({ letter: 'F', accidental: 2 })).toBe('F♯♯');
    expect(noteName({ letter: 'B', accidental: -2 })).toBe('B♭♭');
  });
});

describe('semitonesUp', () => {
  it('counts upward 0..11', () => {
    expect(semitonesUp(0, 0)).toBe(0);
    expect(semitonesUp(0, 7)).toBe(7);
    expect(semitonesUp(7, 0)).toBe(5);
    expect(semitonesUp(11, 0)).toBe(1);
    expect(semitonesUp(4, 3)).toBe(11);
  });
  it('is always in range and complements its reverse', () => {
    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        const up = semitonesUp(a, b);
        expect(up).toBeGreaterThanOrEqual(0);
        expect(up).toBeLessThanOrEqual(11);
        expect((up + semitonesUp(b, a)) % 12).toBe(0);
      }
    }
  });
});
