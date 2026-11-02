import type { FretMode, Skill } from '../data/types';

// scope: 's1'..'s6' | 'allstrings' | 'neighborhood'
export function fretSkillId(mode: FretMode, scope: string): string {
  return 'fret:' + mode + ':' + scope;
}

interface CatalogEntry { name: string; phase: number; prerequisites: string[] }

const SCOPES: { scope: string; label: string }[] = [
  { scope: 's1', label: 'string 1' },
  { scope: 's2', label: 'string 2' },
  { scope: 's3', label: 'string 3' },
  { scope: 's4', label: 'string 4' },
  { scope: 's5', label: 'string 5' },
  { scope: 's6', label: 'string 6' },
  { scope: 'allstrings', label: 'all strings' },
  { scope: 'neighborhood', label: 'neighborhood' },
];

const CATALOG: Record<string, CatalogEntry> = {};
for (const { scope, label } of SCOPES) {
  const natural = fretSkillId('natural', scope);
  CATALOG[natural] = { name: 'Fretboard naturals: ' + label, phase: 1, prerequisites: [] };
  CATALOG[fretSkillId('chromatic', scope)] = { name: 'Fretboard chromatic: ' + label, phase: 1, prerequisites: [natural] };
}

export const SKILL_IDS: string[] = Object.keys(CATALOG);

export function newSkill(id: string): Skill {
  const entry = CATALOG[id];
  if (!entry) throw new Error('Unknown skill id: ' + id);
  return { id, ...entry, prerequisites: [...entry.prerequisites], mastery: 0, lastReviewed: null, nextDue: null, box: 0 };
}
