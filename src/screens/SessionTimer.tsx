import { useEffect, useState } from 'react'
import { DRILLS } from '../drills/drillList'
import { useWakeLock } from './useWakeLock'
import type { FretDrillProps } from '../drills/useDrillRun'

interface SessionTimerProps extends Pick<FretDrillProps, 'mode' | 'strings' | 'spelling'> {
  onExit: () => void
}

const MIN = 60 * 1000
// Fixed M1 sequence, indexes into DRILLS: Note on string, Reverse, Neighborhood, All strings.
const BLOCKS = [
  { drill: DRILLS[0]!, ms: 3 * MIN },
  { drill: DRILLS[1]!, ms: 3 * MIN },
  { drill: DRILLS[2]!, ms: 2 * MIN },
  { drill: DRILLS[3]!, ms: 2 * MIN },
]

interface Tally {
  total: number
  correct: number
}

// The clock is wall time: endsAt is a Date.now() timestamp, so backgrounding
// does not stop it. While paused, endsAt is null and `left` holds the remainder.
export function SessionTimer({ mode, strings, spelling, onExit }: SessionTimerProps) {
  const [block, setBlock] = useState(0)
  const [endsAt, setEndsAt] = useState<number | null>(() => Date.now() + BLOCKS[0]!.ms)
  const [left, setLeft] = useState(BLOCKS[0]!.ms)
  const [tallies, setTallies] = useState<Tally[]>(BLOCKS.map(() => ({ total: 0, correct: 0 })))
  const done = block >= BLOCKS.length
  const paused = endsAt === null

  useWakeLock(!done)

  useEffect(() => {
    if (endsAt === null) return
    const tick = () => {
      const remaining = endsAt - Date.now()
      if (remaining > 0) {
        setLeft(remaining)
        return
      }
      // Chain from endsAt so a late tick (e.g. after backgrounding) loses no time.
      const next = BLOCKS[block + 1]
      setBlock(block + 1)
      setEndsAt(next ? endsAt + next.ms : null)
      setLeft(next ? next.ms : 0)
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endsAt, block])

  function togglePause() {
    if (paused) setEndsAt(Date.now() + left)
    else {
      setLeft(Math.max(0, endsAt - Date.now()))
      setEndsAt(null)
    }
  }

  function skip() {
    const next = BLOCKS[block + 1]
    setBlock(block + 1)
    setEndsAt(next ? Date.now() + next.ms : null)
    setLeft(next ? next.ms : 0)
  }

  function end() {
    setBlock(BLOCKS.length)
    setEndsAt(null)
  }

  function onAnswer(index: number, correct: boolean) {
    setTallies((ts) => ts.map((t, i) => (i === index ? { total: t.total + 1, correct: t.correct + (correct ? 1 : 0) } : t)))
  }

  if (done) {
    return (
      <div className="screen">
        <h1>Session done</h1>
        <div className="summary">
          {BLOCKS.map((b, i) => {
            const t = tallies[i]!
            return (
              <div key={b.drill.id} className="summary-row">
                <span>{b.drill.title}</span>
                <span>
                  {t.total} tries{t.total > 0 ? ' · ' + Math.round((100 * t.correct) / t.total) + '%' : ''}
                </span>
              </div>
            )
          })}
        </div>
        <button type="button" className="start" onClick={onExit}>Done</button>
      </div>
    )
  }

  const { drill } = BLOCKS[block]!
  const Drill = drill.Component

  return (
    <div className="session">
      <div className={'session-bar' + (paused ? ' session-paused' : '')}>
        <div className="session-info">
          <span className="session-time">{formatTime(left)}</span>
          <span className="session-title">{paused ? 'Paused' : block + 1 + '/' + BLOCKS.length + ' ' + drill.title}</span>
        </div>
        <button type="button" className="topbar-btn" onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>
        <button type="button" className="topbar-btn" onClick={skip}>Skip</button>
      </div>
      <div className="session-body">
        <Drill
          key={block}
          mode={mode}
          strings={strings}
          spelling={spelling}
          paused={paused}
          onAnswer={(correct) => onAnswer(block, correct)}
        />
        {paused && (
          <div className="paused-cover">
            <div className="paused-label">Paused</div>
            <button type="button" className="start" onClick={togglePause}>Resume</button>
            <button type="button" className="link-btn" onClick={end}>End session</button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const s = total % 60
  return Math.floor(total / 60) + ':' + (s < 10 ? '0' : '') + s
}
