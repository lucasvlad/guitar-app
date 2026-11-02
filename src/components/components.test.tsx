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
  expect(count(html, 'fb-cell fb-dim')).toBe(60)
  expect(count(html, 'fb-cell fb-open fb-dim')).toBe(5)
  expect(count(html, 'fb-name fb-dim')).toBe(5)
  expect(count(html, 'fb-dot')).toBe(6) // 3, 5, 7, 9 and two at 12
})

test('fretboard reads like tab: high e on top, nut left, frets 0-12 left to right', () => {
  const html = renderToStaticMarkup(<Fretboard highlights={[]} anchorFret={5} />)
  // String names top to bottom.
  const names = html.split('class="fb-name"').slice(1).map((part) => part.split('>')[1]!.split('<')[0])
  expect(names).toEqual(['e', 'B', 'G', 'D', 'A', 'E'])
  // First cell is string 1 open, in the column left of the nut; the last is string 6 fret 12.
  expect(html.indexOf('String 1 fret 0')).toBeLessThan(html.indexOf('String 1 fret 12'))
  expect(html.indexOf('String 1 fret 12')).toBeLessThan(html.indexOf('String 6 fret 0'))
  expect(html).toContain('class="fb-cell fb-open" style="grid-row:1;grid-column:2"')
  expect(html).toContain('style="grid-row:6;grid-column:14" disabled="" aria-label="String 6 fret 12"')
  expect(count(html, 'fb-anchor"')).toBe(1)
  expect(count(html, 'fb-fretnum-anchor')).toBe(1)
})

test('notepad shows 7 natural and 12 chromatic buttons', () => {
  const label = (pc: number) => 'pc' + pc
  const noop = () => {}
  expect(count(renderToStaticMarkup(<NotePad mode="natural" labelFor={label} onAnswer={noop} />), '<button')).toBe(7)
  expect(count(renderToStaticMarkup(<NotePad mode="chromatic" labelFor={label} onAnswer={noop} />), '<button')).toBe(12)
})
