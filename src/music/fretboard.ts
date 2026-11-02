import { semitonesUp, type PitchClass } from './notes';

export type Tuning = PitchClass[]; // index 0 = string 1 (high E) ... index 5 = string 6 (low E)

export const STANDARD_TUNING: Tuning = [4, 11, 7, 2, 9, 4];
export const MAX_FRET = 12;

export function noteAt(stringIndex: number, fret: number, tuning: Tuning = STANDARD_TUNING): PitchClass {
  return semitonesUp(0, tuning[stringIndex]! + fret);
}

export function fretsFor(
  pc: PitchClass,
  stringIndex: number,
  minFret: number,
  maxFret: number,
  tuning: Tuning = STANDARD_TUNING,
): number[] {
  const frets: number[] = [];
  for (let f = minFret; f <= maxFret; f++) {
    if (noteAt(stringIndex, f, tuning) === semitonesUp(0, pc)) frets.push(f);
  }
  return frets;
}
