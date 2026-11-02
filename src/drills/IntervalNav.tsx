import { useMemo } from 'react'
import { noteName, readableSpelling, spellPitchClass, transpose } from '../music'
import { Fretboard } from '../components/Fretboard'
import { GradeButtons } from '../components/GradeButtons'
import { noteLabel } from './items'
import { intervalNavItems } from './navItems'
import { useDrillLoop, type FretDrillProps } from './useDrillRun'
import './drills.css'
import './nav.css'

// 5.1 item 5: from a highlighted note, find an interval on a nearby string without counting from the nut.
export function IntervalNav({ mode, strings, spelling, paused, onAnswer }: FretDrillProps) {
  const items = useMemo(() => intervalNavItems(mode, strings), [mode, strings.join(',')])
  const { item, graded, answer } = useDrillLoop('interval-nav', items, paused, onAnswer)
  if (items.length === 0) {
    return (
      <div className="drill">
        <div className="drill-prompt drill-sub">Select more strings</div>
      </div>
    )
  }
  if (!item) return <div className="drill" />

  const startLabel = noteLabel(item.pc, spelling)
  const targetLabel = noteName(readableSpelling(transpose(spellPitchClass(item.pc, spelling), item.interval.name)))
  const color = graded ? 'correct' : 'wrong'
  const start = { stringIndex: item.stringNum - 1, fret: item.fret, color: 'prompt', label: startLabel } as const
  const revealed = graded === null ? [] : item.targets.map((t) => ({ ...t, color, label: targetLabel }) as const)

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="nav-ask">{item.interval.label} above</div>
        <div className="drill-sub">on string {item.targetString}</div>
        <div className="nav-hint">no counting from the nut</div>
      </div>
      <Fretboard highlights={[start, ...revealed]} activeStrings={[item.stringNum, item.targetString]} />
      <GradeButtons onAnswer={answer} disabled={paused || graded !== null} />
    </div>
  )
}
