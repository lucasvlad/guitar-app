// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getAttempts } from '../data/db'
import { FRET_INTNAV, FRET_OCTAVE } from '../mastery/skills'
import { IntervalNav } from './IntervalNav'
import { OctaveFinder } from './OctaveFinder'

afterEach(cleanup)

async function gotIt(container: HTMLElement) {
  await waitFor(() => expect(container.querySelector('.fb-prompt')).not.toBe(null))
  expect(container.querySelectorAll('.fb-correct')).toHaveLength(0)
  fireEvent.click(screen.getByRole('button', { name: 'Got it' }))
  expect(container.querySelectorAll('.fb-correct').length).toBeGreaterThan(0) // targets revealed
}

test('IntervalNav: Got it logs a fret:intnav attempt', async () => {
  const { container } = render(<IntervalNav mode="natural" strings={[3]} spelling="auto" />)
  await gotIt(container)
  await waitFor(async () => expect(await getAttempts([FRET_INTNAV])).toHaveLength(1))
  const [a] = await getAttempts([FRET_INTNAV])
  expect(a!.drill).toBe('interval-nav')
  expect(a!.correct).toBe(true)
  expect(a!.prompt.startsWith('s3f')).toBe(true)
})

test('IntervalNav: with only string 1 selected it asks for more strings', async () => {
  render(<IntervalNav mode="natural" strings={[1]} spelling="auto" />)
  expect(screen.getByText('Select more strings')).toBeTruthy()
})

test('OctaveFinder: Got it logs a fret:octave attempt', async () => {
  const { container } = render(<OctaveFinder mode="chromatic" strings={[5]} spelling="auto" />)
  await gotIt(container)
  await waitFor(async () => expect(await getAttempts([FRET_OCTAVE])).toHaveLength(1))
  const [a] = await getAttempts([FRET_OCTAVE])
  expect(a!.drill).toBe('octave-finder')
  expect(a!.correct).toBe(true)
  expect(a!.prompt.startsWith('s5f')).toBe(true)
})
