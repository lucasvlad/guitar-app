import { expect, test } from 'vitest';
import type { Attempt } from '../data/types';
import { pickWeighted } from './picker';

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function att(prompt: string, correct: boolean, ms: number, ts: number): Attempt {
  return { skillId: 'fret:natural:s1', drill: 'fret-note-on-string', prompt, correct, ms, ts };
}

const items = [{ key: 'weak' }, { key: 'strong' }];
const attempts: Attempt[] = [];
for (let i = 0; i < 5; i++) {
  attempts.push(att('weak', i < 2, 3000, i));
  attempts.push(att('strong', true, 1000, i));
}

test('weak item is picked at least 2x as often as a strong one', () => {
  const rand = mulberry32(42);
  const counts: Record<string, number> = { weak: 0, strong: 0 };
  for (let i = 0; i < 10000; i++) counts[pickWeighted(items, attempts, 2000, undefined, rand).key]!++;
  expect(counts.weak!).toBeGreaterThanOrEqual(2 * counts.strong!);
});

test('never returns lastKey when there are 2 or more items', () => {
  const rand = mulberry32(7);
  const three = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
  for (let i = 0; i < 2000; i++) {
    expect(pickWeighted(three, [], 2000, 'b', rand).key).not.toBe('b');
    expect(pickWeighted(items, attempts, 2000, 'weak', rand).key).toBe('strong');
  }
});

test('single item is returned even if it equals lastKey', () => {
  expect(pickWeighted([{ key: 'a' }], [], 2000, 'a', () => 0.5).key).toBe('a');
});

test('unseen items get weight 3 vs a perfect fast item at weight 1', () => {
  const seen = [att('known', true, 500, 1)];
  const pair = [{ key: 'known' }, { key: 'new' }];
  // total weight 4: rand < 0.25 picks 'known', otherwise 'new'.
  expect(pickWeighted(pair, seen, 2000, undefined, () => 0.24).key).toBe('known');
  expect(pickWeighted(pair, seen, 2000, undefined, () => 0.26).key).toBe('new');
});

test('empty attempt history: every item is unseen and equally weighted', () => {
  const three = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
  expect(pickWeighted(three, [], 2000, undefined, () => 0).key).toBe('a');
  expect(pickWeighted(three, [], 2000, undefined, () => 0.34).key).toBe('b');
  expect(pickWeighted(three, [], 2000, undefined, () => 0.99).key).toBe('c');
});

test('an unseen item outweighs a perfectly known one (3 vs 1)', () => {
  const known: Attempt[] = [];
  for (let i = 0; i < 5; i++) known.push(att('known', true, 500, i));
  const pair = [{ key: 'known' }, { key: 'new' }];
  // Weights 1 and 3: rand < 0.25 picks known, otherwise new.
  expect(pickWeighted(pair, known, 2000, undefined, () => 0.24).key).toBe('known');
  expect(pickWeighted(pair, known, 2000, undefined, () => 0.26).key).toBe('new');
});
