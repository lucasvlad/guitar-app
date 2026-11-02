import { useEffect, useState } from 'react'
import { getSettings } from './data/db'
import type { Settings as SettingsData } from './data/types'
import { DRILLS } from './drills/drillList'
import { THEORY_DRILLS } from './drills/theoryDrillList'
import { KeyExplorer } from './screens/KeyExplorer'
import { Practice, type PracticeTarget } from './screens/Practice'
import { SessionTimer } from './screens/SessionTimer'
import { Settings } from './screens/Settings'
import { useWakeLock } from './screens/useWakeLock'
import './screens/screens.css'

type Screen = 'practice' | PracticeTarget

// Used if settings cannot be loaded, so Start is always reachable.
const FALLBACK_SETTINGS: SettingsData = { spelling: 'auto', fretMode: 'natural', strings: [1, 2, 3, 4, 5, 6] }

export default function App() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [screen, setScreen] = useState<Screen>('practice')

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((e) => {
        console.error(e)
        setSettings(FALLBACK_SETTINGS)
      })
  }, [])

  const drill = DRILLS.find((d) => d.id === screen)
  const theory = THEORY_DRILLS.find((d) => d.id === screen)
  useWakeLock(drill !== undefined || theory !== undefined)

  if (!settings) return <main className="app" />

  const home = () => setScreen('practice')
  const drillProps = { mode: settings.fretMode, strings: settings.strings, spelling: settings.spelling }

  if (screen === 'session') return <main className="app"><SessionTimer {...drillProps} onExit={home} /></main>
  if (screen === 'settings') return <main className="app"><Settings settings={settings} onChange={setSettings} onBack={home} /></main>

  if (screen === 'key-explorer') return <main className="app"><KeyExplorer onBack={home} /></main>

  const single = drill ?? theory
  if (single) {
    return (
      <main className="app">
        <div className="topbar">
          <span className="topbar-title">{single.title}</span>
          <button type="button" className="topbar-btn" onClick={home}>Done</button>
        </div>
        {drill && <drill.Component {...drillProps} />}
        {theory && <theory.Component spelling={settings.spelling} />}
      </main>
    )
  }

  return (
    <main className="app">
      <Practice settings={settings} onChange={setSettings} onOpen={setScreen} />
    </main>
  )
}
