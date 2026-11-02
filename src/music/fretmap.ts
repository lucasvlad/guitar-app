import { MAX_FRET, STANDARD_TUNING, noteAt, type Tuning } from './fretboard';
import { pitchClass, type Note } from './notes';
import { majorScale } from './scales';

// Interval from the root for each major scale degree (index 0 = degree 1).
export const MAJOR_DEGREE_INTERVALS: string[] = ['1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'];

export interface ScalePosition {
  stringIndex: number;
  fret: number;
  note: Note; // spelled per the key
  degree: number; // 1..7
}

// Every fret 0..MAX_FRET on every string whose note is in the major scale of key.
export function scaleOnFretboard(key: Note, tuning: Tuning = STANDARD_TUNING): ScalePosition[] {
  const scale = majorScale(key);
  const pcs = scale.map(pitchClass);
  const positions: ScalePosition[] = [];
  for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      const i = pcs.indexOf(noteAt(stringIndex, fret, tuning));
      if (i >= 0) positions.push({ stringIndex, fret, note: scale[i]!, degree: i + 1 });
    }
  }
  return positions;
}
