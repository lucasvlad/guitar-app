import { useState } from 'react'
import { LETTERS, type Note } from '../music'
import './components.css'

interface SpellPadProps {
  onAnswer: (n: Note) => void
  disabled?: boolean
}

const ACCIDENTALS = [
  { value: -1, label: '♭' },
  { value: 0, label: '♮' },
  { value: 1, label: '♯' },
]

// Pick an accidental (sticky until the next answer, default ♮), then tap a letter.
export function SpellPad({ onAnswer, disabled }: SpellPadProps) {
  const [accidental, setAccidental] = useState(0)

  function answer(letter: Note['letter']) {
    setAccidental(0)
    onAnswer({ letter, accidental })
  }

  return (
    <div className="spellpad">
      <div className="pad-row pad-acc">
        {ACCIDENTALS.map((a) => (
          <button
            key={a.value}
            type="button"
            className={'pad-btn' + (a.value === accidental ? ' pad-on' : '')}
            aria-pressed={a.value === accidental}
            disabled={disabled}
            onClick={() => setAccidental(a.value)}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="pad-row pad-letters">
        {LETTERS.map((letter) => (
          <button key={letter} type="button" className="pad-btn" disabled={disabled} onClick={() => answer(letter)}>
            {letter}
          </button>
        ))}
      </div>
    </div>
  )
}
