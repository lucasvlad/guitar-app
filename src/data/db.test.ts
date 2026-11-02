import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { getAttempts, getSettings, getSkill, getSkills, logAttempt, putSkill, saveSettings } from './db';
import type { Attempt, Skill } from './types';

function attempt(skillId: string, ts: number, correct = true): Attempt {
  return { skillId, drill: 'fret-note-on-string', prompt: '4:s1', correct, ms: 1500, ts };
}

function skill(id: string): Skill {
  return { id, name: id, phase: 1, prerequisites: [], mastery: 0, lastReviewed: null, nextDue: null, box: 0 };
}

// One shared fake database for the file; tests use distinct skill IDs so they do not interfere.
describe('db', () => {
  it('returns default settings when nothing is stored, then saved settings', async () => {
    expect(await getSettings()).toEqual({ spelling: 'auto', fretMode: 'natural', strings: [1, 2, 3, 4, 5, 6] });
    await saveSettings({ spelling: 'flats', fretMode: 'chromatic', strings: [5, 6] });
    expect(await getSettings()).toEqual({ spelling: 'flats', fretMode: 'chromatic', strings: [5, 6] });
  });

  it('logs attempts and returns them for the requested skills sorted by ts', async () => {
    await logAttempt(attempt('a', 300));
    await logAttempt(attempt('b', 100, false));
    await logAttempt(attempt('c', 50));
    await logAttempt(attempt('a', 200));

    const got = await getAttempts(['a', 'b']);
    expect(got.map((x) => [x.skillId, x.ts])).toEqual([['b', 100], ['a', 200], ['a', 300]]);
    expect(got.every((x) => typeof x.id === 'number')).toBe(true);
    expect(got[0]?.correct).toBe(false);
  });

  it('returns an empty list for unknown or no skills', async () => {
    expect(await getAttempts(['nope'])).toEqual([]);
    expect(await getAttempts([])).toEqual([]);
  });

  it('puts, gets and overwrites skills', async () => {
    expect(await getSkill('fret:natural:s1')).toBeUndefined();
    await putSkill(skill('fret:natural:s1'));
    await putSkill(skill('fret:natural:s2'));
    await putSkill({ ...skill('fret:natural:s1'), box: 2, mastery: 0.5 });

    expect(await getSkill('fret:natural:s1')).toMatchObject({ box: 2, mastery: 0.5 });
    expect((await getSkills()).map((s) => s.id).sort()).toEqual(['fret:natural:s1', 'fret:natural:s2']);
  });
});
