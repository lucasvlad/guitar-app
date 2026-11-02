import type { Attempt, Skill } from '../data/types';
import { nextDue } from './leitner';

const DAY_MS = 24 * 60 * 60 * 1000;

export function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function accuracy(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  return attempts.filter((a) => a.correct).length / attempts.length;
}

function byTs(attempts: Attempt[]): Attempt[] {
  return [...attempts].sort((a, b) => a.ts - b.ts);
}

export function masteryScore(attempts: Attempt[], targetMs: number, now: number): number {
  if (attempts.length === 0) return 0;
  const recent = byTs(attempts).slice(-20);
  const acc = accuracy(recent);
  const speed = Math.min(1, targetMs / median(recent.map((a) => a.ms)));
  const daysSinceLast = (now - recent[recent.length - 1]!.ts) / DAY_MS;
  const recency = Math.max(0.5, 1 - daysSinceLast / 60);
  return (0.7 * acc + 0.3 * speed) * recency;
}

function localDay(ts: number): string {
  const d = new Date(ts);
  return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
}

// Gate: pool attempts from the last 3 distinct local calendar days.
export function isMastered(attempts: Attempt[], targetMs: number): boolean {
  const sorted = byTs(attempts);
  const days: string[] = [];
  for (const a of sorted) {
    const day = localDay(a.ts);
    if (days[days.length - 1] !== day) days.push(day);
  }
  if (days.length < 3) return false;
  const keep = new Set(days.slice(-3));
  const pool = sorted.filter((a) => keep.has(localDay(a.ts)));
  return accuracy(pool) >= 0.9 && median(pool.map((a) => a.ms)) <= targetMs;
}

// A passing run promotes only when the skill is due, so several runs in one session promote at most once.
// A failing run always resets to box 0.
export function applyRun(skill: Skill, runAttempts: Attempt[], allAttempts: Attempt[], targetMs: number, now: number): Skill {
  const passed = accuracy(runAttempts) >= 0.9;
  const due = skill.nextDue === null || now >= skill.nextDue;
  const updated = { ...skill, mastery: masteryScore(allAttempts, targetMs, now), lastReviewed: now };
  if (passed && !due) return updated;
  const leitner = nextDue(skill.box, passed, now);
  return { ...updated, box: leitner.box, nextDue: leitner.due };
}
