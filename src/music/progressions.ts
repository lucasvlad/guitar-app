import { romanNumeral, type Chord, type ChordQuality } from './chords';
import { type Note } from './notes';
import { majorScale } from './scales';

export interface ProgressionStep {
  degree: number;
  quality: ChordQuality;
}
export interface Progression {
  name: string;
  steps: ProgressionStep[];
}

const s = (degree: number, quality: ChordQuality): ProgressionStep => ({ degree, quality });
const I = s(1, 'maj'), iii = s(3, 'min'), IV = s(4, 'maj');
const V = s(5, 'maj'), vi = s(6, 'min');
const I7 = s(1, '7'), IV7 = s(4, '7'), V7 = s(5, '7');

export const PROGRESSIONS: Progression[] = [
  { name: 'I–V–vi–IV (Let It Be style)', steps: [I, V, vi, IV] },
  { name: 'I–vi–IV–V (Stand By Me style)', steps: [I, vi, IV, V] },
  { name: 'I–IV–iii–V', steps: [I, IV, iii, V] },
  { name: 'ii–V–I', steps: [s(2, 'm7'), V7, s(1, 'maj7')] },
  { name: 'Canon-style descending bass', steps: [I, V, vi, iii, IV, I, IV, V] },
  // Dominant 7ths on I and IV are deliberately non-diatonic: that is the blues sound.
  { name: '12-bar blues', steps: [I7, I7, I7, I7, IV7, IV7, I7, I7, V7, IV7, I7, V7] },
];

export function progressionChords(key: Note, p: Progression): Chord[] {
  const scale = majorScale(key);
  return p.steps.map((step) => ({ root: scale[step.degree - 1]!, quality: step.quality }));
}

export function progressionNumerals(p: Progression): string[] {
  return p.steps.map((step) => romanNumeral(step.degree, step.quality));
}
