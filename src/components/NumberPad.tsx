import './components.css'

interface NumberPadProps {
  onAnswer: (n: number) => void
  disabled?: boolean
}

const SEMITONES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// Semitone count answer, 0 to 12.
export function NumberPad({ onAnswer, disabled }: NumberPadProps) {
  return (
    <div className="pad-row pad-numbers">
      {SEMITONES.map((n) => (
        <button key={n} type="button" className="pad-btn" disabled={disabled} onClick={() => onAnswer(n)}>
          {n}
        </button>
      ))}
    </div>
  )
}
