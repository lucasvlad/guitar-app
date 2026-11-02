import { saveSettings } from '../data/db'
import type { FretMode, Settings } from '../data/types'
import './drills.css'

interface DrillOptionsProps {
  settings: Settings
  onChange: (s: Settings) => void
}

// String 6 on the left, matching the fretboard.
const STRING_BUTTONS = [6, 5, 4, 3, 2, 1]

// 5.1 item 7: natural/chromatic toggle and string subset. Saves to Settings, then calls onChange.
export function DrillOptions({ settings, onChange }: DrillOptionsProps) {
  function update(next: Settings) {
    saveSettings(next).catch(console.error)
    onChange(next)
  }

  function setMode(fretMode: FretMode) {
    update({ ...settings, fretMode })
  }

  function toggleString(n: number) {
    const on = settings.strings.includes(n)
    if (on && settings.strings.length === 1) return // keep at least one string
    const strings = on ? settings.strings.filter((s) => s !== n) : [...settings.strings, n].sort((a, b) => a - b)
    update({ ...settings, strings })
  }

  return (
    <div className="drill-options">
      <div className="opt-row">
        {(['natural', 'chromatic'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className="opt-btn"
            aria-pressed={settings.fretMode === m}
            onClick={() => setMode(m)}
          >
            {m === 'natural' ? 'Naturals' : 'Chromatic'}
          </button>
        ))}
      </div>
      <div className="opt-label">Strings (All strings always uses all six)</div>
      <div className="opt-row">
        {STRING_BUTTONS.map((n) => (
          <button
            key={n}
            type="button"
            className="opt-btn"
            aria-pressed={settings.strings.includes(n)}
            onClick={() => toggleString(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
