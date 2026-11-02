// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { KeyExplorer } from './KeyExplorer'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

test('defaults to C major with the scale on the fretboard', () => {
  render(<KeyExplorer onBack={() => {}} />)
  expect(screen.getByText('C major')).toBeTruthy()
  expect(screen.getByText('C D E F G A B')).toBeTruthy()
  expect(document.querySelectorAll('.fb-prompt').length).toBe(6) // one C per string
})

test('choosing A shows F♯m and A F♯m D E, and is remembered', () => {
  render(<KeyExplorer onBack={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: 'A' }))
  expect(screen.getByText('A major')).toBeTruthy()
  expect(screen.getByText('3 sharps: F♯ C♯ G♯')).toBeTruthy()
  expect(document.querySelector('.ke-fact:nth-child(3) span:last-child')!.textContent).toBe('F♯m')
  const stand = screen.getByText('I–vi–IV–V (Stand By Me style)').parentElement!
  expect(stand.querySelector('.ke-prog-chords')!.textContent).toBe('A F♯m D E')
  cleanup()
  render(<KeyExplorer onBack={() => {}} />)
  expect(screen.getByText('A major')).toBeTruthy()
})

test('label toggle switches to intervals and degrees', () => {
  render(<KeyExplorer onBack={() => {}} />)
  const rootLabel = () => document.querySelector('.fb-prompt')!.textContent
  expect(rootLabel()).toBe('C')
  fireEvent.click(screen.getByRole('button', { name: 'Intervals' }))
  expect(rootLabel()).toBe('1')
  expect(screen.getAllByText('M7').length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Degrees' }))
  const labels = [...document.querySelectorAll('.fb-hl')].map((el) => el.textContent)
  expect(new Set(labels)).toEqual(new Set(['1', '2', '3', '4', '5', '6', '7']))
})
