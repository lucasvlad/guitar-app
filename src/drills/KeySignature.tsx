import { useMemo, useState } from 'react'
import { keySignature, noteName, notesEqual, type Note } from '../music'
import { SpellPad } from '../components/SpellPad'
import { keySigItems } from './theoryItems'
import { REVEAL_MS, gradeClass, useDrillLoop, type TheoryDrillProps } from './useDrillRun'
import '../components/components.css'
import './drills.css'

// -7..7: negative = flats, positive = sharps.
const COUNTS = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7]

function countLabel(count: number): string {
  if (count === 0) return '0'
  return Math.abs(count) + (count < 0 ? '♭' : '♯')
}

interface BodyProps {
  root: Note
  graded: boolean | null
  locked: boolean
  answer: (correct: boolean) => void
}

// 5.2: how many sharps or flats, then (if any) which ones in signature order.
// One attempt per key: correct iff the count and every note are right.
// A wrong count or the first wrong note ends the item and reveals the signature.
export function KeySignature({ paused, onAnswer, onItemDone }: TheoryDrillProps) {
  const items = useMemo(() => keySigItems(), [])
  const { item, graded, answer } = useDrillLoop('key-signature', items, paused, onAnswer, REVEAL_MS, onItemDone)
  if (!item) return <div className="drill" />
  return <KeySigBody key={item.key} root={item.root} graded={graded} locked={paused || graded !== null} answer={answer} />
}

// Keyed by item, so each key starts at the count step.
function KeySigBody({ root, graded, locked, answer }: BodyProps) {
  const [counted, setCounted] = useState(false) // count answered correctly; now naming the notes
  const [typed, setTyped] = useState<Note[]>([])
  const sig = keySignature(root)

  function pickCount(c: number) {
    if (c !== sig.count) answer(false)
    else if (c === 0) answer(true)
    else setCounted(true)
  }

  function tap(n: Note) {
    const done = [...typed, n]
    setTyped(done)
    if (!notesEqual(n, sig.notes[typed.length]!)) answer(false)
    else if (done.length === sig.notes.length) answer(true)
  }

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-title">{noteName(root)} major</div>
        <div className="drill-q">{counted ? 'Which ones, in order?' : 'how many sharps or flats?'}</div>
        <div className={'drill-answer ' + gradeClass(graded)}>{graded === null && !counted ? '?' : countLabel(sig.count)}</div>
        <div className="drill-sub">{graded === false ? sig.notes.map(noteName).join(' ') || 'none' : ' '}</div>
      </div>
      {counted ? (
        <>
          <div className="drill-seq">
            {sig.notes.map((note, i) => {
              const t = typed[i]
              const cls = !t ? '' : notesEqual(t, note) ? ' drill-right' : ' drill-wrong'
              return (
                <span key={i} className={'drill-cell' + cls}>
                  {t ? noteName(t) : '·'}
                </span>
              )
            })}
          </div>
          <SpellPad onAnswer={tap} disabled={locked} />
        </>
      ) : (
        <div className="drill-grid drill-grid-5">
          {COUNTS.map((c) => (
            <button key={c} type="button" className="pad-btn" disabled={locked} onClick={() => pickCount(c)}>
              {countLabel(c)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
