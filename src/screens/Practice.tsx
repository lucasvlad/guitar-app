import { DrillOptions } from '../drills/DrillOptions'
import { DRILLS, type DrillId } from '../drills/drillList'
import type { Settings } from '../data/types'

interface PracticeProps {
  settings: Settings
  onChange: (s: Settings) => void
  onOpen: (screen: 'session' | 'settings' | DrillId) => void
}

// M1 home: one big Start session button, then single drills, options, and Settings.
export function Practice({ settings, onChange, onOpen }: PracticeProps) {
  return (
    <div className="screen">
      <button type="button" className="start" onClick={() => onOpen('session')}>
        Start session
        <span className="start-sub">10 minutes</span>
      </button>
      <div className="section-label">Single drills</div>
      <div className="drill-list">
        {DRILLS.map((d) => (
          <button key={d.id} type="button" className="list-btn" onClick={() => onOpen(d.id)}>
            {d.title}
          </button>
        ))}
      </div>
      <DrillOptions settings={settings} onChange={onChange} />
      <button type="button" className="link-btn" onClick={() => onOpen('settings')}>
        Settings
      </button>
    </div>
  )
}
