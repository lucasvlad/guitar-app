import { useMemo } from 'react'
import { Fretboard } from '../components/Fretboard'
import { GradeButtons } from '../components/GradeButtons'
import { locations, neighborhoodItems, neighborhoodWindow, noteLabel } from './items'
import { useDrillLoop, type FretDrillProps } from './useDrillRun'
import './drills.css'

// 5.1 item 3: every location of the note within 5 frets of the anchor.
export function Neighborhood({ mode, strings, spelling, paused, onAnswer }: FretDrillProps) {
  const items = useMemo(() => neighborhoodItems(mode, strings), [mode, strings.join(',')])
  const { item, graded, answer } = useDrillLoop('fret-neighborhood', items, paused, onAnswer)
  if (!item) return <div className="drill" />

  const label = noteLabel(item.pc, spelling)
  const { min, max } = neighborhoodWindow(item.anchor)
  const color = graded ? 'correct' : 'wrong'
  const highlights =
    graded === null ? [] : locations(item.pc, strings, min, max).map((l) => ({ ...l, color, label }) as const)

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-note">{label}</div>
        <div className="drill-sub">frets {min}–{max}</div>
      </div>
      <Fretboard highlights={highlights} activeStrings={strings} anchorFret={item.anchor} />
      <GradeButtons onAnswer={answer} disabled={paused || graded !== null} />
    </div>
  )
}
