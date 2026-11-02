import { expect, test } from 'vitest';
import type { Attempt, Skill } from '../data/types';
import { applyRun, isMastered, masteryScore } from './mastery';
import { newSkill } from './skills';

const DAY = 24 * 60 * 60 * 1000;

function att(ts: number, correct: boolean, ms: number, prompt = '0'): Attempt {
  return { skillId: 'fret:natural:s1', drill: 'fret-note-on-string', prompt, correct, ms, ts };
}

// Local-time timestamp helper.
function at(day: number, hour: number, minute = 0): number {
  return new Date(2026, 10, day, hour, minute).getTime();
}

function runOn(ts: number, n: number, correct: number, ms: number): Attempt[] {
  const out: Attempt[] = [];
  for (let i = 0; i < n; i++) out.push(att(ts + i * 1000, i < correct, ms));
  return out;
}

test('masteryScore is 0 for empty history', () => {
  expect(masteryScore([], 2000, Date.now())).toBe(0);
});

test('masteryScore: perfect and fast, just reviewed = 1', () => {
  const now = at(5, 12);
  expect(masteryScore(runOn(now - 60000, 10, 10, 1000), 2000, now)).toBeCloseTo(1);
});

test('masteryScore uses accuracy, speed and recency', () => {
  const last = at(1, 12);
  const attempts = runOn(last - 9000, 10, 5, 4000); // acc 0.5, speed 0.5
  expect(masteryScore(attempts, 2000, last)).toBeCloseTo(0.5);
  expect(masteryScore(attempts, 2000, last + 30 * DAY)).toBeCloseTo(0.25); // recency 0.5
  expect(masteryScore(attempts, 2000, last + 90 * DAY)).toBeCloseTo(0.25); // floor 0.5
});

test('masteryScore only uses the last 20 attempts', () => {
  const t = at(3, 12);
  const old = runOn(t, 20, 0, 1000);
  const recent = runOn(t + 100000, 20, 20, 1000);
  expect(masteryScore([...recent, ...old], 2000, t + 200000)).toBeCloseTo(1);
});

test('gate: fewer than 3 distinct days is not mastered', () => {
  const attempts = [...runOn(at(1, 10), 30, 30, 500), ...runOn(at(2, 10), 30, 30, 500)];
  expect(isMastered(attempts, 2000)).toBe(false);
  expect(isMastered([], 2000)).toBe(false);
});

test('gate: 3 days with >=90% and median <= target is mastered', () => {
  const attempts = [
    ...runOn(at(1, 10), 10, 9, 1500),
    ...runOn(at(3, 10), 10, 9, 1500),
    ...runOn(at(4, 10), 10, 9, 2000),
  ];
  expect(isMastered(attempts, 2000)).toBe(true);
});

test('gate: fails on accuracy below 90% or slow median', () => {
  const lowAcc = [...runOn(at(1, 10), 10, 9, 1500), ...runOn(at(2, 10), 10, 9, 1500), ...runOn(at(3, 10), 10, 8, 1500)];
  expect(isMastered(lowAcc, 2000)).toBe(false);
  const slow = [...runOn(at(1, 10), 10, 10, 2500), ...runOn(at(2, 10), 10, 10, 2500), ...runOn(at(3, 10), 10, 10, 2500)];
  expect(isMastered(slow, 2000)).toBe(false);
});

test('gate: only the last 3 distinct days count', () => {
  const bad = runOn(at(1, 10), 50, 0, 9000);
  const good = [...runOn(at(2, 10), 10, 10, 1000), ...runOn(at(3, 10), 10, 10, 1000), ...runOn(at(4, 10), 10, 10, 1000)];
  expect(isMastered([...bad, ...good], 2000)).toBe(true);
  // Unsorted input gives the same answer.
  expect(isMastered([...good, ...bad], 2000)).toBe(true);
});

test('gate: midnight boundary splits local days', () => {
  // 23:59 and 00:01 are two days, so this is 3 distinct days.
  const threeDays = [
    ...runOn(at(1, 23, 59), 10, 10, 1000),
    ...runOn(at(2, 0, 1), 10, 10, 1000),
    ...runOn(at(2, 20), 10, 10, 1000),
    ...runOn(at(3, 9), 10, 10, 1000),
  ];
  expect(isMastered(threeDays, 2000)).toBe(true);
  // Same span but nothing crosses midnight: only 2 days.
  const twoDays = [...runOn(at(2, 0, 1), 10, 10, 1000), ...runOn(at(2, 23, 58), 10, 10, 1000), ...runOn(at(3, 9), 10, 10, 1000)];
  expect(isMastered(twoDays, 2000)).toBe(false);
  // Bad attempts at 23:59 on day 1 are excluded once days 2, 3, 4 exist.
  const excluded = [
    ...runOn(at(1, 23, 59), 20, 0, 9000),
    ...runOn(at(2, 0, 1), 10, 10, 1000),
    ...runOn(at(3, 9), 10, 10, 1000),
    ...runOn(at(4, 9), 10, 10, 1000),
  ];
  expect(isMastered(excluded, 2000)).toBe(true);
});

test('applyRun updates mastery, lastReviewed and Leitner', () => {
  const now = at(5, 12);
  const skill: Skill = { ...newSkill('fret:natural:s1'), box: 2 };
  const good = runOn(now - 20000, 10, 9, 1000);
  const promoted = applyRun(skill, good, good, 2000, now);
  expect(promoted.box).toBe(3);
  expect(promoted.nextDue).toBe(now + 7 * DAY);
  expect(promoted.lastReviewed).toBe(now);
  expect(promoted.mastery).toBeCloseTo(masteryScore(good, 2000, now));
  expect(promoted.id).toBe(skill.id);

  const bad = runOn(now - 20000, 10, 8, 1000);
  const reset = applyRun(skill, bad, bad, 2000, now);
  expect(reset.box).toBe(0);
  expect(reset.nextDue).toBe(now + DAY);
});

test('empty attempt history: a brand-new skill gets mastery 0 and is not mastered', () => {
  const now = at(5, 12);
  const fresh = applyRun(newSkill('fret:natural:s1'), [], [], 2000, now);
  expect(fresh.mastery).toBe(0);
  expect(fresh.lastReviewed).toBe(now);
  expect(fresh.box).toBe(0);
  expect(fresh.nextDue).toBe(now + DAY);
  expect(isMastered([], 2000)).toBe(false);
});

test('gate: attempts either side of two midnights span 3 local days', () => {
  // 23:59 day 1, 00:01 day 2, 23:59 day 2, 00:01 day 3: only days 1, 2, 3.
  const span = [
    ...runOn(at(1, 23, 59), 5, 5, 1000),
    ...runOn(at(2, 0, 1), 5, 5, 1000),
    ...runOn(at(2, 23, 57), 5, 5, 1000),
    ...runOn(at(3, 0, 1), 5, 5, 1000),
  ];
  expect(isMastered(span, 2000)).toBe(true);
  // Drop day 1: days 2 and 3 only.
  expect(isMastered(span.slice(5), 2000)).toBe(false);
});

test('applyRun: two passing runs on the same day promote once', () => {
  const now = at(5, 12);
  const skill: Skill = { ...newSkill('fret:natural:s1'), box: 1, nextDue: now - DAY };
  const good = runOn(now - 20000, 10, 10, 1000);
  const first = applyRun(skill, good, good, 2000, now);
  expect(first.box).toBe(2);
  expect(first.nextDue).toBe(now + 3 * DAY);
  const second = applyRun(first, good, good, 2000, now + 60000);
  expect(second.box).toBe(2);
  expect(second.nextDue).toBe(now + 3 * DAY);
  expect(second.lastReviewed).toBe(now + 60000);
});

test('applyRun: a failing run after a pass resets to box 0', () => {
  const now = at(5, 12);
  const good = runOn(now - 20000, 10, 10, 1000);
  const passed = applyRun({ ...newSkill('fret:natural:s1'), box: 2 }, good, good, 2000, now);
  const bad = runOn(now + 1000, 10, 5, 1000);
  const failed = applyRun(passed, bad, [...good, ...bad], 2000, now + 60000);
  expect(failed.box).toBe(0);
  expect(failed.nextDue).toBe(now + 60000 + DAY);
});

test('applyRun: a pass when due promotes', () => {
  const now = at(5, 12);
  const skill: Skill = { ...newSkill('fret:natural:s1'), box: 2, nextDue: now };
  const good = runOn(now - 20000, 10, 10, 1000);
  const promoted = applyRun(skill, good, good, 2000, now);
  expect(promoted.box).toBe(3);
  expect(promoted.nextDue).toBe(now + 7 * DAY);
});
