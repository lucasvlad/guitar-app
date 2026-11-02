import type { SpellingPref } from '../music';

export type DrillType = 'fret-all-strings' | 'fret-note-on-string' | 'fret-neighborhood' | 'fret-reverse';

export type FretMode = 'natural' | 'chromatic';

export interface Attempt {
  id?: number;
  skillId: string;
  drill: DrillType;
  prompt: string;
  correct: boolean;
  ms: number;
  ts: number;
}

export interface Skill {
  id: string;
  name: string;
  phase: number;
  prerequisites: string[];
  mastery: number;
  lastReviewed: number | null;
  nextDue: number | null;
  box: number; // 0..4
}

export interface Settings {
  spelling: SpellingPref;
  fretMode: FretMode;
  strings: number[]; // 1..6
}
