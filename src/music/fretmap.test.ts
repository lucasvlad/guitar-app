import { describe, expect, it } from 'vitest';
import { MAJOR_DEGREE_INTERVALS, scaleOnFretboard } from './fretmap';
import { noteName } from './notes';

describe('scaleOnFretboard', () => {
  it('spells F♯ major with E♯ (string 6 fret 1 is degree 7)', () => {
    const pos = scaleOnFretboard({ letter: 'F', accidental: 1 });
    const hit = pos.find((p) => p.stringIndex === 5 && p.fret === 1)!;
    expect(noteName(hit.note)).toBe('E♯');
    expect(hit.degree).toBe(7);
    expect(pos.some((p) => noteName(p.note) === 'F')).toBe(false);
  });

  it('C major: open strings, roots, and a sane count', () => {
    const pos = scaleOnFretboard({ letter: 'C', accidental: 0 });
    // 7 of 12 pitch classes on 13 frets x 6 strings: each string has 7 or 8 hits.
    expect(pos.length).toBeGreaterThanOrEqual(42);
    expect(pos.length).toBeLessThanOrEqual(48);
    expect(pos.filter((p) => p.stringIndex === 0).map((p) => p.fret)).toEqual([0, 1, 3, 5, 7, 8, 10, 12]);
    const roots = pos.filter((p) => p.degree === 1).map((p) => p.stringIndex + ':' + p.fret);
    expect(roots).toEqual(['0:8', '1:1', '2:5', '3:10', '4:3', '5:8']);
    expect(pos.every((p) => p.note.accidental === 0)).toBe(true);
  });

  it('labels each degree with an interval', () => {
    expect(MAJOR_DEGREE_INTERVALS).toEqual(['1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']);
  });
});
