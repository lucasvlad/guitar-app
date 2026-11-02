import { describe, expect, it } from 'vitest';
import { fretsFor, MAX_FRET, noteAt, STANDARD_TUNING } from './fretboard';

// Expected pitch classes, frets 0..12, per string (index 0 = high E).
const E = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];
const EXPECTED = [
  E,
  [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // B
  [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7], // G
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2], // D
  [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // A
  E,
];

describe('noteAt', () => {
  it('matches every string at frets 0-12', () => {
    EXPECTED.forEach((row, s) => {
      row.forEach((pc, fret) => expect(noteAt(s, fret)).toBe(pc));
    });
  });
  it('fret 12 equals the open string', () => {
    for (let s = 0; s < 6; s++) expect(noteAt(s, MAX_FRET)).toBe(noteAt(s, 0));
  });
  it('open strings follow standard tuning', () => {
    expect(STANDARD_TUNING.map((_, s) => noteAt(s, 0))).toEqual([4, 11, 7, 2, 9, 4]);
  });
  it('accepts a custom tuning', () => {
    const dropD = [4, 11, 7, 2, 9, 2];
    expect(noteAt(5, 0, dropD)).toBe(2);
    expect(noteAt(5, 2, dropD)).toBe(4);
  });
});

describe('fretsFor', () => {
  it('finds both octaves within 0-12', () => {
    expect(fretsFor(4, 0, 0, 12)).toEqual([0, 12]); // E on high E
    expect(fretsFor(0, 4, 0, 12)).toEqual([3]); // C on A string
    expect(fretsFor(7, 5, 0, 12)).toEqual([3]); // G on low E
    expect(fretsFor(11, 1, 0, 12)).toEqual([0, 12]); // B on B string
  });
  it('respects the fret window', () => {
    expect(fretsFor(4, 0, 1, 12)).toEqual([12]);
    expect(fretsFor(4, 0, 1, 11)).toEqual([]);
    expect(fretsFor(9, 3, 5, 9)).toEqual([7]); // A on D string
  });
  it('agrees with noteAt for every pitch class and string', () => {
    for (let s = 0; s < 6; s++) {
      for (let pc = 0; pc < 12; pc++) {
        const frets = fretsFor(pc, s, 0, MAX_FRET);
        expect(frets.length).toBeGreaterThanOrEqual(1);
        frets.forEach((f) => expect(noteAt(s, f)).toBe(pc));
      }
    }
  });
  it('uses a custom tuning', () => {
    expect(fretsFor(4, 5, 0, 12, [4, 11, 7, 2, 9, 2])).toEqual([2]);
  });
});
