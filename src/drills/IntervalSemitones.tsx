import { useMemo } from 'react'
import { NumberPad } from '../components/NumberPad'
import { semitonesItems } from './theoryItems'
import { THEORY_MISS_MS, gradeClass, useDrillLoop, type TheoryDrillProps } from './useDrillRun'
import './drills.css'

// 5.2: semitone count of a named interval.
export function IntervalSemitones({ paused, onAnswer, onItemDone }: TheoryDrillProps) {
  const items = useMemo(() => semitonesItems(), [])
  const { item, graded, answer } = useDrillLoop('interval-semitones', items, paused, onAnswer, THEORY_MISS_MS, onItemDone)
  if (!item) return <div className="drill" />

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-title">{item.interval.label}</div>
        <div className={'drill-answer ' + gradeClass(graded)}>{graded === null ? '?' : item.interval.semitones}</div>
        <div className="drill-q">semitones</div>
      </div>
      <NumberPad onAnswer={(n) => answer(n === item.interval.semitones)} disabled={paused || graded !== null} />
    </div>
  )
}
