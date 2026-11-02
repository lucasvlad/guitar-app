import { describe, expect, it } from 'vitest';
import { noteName, notesEqual, pitchClass, type Letter, type Note } from './notes';
import { MAJOR_KEYS, keySignature, relativeMinor } from './keys';
import { majorScale } from './scales';

const n = (letter: Letter, accidental = 0): Note => ({ letter, accidental });
const names = (notes: Note[]) => notes.map(noteName).join(' ');

const SIGNATURES: [string, number, string][] = [
  ['C♭', -7, 'B♭ E♭ A♭ D♭ G♭ C♭ F♭'],
  ['G♭', -6, 'B♭ E♭ A♭ D♭ G♭ C♭'],
  ['D♭', -5, 'B♭ E♭ A♭ D♭ G♭'],
  ['A♭', -4, 'B♭ E♭ A♭ D♭'],
  ['E♭', -3, 'B♭ E♭ A♭'],
  ['B♭', -2, 'B♭ E♭'],
  ['F', -1, 'B♭'],
  ['C', 0, ''],
  ['G', 1, 'F♯'],
  ['D', 2, 'F♯ C♯'],
  ['A', 3, 'F♯ C♯ G♯'],
  ['E', 4, 'F♯ C♯ G♯ D♯'],
  ['B', 5, 'F♯ C♯ G♯ D♯ A♯'],
  ['F♯', 6, 'F♯ C♯ G♯ D♯ A♯ E♯'],
  ['C♯', 7, 'F♯ C♯ G♯ D♯ A♯ E♯ B♯'],
];

describe('MAJOR_KEYS', () => {
  it('lists 15 keys in circle-of-fifths order', () => {
    expect(names(MAJOR_KEYS)).toBe('C♭ G♭ D♭ A♭ E♭ B♭ F C G D A E B F♯ C♯');
  });
  it('each key is a perfect 5th (7 semitones) above the previous', () => {
    for (let i = 1; i < MAJOR_KEYS.length; i++) {
      expect((pitchClass(MAJOR_KEYS[i]!) - pitchClass(MAJOR_KEYS[i - 1]!) + 12) % 12).toBe(7);
    }
  });
});

describe('keySignature', () => {
  it.each(MAJOR_KEYS.map((k, i) => [noteName(k), k, SIGNATURES[i]!] as const))(
    '%s',
    (name, key, [expectedName, count, notes]) => {
      expect(name).toBe(expectedName);
      const sig = keySignature(key);
      expect(sig.count).toBe(count);
      expect(names(sig.notes)).toBe(notes);
    },
  );
});

describe('relativeMinor', () => {
  it('is the 6th degree', () => {
    expect(noteName(relativeMinor(n('C')))).toBe('A');
    expect(noteName(relativeMinor(n('F', 1)))).toBe('D♯');
    expect(noteName(relativeMinor(n('C', -1)))).toBe('A♭');
    expect(noteName(relativeMinor(n('G', -1)))).toBe('E♭');
    expect(noteName(relativeMinor(n('E')))).toBe('C♯');
  });
  it.each(MAJOR_KEYS)('is a minor 3rd below the tonic for %o', (key) => {
    expect((pitchClass(key) - pitchClass(relativeMinor(key)) + 12) % 12).toBe(3);
    expect(notesEqual(relativeMinor(key), majorScale(key)[5]!)).toBe(true);
  });
});

describe('notesEqual', () => {
  it('requires same letter and accidental', () => {
    expect(notesEqual(n('F', 1), n('F', 1))).toBe(true);
    expect(notesEqual(n('F', 1), n('G', -1))).toBe(false);
    expect(notesEqual(n('B', 1), n('C'))).toBe(false);
    expect(notesEqual(n('C'), n('C', 1))).toBe(false);
  });
});
