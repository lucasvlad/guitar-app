import { useState } from 'react'
import { chordName, chordSymbol, noteName, type Chord, type ChordQuality, type Note } from '../music'
import { SpellPad } from './SpellPad'
import './components.css'

interface ChordPadProps {
  qualities: ChordQuality[]
  onAnswer: (c: Chord) => void
  disabled?: boolean
}

// Pick a root with the SpellPad (re-pick freely), then tap a quality to submit.
export function ChordPad({ qualities, onAnswer, disabled }: ChordPadProps) {
  const [root, setRoot] = useState<Note | null>(null)

  function answer(quality: ChordQuality) {
    if (!root) return
    setRoot(null)
    onAnswer({ root, quality })
  }

  return (
    <div className="chordpad">
      <div className="pad-pending">{root ? noteName(root) + ' …' : 'Root?'}</div>
      <SpellPad onAnswer={setRoot} disabled={disabled} />
      <div className="pad-row">
        {qualities.map((q) => (
          <button key={q} type="button" className="pad-btn" disabled={disabled || !root} onClick={() => answer(q)}>
            {root ? chordName({ root, quality: q }) : chordSymbol(q) || 'maj'}
          </button>
        ))}
      </div>
    </div>
  )
}
