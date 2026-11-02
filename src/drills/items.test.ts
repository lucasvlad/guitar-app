import { expect, test } from 'vitest'
import {
  allStringsItems,
  locations,
  neighborhoodItems,
  neighborhoodWindow,
  noteLabel,
  noteOnStringItems,
  reverseItems,
} from './items'

test('all strings: 7 natural or 12 chromatic items with "{pc}" keys', () => {
  const nat = allStringsItems('natural')
  expect(nat.map((i) => i.key)).toEqual(['0', '2', '4', '5', '7', '9', '11'])
  expect(nat[0]!.skillId).toBe('fret:natural:allstrings')
  expect(allStringsItems('chromatic').length).toBe(12)
})

test('note on string: keys "{pc}:s{n}" and per-string skills, only selected strings', () => {
  const items = noteOnStringItems('chromatic', [6, 4])
  expect(items.length).toBe(24)
  const it = items.find((i) => i.key === '1:s4')!
  expect(it).toEqual({ key: '1:s4', skillId: 'fret:chromatic:s4', pc: 1, stringNum: 4 })
  expect(items.some((i) => i.stringNum === 5)).toBe(false)
  expect(noteOnStringItems('natural', [1]).length).toBe(7)
})

test('neighborhood window is anchor ±5 clamped to 0..12', () => {
  expect(neighborhoodWindow(2)).toEqual({ min: 0, max: 7 })
  expect(neighborhoodWindow(7)).toEqual({ min: 2, max: 12 })
  expect(neighborhoodWindow(12)).toEqual({ min: 7, max: 12 })
})

test('neighborhood: keys "{pc}@f{anchor}", only items with a location in the window', () => {
  const all = neighborhoodItems('chromatic', [1, 2, 3, 4, 5, 6])
  expect(all.length).toBe(13 * 12)
  expect(all.find((i) => i.key === '6@f7')!.anchor).toBe(7)
  expect(all[0]!.skillId).toBe('fret:chromatic:neighborhood')
  // String 1 only, anchor 0 (frets 0..5): E F F♯ G G♯ A.
  const s1 = neighborhoodItems('chromatic', [1]).filter((i) => i.anchor === 0)
  expect(s1.map((i) => i.pc)).toEqual([4, 5, 6, 7, 8, 9])
})

test('reverse: keys "s{n}f{fret}", natural mode keeps only natural positions', () => {
  const chrom = reverseItems('chromatic', [6])
  expect(chrom.length).toBe(13)
  expect(chrom.find((i) => i.key === 's6f3')).toEqual({ key: 's6f3', skillId: 'fret:chromatic:s6', pc: 7, stringNum: 6, fret: 3 })
  const nat = reverseItems('natural', [6])
  // Low E, frets 0..12: E F G A B C D E -> 8 natural positions.
  expect(nat.map((i) => i.fret)).toEqual([0, 1, 3, 5, 7, 8, 10, 12])
  expect(nat[0]!.skillId).toBe('fret:natural:s6')
})

test('locations finds every fret on the given strings', () => {
  // G (7) on string 6 and string 3 across the whole neck.
  expect(locations(7, [6, 3], 0, 12)).toEqual([
    { stringIndex: 5, fret: 3 },
    { stringIndex: 2, fret: 0 },
    { stringIndex: 2, fret: 12 },
  ])
})

test('labels follow the spelling preference', () => {
  expect(noteLabel(1, 'auto')).toBe('C♯')
  expect(noteLabel(3, 'auto')).toBe('E♭')
  expect(noteLabel(1, 'flats')).toBe('D♭')
})
