import { describe, expect, it } from 'vitest';
import { noteName, type Letter, type Note } from './notes';
import { MAJOR_KEYS } from './keys';
import {
  CHORD_QUALITIES,
  NUMERAL_DEGREES,
  chordName,
  chordSymbol,
  chordTones,
  diatonicSevenths,
  diatonicTriads,
  keysContaining,
  numeralInKey,
  romanNumeral,
  type ChordQuality,
} from './chords';

const n = (letter: Letter, accidental = 0): Note => ({ letter, accidental });
const names = (notes: Note[]) => notes.map(noteName).join(' ');
const keyNames = (notes: Note[]) => notes.map(noteName);

describe('CHORD_QUALITIES / chordSymbol', () => {
  it('lists qualities in order with symbols', () => {
    expect(CHORD_QUALITIES).toEqual(['maj', 'min', 'dim', 'maj7', '7', 'm7', 'm7b5']);
    expect(CHORD_QUALITIES.map(chordSymbol)).toEqual(['', 'm', '°', 'maj7', '7', 'm7', 'ø7']);
  });
});

describe('chordTones', () => {
  const cases: [Note, ChordQuality, string][] = [
    [n('B'), 'dim', 'B D F'],
    [n('F', 1), 'min', 'F♯ A C♯'],
    [n('E', -1), 'maj7', 'E♭ G B♭ D'],
    [n('C', 1), 'm7b5', 'C♯ E G B'],
    [n('G'), '7', 'G B D F'],
    [n('C'), 'maj', 'C E G'],
    [n('E', -1), 'm7', 'E♭ G♭ B♭ D♭'],
    [n('G', 1), 'maj', 'G♯ B♯ D♯'],
    [n('D', 1), '7', 'D♯ F♯♯ A♯ C♯'],
    [n('C', -1), 'dim', 'C♭ E♭♭ G♭♭'],
  ];
  it.each(cases)('%o %s', (root, quality, expected) => {
    expect(names(chordTones({ root, quality }))).toBe(expected);
  });
  it('uses one letter per third (letters skip by one)', () => {
    for (const key of MAJOR_KEYS) {
      for (const c of diatonicSevenths(key)) {
        const letters = chordTones(c).map((t) => 'CDEFGAB'.indexOf(t.letter));
        for (let i = 1; i < letters.length; i++) {
          expect((letters[i]! - letters[i - 1]! + 7) % 7).toBe(2);
        }
      }
    }
  });
});

describe('chordName', () => {
  it('joins root and symbol', () => {
    expect(chordName({ root: n('F', 1), quality: 'min' })).toBe('F♯m');
    expect(chordName({ root: n('B'), quality: 'dim' })).toBe('B°');
    expect(chordName({ root: n('G'), quality: 'maj7' })).toBe('Gmaj7');
    expect(chordName({ root: n('C', 1), quality: 'm7b5' })).toBe('C♯ø7');
  });
});

describe('diatonic chords', () => {
  const triads: [Note, string][] = [
    [n('C'), 'C Dm Em F G Am B°'],
    [n('F', 1), 'F♯ G♯m A♯m B C♯ D♯m E♯°'],
    [n('B', -1), 'B♭ Cm Dm E♭ F Gm A°'],
    [n('C', -1), 'C♭ D♭m E♭m F♭ G♭ A♭m B♭°'],
  ];
  const sevenths: [Note, string][] = [
    [n('C'), 'Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bø7'],
    [n('F', 1), 'F♯maj7 G♯m7 A♯m7 Bmaj7 C♯7 D♯m7 E♯ø7'],
    [n('B', -1), 'B♭maj7 Cm7 Dm7 E♭maj7 F7 Gm7 Aø7'],
    [n('C', -1), 'C♭maj7 D♭m7 E♭m7 F♭maj7 G♭7 A♭m7 B♭ø7'],
  ];
  it.each(triads)('triads in %o', (key, expected) => {
    expect(diatonicTriads(key).map(chordName).join(' ')).toBe(expected);
  });
  it.each(sevenths)('sevenths in %o', (key, expected) => {
    expect(diatonicSevenths(key).map(chordName).join(' ')).toBe(expected);
  });
  it.each(MAJOR_KEYS)('every diatonic chord tone is in the scale of %o', (key) => {
    const scale = names(diatonicTriads(key).map((c) => c.root)).split(' ');
    for (const c of [...diatonicTriads(key), ...diatonicSevenths(key)]) {
      for (const t of chordTones(c)) expect(scale).toContain(noteName(t));
    }
  });
});

describe('romanNumeral', () => {
  it('formats case and suffix', () => {
    expect(romanNumeral(5, '7')).toBe('V7');
    expect(romanNumeral(2, 'm7')).toBe('ii7');
    expect(romanNumeral(7, 'dim')).toBe('vii°');
    expect(romanNumeral(7, 'm7b5')).toBe('viiø7');
    expect(romanNumeral(1, 'maj')).toBe('I');
    expect(romanNumeral(6, 'min')).toBe('vi');
    expect(romanNumeral(4, 'maj7')).toBe('IVmaj7');
  });
  it('NUMERAL_DEGREES are uppercase base glyphs', () => {
    expect(NUMERAL_DEGREES).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']);
  });
});

describe('keysContaining', () => {
  it('Dm is in B♭ (iii), F (vi), C (ii)', () => {
    expect(keyNames(keysContaining({ root: n('D'), quality: 'min' }))).toEqual(['B♭', 'F', 'C']);
  });
  it('G7 is only in C', () => {
    expect(keyNames(keysContaining({ root: n('G'), quality: '7' }))).toEqual(['C']);
  });
  it('respects spelling: E♯° is in F♯ only, F° is in G♭ only', () => {
    expect(keyNames(keysContaining({ root: n('E', 1), quality: 'dim' }))).toEqual(['F♯']);
    expect(keyNames(keysContaining({ root: n('F'), quality: 'dim' }))).toEqual(['G♭']);
  });
  it('a major triad belongs to three keys (I, IV, V)', () => {
    expect(keyNames(keysContaining({ root: n('G'), quality: 'maj' }))).toEqual(['C', 'G', 'D']);
  });
  it('round-trips: each key contains all its own diatonic chords', () => {
    for (const key of MAJOR_KEYS) {
      for (const c of [...diatonicTriads(key), ...diatonicSevenths(key)]) {
        expect(keyNames(keysContaining(c))).toContain(noteName(key));
      }
    }
  });
});

describe('numeralInKey', () => {
  it('names diatonic triads and sevenths', () => {
    expect(numeralInKey(n('C'), { root: n('D'), quality: 'min' })).toBe('ii');
    expect(numeralInKey(n('F'), { root: n('D'), quality: 'min' })).toBe('vi');
    expect(numeralInKey(n('C'), { root: n('G'), quality: '7' })).toBe('V7');
    expect(numeralInKey(n('B', -1), { root: n('E', -1), quality: 'maj7' })).toBe('IVmaj7');
  });
  it('returns null for non-diatonic chords', () => {
    expect(numeralInKey(n('C'), { root: n('D'), quality: 'maj' })).toBeNull();
    expect(numeralInKey(n('C'), { root: n('G'), quality: 'maj7' })).toBeNull();
    expect(numeralInKey(n('C'), { root: n('C', 1), quality: 'dim' })).toBeNull();
  });
});
