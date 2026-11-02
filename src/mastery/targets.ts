import type { DrillType } from '../data/types';

// M1 gate-level response-time targets (docs/PLAN.md).
export const TARGET_MS: Record<DrillType, number> = {
  'fret-note-on-string': 2000,
  'fret-reverse': 2000,
  'fret-all-strings': 8000,
  'fret-neighborhood': 6000,
};
