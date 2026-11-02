export type { Letter, PitchClass, Note, SpellingPref } from './notes';
export { LETTERS, NATURAL_PCS, pitchClass, isNatural, noteName, semitonesUp } from './notes';
export type { Tuning } from './fretboard';
export { STANDARD_TUNING, MAX_FRET, noteAt, fretsFor } from './fretboard';
export type { IntervalName, Interval } from './intervals';
export { INTERVALS, transpose } from './intervals';
export { MAJOR_STEPS, CHROMATIC_PCS, majorScale, spellPitchClass, enharmonicLabel } from './scales';
