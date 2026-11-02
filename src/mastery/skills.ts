import type { FretMode, Skill } from '../data/types';

// scope: 's1'..'s6' | 'allstrings' | 'neighborhood'
export function fretSkillId(mode: FretMode, scope: string): string {
  return 'fret:' + mode + ':' + scope;
}

interface CatalogEntry { name: string; phase: number; prerequisites: string[] }

const SCOPES: { scope: string; label: string }[] = [
  { scope: 's1', label: 'string 1' },
  { scope: 's2', label: 'string 2' },
  { scope: 's3', label: 'string 3' },
  { scope: 's4', label: 'string 4' },
  { scope: 's5', label: 'string 5' },
  { scope: 's6', label: 'string 6' },
  { scope: 'allstrings', label: 'all strings' },
  { scope: 'neighborhood', label: 'neighborhood' },
];

const CATALOG: Record<string, CatalogEntry> = {};
for (const { scope, label } of SCOPES) {
  const natural = fretSkillId('natural', scope);
  CATALOG[natural] = { name: 'Fretboard naturals: ' + label, phase: 1, prerequisites: [] };
  CATALOG[fretSkillId('chromatic', scope)] = { name: 'Fretboard chromatic: ' + label, phase: 1, prerequisites: [natural] };
}

const ALL_STRINGS = fretSkillId('natural', 'allstrings');

export const INT_UP = 'int:up';
export const INT_SEMIS = 'int:semis';
export const FRET_INTNAV = 'fret:intnav';
export const FRET_OCTAVE = 'fret:octave';
export const SCALE_MAJOR = 'scale:major';
export const KEYSIG = 'keysig';
export const DIATONIC_TRIADS = 'diatonic:triads';
export const DIATONIC_KEYS_OF_CHORD = 'diatonic:keys-of-chord';
export const TRANSPOSE_TO_CHORDS = 'transpose:to-chords';
export const TRANSPOSE_TO_NUMERALS = 'transpose:to-numerals';

CATALOG[INT_UP] = { name: 'Intervals: note above', phase: 1, prerequisites: [] };
CATALOG[INT_SEMIS] = { name: 'Intervals: semitone counts', phase: 1, prerequisites: [] };
CATALOG[FRET_INTNAV] = { name: 'Fretboard interval navigation', phase: 1, prerequisites: [ALL_STRINGS] };
CATALOG[FRET_OCTAVE] = { name: 'Fretboard octave finder', phase: 1, prerequisites: [ALL_STRINGS] };
CATALOG[SCALE_MAJOR] = { name: 'Major scale spelling', phase: 2, prerequisites: [INT_UP] };
CATALOG[KEYSIG] = { name: 'Key signatures', phase: 2, prerequisites: [SCALE_MAJOR] };
CATALOG[DIATONIC_TRIADS] = { name: 'Diatonic triads', phase: 3, prerequisites: [SCALE_MAJOR] };
CATALOG[DIATONIC_KEYS_OF_CHORD] = { name: 'Keys containing a chord', phase: 3, prerequisites: [DIATONIC_TRIADS] };
CATALOG[TRANSPOSE_TO_CHORDS] = { name: 'Transpose: numerals to chords', phase: 3, prerequisites: [DIATONIC_TRIADS] };
CATALOG[TRANSPOSE_TO_NUMERALS] = { name: 'Transpose: chords to numerals', phase: 3, prerequisites: [DIATONIC_TRIADS] };

export const SKILL_IDS: string[] = Object.keys(CATALOG);

export function newSkill(id: string): Skill {
  const entry = CATALOG[id];
  if (!entry) throw new Error('Unknown skill id: ' + id);
  return { id, ...entry, prerequisites: [...entry.prerequisites], mastery: 0, lastReviewed: null, nextDue: null, box: 0 };
}
