import { useMemo, useState } from 'react'
import { MAJOR_KEYS, chordName, keysContaining, noteName, notesEqual, numeralInKey, type Chord } from '../music'
import { keysOfChordItems } from './theoryItems'
import { REVEAL_MS, gradeClass, useDrillLoop, type TheoryDrillProps } from './useDrillRun'
import '../components/components.css'
import './drills.css'

interface BodyProps {
  chord: Chord
  graded: boolean | null
  locked: boolean
  answer: (correct: boolean) => void
}

// 5.2: which major keys contain a triad? Multi-select, then Submit.
// Correct iff the selection equals keysContaining(chord) exactly.
export function KeysOfChord({ paused, onAnswer, onItemDone }: TheoryDrillProps) {
  const items = useMemo(() => keysOfChordItems(), [])
  const { item, graded, answer } = useDrillLoop('keys-of-chord', items, paused, onAnswer, REVEAL_MS, onItemDone)
  if (!item) return <div className="drill" />
  return <KeysBody key={item.key} chord={item.chord} graded={graded} locked={paused || graded !== null} answer={answer} />
}

// Keyed by item, so the selection starts empty for each chord.
function KeysBody({ chord, graded, locked, answer }: BodyProps) {
  const [picked, setPicked] = useState<number[]>([]) // indexes into MAJOR_KEYS
  const right = keysContaining(chord)
  const isRight = (i: number) => right.some((k) => notesEqual(k, MAJOR_KEYS[i]!))

  function toggle(i: number) {
    setPicked(picked.includes(i) ? picked.filter((p) => p !== i) : [...picked, i])
  }

  function submit() {
    answer(picked.length === right.length && picked.every(isRight))
  }

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-q">Which major keys contain</div>
        <div className={'drill-title ' + gradeClass(graded)}>{chordName(chord)}</div>
      </div>
      <div className="drill-grid drill-grid-5">
        {MAJOR_KEYS.map((key, i) => {
          const on = picked.includes(i)
          let cls = 'pad-btn drill-key' + (on ? ' pad-on' : '')
          if (graded !== null && isRight(i)) cls += ' drill-key-right'
          else if (graded !== null && on) cls += ' drill-key-wrong'
          return (
            <button key={i} type="button" className={cls} aria-pressed={on} disabled={locked} onClick={() => toggle(i)}>
              {noteName(key)}
              {graded !== null && isRight(i) && <span className="drill-key-num">{numeralInKey(key, chord) ?? ''}</span>}
            </button>
          )
        })}
      </div>
      <button type="button" className="drill-submit" disabled={locked} onClick={submit}>
        Submit
      </button>
    </div>
  )
}
