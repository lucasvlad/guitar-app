// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { afterEach, expect, test, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SessionTimer } from './SessionTimer'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

// Renders the session and waits for block 1 (Note on string) to load from IndexedDB.
// Only Date and the tick interval are faked: setTimeout stays real because
// waitFor polls with it and the drills' IndexedDB loads need it.
async function start() {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
  render(<SessionTimer mode="natural" strings={[1]} spelling="auto" onExit={() => {}} />)
  await waitFor(() => expect(screen.getByText('string 1')).toBeTruthy())
}

function time(): string {
  return document.querySelector('.session-time')!.textContent!
}

function title(): string {
  return document.querySelector('.session-title')!.textContent!
}

test('advancing 3:00 moves to block 2', async () => {
  await start()
  expect(title()).toBe('1/4 Note on string')
  act(() => vi.advanceTimersByTime(3 * 60 * 1000))
  expect(title()).toBe('2/4 Reverse')
  expect(time()).toBe('3:00')
})

test('pausing for 60 s leaves the remaining time unchanged', async () => {
  await start()
  act(() => vi.advanceTimersByTime(10 * 1000))
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
  const before = time()
  act(() => vi.advanceTimersByTime(60 * 1000))
  expect(time()).toBe(before)
  expect(before).toBe('2:50')
  fireEvent.click(screen.getAllByRole('button', { name: 'Resume' })[0]!)
  act(() => vi.advanceTimersByTime(1000))
  expect(time()).toBe('2:49')
})

test('jumping 10+ minutes ahead shows the summary', async () => {
  await start()
  act(() => {
    vi.setSystemTime(Date.now() + 11 * 60 * 1000)
    vi.advanceTimersByTime(250)
  })
  expect(screen.getByText('Session done')).toBeTruthy()
})

test('Skip on the last block shows the summary', async () => {
  await start()
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
  expect(title()).toBe('4/4 All strings')
  fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
  expect(screen.getByText('Session done')).toBeTruthy()
})

test('hiding the page pauses the session; Resume continues from the same time', async () => {
  await start()
  act(() => vi.advanceTimersByTime(5 * 1000))
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  expect(title()).toBe('Paused')
  act(() => vi.advanceTimersByTime(60 * 1000))
  document.dispatchEvent(new Event('visibilitychange'))
  expect(title()).toBe('Paused')
  expect(time()).toBe('2:55')
  fireEvent.click(screen.getAllByRole('button', { name: 'Resume' })[0]!)
  act(() => vi.advanceTimersByTime(1000))
  expect(time()).toBe('2:54')
})
