export const LEITNER_DAYS = [1, 3, 7, 14, 30];

const DAY_MS = 24 * 60 * 60 * 1000;

export function nextDue(box: number, correct: boolean, now: number): { box: number; due: number } {
  if (!correct) return { box: 0, due: now + DAY_MS };
  const days = LEITNER_DAYS[box] ?? LEITNER_DAYS[LEITNER_DAYS.length - 1]!;
  return { box: Math.min(box + 1, 4), due: now + days * DAY_MS };
}
