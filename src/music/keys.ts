import { type Letter, type Note } from './notes';
import { majorScale } from './scales';

const n = (letter: Letter, accidental = 0): Note => ({ letter, accidental });

// Circle-of-fifths order, from 7 flats to 7 sharps.
export const MAJOR_KEYS: Note[] = [
  n('C', -1), n('G', -1), n('D', -1), n('A', -1), n('E', -1), n('B', -1), n('F'),
  n('C'), n('G'), n('D'), n('A'), n('E'), n('B'), n('F', 1), n('C', 1),
];

const SHARP_ORDER: Letter[] = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER: Letter[] = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

// count > 0 means sharps, < 0 means flats; notes are in standard signature order.
export function keySignature(root: Note): { count: number; notes: Note[] } {
  const altered = majorScale(root).filter((note) => note.accidental !== 0);
  const count = altered.reduce((sum, note) => sum + note.accidental, 0);
  const order = count > 0 ? SHARP_ORDER : FLAT_ORDER;
  const notes = [...altered].sort((a, b) => order.indexOf(a.letter) - order.indexOf(b.letter));
  return { count, notes };
}

export function relativeMinor(root: Note): Note {
  return majorScale(root)[5]!;
}
