export type { Letter, PitchClass, Note, SpellingPref } from './notes';
export { LETTERS, NATURAL_PCS, pitchClass, isNatural, noteName, semitonesUp } from './notes';
export type { Tuning } from './fretboard';
export { STANDARD_TUNING, MAX_FRET, noteAt, pitchAt, fretsFor, fretAbove } from './fretboard';
export type { IntervalName, Interval } from './intervals';
export { INTERVALS, transpose } from './intervals';
export { MAJOR_STEPS, CHROMATIC_PCS, majorScale, spellPitchClass, enharmonicLabel, readableSpelling } from './scales';
export { notesEqual } from './notes';
export { MAJOR_KEYS, keySignature, relativeMinor } from './keys';
export type { ChordQuality, Chord } from './chords';
export {
  NUMERAL_DEGREES,
  chordSymbol,
  chordName,
  diatonicTriads,
  diatonicSevenths,
  romanNumeral,
  keysContaining,
  numeralInKey,
} from './chords';
export type { Progression } from './progressions';
export { PROGRESSIONS, progressionChords, progressionNumerals } from './progressions';
export { MAJOR_DEGREE_INTERVALS, scaleOnFretboard } from './fretmap';
