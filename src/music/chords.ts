import { transpose, type IntervalName } from './intervals';
import { noteName, notesEqual, type Note } from './notes';
import { majorScale } from './scales';
import { MAJOR_KEYS } from './keys';

export type ChordQuality = 'maj' | 'min' | 'dim' | 'maj7' | '7' | 'm7' | 'm7b5';
export interface Chord {
  root: Note;
  quality: ChordQuality;
}

export const CHORD_QUALITIES: ChordQuality[] = ['maj', 'min', 'dim', 'maj7', '7', 'm7', 'm7b5'];

const FORMULAS: Record<ChordQuality, IntervalName[]> = {
  maj: ['M3', 'P5'],
  min: ['m3', 'P5'],
  dim: ['m3', 'd5'],
  maj7: ['M3', 'P5', 'M7'],
  '7': ['M3', 'P5', 'm7'],
  m7: ['m3', 'P5', 'm7'],
  m7b5: ['m3', 'd5', 'm7'],
};

const SYMBOLS: Record<ChordQuality, string> = {
  maj: '', min: 'm', dim: '°', maj7: 'maj7', '7': '7', m7: 'm7', m7b5: 'ø7',
};

// Numeral suffixes; case already shows major vs minor.
const NUMERAL_SUFFIXES: Record<ChordQuality, string> = {
  maj: '', min: '', dim: '°', maj7: 'maj7', '7': '7', m7: '7', m7b5: 'ø7',
};

export const NUMERAL_DEGREES: string[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const TRIAD_QUALITIES: ChordQuality[] = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const SEVENTH_QUALITIES: ChordQuality[] = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'];

export function chordTones(c: Chord): Note[] {
  return [c.root, ...FORMULAS[c.quality].map((iv) => transpose(c.root, iv))];
}

export function chordSymbol(q: ChordQuality): string {
  return SYMBOLS[q];
}

export function chordName(c: Chord): string {
  return noteName(c.root) + SYMBOLS[c.quality];
}

export function diatonicTriads(key: Note): Chord[] {
  return majorScale(key).map((root, i) => ({ root, quality: TRIAD_QUALITIES[i]! }));
}

export function diatonicSevenths(key: Note): Chord[] {
  return majorScale(key).map((root, i) => ({ root, quality: SEVENTH_QUALITIES[i]! }));
}

export function romanNumeral(degree: number, quality: ChordQuality): string {
  const upper = quality === 'maj' || quality === 'maj7' || quality === '7';
  const base = NUMERAL_DEGREES[degree - 1]!;
  return (upper ? base : base.toLowerCase()) + NUMERAL_SUFFIXES[quality];
}

export function keysContaining(c: Chord): Note[] {
  const matches = (d: Chord) => d.quality === c.quality && notesEqual(d.root, c.root);
  return MAJOR_KEYS.filter(
    (key) => diatonicTriads(key).some(matches) || diatonicSevenths(key).some(matches),
  );
}

// Roman numeral of c in the major key, or null if c is not a diatonic triad or seventh.
export function numeralInKey(key: Note, c: Chord): string | null {
  const matches = (d: Chord) => d.quality === c.quality && notesEqual(d.root, c.root);
  const degree = Math.max(diatonicTriads(key).findIndex(matches), diatonicSevenths(key).findIndex(matches));
  return degree < 0 ? null : romanNumeral(degree + 1, c.quality);
}
