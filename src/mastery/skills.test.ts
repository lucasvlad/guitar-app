import { expect, test } from 'vitest';
import { SKILL_IDS, fretSkillId, newSkill } from './skills';

test('16 fretboard skills, all phase 1', () => {
  expect(SKILL_IDS.length).toBe(16);
  for (const id of SKILL_IDS) {
    const s = newSkill(id);
    expect(s.phase).toBe(1);
    expect(s.box).toBe(0);
    expect(s.mastery).toBe(0);
    expect(s.nextDue).toBeNull();
    expect(s.name.length).toBeGreaterThan(0);
  }
});

test('ids and prerequisites', () => {
  expect(fretSkillId('natural', 's5')).toBe('fret:natural:s5');
  expect(newSkill('fret:chromatic:s5').prerequisites).toEqual(['fret:natural:s5']);
  expect(newSkill('fret:chromatic:neighborhood').prerequisites).toEqual(['fret:natural:neighborhood']);
  expect(newSkill('fret:natural:allstrings').prerequisites).toEqual([]);
  expect(() => newSkill('nope')).toThrow();
});
