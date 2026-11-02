import {
  LETTERS,
  NATURAL_PCS,
  isNatural,
  noteName,
  noteWithLetter,
  pitchClass,
  semitonesUp,
  type Note,
  type PitchClass,
  type SpellingPref,
} from './notes';

export const MAJOR_STEPS: number[] = [2, 2, 1, 2, 2, 2, 1];

export function majorScale(root: Note): Note[] {
  const scale = [root];
  const start = LETTERS.indexOf(root.letter);
  let pc = pitchClass(root);
  for (let i = 1; i < 7; i++) {
    pc += MAJOR_STEPS[i - 1]!;
    scale.push(noteWithLetter(LETTERS[(start + i) % 7]!, pc));
  }
  return scale;
}

const AUTO_SHARPS: PitchClass[] = [1, 6]; // C♯ F♯; the other black keys default to flats (E♭ A♭ B♭)

export function spellPitchClass(pc: PitchClass, pref: SpellingPref, key?: Note): Note {
  pc = semitonesUp(0, pc);
  if (pref === 'auto' && key) {
    const inKey = majorScale(key).find((n) => pitchClass(n) === pc);
    if (inKey) return inKey;
  }
  if (isNatural(pc)) return { letter: LETTERS[NATURAL_PCS.indexOf(pc)]!, accidental: 0 };
  const sharp = pref === 'sharps' || (pref === 'auto' && AUTO_SHARPS.includes(pc));
  return sharp
    ? { letter: LETTERS[NATURAL_PCS.indexOf(pc - 1)]!, accidental: 1 }
    : { letter: LETTERS[NATURAL_PCS.indexOf(pc + 1)]!, accidental: -1 };
}

export const CHROMATIC_PCS: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Label for a pitch class with no key context. 'auto' shows both names of a black key, sharp first.
export function enharmonicLabel(pc: PitchClass, pref: SpellingPref): string {
  const sharp = noteName(spellPitchClass(pc, 'sharps'));
  const flat = noteName(spellPitchClass(pc, 'flats'));
  if (isNatural(pc) || pref === 'sharps') return sharp;
  if (pref === 'flats') return flat;
  return sharp + ' ' + flat;
}

// Respells double sharps/flats with the plain sharp or flat name (F♯♯ → G); single accidentals are kept.
export function readableSpelling(n: Note): Note {
  if (Math.abs(n.accidental) <= 1) return n;
  return spellPitchClass(pitchClass(n), n.accidental > 0 ? 'sharps' : 'flats');
}
