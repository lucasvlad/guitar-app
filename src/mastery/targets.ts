import type { DrillType } from '../data/types';

// Gate-level response-time targets (docs/PLAN.md). Per item unless noted.
export const TARGET_MS: Record<DrillType, number> = {
  'fret-note-on-string': 2000,
  'fret-reverse': 2000,
  'fret-all-strings': 8000,
  'fret-neighborhood': 6000,
  'interval-up': 4000,
  'interval-semitones': 3000,
  'scale-spell': 15000, // whole scale
  'key-signature': 12000, // count + naming the accidentals in order
  'diatonic-chords': 4000, // per chord
  'keys-of-chord': 8000,
  'transpose-to-chords': 4000, // per chord
  'transpose-to-numerals': 4000, // per chord
  'interval-nav': 4000,
  'octave-finder': 3000,
};
