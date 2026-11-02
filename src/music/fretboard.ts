import { semitonesUp, type PitchClass } from './notes';

export type Tuning = PitchClass[]; // index 0 = string 1 (high E) ... index 5 = string 6 (low E)

export const STANDARD_TUNING: Tuning = [4, 11, 7, 2, 9, 4];
export const MAX_FRET = 12;

// Absolute MIDI pitches of the open strings in standard tuning, index 0 = string 1 (high E4).
const STANDARD_TUNING_MIDI = [64, 59, 55, 50, 45, 40];

// Absolute MIDI pitch at a string and fret (standard tuning).
export function pitchAt(stringIndex: number, fret: number): number {
  return STANDARD_TUNING_MIDI[stringIndex]! + fret;
}

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

// Fret on targetStringIndex sounding exactly `semitones` above (stringIndex, fret); null if off the neck.
export function fretAbove(
  stringIndex: number,
  fret: number,
  semitones: number,
  targetStringIndex: number,
): number | null {
  const target = pitchAt(stringIndex, fret) + semitones - pitchAt(targetStringIndex, 0);
  return target >= 0 && target <= MAX_FRET ? target : null;
}
