import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Attempt, Settings, Skill } from './types';

interface GuitarDB extends DBSchema {
  attempts: { key: number; value: Attempt; indexes: { skillId: string; ts: number } };
  skills: { key: string; value: Skill };
  settings: { key: string; value: Settings };
}

const DEFAULT_SETTINGS: Settings = { spelling: 'auto', fretMode: 'natural', strings: [1, 2, 3, 4, 5, 6] };

let dbPromise: Promise<IDBPDatabase<GuitarDB>> | null = null;

function db(): Promise<IDBPDatabase<GuitarDB>> {
  if (!dbPromise) {
    requestPersist();
    // Forget this connection if it fails to open or is closed later (iOS can drop it), so the next call reopens.
    const forget = () => {
      if (dbPromise === p) dbPromise = null;
    };
    const p = openDB<GuitarDB>('guitar-app', 1, {
      upgrade(d) {
        const attempts = d.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
        attempts.createIndex('skillId', 'skillId');
        attempts.createIndex('ts', 'ts');
        d.createObjectStore('skills', { keyPath: 'id' });
        d.createObjectStore('settings');
      },
      blocking() {
        forget();
        p.then((d) => d.close()).catch(() => {});
      },
      terminated: forget,
    });
    p.catch(forget);
    dbPromise = p;
  }
  return dbPromise;
}

function requestPersist(): void {
  try {
    globalThis.navigator?.storage?.persist?.().catch(() => {});
  } catch {
    // Persistence is best effort.
  }
}

export async function logAttempt(a: Attempt): Promise<void> {
  await (await db()).add('attempts', a);
}

export async function getAttempts(skillIds: string[]): Promise<Attempt[]> {
  const d = await db();
  const result: Attempt[] = [];
  for (const id of skillIds) {
    result.push(...(await d.getAllFromIndex('attempts', 'skillId', id)));
  }
  return result.sort((x, y) => x.ts - y.ts);
}

export async function getSkill(id: string): Promise<Skill | undefined> {
  return (await db()).get('skills', id);
}

export async function getSkills(): Promise<Skill[]> {
  return (await db()).getAll('skills');
}

export async function putSkill(s: Skill): Promise<void> {
  await (await db()).put('skills', s);
}

export async function getSettings(): Promise<Settings> {
  const stored = await (await db()).get('settings', 'settings');
  return stored ?? { ...DEFAULT_SETTINGS, strings: [...DEFAULT_SETTINGS.strings] };
}

export async function saveSettings(s: Settings): Promise<void> {
  await (await db()).put('settings', s, 'settings');
}
