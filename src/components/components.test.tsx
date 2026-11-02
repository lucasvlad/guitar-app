import { expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Fretboard } from './Fretboard'
import { NotePad } from './NotePad'

function count(html: string, part: string): number {
  return html.split(part).length - 1
}

test('fretboard renders 6 strings x 13 frets and highlights', () => {
  const html = renderToStaticMarkup(
    <Fretboard highlights={[{ stringIndex: 5, fret: 3, color: 'prompt', label: 'G' }]} activeStrings={[1]} />,
  )
  expect(count(html, '<button')).toBe(78)
  expect(count(html, 'fb-prompt')).toBe(1)
  expect(count(html, 'fb-dim')).toBe(65)
})

test('notepad shows 7 natural and 12 chromatic buttons', () => {
  const label = (pc: number) => 'pc' + pc
  const noop = () => {}
  expect(count(renderToStaticMarkup(<NotePad mode="natural" labelFor={label} onAnswer={noop} />), '<button')).toBe(7)
  expect(count(renderToStaticMarkup(<NotePad mode="chromatic" labelFor={label} onAnswer={noop} />), '<button')).toBe(12)
})
