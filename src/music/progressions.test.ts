import { describe, expect, it } from 'vitest';
import { noteName, type Letter, type Note } from './notes';
import { MAJOR_KEYS } from './keys';
import { chordName, diatonicTriads } from './chords';
import { PROGRESSIONS, progressionChords, progressionNumerals } from './progressions';

const n = (letter: Letter, accidental = 0): Note => ({ letter, accidental });
const byName = (prefix: string) => PROGRESSIONS.find((p) => p.name.startsWith(prefix))!;
const chordNames = (key: Note, prefix: string) =>
  progressionChords(key, byName(prefix)).map(chordName).join(' ');

describe('PROGRESSIONS', () => {
  it('has the seed progressions with numerals', () => {
    expect(PROGRESSIONS.map((p) => progressionNumerals(p).join('–'))).toEqual([
      'I–V–vi–IV',
      'I–vi–IV–V',
      'I–IV–iii–V',
      'ii7–V7–Imaj7',
      'I–V–vi–iii–IV–I–IV–V',
      'I7–I7–I7–I7–IV7–IV7–I7–I7–V7–IV7–I7–V7',
    ]);
  });
});

describe('progressionChords', () => {
  it('I–vi–IV–V in A (Overdrive) is A F♯m D E', () => {
    expect(chordNames(n('A'), 'I–vi–IV–V')).toBe('A F♯m D E');
  });
  it('12-bar blues in E', () => {
    expect(chordNames(n('E'), '12-bar')).toBe('E7 E7 E7 E7 A7 A7 E7 E7 B7 A7 E7 B7');
  });
  it('ii–V–I in B♭ and C♭', () => {
    expect(chordNames(n('B', -1), 'ii–V–I')).toBe('Cm7 F7 B♭maj7');
    expect(chordNames(n('C', -1), 'ii–V–I')).toBe('D♭m7 G♭7 C♭maj7');
  });
  it('I–V–vi–IV in F♯ and G♭', () => {
    expect(chordNames(n('F', 1), 'I–V–vi–IV')).toBe('F♯ C♯ D♯m B');
    expect(chordNames(n('G', -1), 'I–V–vi–IV')).toBe('G♭ D♭ E♭m C♭');
  });
  it('triad progressions are diatonic in every key (numerals to chords and back)', () => {
    const triadOnly = PROGRESSIONS.filter((p) => p.steps.every((s) => s.quality === 'maj' || s.quality === 'min'));
    for (const key of MAJOR_KEYS) {
      const diatonic = diatonicTriads(key).map(chordName);
      for (const p of triadOnly) {
        progressionChords(key, p).forEach((c, i) => {
          expect(diatonic.indexOf(chordName(c)) + 1).toBe(p.steps[i]!.degree);
        });
      }
    }
  });
  it('roots spell from the key', () => {
    expect(noteName(progressionChords(n('C', 1), byName('Canon'))[3]!.root)).toBe('E♯');
  });
});
