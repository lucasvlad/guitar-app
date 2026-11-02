import { useMemo } from 'react'
import { Fretboard } from '../components/Fretboard'
import { GradeButtons } from '../components/GradeButtons'
import { noteLabel } from './items'
import { octaveItems, stringMove } from './navItems'
import { useDrillLoop, type FretDrillProps } from './useDrillRun'
import './drills.css'
import './nav.css'

// 5.1 item 6: find the same note (octave or unison) one or two strings up or down.
export function OctaveFinder({ mode, strings, spelling, paused, onAnswer }: FretDrillProps) {
  const items = useMemo(() => octaveItems(mode, strings), [mode, strings.join(',')])
  const { item, graded, answer } = useDrillLoop('octave-finder', items, paused, onAnswer)
  if (!item) return <div className="drill" />

  const label = noteLabel(item.pc, spelling)
  const color = graded ? 'correct' : 'wrong'
  const start = { stringIndex: item.stringNum - 1, fret: item.fret, color: 'prompt', label } as const
  const revealed = graded === null ? [] : item.targets.map((t) => ({ ...t, color, label }) as const)

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="nav-ask">Same note {stringMove(item.stringNum, item.targetString)}</div>
        <div className="drill-sub">on string {item.targetString}</div>
      </div>
      <Fretboard highlights={[start, ...revealed]} activeStrings={[item.stringNum, item.targetString]} />
      <GradeButtons onAnswer={answer} disabled={paused || graded !== null} />
    </div>
  )
}
