import { CHROMATIC_PCS, NATURAL_PCS } from '../music'
import './components.css'

interface NotePadProps {
  mode: 'natural' | 'chromatic'
  labelFor: (pc: number) => string
  onAnswer: (pc: number) => void
  disabled?: boolean
}

// Pitch class indexes only (C = 0); labels come from the parent via src/music.

export function NotePad({ mode, labelFor, onAnswer, disabled }: NotePadProps) {
  const pcs = mode === 'natural' ? NATURAL_PCS : CHROMATIC_PCS
  return (
    <div className={'notepad notepad-' + mode}>
      {pcs.map((pc) => (
        <button
          key={pc}
          type="button"
          className="notepad-btn"
          disabled={disabled}
          onClick={() => onAnswer(pc)}
        >
          {labelFor(pc)}
        </button>
      ))}
    </div>
  )
}
