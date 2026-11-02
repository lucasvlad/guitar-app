import { useMemo, useState } from 'react'
import { chordName, diatonicTriads, noteName, notesEqual, type ChordQuality, type Note } from '../music'
import { ChordPad } from '../components/ChordPad'
import { StepCells } from './StepCells'
import { diatonicItems } from './theoryItems'
import { REVEAL_MS, useDrillLoop, type TheoryDrillProps } from './useDrillRun'
import './drills.css'

const QUALITIES: ChordQuality[] = ['maj', 'min', 'dim']
const DEGREES = ['1', '2', '3', '4', '5', '6', '7'] // neutral labels: numerals would give away the quality

interface BodyProps {
  root: Note
  locked: boolean
  answer: (correct: boolean, units: number) => void
}

// 5.2: given a key, name all seven diatonic triads in order. A wrong chord shows
// the right one in red and moves on. One attempt per key (correct iff all 7 right),
// logged as ms per chord.
export function DiatonicChords({ paused, onAnswer, onItemDone }: TheoryDrillProps) {
  const items = useMemo(() => diatonicItems(), [])
  const { item, graded, answer } = useDrillLoop('diatonic-chords', items, paused, onAnswer, REVEAL_MS, onItemDone)
  if (!item) return <div className="drill" />
  return <DiatonicBody key={item.key} root={item.root} locked={paused || graded !== null} answer={answer} />
}

// Keyed by item, so the entered results start empty for each key.
function DiatonicBody({ root, locked, answer }: BodyProps) {
  const [results, setResults] = useState<boolean[]>([])
  const triads = diatonicTriads(root)

  function enter(correct: boolean) {
    if (locked || results.length >= triads.length) return
    const done = [...results, correct]
    setResults(done)
    if (done.length === triads.length) answer(done.every(Boolean), triads.length)
  }

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-title">Key of {noteName(root)}</div>
        <div className="drill-q">name the 7 triads</div>
      </div>
      <StepCells given={DEGREES} wanted={triads.map(chordName)} results={results} />
      <ChordPad
        qualities={QUALITIES}
        onAnswer={(c) => {
          const want = triads[results.length]
          enter(!!want && c.quality === want.quality && notesEqual(c.root, want.root))
        }}
        disabled={locked}
      />
    </div>
  )
}
