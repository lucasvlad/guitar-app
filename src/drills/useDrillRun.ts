import { useEffect, useRef, useState } from 'react'
import type { SpellingPref } from '../music'
import { getAttempts, getSkill, logAttempt, putSkill } from '../data/db'
import type { Attempt, DrillType, FretMode } from '../data/types'
import { applyRun } from '../mastery/mastery'
import { pickWeighted } from '../mastery/picker'
import { newSkill } from '../mastery/skills'
import { TARGET_MS } from '../mastery/targets'

export interface FretDrillProps {
  mode: FretMode
  strings: number[] // string numbers 1..6
  spelling: SpellingPref
  paused?: boolean
  onAnswer?: (correct: boolean) => void
}

const FEEDBACK_MS = 700

interface Run {
  attempts: Attempt[]
  saves: Promise<void>[]
  flushed: number // attempts already applied to skills
  flushing: Promise<void> // serializes flushes so skill writes never race
}

function newRun(): Run {
  return { attempts: [], saves: [], flushed: 0, flushing: Promise.resolve() }
}

// Loads past attempts for the skills, records new ones, and updates every
// touched skill (applyRun + putSkill) when the run ends (unmount or new skills)
// and whenever the page is hidden, since iOS may kill a backgrounded PWA.
// Each flush applies only the attempts recorded since the previous flush.
function useDrillRun(drill: DrillType, skillIds: string[]) {
  const [ready, setReady] = useState(false)
  const history = useRef<Attempt[]>([])
  const run = useRef<Run>(newRun())

  useEffect(() => {
    let live = true
    const current = newRun()
    run.current = current
    history.current = []
    setReady(false)
    getAttempts(skillIds).then((loaded) => {
      if (!live) return
      history.current = [...loaded, ...current.attempts]
      setReady(true)
    })
    function onVisibility() {
      if (document.visibilityState === 'hidden') flushRun(drill, current)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      live = false
      document.removeEventListener('visibilitychange', onVisibility)
      flushRun(drill, current)
    }
  }, [drill, skillIds.join(',')])

  function record(skillId: string, prompt: string, correct: boolean, ms: number) {
    const a: Attempt = { skillId, drill, prompt, correct, ms, ts: Date.now() }
    history.current.push(a)
    run.current.attempts.push(a)
    run.current.saves.push(logAttempt(a).catch(console.error))
  }

  return { ready, history, record }
}

function flushRun(drill: DrillType, run: Run) {
  const fresh = run.attempts.slice(run.flushed)
  if (fresh.length === 0) return
  run.flushed = run.attempts.length
  const saves = [...run.saves]
  run.flushing = run.flushing.then(() => applyAttempts(drill, fresh, saves)).catch(console.error)
}

async function applyAttempts(drill: DrillType, fresh: Attempt[], saves: Promise<void>[]) {
  await Promise.all(saves)
  const now = Date.now()
  const touched = [...new Set(fresh.map((a) => a.skillId))]
  for (const id of touched) {
    const all = await getAttempts([id])
    const skill = (await getSkill(id)) ?? newSkill(id)
    const runAttempts = fresh.filter((a) => a.skillId === id)
    await putSkill(applyRun(skill, runAttempts, all, TARGET_MS[drill], now))
  }
}

// The shared prompt -> answer -> ~700 ms feedback -> next prompt loop.
// `items` should be memoized; a new array starts a fresh pick.
export function useDrillLoop<T extends { key: string; skillId: string }>(
  drill: DrillType,
  items: T[],
  paused = false,
  onAnswer?: (correct: boolean) => void,
) {
  const skillIds = [...new Set(items.map((i) => i.skillId))]
  const { ready, history, record } = useDrillRun(drill, skillIds)
  const [item, setItem] = useState<T | null>(null)
  const [graded, setGraded] = useState<boolean | null>(null)
  const t0 = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  function next(lastKey?: string) {
    setGraded(null)
    setItem(items.length > 0 ? pickWeighted(items, history.current, TARGET_MS[drill], lastKey, Math.random) : null)
    t0.current = performance.now()
  }

  useEffect(() => {
    if (ready) next()
    return () => clearTimeout(timer.current)
  }, [ready, items])

  // Paused time is not counted: restart the clock on resume.
  useEffect(() => {
    if (!paused) t0.current = performance.now()
  }, [paused])

  // Backgrounded time is not counted either: restart the clock when visible again.
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible') t0.current = performance.now()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  function answer(correct: boolean) {
    if (paused || !item || graded !== null) return
    record(item.skillId, item.key, correct, Math.round(performance.now() - t0.current))
    setGraded(correct)
    onAnswer?.(correct)
    const key = item.key
    timer.current = window.setTimeout(() => next(key), FEEDBACK_MS)
  }

  // item is null while loading.
  return { item, graded, answer }
}
