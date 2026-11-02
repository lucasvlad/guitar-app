import { useMemo, useState } from 'react'
import { majorScale, noteName, notesEqual, type Note } from '../music'
import { SpellPad } from '../components/SpellPad'
import { scaleItems } from './theoryItems'
import { REVEAL_MS, useDrillLoop, type TheoryDrillProps } from './useDrillRun'
import './drills.css'

interface BodyProps {
  root: Note
  graded: boolean | null
  locked: boolean
  answer: (correct: boolean) => void
}

// 5.2: spell a major scale note by note. The first wrong note ends the item.
// One attempt per scale, timed over the whole scale.
export function ScaleSpell({ paused, onAnswer, onItemDone }: TheoryDrillProps) {
  const items = useMemo(() => scaleItems(), [])
  const { item, graded, answer } = useDrillLoop('scale-spell', items, paused, onAnswer, REVEAL_MS, onItemDone)
  if (!item) return <div className="drill" />
  return <ScaleBody key={item.key} root={item.root} graded={graded} locked={paused || graded !== null} answer={answer} />
}

// Keyed by item, so the typed notes start empty for each scale.
function ScaleBody({ root, graded, locked, answer }: BodyProps) {
  const [typed, setTyped] = useState<Note[]>([])
  const scale = majorScale(root)

  function tap(n: Note) {
    const done = [...typed, n]
    setTyped(done)
    if (!notesEqual(n, scale[typed.length]!)) answer(false)
    else if (done.length === scale.length) answer(true)
  }

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-q">Spell</div>
        <div className="drill-title">{noteName(root)} major</div>
      </div>
      <div className="drill-seq">
        {scale.map((note, i) => {
          const t = typed[i]
          const cls = !t ? '' : notesEqual(t, note) ? ' drill-right' : ' drill-wrong'
          return (
            <span key={i} className={'drill-cell' + cls}>
              {t ? noteName(t) : '·'}
            </span>
          )
        })}
      </div>
      {graded === false && (
        <div className="drill-seq drill-reveal">
          {scale.map((note, i) => (
            <span key={i} className="drill-cell drill-right">
              {noteName(note)}
            </span>
          ))}
        </div>
      )}
      <SpellPad onAnswer={tap} disabled={locked} />
    </div>
  )
}
