import { expect, test } from 'vitest';
import { LEITNER_DAYS, nextDue } from './leitner';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_000_000_000_000;

test('correct promotes one box and schedules by the current box interval', () => {
  for (let box = 0; box <= 4; box++) {
    const r = nextDue(box, true, NOW);
    expect(r.box).toBe(Math.min(box + 1, 4));
    expect(r.due).toBe(NOW + LEITNER_DAYS[box]! * DAY);
  }
});

test('box 4 stays at 4 with a 30-day interval', () => {
  expect(nextDue(4, true, NOW)).toEqual({ box: 4, due: NOW + 30 * DAY });
});

test('wrong resets to box 0, due in 1 day', () => {
  for (let box = 0; box <= 4; box++) {
    expect(nextDue(box, false, NOW)).toEqual({ box: 0, due: NOW + DAY });
  }
});
