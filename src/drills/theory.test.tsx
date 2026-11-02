// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { chordName, diatonicTriads, keySignature, keysContaining, majorScale, noteName, progressionChords, progressionNumerals } from '../music'
import type { Note } from '../music'
import { getAttempts } from '../data/db'
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
import {
  diatonicItems,
  intervalUpItems,
  keySigItems,
  keysOfChordItems,
  progressionItems,
  progressionQualities,
  scaleItems,
  semitonesItems,
} from './theoryItems'
import { IntervalUp } from './IntervalUp'
import { IntervalSemitones } from './IntervalSemitones'
import { ScaleSpell } from './ScaleSpell'
import { KeySignature } from './KeySignature'
import { DiatonicChords } from './DiatonicChords'
import { KeysOfChord } from './KeysOfChord'
import { TransposeToChords, TransposeToNumerals } from './Transposer'
import { TheoryMix } from './TheoryMix'

// With Math.random() = 0 the weighted picker always takes the first item of its
// pool, so a fresh drill shows items[0] and the next prompt shows items[1].
// Each drill uses its own skill, so the shared database never mixes them.

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const ACC: Record<number, string> = { [-1]: '♭', 0: '♮', 1: '♯' }

function spell(n: Note) {
  fireEvent.click(screen.getByRole('button', { name: ACC[n.accidental]! }))
  fireEvent.click(screen.getByRole('button', { name: n.letter }))
}

function clickIn(container: HTMLElement, selector: string, text: string) {
  const btn = [...container.querySelectorAll<HTMLElement>(selector)].find((b) => b.textContent === text)
  if (!btn) throw new Error('No button "' + text + '" in ' + selector)
  fireEvent.click(btn)
}

async function attempts(skillId: string, n: number) {
  await waitFor(async () => expect(await getAttempts([skillId])).toHaveLength(n))
  return (await getAttempts([skillId])).map((a) => [a.skillId, a.drill, a.prompt, a.correct])
}

async function waitText(text: string, selector = '*') {
  await waitFor(() => expect(screen.getByText(text, { selector })).toBeTruthy(), { timeout: 3000 })
}

test('IntervalUp: right spelling is correct, the enharmonic is wrong', async () => {
  const [a, b] = intervalUpItems()
  render(<IntervalUp spelling="auto" />)
  await waitText(a!.interval.label + ' above')
  expect(screen.getByText(noteName(a!.root))).toBeTruthy()
  spell(a!.answer)
  expect(await attempts(INT_UP, 1)).toEqual([[INT_UP, 'interval-up', a!.key, true]])

  await waitText(b!.interval.label + ' above')
  expect(noteName(b!.answer)).toBe('E♭')
  spell({ letter: 'D', accidental: 1 }) // D♯ sounds the same but is spelled wrong
  expect(screen.getByText('E♭', { selector: '.drill-answer' })).toBeTruthy()
  expect((await attempts(INT_UP, 2))[1]).toEqual([INT_UP, 'interval-up', b!.key, false])
})

test('IntervalSemitones: right and wrong counts', async () => {
  const [a, b] = semitonesItems()
  render(<IntervalSemitones spelling="auto" />)
  await waitText(a!.interval.label)
  fireEvent.click(screen.getByRole('button', { name: String(a!.interval.semitones) }))
  expect(await attempts(INT_SEMIS, 1)).toEqual([[INT_SEMIS, 'interval-semitones', a!.key, true]])

  await waitText(b!.interval.label)
  fireEvent.click(screen.getByRole('button', { name: String(b!.interval.semitones + 1) }))
  expect((await attempts(INT_SEMIS, 2))[1]).toEqual([INT_SEMIS, 'interval-semitones', b!.key, false])
})

test('ScaleSpell: whole scale is one correct attempt; first wrong note ends the item', async () => {
  const [a, b] = scaleItems()
  const { container } = render(<ScaleSpell spelling="auto" />)
  await waitText(noteName(a!.root) + ' major')
  for (const n of majorScale(a!.root)) spell(n)
  expect(await attempts(SCALE_MAJOR, 1)).toEqual([[SCALE_MAJOR, 'scale-spell', a!.key, true]])

  await waitText(noteName(b!.root) + ' major')
  const scale = majorScale(b!.root)
  spell(scale[0]!)
  spell({ letter: scale[1]!.letter, accidental: scale[1]!.accidental === 0 ? 1 : 0 })
  expect((await attempts(SCALE_MAJOR, 2))[1]).toEqual([SCALE_MAJOR, 'scale-spell', b!.key, false])
  expect(container.querySelector('.drill-reveal')!.textContent).toBe(scale.map(noteName).join(''))
  expect((screen.getByRole('button', { name: 'C' }) as HTMLButtonElement).disabled).toBe(true)

  // The next scale starts with empty cells (no stale typed notes).
  await waitText(noteName(a!.root) + ' major')
  expect(container.querySelectorAll('.drill-cell.drill-right, .drill-cell.drill-wrong')).toHaveLength(0)
})

test('KeySignature: count then the notes in order is one attempt; a wrong note or count is a miss', async () => {
  const [a, b] = keySigItems()
  const { container } = render(<KeySignature spelling="auto" />)
  await waitText(noteName(a!.root) + ' major')
  const sig = keySignature(a!.root)
  expect(sig.count).toBe(-7)
  fireEvent.click(screen.getByRole('button', { name: '7♭' }))
  await waitText('Which ones, in order?')
  for (const n of sig.notes) spell(n)
  expect(await attempts(KEYSIG, 1)).toEqual([[KEYSIG, 'key-signature', a!.key, true]])

  // Right count, wrong first note: a miss that reveals the signature.
  await waitText(noteName(b!.root) + ' major')
  const sigB = keySignature(b!.root)
  expect(sigB.count).toBe(-6)
  fireEvent.click(screen.getByRole('button', { name: '6♭' }))
  spell(sigB.notes[1]!)
  expect((await attempts(KEYSIG, 2))[1]).toEqual([KEYSIG, 'key-signature', b!.key, false])
  expect(screen.getByText(sigB.notes.map(noteName).join(' '), { selector: '.drill-sub' })).toBeTruthy()

  // The next key starts fresh at the count step; a wrong count ends it.
  await waitText(noteName(a!.root) + ' major')
  expect(screen.getByText('how many sharps or flats?')).toBeTruthy()
  expect(container.querySelector('.drill-seq')).toBe(null)
  fireEvent.click(screen.getByRole('button', { name: '0' }))
  expect((await attempts(KEYSIG, 3))[2]).toEqual([KEYSIG, 'key-signature', a!.key, false])
})

test('DiatonicChords: all 7 triads is one correct attempt; a wrong chord shows the right one and continues', async () => {
  const [a, b] = diatonicItems()
  const pad = (c: HTMLElement) => c.querySelector<HTMLElement>('.chordpad > .pad-row')!
  const { container } = render(<DiatonicChords spelling="auto" />)
  await waitText('Key of ' + noteName(a!.root))
  expect(screen.getByText('name the 7 triads')).toBeTruthy()
  // Cells are labelled 1-7, never with numerals that give away the quality.
  const labels = [...container.querySelectorAll('.drill-step-given')].map((e) => e.textContent)
  expect(labels).toEqual(['1', '2', '3', '4', '5', '6', '7'])
  for (const c of diatonicTriads(a!.root)) {
    spell(c.root)
    clickIn(pad(container), 'button', chordName(c))
  }
  expect(await attempts(DIATONIC_TRIADS, 1)).toEqual([[DIATONIC_TRIADS, 'diatonic-chords', a!.key, true]])

  await waitText('Key of ' + noteName(b!.root))
  expect(container.querySelectorAll('.drill-step.drill-right')).toHaveLength(0) // fresh cells
  const triads = diatonicTriads(b!.root)
  spell(triads[0]!.root)
  clickIn(pad(container), 'button', chordName({ root: triads[0]!.root, quality: 'min' }))
  expect(container.querySelector('.drill-step.drill-wrong')!.textContent).toBe('1' + chordName(triads[0]!))
  expect(await getAttempts([DIATONIC_TRIADS])).toHaveLength(1) // still going
  for (const c of triads.slice(1)) {
    spell(c.root)
    clickIn(pad(container), 'button', chordName(c))
  }
  expect((await attempts(DIATONIC_TRIADS, 2))[1]).toEqual([DIATONIC_TRIADS, 'diatonic-chords', b!.key, false])
})

test('KeysOfChord: the exact set is correct, a superset is a miss', async () => {
  const [a, b] = keysOfChordItems()
  render(<KeysOfChord spelling="auto" />)
  await waitText(chordName(a!.chord), '.drill-title')
  for (const key of keysContaining(a!.chord)) fireEvent.click(screen.getByRole('button', { name: noteName(key) }))
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
  expect(await attempts(DIATONIC_KEYS_OF_CHORD, 1)).toEqual([[DIATONIC_KEYS_OF_CHORD, 'keys-of-chord', a!.key, true]])

  await waitText(chordName(b!.chord), '.drill-title')
  const right = keysContaining(b!.chord)
  // Every right key plus C major (which does not contain it): a superset is wrong.
  expect(right.some((k) => noteName(k) === 'C')).toBe(false)
  for (const key of [...right, { letter: 'C', accidental: 0 } as Note]) {
    fireEvent.click(screen.getByRole('button', { name: noteName(key) }))
  }
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
  expect((await attempts(DIATONIC_KEYS_OF_CHORD, 2))[1]).toEqual([DIATONIC_KEYS_OF_CHORD, 'keys-of-chord', b!.key, false])

  // The next chord starts with nothing selected.
  await waitText(chordName(a!.chord), '.drill-title')
  expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0)
})

test('TransposeToChords: one attempt per progression; a miss shows the right chord and moves on', async () => {
  const [a, b] = progressionItems('chords')
  const chords = progressionChords(a!.root, a!.progression)
  expect(progressionQualities(a!.progression)).toEqual(['maj', 'min', 'dim'])
  const pad = (c: HTMLElement) => c.querySelector<HTMLElement>('.chordpad > .pad-row')!

  const { container } = render(<TransposeToChords spelling="auto" />)
  await waitText('Key of ' + noteName(a!.root))
  for (const c of chords) {
    spell(c.root)
    clickIn(pad(container), 'button', chordName(c))
  }
  expect(await attempts(TRANSPOSE_TO_CHORDS, 1)).toEqual([[TRANSPOSE_TO_CHORDS, 'transpose-to-chords', a!.key, true]])

  // Next progression starts with fresh cells; a wrong first chord shows the right one, the rest are still asked.
  const chordsB = progressionChords(b!.root, b!.progression)
  const numeralsB = progressionNumerals(b!.progression)
  await waitFor(() => expect(container.querySelector('.drill-step')!.className).toBe('drill-step drill-cur'), { timeout: 3000 })
  expect([...container.querySelectorAll('.drill-step-given')].map((e) => e.textContent)).toEqual(numeralsB)
  spell(chordsB[0]!.root)
  clickIn(pad(container), 'button', chordName({ root: chordsB[0]!.root, quality: 'min' }))
  expect(container.querySelector('.drill-step.drill-wrong')!.textContent).toBe(numeralsB[0] + chordName(chordsB[0]!))
  expect(await getAttempts([TRANSPOSE_TO_CHORDS])).toHaveLength(1)
  for (const c of chordsB.slice(1)) {
    spell(c.root)
    clickIn(pad(container), 'button', chordName(c))
  }
  expect((await attempts(TRANSPOSE_TO_CHORDS, 2))[1]).toEqual([TRANSPOSE_TO_CHORDS, 'transpose-to-chords', b!.key, false])
})

test('TransposeToNumerals: one attempt per progression; any wrong numeral makes it a miss', async () => {
  const [a] = progressionItems('numerals')
  const steps = a!.progression.steps
  const names = progressionNumerals(a!.progression)
  const numeralRows = (c: HTMLElement) => c.querySelectorAll<HTMLElement>('.numeralpad > .pad-row')
  const row = [TRANSPOSE_TO_NUMERALS, 'transpose-to-numerals', a!.key]

  const first = render(<TransposeToNumerals spelling="auto" />)
  await waitText('Key of ' + noteName(a!.root))
  steps.forEach((s, i) => {
    const rows = numeralRows(first.container)
    fireEvent.click(rows[0]!.querySelectorAll('button')[s.degree - 1]!)
    clickIn(rows[1]!, 'button', names[i]!)
  })
  expect(await attempts(TRANSPOSE_TO_NUMERALS, 1)).toEqual([[...row, true]])
  first.unmount()

  const { container } = render(<TransposeToNumerals spelling="auto" />)
  await waitText('Key of ' + noteName(a!.root))
  steps.forEach((s, i) => {
    const rows = numeralRows(container)
    if (i === 0) {
      fireEvent.click(rows[0]!.querySelectorAll('button')[1]!) // ii instead of I
      fireEvent.click(rows[1]!.querySelectorAll('button')[0]!)
    } else {
      fireEvent.click(rows[0]!.querySelectorAll('button')[s.degree - 1]!)
      clickIn(rows[1]!, 'button', names[i]!)
    }
  })
  expect((await attempts(TRANSPOSE_TO_NUMERALS, 2))[1]).toEqual([...row, false])
})

test('TheoryMix: switches to another drill after 3 finished items, not before', async () => {
  // Math.random() = 0: starts on THEORY_DRILLS[0] (Interval above), then switches to [1].
  const [a, b] = intervalUpItems()
  const onAnswer = vi.fn()
  const { container } = render(<TheoryMix spelling="auto" onAnswer={onAnswer} />)
  const label = () => container.querySelector('.mix-label')!.textContent
  for (const item of [a!, b!, a!]) {
    await waitFor(() => expect(container.querySelector('.drill-answer')?.textContent).toBe('?'), { timeout: 3000 })
    await waitText(item.interval.label + ' above')
    expect(label()).toBe('Interval above')
    spell(item.answer)
  }
  expect(onAnswer).toHaveBeenCalledTimes(3)
  await waitFor(() => expect(label()).toBe('Interval semitones'), { timeout: 3000 })
  await waitText(semitonesItems()[0]!.interval.label)
})
