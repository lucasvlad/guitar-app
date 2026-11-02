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

// Laid out like tab: string 1 (high e) on the top row, nut on the left, frets 0-12 left to right.
const FRETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const STRING_INDEXES = [0, 1, 2, 3, 4, 5]
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'] // standard tuning, tab style
const SINGLE_MARKERS = [3, 5, 7, 9]

// Grid: column 1 = string names, column fret + 2 = that fret; rows 1-6 = strings, row 7 = fret numbers.
export function Fretboard({ highlights, activeStrings, onTap, anchorFret }: FretboardProps) {
  const isActive = (stringIndex: number) => !activeStrings || activeStrings.includes(stringIndex + 1)
  return (
    <div className="fretboard">
      {anchorFret !== undefined && <div className="fb-anchor" style={{ gridColumn: anchorFret + 2 }} />}
      {SINGLE_MARKERS.map((fret) => (
        <span key={'m' + fret} className="fb-dot" style={{ gridColumn: fret + 2, gridRow: '3 / 5' }} />
      ))}
      <span className="fb-dot" style={{ gridColumn: 14, gridRow: '2 / 4' }} />
      <span className="fb-dot" style={{ gridColumn: 14, gridRow: '4 / 6' }} />
      {STRING_INDEXES.map((stringIndex) => (
        <div
          key={'s' + stringIndex}
          className={'fb-name' + (isActive(stringIndex) ? '' : ' fb-dim')}
          style={{ gridRow: stringIndex + 1 }}
        >
          {STRING_NAMES[stringIndex]}
        </div>
      ))}
      {FRETS.map((fret) => (
        <div
          key={'n' + fret}
          className={'fb-fretnum' + (fret === anchorFret ? ' fb-fretnum-anchor' : '')}
          style={{ gridColumn: fret + 2 }}
        >
          {fret}
        </div>
      ))}
      {STRING_INDEXES.map((stringIndex) =>
        FRETS.map((fret) => {
          const hit = highlights.find((h) => h.stringIndex === stringIndex && h.fret === fret)
          let className = 'fb-cell'
          if (fret === 0) className += ' fb-open'
          if (!isActive(stringIndex)) className += ' fb-dim'
          return (
            <button
              key={stringIndex + ':' + fret}
              type="button"
              className={className}
              style={{ gridRow: stringIndex + 1, gridColumn: fret + 2 }}
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
