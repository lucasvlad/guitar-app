import { CHROMATIC_PCS, MAX_FRET, NATURAL_PCS, fretsFor, isNatural, noteAt, noteName, spellPitchClass } from '../music'
import type { PitchClass, SpellingPref } from '../music'
import type { FretMode } from '../data/types'
import { fretSkillId } from '../mastery/skills'

// Candidate items for the fretboard drills. Each item carries its own fields,
// so nothing ever parses `key` (the Attempt.prompt).

const NEIGHBORHOOD_RADIUS = 5

interface AllStringsItem { key: string; skillId: string; pc: PitchClass }
interface NoteOnStringItem { key: string; skillId: string; pc: PitchClass; stringNum: number }
interface NeighborhoodItem { key: string; skillId: string; pc: PitchClass; anchor: number }
interface ReverseItem { key: string; skillId: string; pc: PitchClass; stringNum: number; fret: number }

function pitchClasses(mode: FretMode): PitchClass[] {
  return mode === 'natural' ? NATURAL_PCS : CHROMATIC_PCS
}

export function allStringsItems(mode: FretMode): AllStringsItem[] {
  const skillId = fretSkillId(mode, 'allstrings')
  return pitchClasses(mode).map((pc) => ({ key: String(pc), skillId, pc }))
}

export function noteOnStringItems(mode: FretMode, strings: number[]): NoteOnStringItem[] {
  const items: NoteOnStringItem[] = []
  for (const stringNum of strings) {
    const skillId = fretSkillId(mode, 's' + stringNum)
    for (const pc of pitchClasses(mode)) {
      items.push({ key: pc + ':s' + stringNum, skillId, pc, stringNum })
    }
  }
  return items
}

export function neighborhoodWindow(anchor: number): { min: number; max: number } {
  return { min: Math.max(0, anchor - NEIGHBORHOOD_RADIUS), max: Math.min(MAX_FRET, anchor + NEIGHBORHOOD_RADIUS) }
}

// Only items with at least one location in the window on the selected strings.
export function neighborhoodItems(mode: FretMode, strings: number[]): NeighborhoodItem[] {
  const skillId = fretSkillId(mode, 'neighborhood')
  const items: NeighborhoodItem[] = []
  for (let anchor = 0; anchor <= MAX_FRET; anchor++) {
    const { min, max } = neighborhoodWindow(anchor)
    for (const pc of pitchClasses(mode)) {
      if (locations(pc, strings, min, max).length > 0) {
        items.push({ key: pc + '@f' + anchor, skillId, pc, anchor })
      }
    }
  }
  return items
}

export function reverseItems(mode: FretMode, strings: number[]): ReverseItem[] {
  const items: ReverseItem[] = []
  for (const stringNum of strings) {
    const skillId = fretSkillId(mode, 's' + stringNum)
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      const pc = noteAt(stringNum - 1, fret)
      if (mode === 'natural' && !isNatural(pc)) continue
      items.push({ key: 's' + stringNum + 'f' + fret, skillId, pc, stringNum, fret })
    }
  }
  return items
}

// Every place pc sounds on the given strings (numbers 1..6) between minFret and maxFret.
export function locations(pc: PitchClass, strings: number[], minFret: number, maxFret: number) {
  const out: { stringIndex: number; fret: number }[] = []
  for (const stringNum of strings) {
    for (const fret of fretsFor(pc, stringNum - 1, minFret, maxFret)) {
      out.push({ stringIndex: stringNum - 1, fret })
    }
  }
  return out
}

export function noteLabel(pc: PitchClass, spelling: SpellingPref): string {
  return noteName(spellPitchClass(pc, spelling))
}
