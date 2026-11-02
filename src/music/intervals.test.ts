import { describe, expect, it } from 'vitest';
import { INTERVALS, transpose, type IntervalName } from './intervals';
import { noteName, pitchClass, semitonesUp, type Letter, type Note } from './notes';

const n = (letter: Letter, accidental = 0): Note => ({ letter, accidental });
const up = (root: Note, iv: IntervalName) => noteName(transpose(root, iv));

const NAMES: IntervalName[] = ['m2', 'M2', 'm3', 'M3', 'P4', 'A4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];

const KEY_ROOTS: Note[] = [
  n('C'), n('G'), n('D'), n('A'), n('E'), n('B'), n('F', 1), n('C', 1),
  n('F'), n('B', -1), n('E', -1), n('A', -1), n('D', -1), n('G', -1), n('C', -1),
];

describe('INTERVALS', () => {
  it('lists the 13 intervals in order with consistent data', () => {
    expect(INTERVALS.map((i) => i.name)).toEqual(NAMES);
    expect(INTERVALS.find((i) => i.name === 'P5')).toEqual({
      name: 'P5', label: 'perfect 5th', semitones: 7, letterSteps: 4,
    });
    expect(INTERVALS.map((i) => i.semitones)).toEqual([1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 10, 11, 12]);
    expect(INTERVALS.map((i) => i.letterSteps)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7]);
  });
});

describe('transpose', () => {
  it('every interval from C', () => {
    expect(NAMES.map((iv) => up(n('C'), iv))).toEqual(
      ['D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B', 'C'],
    );
  });
  it('every interval from F♯', () => {
    expect(NAMES.map((iv) => up(n('F', 1), iv))).toEqual(
      ['G', 'G♯', 'A', 'A♯', 'B', 'B♯', 'C', 'C♯', 'D', 'D♯', 'E', 'E♯', 'F♯'],
    );
  });
  it('every interval from B♭', () => {
    expect(NAMES.map((iv) => up(n('B', -1), iv))).toEqual(
      ['C♭', 'C', 'D♭', 'D', 'E♭', 'E', 'F♭', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭'],
    );
  });
  it('handles the named examples', () => {
    expect(up(n('B'), 'P5')).toBe('F♯');
    expect(up(n('F', 1), 'm3')).toBe('A');
    expect(up(n('C'), 'd5')).toBe('G♭');
    expect(up(n('C'), 'A4')).toBe('F♯');
  });
  it('produces double sharps and flats where needed', () => {
    expect(up(n('C', 1), 'A4')).toBe('F♯♯');
    expect(up(n('D', 1), 'M3')).toBe('F♯♯');
    expect(up(n('C', -1), 'd5')).toBe('G♭♭');
    expect(up(n('F', -1), 'm3')).toBe('A♭♭');
  });
  it('moves the right number of letters and semitones from every key root', () => {
    for (const root of KEY_ROOTS) {
      for (const iv of INTERVALS) {
        const t = transpose(root, iv.name);
        expect(semitonesUp(pitchClass(root), pitchClass(t))).toBe(iv.semitones % 12);
        expect(t.letter.length).toBe(1);
      }
    }
  });
  it('round-trips: an interval plus its inversion is an octave', () => {
    const inversion: Record<IntervalName, IntervalName> = {
      m2: 'M7', M2: 'm7', m3: 'M6', M3: 'm6', P4: 'P5', A4: 'd5',
      d5: 'A4', P5: 'P4', m6: 'M3', M6: 'm3', m7: 'M2', M7: 'm2', P8: 'P8',
    };
    for (const root of KEY_ROOTS) {
      for (const iv of NAMES) {
        expect(transpose(transpose(root, iv), inversion[iv])).toEqual(root);
      }
    }
  });
});
