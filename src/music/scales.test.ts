import { describe, expect, it } from 'vitest';
import { LETTERS, noteName, pitchClass, semitonesUp, type Letter, type Note } from './notes';
import { CHROMATIC_PCS, MAJOR_STEPS, enharmonicLabel, majorScale, spellPitchClass } from './scales';

const n = (letter: Letter, accidental = 0): Note => ({ letter, accidental });
const names = (notes: Note[]) => notes.map(noteName).join(' ');

const SCALES: [Note, string][] = [
  [n('C'), 'C D E F G A B'],
  [n('G'), 'G A B C D E F♯'],
  [n('D'), 'D E F♯ G A B C♯'],
  [n('A'), 'A B C♯ D E F♯ G♯'],
  [n('E'), 'E F♯ G♯ A B C♯ D♯'],
  [n('B'), 'B C♯ D♯ E F♯ G♯ A♯'],
  [n('F', 1), 'F♯ G♯ A♯ B C♯ D♯ E♯'],
  [n('C', 1), 'C♯ D♯ E♯ F♯ G♯ A♯ B♯'],
  [n('F'), 'F G A B♭ C D E'],
  [n('B', -1), 'B♭ C D E♭ F G A'],
  [n('E', -1), 'E♭ F G A♭ B♭ C D'],
  [n('A', -1), 'A♭ B♭ C D♭ E♭ F G'],
  [n('D', -1), 'D♭ E♭ F G♭ A♭ B♭ C'],
  [n('G', -1), 'G♭ A♭ B♭ C♭ D♭ E♭ F'],
  [n('C', -1), 'C♭ D♭ E♭ F♭ G♭ A♭ B♭'],
];

describe('majorScale', () => {
  it.each(SCALES)('spells %o correctly', (root, expected) => {
    expect(names(majorScale(root))).toBe(expected);
  });
  it.each(SCALES)('uses each letter exactly once and follows the step pattern (%o)', (root) => {
    const scale = majorScale(root);
    expect([...scale.map((x) => x.letter)].sort()).toEqual([...LETTERS].sort());
    expect(scale[0]).toEqual(root);
    for (let i = 0; i < 7; i++) {
      const next = scale[(i + 1) % 7]!;
      expect(semitonesUp(pitchClass(scale[i]!), pitchClass(next))).toBe(MAJOR_STEPS[i]);
    }
  });
  it('MAJOR_STEPS sums to an octave', () => {
    expect(MAJOR_STEPS).toEqual([2, 2, 1, 2, 2, 2, 1]);
  });
});

describe('spellPitchClass', () => {
  const ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const spell = (pref: 'auto' | 'sharps' | 'flats', key?: Note) =>
    ALL.map((pc) => noteName(spellPitchClass(pc, pref, key))).join(' ');

  it('auto without a key uses C♯ E♭ F♯ A♭ B♭', () => {
    expect(spell('auto')).toBe('C C♯ D E♭ E F F♯ G A♭ A B♭ B');
  });
  it('sharps without a key', () => {
    expect(spell('sharps')).toBe('C C♯ D D♯ E F F♯ G G♯ A A♯ B');
  });
  it('flats without a key', () => {
    expect(spell('flats')).toBe('C D♭ D E♭ E F G♭ G A♭ A B♭ B');
  });
  it('auto with a key uses the key spelling for scale tones', () => {
    expect(spell('auto', n('F', 1))).toBe('C C♯ D D♯ E E♯ F♯ G G♯ A A♯ B');
    expect(spell('auto', n('G', -1))).toBe('C D♭ D E♭ E F G♭ G A♭ A B♭ C♭');
    expect(spell('auto', n('C', -1))).toBe('C D♭ D E♭ F♭ F G♭ G A♭ A B♭ C♭');
    expect(spell('auto', n('C', 1))).toBe('B♯ C♯ D D♯ E E♯ F♯ G G♯ A A♯ B');
    expect(spell('auto', n('E'))).toBe('C C♯ D D♯ E F F♯ G G♯ A B♭ B');
    expect(spell('auto', n('F'))).toBe('C C♯ D E♭ E F F♯ G A♭ A B♭ B');
  });
  it('auto with a key falls back to the default for non-scale tones', () => {
    // E♭ is not in G major; F is not in D major.
    expect(noteName(spellPitchClass(3, 'auto', n('G')))).toBe('E♭');
    expect(noteName(spellPitchClass(5, 'auto', n('D')))).toBe('F');
    expect(noteName(spellPitchClass(10, 'auto', n('E')))).toBe('B♭');
  });
  it('sharps and flats ignore the key', () => {
    expect(spell('sharps', n('C', -1))).toBe(spell('sharps'));
    expect(spell('flats', n('C', 1))).toBe(spell('flats'));
  });
  it('always returns a note with the requested pitch class', () => {
    for (const pref of ['auto', 'sharps', 'flats'] as const) {
      for (const [key] of SCALES) {
        for (const pc of ALL) expect(pitchClass(spellPitchClass(pc, pref, key))).toBe(pc);
      }
    }
  });
});

describe('enharmonicLabel', () => {
  it('lists all 12 pitch classes in order', () => {
    expect(CHROMATIC_PCS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('naturals get the natural name for every preference', () => {
    for (const pref of ['auto', 'sharps', 'flats'] as const) {
      expect(enharmonicLabel(0, pref)).toBe('C');
      expect(enharmonicLabel(11, pref)).toBe('B');
    }
  });

  it('black keys: auto shows both (sharp first), otherwise the preferred name', () => {
    expect(enharmonicLabel(1, 'auto')).toBe('C♯ D♭');
    expect(enharmonicLabel(10, 'auto')).toBe('A♯ B♭');
    expect(enharmonicLabel(1, 'sharps')).toBe('C♯');
    expect(enharmonicLabel(1, 'flats')).toBe('D♭');
    expect(enharmonicLabel(8, 'flats')).toBe('A♭');
  });
});
