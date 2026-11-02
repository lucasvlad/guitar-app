// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SpellPad } from './SpellPad'
import { ChordPad } from './ChordPad'
import { NumeralPad } from './NumeralPad'
import { NumberPad } from './NumberPad'

afterEach(cleanup)

const tap = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

test('spellpad: 3 accidentals + 7 letters; accidental is sticky then resets to natural', () => {
  const onAnswer = vi.fn()
  render(<SpellPad onAnswer={onAnswer} />)
  expect(screen.getAllByRole('button')).toHaveLength(10)
  expect(screen.getByRole('button', { name: '♮' }).getAttribute('aria-pressed')).toBe('true')
  tap('♯')
  tap('F')
  expect(onAnswer).toHaveBeenLastCalledWith({ letter: 'F', accidental: 1 })
  expect(screen.getByRole('button', { name: '♮' }).getAttribute('aria-pressed')).toBe('true')
  tap('B')
  expect(onAnswer).toHaveBeenLastCalledWith({ letter: 'B', accidental: 0 })
})

test('chordpad: root then quality, root can be re-picked', () => {
  const onAnswer = vi.fn()
  render(<ChordPad qualities={['maj', 'min', 'dim']} onAnswer={onAnswer} />)
  expect(screen.getAllByRole('button')).toHaveLength(13)
  expect(screen.getByRole('button', { name: 'm' })).toHaveProperty('disabled', true)
  tap('G')
  tap('♯')
  tap('F')
  expect(screen.getByText('F♯ …')).toBeTruthy()
  tap('F♯m')
  expect(onAnswer).toHaveBeenCalledOnce()
  expect(onAnswer).toHaveBeenCalledWith({ root: { letter: 'F', accidental: 1 }, quality: 'min' })
  expect(screen.getByText('Root?')).toBeTruthy()
})

test('numeralpad: degree then quality shows the numeral and submits', () => {
  const onAnswer = vi.fn()
  render(<NumeralPad qualities={['maj', 'min', 'dim', '7']} onAnswer={onAnswer} />)
  expect(screen.getAllByRole('button')).toHaveLength(11)
  tap('II')
  expect(screen.getByRole('button', { name: 'ii' })).toBeTruthy()
  tap('V')
  tap('V7')
  expect(onAnswer).toHaveBeenCalledOnce()
  expect(onAnswer).toHaveBeenCalledWith(5, '7')
})

test('numberpad: 13 buttons 0-12', () => {
  const onAnswer = vi.fn()
  render(<NumberPad onAnswer={onAnswer} />)
  expect(screen.getAllByRole('button')).toHaveLength(13)
  tap('7')
  expect(onAnswer).toHaveBeenCalledWith(7)
})

test('disabled pads disable every button', () => {
  render(<NumberPad onAnswer={() => {}} disabled />)
  render(<SpellPad onAnswer={() => {}} disabled />)
  for (const b of screen.getAllByRole('button')) expect(b).toHaveProperty('disabled', true)
})
