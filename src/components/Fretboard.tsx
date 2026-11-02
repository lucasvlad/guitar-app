import './components.css'

interface FretHighlight {
  stringIndex: number // 0 = string 1 (high E) ... 5 = string 6 (low E)
  fret: number
  color: 'prompt' | 'correct' | 'wrong'
  label?: string
}

interface FretboardProps {
  highlights: FretHighlight[]
  activeStrings?: number[] // string numbers 1..6; others are dimmed. Omit for all active.
  onTap?: (stringIndex: number, fret: number) => void
  anchorFret?: number
}

const FRETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
// Left to right on screen: string 6 ... string 1.
const STRING_INDEXES = [5, 4, 3, 2, 1, 0]
const SINGLE_MARKERS = [3, 5, 7, 9]

export function Fretboard({ highlights, activeStrings, onTap, anchorFret }: FretboardProps) {
  return (
    <div className="fretboard">
      {anchorFret !== undefined && (
        <div className="fb-anchor" style={{ gridRow: anchorFret + 1 }} />
      )}
      {FRETS.map((fret) => (
        <div key={'n' + fret} className="fb-fretnum" style={{ gridRow: fret + 1 }}>
          {fret === anchorFret ? '▶' : fret === 0 ? '' : fret}
        </div>
      ))}
      {SINGLE_MARKERS.map((fret) => (
        <div key={'m' + fret} className="fb-marker" style={{ gridRow: fret + 1 }}>
          <span className="fb-dot" />
        </div>
      ))}
      <div className="fb-marker fb-marker-double" style={{ gridRow: 13 }}>
        <span className="fb-dot" />
        <span className="fb-dot" />
      </div>
      {STRING_INDEXES.map((stringIndex, col) =>
        FRETS.map((fret) => {
          const hit = highlights.find((h) => h.stringIndex === stringIndex && h.fret === fret)
          const active = !activeStrings || activeStrings.includes(stringIndex + 1)
          let className = 'fb-cell'
          if (fret === 0) className += ' fb-open'
          if (!active) className += ' fb-dim'
          return (
            <button
              key={stringIndex + ':' + fret}
              type="button"
              className={className}
              style={{ gridRow: fret + 1, gridColumn: col + 2 }}
              disabled={!onTap}
              aria-label={'String ' + (stringIndex + 1) + ' fret ' + fret}
              onClick={onTap ? () => onTap(stringIndex, fret) : undefined}
            >
              {hit && <span className={'fb-hl fb-' + hit.color}>{hit.label}</span>}
            </button>
          )
        }),
      )}
    </div>
  )
}
