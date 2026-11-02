import { useState } from 'react'
import { NUMERAL_DEGREES, chordSymbol, romanNumeral, type ChordQuality } from '../music'
import './components.css'

interface NumeralPadProps {
  qualities: ChordQuality[]
  onAnswer: (degree: number, quality: ChordQuality) => void
  disabled?: boolean
}

// Pick a scale degree (1-7, re-pick freely), then tap a quality to submit.
export function NumeralPad({ qualities, onAnswer, disabled }: NumeralPadProps) {
  const [degree, setDegree] = useState(0) // 0 = none picked yet

  function answer(quality: ChordQuality) {
    if (!degree) return
    setDegree(0)
    onAnswer(degree, quality)
  }

  return (
    <div className="numeralpad">
      <div className="pad-pending">{degree ? NUMERAL_DEGREES[degree - 1] + ' …' : 'Degree?'}</div>
      <div className="pad-row">
        {NUMERAL_DEGREES.map((label, i) => (
          <button
            key={label}
            type="button"
            className={'pad-btn' + (degree === i + 1 ? ' pad-on' : '')}
            aria-pressed={degree === i + 1}
            disabled={disabled}
            onClick={() => setDegree(i + 1)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pad-row">
        {qualities.map((q) => (
          <button key={q} type="button" className="pad-btn" disabled={disabled || !degree} onClick={() => answer(q)}>
            {degree ? romanNumeral(degree, q) : chordSymbol(q) || 'maj'}
          </button>
        ))}
      </div>
    </div>
  )
}
