import { useMemo, useState } from 'react'
import { chordName, noteName, notesEqual, progressionChords, progressionNumerals, type Note, type Progression } from '../music'
import { ChordPad } from '../components/ChordPad'
import { NumeralPad } from '../components/NumeralPad'
import { StepCells } from './StepCells'
import { progressionItems, progressionQualities } from './theoryItems'
import { REVEAL_MS, useDrillLoop, type TheoryDrillProps } from './useDrillRun'
import './drills.css'

type Direction = 'chords' | 'numerals'

interface TransposerProps extends TheoryDrillProps {
  direction: Direction
}

interface BodyProps {
  direction: Direction
  root: Note
  progression: Progression
  locked: boolean
  answer: (correct: boolean, units: number) => void
}

// 5.2 transposer: numerals -> chord names in a random key, or the reverse.
// Chords are entered in order; a miss shows the right answer in its cell and moves on.
// One attempt per progression (correct iff every chord is right), logged as ms per chord.
function Transposer({ direction, paused, onAnswer, onItemDone }: TransposerProps) {
  const items = useMemo(() => progressionItems(direction), [direction])
  const drill = direction === 'chords' ? 'transpose-to-chords' : 'transpose-to-numerals'
  const { item, graded, answer } = useDrillLoop(drill, items, paused, onAnswer, REVEAL_MS, onItemDone)
  if (!item) return <div className="drill" />
  return (
    <TransposerBody
      key={item.key}
      direction={direction}
      root={item.root}
      progression={item.progression}
      locked={paused || graded !== null}
      answer={answer}
    />
  )
}

// Keyed by item, so the entered results start empty for each progression.
function TransposerBody({ direction, root, progression, locked, answer }: BodyProps) {
  const [results, setResults] = useState<boolean[]>([]) // one per chord entered
  const toChords = direction === 'chords'
  const chords = progressionChords(root, progression)
  const numerals = progressionNumerals(progression)
  const qualities = progressionQualities(progression)
  const i = results.length
  const target = progression.steps[i]

  function enter(correct: boolean) {
    if (locked || i >= chords.length) return
    const done = [...results, correct]
    setResults(done)
    if (done.length === chords.length) answer(done.every(Boolean), chords.length)
  }

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className="drill-title">Key of {noteName(root)}</div>
        <div className="drill-q">{toChords ? 'name each chord' : 'give each numeral'}</div>
      </div>
      <StepCells
        given={toChords ? numerals : chords.map(chordName)}
        wanted={toChords ? chords.map(chordName) : numerals}
        results={results}
      />
      {toChords ? (
        <ChordPad
          qualities={qualities}
          onAnswer={(c) => {
            const want = chords[i]
            enter(!!want && c.quality === want.quality && notesEqual(c.root, want.root))
          }}
          disabled={locked}
        />
      ) : (
        <NumeralPad
          qualities={qualities}
          onAnswer={(degree, quality) => enter(!!target && degree === target.degree && quality === target.quality)}
          disabled={locked}
        />
      )}
    </div>
  )
}

export function TransposeToChords(props: TheoryDrillProps) {
  return <Transposer direction="chords" {...props} />
}

export function TransposeToNumerals(props: TheoryDrillProps) {
  return <Transposer direction="numerals" {...props} />
}
