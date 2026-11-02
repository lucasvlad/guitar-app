import { LETTERS, noteWithLetter, pitchClass, type Note } from './notes';

export type IntervalName =
  | 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | 'A4' | 'd5' | 'P5' | 'm6' | 'M6' | 'm7' | 'M7' | 'P8';

export interface Interval {
  name: IntervalName;
  label: string;
  semitones: number;
  letterSteps: number;
}

export const INTERVALS: Interval[] = [
  { name: 'm2', label: 'minor 2nd', semitones: 1, letterSteps: 1 },
  { name: 'M2', label: 'major 2nd', semitones: 2, letterSteps: 1 },
  { name: 'm3', label: 'minor 3rd', semitones: 3, letterSteps: 2 },
  { name: 'M3', label: 'major 3rd', semitones: 4, letterSteps: 2 },
  { name: 'P4', label: 'perfect 4th', semitones: 5, letterSteps: 3 },
  { name: 'A4', label: 'augmented 4th', semitones: 6, letterSteps: 3 },
  { name: 'd5', label: 'diminished 5th', semitones: 6, letterSteps: 4 },
  { name: 'P5', label: 'perfect 5th', semitones: 7, letterSteps: 4 },
  { name: 'm6', label: 'minor 6th', semitones: 8, letterSteps: 5 },
  { name: 'M6', label: 'major 6th', semitones: 9, letterSteps: 5 },
  { name: 'm7', label: 'minor 7th', semitones: 10, letterSteps: 6 },
  { name: 'M7', label: 'major 7th', semitones: 11, letterSteps: 6 },
  { name: 'P8', label: 'octave', semitones: 12, letterSteps: 7 },
];

export function transpose(n: Note, interval: IntervalName): Note {
  const iv = INTERVALS.find((i) => i.name === interval)!;
  const letter = LETTERS[(LETTERS.indexOf(n.letter) + iv.letterSteps) % 7]!;
  return noteWithLetter(letter, pitchClass(n) + iv.semitones);
}
