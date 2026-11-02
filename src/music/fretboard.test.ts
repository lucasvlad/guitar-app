import { describe, expect, it } from 'vitest';
import { fretAbove, fretsFor, MAX_FRET, noteAt, pitchAt, STANDARD_TUNING } from './fretboard';

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

describe('pitchAt', () => {
  it('gives absolute MIDI pitches in standard tuning', () => {
    expect(pitchAt(5, 0)).toBe(40);
    expect(pitchAt(0, 0)).toBe(64);
    expect(pitchAt(1, 5)).toBe(pitchAt(0, 0));
    expect(pitchAt(2, 4)).toBe(pitchAt(1, 0));
  });

  it('agrees with noteAt on pitch class', () => {
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= MAX_FRET; f++) expect(pitchAt(s, f) % 12).toBe(noteAt(s, f));
    }
  });
});

describe('fretAbove', () => {
  it('finds the fret a given interval above on another string', () => {
    expect(fretAbove(2, 5, 4, 1)).toBe(5); // C4 + M3 = E4 on string 2
    expect(fretAbove(2, 5, 4, 0)).toBe(0); // same E4 on open string 1
    expect(fretAbove(5, 3, 7, 4)).toBe(5); // G2 + P5 = D3 on string 5
    expect(fretAbove(1, 1, 0, 1)).toBe(1);
  });
  it('returns null off the neck', () => {
    expect(fretAbove(1, 0, -1, 1)).toBeNull();
    expect(fretAbove(5, 0, 4, 0)).toBeNull(); // E2 + M3 is below open high E
    expect(fretAbove(0, 12, 1, 0)).toBeNull();
  });
});
