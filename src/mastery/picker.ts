import type { Attempt } from '../data/types';
import { median } from './mastery';

function weight(key: string, attempts: Attempt[], targetMs: number): number {
  const recent = attempts.filter((a) => a.prompt === key).sort((a, b) => a.ts - b.ts).slice(-5);
  if (recent.length === 0) return 3;
  const acc = recent.filter((a) => a.correct).length / recent.length;
  const slow = Math.min(2, Math.max(0, median(recent.map((a) => a.ms)) / targetMs - 1) * 2);
  return 1 + 4 * (1 - acc) + slow;
}

// Favours weak and slow items. Never repeats lastKey when there is another choice.
export function pickWeighted<T extends { key: string }>(
  items: T[],
  attempts: Attempt[],
  targetMs: number,
  lastKey: string | undefined,
  rand: () => number,
): T {
  if (items.length === 0) throw new Error('pickWeighted: no items');
  const pool = items.length >= 2 ? items.filter((i) => i.key !== lastKey) : items;
  const weights = pool.map((i) => weight(i.key, attempts, targetMs));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]!;
    if (r < 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}
