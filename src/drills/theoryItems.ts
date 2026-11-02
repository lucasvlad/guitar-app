import {
  INTERVALS,
  MAJOR_KEYS,
  PROGRESSIONS,
  chordName,
  diatonicTriads,
  noteName,
  progressionNumerals,
  transpose,
  type Chord,
  type ChordQuality,
  type Interval,
  type Note,
  type Progression,
} from '../music'
import {
  DIATONIC_KEYS_OF_CHORD,
  DIATONIC_TRIADS,
  INT_SEMIS,
  INT_UP,
  KEYSIG,
  SCALE_MAJOR,
  TRANSPOSE_TO_CHORDS,
  TRANSPOSE_TO_NUMERALS,
} from '../mastery/skills'

// Candidate items for the theory drills. Roots always come from MAJOR_KEYS so
// spellings stay sane; the weighted picker supplies the random key per question.

interface IntervalUpItem { key: string; skillId: string; root: Note; interval: Interval; answer: Note }
interface SemitonesItem { key: string; skillId: string; interval: Interval }
interface RootItem { key: string; skillId: string; root: Note }
interface ChordItem { key: string; skillId: string; chord: Chord }
interface ProgressionItem { key: string; skillId: string; root: Note; progression: Progression }

// The octave is left out (the answer would be the root). Answers needing a
// double accidental are skipped: the SpellPad only has ♭ ♮ ♯.
export function intervalUpItems(): IntervalUpItem[] {
  const items: IntervalUpItem[] = []
  for (const root of MAJOR_KEYS) {
    for (const interval of INTERVALS) {
      if (interval.name === 'P8') continue
      const answer = transpose(root, interval.name)
      if (Math.abs(answer.accidental) > 1) continue
      items.push({ key: noteName(root) + ':' + interval.name, skillId: INT_UP, root, interval, answer })
    }
  }
  return items
}

export function semitonesItems(): SemitonesItem[] {
  return INTERVALS.map((interval) => ({ key: interval.name, skillId: INT_SEMIS, interval }))
}

export function scaleItems(): RootItem[] {
  return MAJOR_KEYS.map((root) => ({ key: noteName(root), skillId: SCALE_MAJOR, root }))
}

export function keySigItems(): RootItem[] {
  return MAJOR_KEYS.map((root) => ({ key: noteName(root), skillId: KEYSIG, root }))
}

// One item per key: name all seven diatonic triads.
export function diatonicItems(): RootItem[] {
  return MAJOR_KEYS.map((root) => ({ key: noteName(root), skillId: DIATONIC_TRIADS, root }))
}

// Every diatonic triad of every major key, once each.
export function keysOfChordItems(): ChordItem[] {
  const items: ChordItem[] = []
  for (const root of MAJOR_KEYS) {
    for (const chord of diatonicTriads(root)) {
      const key = chordName(chord)
      if (!items.some((i) => i.key === key)) items.push({ key, skillId: DIATONIC_KEYS_OF_CHORD, chord })
    }
  }
  return items
}

// One attempt per progression in a key.
export function progressionItems(direction: 'chords' | 'numerals'): ProgressionItem[] {
  const skillId = direction === 'chords' ? TRANSPOSE_TO_CHORDS : TRANSPOSE_TO_NUMERALS
  const items: ProgressionItem[] = []
  for (const root of MAJOR_KEYS) {
    for (const progression of PROGRESSIONS) {
      const key = noteName(root) + ':' + progressionNumerals(progression).join('–')
      items.push({ key, skillId, root, progression })
    }
  }
  return items
}

const TRIADS: ChordQuality[] = ['maj', 'min', 'dim']

// Answer qualities for a progression: maj/min/dim when it is all triads,
// otherwise the qualities it uses.
export function progressionQualities(p: Progression): ChordQuality[] {
  const used: ChordQuality[] = []
  for (const step of p.steps) if (!used.includes(step.quality)) used.push(step.quality)
  return used.every((q) => TRIADS.includes(q)) ? TRIADS : used
}
