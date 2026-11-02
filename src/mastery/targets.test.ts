import { expect, test } from 'vitest';
import { TARGET_MS } from './targets';

test('theory and fretboard M2 targets', () => {
  expect(TARGET_MS['interval-up']).toBe(4000);
  expect(TARGET_MS['interval-semitones']).toBe(3000);
  expect(TARGET_MS['scale-spell']).toBe(15000);
  expect(TARGET_MS['key-signature']).toBe(12000);
  expect(TARGET_MS['diatonic-chords']).toBe(4000);
  expect(TARGET_MS['keys-of-chord']).toBe(8000);
  expect(TARGET_MS['transpose-to-chords']).toBe(4000);
  expect(TARGET_MS['transpose-to-numerals']).toBe(4000);
  expect(TARGET_MS['interval-nav']).toBe(4000);
  expect(TARGET_MS['octave-finder']).toBe(3000);
  for (const ms of Object.values(TARGET_MS)) expect(ms).toBeGreaterThan(0);
});
