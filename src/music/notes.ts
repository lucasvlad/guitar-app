export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type PitchClass = number; // 0..11, C = 0
export interface Note {
  letter: Letter;
  accidental: number; // -2..2 (♭♭..♯♯)
}
export type SpellingPref = 'auto' | 'sharps' | 'flats';

export const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const NATURAL_PCS: PitchClass[] = [0, 2, 4, 5, 7, 9, 11];

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

export function semitonesUp(from: PitchClass, to: PitchClass): number {
  return mod12(to - from);
}

function letterPc(letter: Letter): PitchClass {
  return NATURAL_PCS[LETTERS.indexOf(letter)]!;
}

export function pitchClass(n: Note): PitchClass {
  return mod12(letterPc(n.letter) + n.accidental);
}

export function isNatural(pc: PitchClass): boolean {
  return NATURAL_PCS.includes(mod12(pc));
}

// The note with this letter that sounds as pc, using the smallest accidental.
export function noteWithLetter(letter: Letter, pc: PitchClass): Note {
  let accidental = semitonesUp(letterPc(letter), pc);
  if (accidental > 6) accidental -= 12;
  return { letter, accidental };
}

export function noteName(n: Note): string {
  const symbol = n.accidental > 0 ? '♯' : '♭';
  return n.letter + symbol.repeat(Math.abs(n.accidental));
}
