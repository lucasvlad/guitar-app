// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { afterEach, expect, test, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MAX_FRET, enharmonicLabel, noteAt } from '../music'
import { getAttempts, getSkill } from '../data/db'
import { noteLabel, noteOnStringItems } from './items'
import { ReverseNote } from './ReverseNote'
import { NoteOnString } from './NoteOnString'

// Runtime integration: drills -> useDrillLoop -> IndexedDB (fake-indexeddb).
// Each test uses its own string so the shared database does not mix skills.

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

// The fret highlighted as the prompt on the given string (number 1..6), or null.
function promptFret(container: HTMLElement, stringNum: number): number | null {
  for (let fret = 0; fret <= MAX_FRET; fret++) {
    const cell = container.querySelector('[aria-label="String ' + stringNum + ' fret ' + fret + '"]')
    if (cell && cell.querySelector('.fb-prompt')) return fret
  }
  return null
}

async function waitForPrompt(container: HTMLElement, stringNum: number): Promise<number> {
  let fret: number | null = null
  await waitFor(() => {
    fret = promptFret(container, stringNum)
    expect(fret).not.toBe(null)
  })
  return fret!
}

// Answer button on the NotePad (natural mode, auto spelling).
function padButton(pc: number): HTMLElement {
  return screen.getByRole('button', { name: enharmonicLabel(pc, 'auto') })
}

function wrongPc(pc: number): number {
  // Natural neighbours: pick another natural pitch class.
  return pc === 0 ? 2 : 0
}

test('ReverseNote: correct answer logs fret:natural:s1 attempt with key s{n}f{fret}', async () => {
  const { container } = render(<ReverseNote mode="natural" strings={[1]} spelling="auto" />)
  const fret = await waitForPrompt(container, 1)
  const pc = noteAt(0, fret)

  fireEvent.click(padButton(pc))
  expect(screen.getByText(enharmonicLabel(pc, 'auto'), { selector: '.drill-note' })).toBeTruthy()

  await waitFor(async () => expect(await getAttempts(['fret:natural:s1'])).toHaveLength(1))
  const [a] = await getAttempts(['fret:natural:s1'])
  expect(a!.skillId).toBe('fret:natural:s1')
  expect(a!.drill).toBe('fret-reverse')
  expect(a!.prompt).toBe('s1f' + fret)
  expect(a!.correct).toBe(true)
  expect(a!.ms).toBeGreaterThanOrEqual(0)
})

test('ReverseNote: wrong answer records correct=false; next prompt after ~700 ms', async () => {
  const { container } = render(<ReverseNote mode="natural" strings={[2]} spelling="auto" />)
  const fret = await waitForPrompt(container, 2)
  const pc = noteAt(1, fret)

  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  fireEvent.click(padButton(wrongPc(pc)))
  // Feedback state: the prompt highlight is replaced by the wrong colour; pad is disabled.
  expect(promptFret(container, 2)).toBe(null)
  expect((padButton(pc) as HTMLButtonElement).disabled).toBe(true)

  act(() => vi.advanceTimersByTime(600))
  expect(promptFret(container, 2)).toBe(null)
  act(() => vi.advanceTimersByTime(150))
  const nextFret = promptFret(container, 2)
  expect(nextFret).not.toBe(null)
  expect(nextFret).not.toBe(fret) // never repeats the last key
  expect((padButton(pc) as HTMLButtonElement).disabled).toBe(false)
  vi.useRealTimers()

  await waitFor(async () => expect(await getAttempts(['fret:natural:s2'])).toHaveLength(1))
  const [a] = await getAttempts(['fret:natural:s2'])
  expect(a!.prompt).toBe('s2f' + fret)
  expect(a!.correct).toBe(false)
})

test('ReverseNote: a second tap during feedback is ignored', async () => {
  const { container } = render(<ReverseNote mode="natural" strings={[6]} spelling="auto" />)
  const fret = await waitForPrompt(container, 6)
  const pc = noteAt(5, fret)
  fireEvent.click(padButton(pc))
  fireEvent.click(padButton(wrongPc(pc)))
  await waitFor(async () => expect(await getAttempts(['fret:natural:s6'])).toHaveLength(1))
  await new Promise((r) => setTimeout(r, 50))
  expect(await getAttempts(['fret:natural:s6'])).toHaveLength(1)
})

test('ReverseNote: unmount writes the skill via putSkill with lastReviewed set', async () => {
  expect(await getSkill('fret:natural:s3')).toBeUndefined()
  const before = Date.now()
  const { container, unmount } = render(<ReverseNote mode="natural" strings={[3]} spelling="auto" />)
  const fret = await waitForPrompt(container, 3)
  fireEvent.click(padButton(noteAt(2, fret)))
  unmount()

  await waitFor(async () => expect(await getSkill('fret:natural:s3')).toBeDefined())
  const skill = (await getSkill('fret:natural:s3'))!
  expect(skill.id).toBe('fret:natural:s3')
  expect(skill.lastReviewed).not.toBe(null)
  expect(skill.lastReviewed!).toBeGreaterThanOrEqual(before)
  expect(skill.mastery).toBeGreaterThan(0)
  expect(skill.box).toBe(1) // 1/1 correct promotes from box 0
})

test('ReverseNote: unmount without any attempt writes no skill', async () => {
  const { container, unmount } = render(<ReverseNote mode="chromatic" strings={[3]} spelling="auto" />)
  await waitForPrompt(container, 3)
  unmount()
  await new Promise((r) => setTimeout(r, 50))
  expect(await getSkill('fret:chromatic:s3')).toBeUndefined()
})

test('ReverseNote: input is ignored while paused, accepted after resume', async () => {
  const { container, rerender } = render(<ReverseNote mode="natural" strings={[4]} spelling="auto" paused />)
  const fret = await waitForPrompt(container, 4)
  const pc = noteAt(3, fret)
  const btn = padButton(pc) as HTMLButtonElement
  expect(btn.disabled).toBe(true)
  fireEvent.click(btn)
  await new Promise((r) => setTimeout(r, 50))
  expect(promptFret(container, 4)).toBe(fret)
  expect(await getAttempts(['fret:natural:s4'])).toHaveLength(0)

  rerender(<ReverseNote mode="natural" strings={[4]} spelling="auto" paused={false} />)
  fireEvent.click(padButton(pc))
  await waitFor(async () => expect(await getAttempts(['fret:natural:s4'])).toHaveLength(1))
  expect((await getAttempts(['fret:natural:s4']))[0]!.correct).toBe(true)
})

test('NoteOnString: Got it / Missed record attempts with key {pc}:s{n} and skill fret:natural:s{n}', async () => {
  const items = noteOnStringItems('natural', [5])
  const shown = () => {
    const label = document.querySelector('.drill-note')!.textContent
    return items.find((i) => noteLabel(i.pc, 'auto') === label)!
  }

  const { unmount } = render(<NoteOnString mode="natural" strings={[5]} spelling="auto" />)
  await waitFor(() => expect(screen.getByText('string 5')).toBeTruthy())
  const first = shown()
  // Fake timers only after IndexedDB has loaded (waitFor polls with real timers).
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  fireEvent.click(screen.getByRole('button', { name: 'Got it' }))
  expect((screen.getByRole('button', { name: 'Missed' }) as HTMLButtonElement).disabled).toBe(true)

  act(() => vi.advanceTimersByTime(700))
  const second = shown()
  expect(second.key).not.toBe(first.key)
  fireEvent.click(screen.getByRole('button', { name: 'Missed' }))
  vi.useRealTimers()

  await waitFor(async () => expect(await getAttempts(['fret:natural:s5'])).toHaveLength(2))
  const logged = await getAttempts(['fret:natural:s5'])
  expect(logged.map((a) => [a.skillId, a.drill, a.prompt, a.correct])).toEqual([
    ['fret:natural:s5', 'fret-note-on-string', first.key, true],
    ['fret:natural:s5', 'fret-note-on-string', second.key, false],
  ])
  expect(first.key).toBe(first.pc + ':s5')

  unmount()
  await waitFor(async () => expect((await getSkill('fret:natural:s5'))?.lastReviewed).toBeGreaterThan(0))
  expect((await getSkill('fret:natural:s5'))!.box).toBe(0) // 50% run accuracy resets to box 0
})

test('page hidden flushes the run to the skill without unmounting', async () => {
  const { container } = render(<ReverseNote mode="chromatic" strings={[1]} spelling="auto" />)
  const fret = await waitForPrompt(container, 1)
  fireEvent.click(screen.getByRole('button', { name: enharmonicLabel(noteAt(0, fret), 'auto') }))
  expect(await getSkill('fret:chromatic:s1')).toBeUndefined()

  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })

  await waitFor(async () => expect((await getSkill('fret:chromatic:s1'))?.lastReviewed).toBeGreaterThan(0))
  expect((await getSkill('fret:chromatic:s1'))!.box).toBe(1)
})
