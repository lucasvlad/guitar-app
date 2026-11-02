import { useMemo } from 'react'
import { MAX_FRET } from '../music'
import { Fretboard } from '../components/Fretboard'
import { GradeButtons } from '../components/GradeButtons'
import { allStringsItems, locations, noteLabel } from './items'
import { useDrillLoop, type FretDrillProps } from './useDrillRun'
import './drills.css'

// 5.1 item 1: find the note on all six strings. Ignores the string subset by design.
const ALL_STRINGS = [1, 2, 3, 4, 5, 6]

export function FindAllStrings({ mode, spelling, paused, onAnswer }: FretDrillProps) {
  const items = useMemo(() => allStringsItems(mode), [mode])
  const { item, graded, answer } = useDrillLoop('fret-all-strings', items, paused, onAnswer)
  if (!item) return <div className="drill" />

  const label = noteLabel(item.pc, spelling)
  const color = graded ? 'correct' : 'wrong'
  const highlights =
    graded === null ? [] : locations(item.pc, ALL_STRINGS, 0, MAX_FRET).map((l) => ({ ...l, color, label }) as const)

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-note">{label}</div>
        <div className="drill-sub">on every string</div>
      </div>
      <Fretboard highlights={highlights} />
      <GradeButtons onAnswer={answer} disabled={paused || graded !== null} />
    </div>
  )
}
