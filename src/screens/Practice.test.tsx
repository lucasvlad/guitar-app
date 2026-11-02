// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Practice, type PracticeTarget } from './Practice'

afterEach(cleanup)

test('Start session comes first, then Fretboard, Theory and Reference sections', () => {
  const opened: PracticeTarget[] = []
  render(<Practice settings={{ spelling: 'auto', fretMode: 'natural', strings: [1] }} onChange={() => {}} onOpen={(s) => opened.push(s)} />)
  const buttons = screen.getAllByRole('button')
  expect(buttons[0]!.textContent).toContain('Start session')
  const labels = [...document.querySelectorAll('.section-label')].map((e) => e.textContent)
  expect(labels.slice(0, 3)).toEqual(['Fretboard', 'Theory', 'Reference'])
  expect(document.querySelectorAll('.list-btn').length).toBe(6 + 8 + 1)
  fireEvent.click(screen.getByRole('button', { name: 'Octave finder' }))
  fireEvent.click(screen.getByRole('button', { name: 'Spell the scale' }))
  fireEvent.click(screen.getByRole('button', { name: 'Key Explorer' }))
  expect(opened).toEqual(['octave-finder', 'scale-spell', 'key-explorer'])
})
