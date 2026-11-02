import { CHROMATIC_PCS, INTERVALS, MAX_FRET, NATURAL_PCS, fretAbove, fretsFor, noteAt } from '../music'
import type { Interval, PitchClass } from '../music'
import type { FretMode } from '../data/types'
import { FRET_INTNAV, FRET_OCTAVE } from '../mastery/skills'

// Items for the interval navigation and octave finder drills (5.1 items 5-6).
// Each item carries its own fields, so nothing ever parses `key`.

const NAV_RADIUS = 5
const NAV_INTERVALS = ['m3', 'M3', 'P4', 'P5', 'P8']

interface Spot { stringIndex: number; fret: number }

interface NavStart { stringNum: number; fret: number; pc: PitchClass }

interface IntervalNavItem extends NavStart {
  key: string
  skillId: string
  interval: Interval
  targetString: number
  targets: Spot[]
}

interface OctaveItem extends NavStart {
  key: string
  skillId: string
  targetString: number
  targets: Spot[]
}

// Start notes on the selected strings (numbers 1..6), frets 0..12, within the mode.
function starts(mode: FretMode, strings: number[]): NavStart[] {
  const pcs = mode === 'natural' ? NATURAL_PCS : CHROMATIC_PCS
  const out: NavStart[] = []
  for (const stringNum of strings) {
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      const pc = noteAt(stringNum - 1, fret)
      if (pcs.includes(pc)) out.push({ stringNum, fret, pc })
    }
  }
  return out
}

// Strings one or two away from the start string.
function nearStrings(stringNum: number): number[] {
  return [stringNum - 2, stringNum - 1, stringNum + 1, stringNum + 2].filter((s) => s >= 1 && s <= 6)
}

function spots(pc: PitchClass, stringNum: number, minFret: number, maxFret: number): Spot[] {
  return fretsFor(pc, stringNum - 1, minFret, maxFret).map((fret) => ({ stringIndex: stringNum - 1, fret }))
}

function startKey(s: NavStart): string {
  return 's' + s.stringNum + 'f' + s.fret
}

// Items from one start toward the given target strings: the exact fret that sounds
// the interval above (absolute pitch, via fretAbove, frets 0..12), within NAV_RADIUS frets of the start.
function navItemsFrom(start: NavStart, targetStrings: number[]): IntervalNavItem[] {
  const items: IntervalNavItem[] = []
  for (const interval of INTERVALS.filter((i) => NAV_INTERVALS.includes(i.name))) {
    for (const targetString of targetStrings) {
      const fret = fretAbove(start.stringNum - 1, start.fret, interval.semitones, targetString - 1)
      if (fret === null || Math.abs(fret - start.fret) > NAV_RADIUS) continue
      const key = startKey(start) + ':' + interval.name + ':s' + targetString
      const targets = [{ stringIndex: targetString - 1, fret }]
      items.push({ ...start, key, skillId: FRET_INTNAV, interval, targetString, targets })
    }
  }
  return items
}

// Target strings within the selected subset are preferred; a start with no item
// there may use any string one or two away. Empty when nothing fits (e.g. string 1 alone).
export function intervalNavItems(mode: FretMode, strings: number[]): IntervalNavItem[] {
  const items: IntervalNavItem[] = []
  for (const start of starts(mode, strings)) {
    const near = nearStrings(start.stringNum)
    const inSubset = navItemsFrom(start, near.filter((s) => strings.includes(s)))
    items.push(...(inSubset.length > 0 ? inSubset : navItemsFrom(start, near)))
  }
  return items
}

// Same pitch class (octave or unison) one or two strings away, frets 0..12.
export function octaveItems(mode: FretMode, strings: number[]): OctaveItem[] {
  const items: OctaveItem[] = []
  for (const start of starts(mode, strings)) {
    for (const targetString of nearStrings(start.stringNum)) {
      const targets = spots(start.pc, targetString, 0, MAX_FRET)
      if (targets.length === 0) continue
      const key = startKey(start) + ':s' + targetString
      items.push({ ...start, key, skillId: FRET_OCTAVE, targetString, targets })
    }
  }
  return items
}

// "one string up" means toward string 1 (higher pitched); "down" toward string 6.
export function stringMove(from: number, to: number): string {
  const n = Math.abs(to - from)
  return (n === 1 ? 'one string ' : 'two strings ') + (to < from ? 'up' : 'down')
}
