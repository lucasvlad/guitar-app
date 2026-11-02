import { useState } from 'react'
import { Fretboard } from '../components/Fretboard'
import {
  MAJOR_DEGREE_INTERVALS,
  MAJOR_KEYS,
  PROGRESSIONS,
  chordName,
  diatonicSevenths,
  diatonicTriads,
  keySignature,
  majorScale,
  noteName,
  progressionChords,
  progressionNumerals,
  relativeMinor,
  romanNumeral,
  scaleOnFretboard,
  type Chord,
  type Note,
} from '../music'
import './keyexplorer.css'

interface KeyExplorerProps {
  onBack: () => void
}

type LabelMode = 'names' | 'intervals' | 'degrees'

const LABEL_MODES: { value: LabelMode; label: string }[] = [
  { value: 'names', label: 'Names' },
  { value: 'intervals', label: 'Intervals' },
  { value: 'degrees', label: 'Degrees' },
]

const STORAGE_KEY = 'keyExplorer.key' // index into MAJOR_KEYS
const DEFAULT_INDEX = 7 // C

function loadKeyIndex(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const i = Number(raw)
    if (raw !== null && Number.isInteger(i) && i >= 0 && i < MAJOR_KEYS.length) return i
  } catch {
    // storage unavailable: fall back to C
  }
  return DEFAULT_INDEX
}

function signatureText(key: Note): string {
  const { count, notes } = keySignature(key)
  if (count === 0) return 'No sharps or flats'
  const n = Math.abs(count)
  const kind = count > 0 ? (n === 1 ? 'sharp' : 'sharps') : n === 1 ? 'flat' : 'flats'
  return n + ' ' + kind + ': ' + notes.map(noteName).join(' ')
}

function ChordRow({ chords }: { chords: Chord[] }) {
  return (
    <div className="ke-chords">
      {chords.map((c, i) => (
        <div key={i} className="ke-chord">
          <span className="ke-numeral">{romanNumeral(i + 1, c.quality)}</span>
          <span className="ke-chord-name">{chordName(c)}</span>
        </div>
      ))}
    </div>
  )
}

export function KeyExplorer({ onBack }: KeyExplorerProps) {
  const [keyIndex, setKeyIndex] = useState(loadKeyIndex)
  const [labelMode, setLabelMode] = useState<LabelMode>('names')
  const key = MAJOR_KEYS[keyIndex]!

  function pickKey(i: number) {
    setKeyIndex(i)
    try {
      localStorage.setItem(STORAGE_KEY, String(i))
    } catch {
      // not remembered; fine
    }
  }

  const highlights = scaleOnFretboard(key).map((p) => ({
    stringIndex: p.stringIndex,
    fret: p.fret,
    color: p.degree === 1 ? ('prompt' as const) : ('correct' as const),
    label:
      labelMode === 'names'
        ? noteName(p.note)
        : labelMode === 'intervals'
          ? MAJOR_DEGREE_INTERVALS[p.degree - 1]
          : String(p.degree),
  }))

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-title">Key Explorer</span>
        <button type="button" className="topbar-btn" onClick={onBack}>Back</button>
      </div>

      <div className="ke-keys">
        {MAJOR_KEYS.map((k, i) => (
          <button
            key={i}
            type="button"
            className="ke-btn"
            aria-pressed={i === keyIndex}
            onClick={() => pickKey(i)}
          >
            {noteName(k)}
          </button>
        ))}
      </div>

      <h2 className="ke-title">{noteName(key)} major</h2>
      <div className="ke-facts">
        <div className="ke-fact">
          <span className="section-label">Scale</span>
          <span className="ke-scale">{majorScale(key).map(noteName).join(' ')}</span>
        </div>
        <div className="ke-fact">
          <span className="section-label">Key signature</span>
          <span>{signatureText(key)}</span>
        </div>
        <div className="ke-fact">
          <span className="section-label">Relative minor</span>
          <span>{chordName({ root: relativeMinor(key), quality: 'min' })}</span>
        </div>
      </div>

      <div className="section-label">Fretboard</div>
      <div className="ke-modes">
        {LABEL_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            className="ke-btn"
            aria-pressed={labelMode === m.value}
            onClick={() => setLabelMode(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <Fretboard highlights={highlights} />

      <div className="section-label">Triads</div>
      <ChordRow chords={diatonicTriads(key)} />
      <div className="section-label">Sevenths</div>
      <ChordRow chords={diatonicSevenths(key)} />

      <div className="section-label">Progressions</div>
      <div className="ke-progs">
        {PROGRESSIONS.map((p) => (
          <div key={p.name} className="ke-prog">
            <div className="ke-prog-name">{p.name}</div>
            <div className="ke-prog-numerals">{progressionNumerals(p).join(' ')}</div>
            <div className="ke-prog-chords">{progressionChords(key, p).map(chordName).join(' ')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
