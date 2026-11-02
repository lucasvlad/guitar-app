import { expect, test } from 'vitest'
import { MAX_FRET, isNatural, noteAt, pitchAt } from '../music'
import { FRET_INTNAV, FRET_OCTAVE } from '../mastery/skills'
import { intervalNavItems, octaveItems, stringMove } from './navItems'

const ALL = [1, 2, 3, 4, 5, 6]

test('intervalNavItems: every target is exactly the interval above in absolute pitch, nearby, on the target string', () => {
  const items = intervalNavItems('chromatic', ALL)
  expect(items.length).toBeGreaterThan(0)
  for (const item of items) {
    expect(item.skillId).toBe(FRET_INTNAV)
    expect(item.targetString).not.toBe(item.stringNum)
    expect(Math.abs(item.targetString - item.stringNum)).toBeLessThanOrEqual(2)
    expect(item.pc).toBe(noteAt(item.stringNum - 1, item.fret))
    expect(item.targets.length).toBeGreaterThan(0)
    for (const t of item.targets) {
      expect(t.stringIndex).toBe(item.targetString - 1)
      expect(Math.abs(t.fret - item.fret)).toBeLessThanOrEqual(5)
      expect(t.fret).toBeGreaterThanOrEqual(0)
      expect(t.fret).toBeLessThanOrEqual(MAX_FRET)
      expect(pitchAt(t.stringIndex, t.fret) - pitchAt(item.stringNum - 1, item.fret)).toBe(item.interval.semitones)
    }
  }
  expect(new Set(items.map((i) => i.key)).size).toBe(items.length)
  expect(new Set(items.map((i) => i.interval.name))).toEqual(new Set(['m3', 'M3', 'P4', 'P5', 'P8']))
})

test('intervalNavItems: known item s3f5:M3:s2 (C on G string -> E at fret 5 on B string)', () => {
  const item = intervalNavItems('natural', [3]).find((i) => i.key === 's3f5:M3:s2')!
  expect(item.targets).toEqual([{ stringIndex: 1, fret: 5 }])
})

test('intervalNavItems: regression, never a same-pitch-class fret that sounds lower', () => {
  // C on string 3 fret 5 (C4): E on string 4 fret 2 is pitch class E but sounds a minor 6th lower.
  expect(intervalNavItems('natural', [3]).find((i) => i.key === 's3f5:M3:s4')).toBeUndefined()
  // A on string 5 fret 0 (A2): octave above on string 3 is fret 2 (A3), not fret 14 or a lower A.
  const p8 = intervalNavItems('natural', [5]).find((i) => i.key === 's5f0:P8:s3')!
  expect(p8.targets).toEqual([{ stringIndex: 2, fret: 2 }])
})

test('intervalNavItems: start strings follow the subset; natural mode starts on naturals', () => {
  const items = intervalNavItems('natural', [6, 5])
  expect(new Set(items.map((i) => i.stringNum))).toEqual(new Set([6, 5]))
  for (const item of items) expect(isNatural(item.pc)).toBe(true)
  expect(items.some((i) => i.targetString === 4)).toBe(true) // target string may be outside the subset
})

test('intervalNavItems: targets prefer the selected strings, falling back to any nearby string per start', () => {
  const items = intervalNavItems('natural', [3, 2])
  // String 3 starts have items toward string 2, so they never use strings 1, 4 or 5.
  for (const item of items.filter((i) => i.stringNum === 3)) expect(item.targetString).toBe(2)
  // String 2 starts cannot reach string 3 (lower) within reach, so they fall back to other nearby strings.
  expect(items.filter((i) => i.stringNum === 2).length).toBeGreaterThan(0)
})

test('intervalNavItems: string 1 alone has no reachable interval above, so the list is empty', () => {
  expect(intervalNavItems('natural', [1])).toEqual([])
  expect(intervalNavItems('chromatic', [1])).toEqual([])
})

test('octaveItems: targets are the same pitch class one or two strings away', () => {
  const items = octaveItems('chromatic', ALL)
  for (const item of items) {
    expect(item.skillId).toBe(FRET_OCTAVE)
    expect(Math.abs(item.targetString - item.stringNum)).toBeGreaterThanOrEqual(1)
    expect(Math.abs(item.targetString - item.stringNum)).toBeLessThanOrEqual(2)
    expect(item.targets.length).toBeGreaterThan(0)
    for (const t of item.targets) {
      expect(t.stringIndex).toBe(item.targetString - 1)
      expect(noteAt(t.stringIndex, t.fret)).toBe(item.pc)
    }
  }
  // 6 strings x 13 frets, each with 2-4 nearby strings.
  expect(items.length).toBe(13 * (2 + 3 + 4 + 4 + 3 + 2))
  const a = items.find((i) => i.key === 's5f3:s3')! // C on A string -> C on G string at fret 5
  expect(a.targets).toEqual([{ stringIndex: 2, fret: 5 }])
})

test('stringMove: up is toward string 1', () => {
  expect(stringMove(5, 3)).toBe('two strings up')
  expect(stringMove(2, 3)).toBe('one string down')
})
