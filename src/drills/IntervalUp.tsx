import { useMemo } from 'react'
import { noteName, notesEqual } from '../music'
import { SpellPad } from '../components/SpellPad'
import { intervalUpItems } from './theoryItems'
import { THEORY_MISS_MS, gradeClass, useDrillLoop, type TheoryDrillProps } from './useDrillRun'
import './drills.css'

// 5.2: name the note an interval above a root. Graded by spelling (letter + accidental).
export function IntervalUp({ paused, onAnswer, onItemDone }: TheoryDrillProps) {
  const items = useMemo(() => intervalUpItems(), [])
  const { item, graded, answer } = useDrillLoop('interval-up', items, paused, onAnswer, THEORY_MISS_MS, onItemDone)
  if (!item) return <div className="drill" />

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-q">{item.interval.label} above</div>
        <div className="drill-title">{noteName(item.root)}</div>
        <div className={'drill-answer ' + gradeClass(graded)}>{graded === null ? '?' : noteName(item.answer)}</div>
      </div>
      <SpellPad onAnswer={(n) => answer(notesEqual(n, item.answer))} disabled={paused || graded !== null} />
    </div>
  )
}
