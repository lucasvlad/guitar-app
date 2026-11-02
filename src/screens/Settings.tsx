import { saveSettings } from '../data/db'
import type { Settings as SettingsData } from '../data/types'
import type { SpellingPref } from '../music'

interface SettingsProps {
  settings: SettingsData
  onChange: (s: SettingsData) => void
  onBack: () => void
}

const SPELLINGS: { value: SpellingPref; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'sharps', label: 'Sharps' },
  { value: 'flats', label: 'Flats' },
]

export function Settings({ settings, onChange, onBack }: SettingsProps) {
  function setSpelling(spelling: SpellingPref) {
    const next = { ...settings, spelling }
    saveSettings(next).catch(console.error)
    onChange(next)
  }

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-title">Settings</span>
        <button type="button" className="topbar-btn" onClick={onBack}>Back</button>
      </div>
      <div className="section-label">Note names</div>
      <div className="opt-row">
        {SPELLINGS.map((s) => (
          <button
            key={s.value}
            type="button"
            className="opt-btn"
            aria-pressed={settings.spelling === s.value}
            onClick={() => setSpelling(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="info">Auto picks the usual name for each note.</p>
      <p className="info">Fretboard Trainer, Milestone 1. Your data stays on this device.</p>
    </div>
  )
}
