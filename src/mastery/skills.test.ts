import { expect, test } from 'vitest';
import { SKILL_IDS, fretSkillId, newSkill } from './skills';

test('26 skills, all constructible with valid prerequisites', () => {
  expect(SKILL_IDS.length).toBe(26);
  for (const id of SKILL_IDS) {
    const s = newSkill(id);
    expect([1, 2, 3]).toContain(s.phase);
    for (const p of s.prerequisites) expect(SKILL_IDS).toContain(p);
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

test('fretboard skills are phase 1', () => {
  for (const id of SKILL_IDS) {
    if (id.startsWith('fret:')) expect(newSkill(id).phase).toBe(1);
  }
});

test('theory skills: phases and prerequisites', () => {
  const expected: [string, number, string[]][] = [
    ['int:up', 1, []],
    ['int:semis', 1, []],
    ['fret:intnav', 1, ['fret:natural:allstrings']],
    ['fret:octave', 1, ['fret:natural:allstrings']],
    ['scale:major', 2, ['int:up']],
    ['keysig', 2, ['scale:major']],
    ['diatonic:triads', 3, ['scale:major']],
    ['diatonic:keys-of-chord', 3, ['diatonic:triads']],
    ['transpose:to-chords', 3, ['diatonic:triads']],
    ['transpose:to-numerals', 3, ['diatonic:triads']],
  ];
  for (const [id, phase, prereqs] of expected) {
    const s = newSkill(id);
    expect(s.phase).toBe(phase);
    expect(s.prerequisites).toEqual(prereqs);
  }
});
