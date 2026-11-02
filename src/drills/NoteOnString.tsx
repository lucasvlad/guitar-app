import { useMemo } from 'react'
import { MAX_FRET } from '../music'
import { Fretboard } from '../components/Fretboard'
import { GradeButtons } from '../components/GradeButtons'
import { locations, noteLabel, noteOnStringItems } from './items'
import { useDrillLoop, type FretDrillProps } from './useDrillRun'
import './drills.css'

// 5.1 item 2: find the note on one string.
export function NoteOnString({ mode, strings, spelling, paused, onAnswer }: FretDrillProps) {
  const items = useMemo(() => noteOnStringItems(mode, strings), [mode, strings.join(',')])
  const { item, graded, answer } = useDrillLoop('fret-note-on-string', items, paused, onAnswer)
  if (!item) return <div className="drill" />

  const label = noteLabel(item.pc, spelling)
  const color = graded ? 'correct' : 'wrong'
  const highlights =
    graded === null ? [] : locations(item.pc, [item.stringNum], 0, MAX_FRET).map((l) => ({ ...l, color, label }) as const)

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-note">{label}</div>
        <div className="drill-sub">string {item.stringNum}</div>
      </div>
      <Fretboard highlights={highlights} activeStrings={[item.stringNum]} />
      <GradeButtons onAnswer={answer} disabled={paused || graded !== null} />
    </div>
  )
}
