import 'fake-indexeddb/auto';
import { expect, test, vi } from 'vitest';

// Wrap the real openDB: fail the first open, and capture the callbacks so terminated() can be fired.
const calls: { terminated?: () => void }[] = [];
vi.mock('idb', async () => {
  const actual = await vi.importActual<typeof import('idb')>('idb');
  return {
    ...actual,
    openDB: (...args: Parameters<typeof actual.openDB>) => {
      calls.push(args[2] as { terminated?: () => void });
      if (calls.length === 1) return Promise.reject(new Error('open failed'));
      return actual.openDB(...args);
    },
  };
});

const { getSkills } = await import('./db');

test('a failed open is retried on the next call', async () => {
  await expect(getSkills()).rejects.toThrow('open failed');
  expect(await getSkills()).toEqual([]);
  expect(calls.length).toBe(2);
});

test('a terminated connection is reopened on next use', async () => {
  await getSkills();
  expect(calls.length).toBe(2);
  calls[1]!.terminated!();
  expect(await getSkills()).toEqual([]);
  expect(calls.length).toBe(3);
});
