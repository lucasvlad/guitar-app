# Build Plan: Fretboard & Theory Trainer

Source of truth: `docs/SPEC.md`. This file turns spec Section 11 into tasks that agents can run.

## How this file is used
- The orchestrator assigns tasks by ID, and only the orchestrator changes checkboxes: when a task's acceptance criteria pass, `[ ]` becomes `[x]`.
- A task can start once every task in its **Depends** list is `[x]`. An exception: tasks that build against the **Interface contract** can start before the code behind it exists.
- Each task names the files it owns. Only the owner edits those files. If a contract needs to change, the orchestrator approves it and updates this file first.
- At the end of every milestone, stop and get the user's feedback before starting the next one (spec Section 11).
- Code style: minimal, no regular expressions, no speculative abstractions, and build only what the current milestone needs. All music logic lives in `src/music`.

**Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done (acceptance passed) · `[!]` blocked (reason given inline) · **iOS** = must be checked on the iPhone 17 Pro Max (iOS 26, installed PWA) by the user.

---

## Milestone 1: Setup, theory core, fretboard drills, mastery, storage, timer

- [x] **M1-0 Project setup + hosting** (owner: orchestrator). Files: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `public/` (icons, manifest assets), `.github/workflows/deploy.yml`, `src/main.tsx`, `src/App.tsx` (empty shell), `src/index.css`. Depends: none.
  Status: Live at https://lucasvlad.github.io/guitar-app/ (public repo github.com/lucasvlad/guitar-app, approved by user 2026-11-01). The `BASE_PATH` env var overrides the Vite base (default `/guitar-app/`).
  Accept: `npm run dev`, `npm test` (Vitest) and `npm run build` all pass. A push to main deploys to GitHub Pages; the Vite `base` setting matches the repo path. vite-plugin-pwa produces a manifest (standalone display, icons, apple-touch-icon) and a service worker that precaches the build. **iOS:** Add to Home Screen works, and the app launches offline in airplane mode.
- [x] **M1-1 Music core** (theory-engine). Files: `src/music/notes.ts`, `src/music/intervals.ts`, `src/music/scales.ts`, `src/music/fretboard.ts`, `src/music/index.ts`, plus a `*.test.ts` next to each. Depends: M1-0 (only to run Vitest).
  Accept: implements the contract below exactly. Tests cover these cases:
  - `noteAt` for every open string and frets 0–12.
  - `majorScale` for all 15 key roots, with each letter used exactly once (F♯ major contains E♯; C♭ major contains F♭).
  - `transpose` for every interval from C, F♯ and B♭.
  - `spellPitchClass` under each preference, with and without a key.
- [x] **M1-2 Data layer** (data-layer). Files: `src/data/types.ts`, `src/data/db.ts`, `src/data/db.test.ts` (uses the `fake-indexeddb` dev dependency). Depends: M1-0.
  Accept: implements the contract. Database `guitar-app`, version 1, with these stores:
  - `attempts`: autoIncrement, with indexes `skillId` and `ts`.
  - `skills`: keyPath `id`.
  - `settings`: a single key, `"settings"`.

  `getSettings` returns defaults when nothing is stored. The first open calls `navigator.storage.persist()`, and a failure there is ignored.
- [x] **M1-3 Mastery + Leitner + picker** (data-layer). Files: `src/mastery/mastery.ts`, `src/mastery/leitner.ts`, `src/mastery/picker.ts`, `src/mastery/skills.ts`, `src/mastery/targets.ts`, plus tests. Depends: none (imports types only from the contract).
  Accept: pure functions with no idb or DOM access, and the random source can be injected. Tests cover these cases:
  - Leitner promotes and resets correctly.
  - The mastery gate checks the last 3 distinct days.
  - A weak item is picked at least 2× as often as a strong one over 10k draws with a seeded random source.
  - The picker never returns `lastKey` when there are 2 or more items.
- [x] **M1-4 Fretboard + NotePad components** (drills-ui). Files: `src/components/Fretboard.tsx`, `src/components/NotePad.tsx`, `src/components/components.css`. Depends: M1-0; builds against the M1-1 contract.
  Accept:
  - The fretboard is horizontal like tab: string 1 (high e) on top, string 6 at the bottom, nut on the left, frets 0–12 left to right, string names at the left edge, fret numbers below, with markers at frets 3, 5, 7, 9 and 12. It fits an iPhone in portrait with no horizontal scroll.
  - It renders highlights, dims strings outside the subset, and calls `onTap`.
  - NotePad shows 7 letter buttons in natural mode and 12 in chromatic mode. In `auto` mode each label shows both names (e.g. "C♯ D♭").
  - Tap targets are at least 48px.
- [x] **M1-5 Fretboard drills 5.1 items 1–4 and 7** (drills-ui). Files: `src/drills/useDrillRun.ts`, `src/drills/FindAllStrings.tsx`, `src/drills/NoteOnString.tsx`, `src/drills/Neighborhood.tsx`, `src/drills/ReverseNote.tsx`, `src/drills/DrillOptions.tsx`, `src/drills/drills.css`. Depends: M1-1, M1-2, M1-3, M1-4.
  Accept: the drill contract below is met. Attempts appear in IndexedDB with the correct skill IDs and item keys. Natural/chromatic mode and the string subset change which items are drawn. Skills are updated when a run ends.
- [x] **M1-6 Practice screen, session timer, mini Settings, navigation** (drills-ui). Files: `src/screens/Practice.tsx`, `src/screens/SessionTimer.tsx`, `src/screens/Settings.tsx`, `src/App.tsx` (screen state). Depends: M1-5.
  Accept: the timer contract below is met. Settings saves the spelling preference, and the drill options persist. Navigation uses a `screen` state value in `App` (no router).
- [x] **M1-7 Test pass** (tester). Files: `src/**/*.test.ts` gaps only. Depends: M1-1, M1-2, M1-3 (can start in wave 2 against the contract).
  Accept: all tests are green. Edge cases added:
  - Fret 12 equals the open string.
  - The C♭ and C♯ major scales.
  - An empty attempt history.
  - Clock tests across midnight for day grouping.
- [~] **M1-8 Review + device check** (reviewer). Depends: M1-6, M1-7.
  Status: code review done and fixes applied; awaiting user's on-device iPhone check.
  Accept: the code follows the style rules (no regex, no unused exports, all music logic only in `src/music`). The user has checked all **iOS** items for M1-0 plus one full 10-minute timed session on the phone, including the screen staying awake.

**Parallel groups (M1):** wave 0: M1-0 · wave 1: M1-1, M1-2, M1-3, M1-4 · wave 2: M1-5, M1-7 · wave 3: M1-6 · wave 4: M1-8

### M1 interface contract

**`src/music` (theory-engine), public API through `src/music/index.ts`:**
```ts
export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type PitchClass = number;                 // 0..11, C = 0
export interface Note { letter: Letter; accidental: number } // -2..2 (♭♭..♯♯)
export type SpellingPref = 'auto' | 'sharps' | 'flats';
export type Tuning = PitchClass[];               // index 0 = string 1 (high E) ... index 5 = string 6 (low E)

export const LETTERS: Letter[];                  // C D E F G A B
export const NATURAL_PCS: PitchClass[];          // [0,2,4,5,7,9,11]
export const STANDARD_TUNING: Tuning;            // [4, 11, 7, 2, 9, 4]
export const MAX_FRET = 12;

export function pitchClass(n: Note): PitchClass;
export function isNatural(pc: PitchClass): boolean;
export function noteName(n: Note): string;       // "F♯", "B♭", "E", "F♯♯" (Unicode ♯ ♭)
export function spellPitchClass(pc: PitchClass, pref: SpellingPref, key?: Note): Note;
//   sharps/flats: forced. auto + key: the spelling used in majorScale(key) if pc is in it, else as no key.
//   auto, no key: C♯ E♭ F♯ A♭ B♭ (conventional default).
export function noteAt(stringIndex: number, fret: number, tuning?: Tuning): PitchClass; // tuning defaults to STANDARD_TUNING
export function fretsFor(pc: PitchClass, stringIndex: number, minFret: number, maxFret: number, tuning?: Tuning): number[];
export function semitonesUp(from: PitchClass, to: PitchClass): number; // 0..11

export type IntervalName = 'm2'|'M2'|'m3'|'M3'|'P4'|'A4'|'d5'|'P5'|'m6'|'M6'|'m7'|'M7'|'P8';
export interface Interval { name: IntervalName; label: string; semitones: number; letterSteps: number }
export const INTERVALS: Interval[];              // e.g. { name:'P5', label:'perfect 5th', semitones:7, letterSteps:4 }
export function transpose(n: Note, interval: IntervalName): Note; // moves letterSteps letters, fixes the accidental

export const MAJOR_STEPS: number[];              // [2,2,1,2,2,2,1]
export function majorScale(root: Note): Note[];  // 7 notes, one per letter, starting on root
export const CHROMATIC_PCS: PitchClass[];        // [0..11]
export function enharmonicLabel(pc: PitchClass, pref: SpellingPref): string; // auto: "C♯ D♭"; sharps/flats: single name
```
In strings 1–6, string number = `stringIndex + 1`. M2 adds to this module (see M2-1); do not add M2 functions in M1.

**`src/data` (data-layer):**
```ts
export type DrillType = 'fret-all-strings' | 'fret-note-on-string' | 'fret-neighborhood' | 'fret-reverse';
// M2 adds: 'interval-up' | 'interval-semitones' | 'scale-spell' | 'key-signature' | 'diatonic-chords' | 'transposer' | 'interval-nav' | 'octave-finder'
export type FretMode = 'natural' | 'chromatic';
export interface Attempt { id?: number; skillId: string; drill: DrillType; prompt: string; correct: boolean; ms: number; ts: number }
export interface Skill { id: string; name: string; phase: number; prerequisites: string[];
  mastery: number; lastReviewed: number | null; nextDue: number | null; box: number } // box 0..4
export interface Settings { spelling: SpellingPref; fretMode: FretMode; strings: number[] } // strings: 1..6; defaults auto, natural, [1..6]

export function logAttempt(a: Attempt): Promise<void>;
export function getAttempts(skillIds: string[]): Promise<Attempt[]>;    // sorted by ts ascending
export function getSkill(id: string): Promise<Skill | undefined>;
export function getSkills(): Promise<Skill[]>;
export function putSkill(s: Skill): Promise<void>;
export function getSettings(): Promise<Settings>;
export function saveSettings(s: Settings): Promise<void>;
```

**`src/mastery` (data-layer). Pure functions; types imported from `src/data/types.ts`. The weighted picker lives here.**
```ts
export const LEITNER_DAYS = [1, 3, 7, 14, 30];
export function nextDue(box: number, correct: boolean, now: number): { box: number; due: number };
//   correct: due = now + LEITNER_DAYS[box] days, box = min(box+1, 4). wrong: box = 0, due = now + 1 day. New skills start at box 0.
export function masteryScore(attempts: Attempt[], targetMs: number, now: number): number;
//   last 20 attempts; 0 if none. acc = correct/n; speed = min(1, targetMs / median(ms));
//   recency = max(0.5, 1 - daysSinceLast/60); score = (0.7*acc + 0.3*speed) * recency
export function isMastered(attempts: Attempt[], targetMs: number): boolean; // gate, see below
export function applyRun(skill: Skill, runAttempts: Attempt[], allAttempts: Attempt[], targetMs: number, now: number): Skill;
//   mastery = masteryScore(allAttempts...), lastReviewed = now. Pass = run accuracy >= 0.9.
//   Pass promotes only when due (nextDue null or now >= nextDue), else box/nextDue unchanged (no double promotion within a session).
//   Fail always resets to box 0, due now + 1 day.
export function pickWeighted<T extends { key: string }>(items: T[], attempts: Attempt[], targetMs: number, lastKey: string | undefined, rand: () => number): T; // rand required
//   per item (attempts whose prompt === key, last 5): unseen weight 3; else 1 + 4*(1-acc) + min(2, max(0, median/targetMs - 1) * 2)
export const TARGET_MS: Record<DrillType, number>;
export function fretSkillId(mode: FretMode, scope: string): string; // scope 's1'..'s6' | 'allstrings' | 'neighborhood'
export function newSkill(id: string): Skill;                        // name/phase from the catalog in skills.ts
```
**Fretboard skill IDs (16):** `fret:{natural|chromatic}:s{1-6}` (drills 2 and 4), `fret:{mode}:allstrings` (drill 1), `fret:{mode}:neighborhood` (drill 3). All are phase 1. The natural skills are prerequisites of the matching chromatic skills.

**Item keys (`Attempt.prompt`), compared by string equality only (no parsing):** drill 1 `"{pc}"`, drill 2 `"{pc}:s{n}"`, drill 3 `"{pc}@f{anchor}"`, drill 4 `"s{n}f{fret}"`. Each candidate object carries its own fields, so nothing ever needs to parse a key.

**Mastery gate (spec Section 6):** take the last 3 distinct local calendar days that have attempts for the skill (fewer than 3 days = not mastered). Pool those attempts: accuracy must be ≥ 90% and median `ms` ≤ `TARGET_MS[drill]`.

**Response-time targets (M1 gate level):**

| Drill | Target |
|---|---|
| fret-note-on-string | 2000 ms |
| fret-reverse | 2000 ms |
| fret-all-strings | 8000 ms (all six strings) |
| fret-neighborhood | 6000 ms |

The spec's later speed tiers (under 1 s, then metronome pace) arrive with the M3 planner as gate levels.

**Drill component contract (drills-ui):**
```ts
interface FretDrillProps { mode: FretMode; strings: number[]; spelling: SpellingPref; paused?: boolean; onAnswer?: (correct: boolean) => void }
// Screens own the Done bar; drills have no onExit.
```
- **Loop:**
  1. Build the candidate list from mode and strings. Natural mode keeps only natural pitch classes; drill 4 keeps only positions whose pitch class is natural.
  2. `pickWeighted` chooses the next item.
  3. The prompt is shown and `t0 = performance.now()` is recorded.
  4. The user answers; `ms = now - t0`.
  5. `logAttempt` saves the attempt.
  6. Feedback shows for about 700 ms (the answer on the fretboard, green or red), then the next prompt appears.
- **Drills 1–3 ("play it", self-graded):**
  - Drill 1: the note name, to be found on all six strings (ignores the string subset).
  - Drill 2: the note name plus a string number.
  - Drill 3: the note name plus an anchor fret marker; the window is anchor ±5, clamped to 0–12.

  The user answers with large **Got it** / **Missed** buttons. After grading, every correct location is revealed. Microphone verification is M4-8 (optional).
- **Drill 4 (reverse):** one fret is highlighted, and the user taps the answer on the NotePad. The answer is graded by pitch class, so either enharmonic name is correct.
- `useDrillRun(drill, skillIds)` loads attempts once, exposes `record(...)`, and on unmount calls `applyRun` and `putSkill` for every skill the run touched.
- When `paused` is true, input is ignored. On resume, `t0` resets so the paused time is not counted.
- Item 7 (natural/chromatic toggle and string-subset checkboxes) is in M1 as `DrillOptions`, saved to Settings.

**Simple session timer (M1 only; the M3 session runner replaces it):**
- Runs a fixed 10-minute sequence: Note on string 3:00 → Reverse 3:00 → Neighborhood 2:00 → All strings 2:00.
- Shows an mm:ss countdown. The clock is computed from `Date.now()` so it survives backgrounding.
- **Pause** and **Skip block** buttons are always visible. Blocks advance automatically.
- It requests a screen wake lock if the browser supports one.
- At the end it shows a summary: attempt count and accuracy for each block. The Practice screen has one big **Start session** button plus links to each drill.

---

## Milestone 2: Theory drills (5.2) and Key Explorer
- [ ] **M2-1 Keys and diatonic harmony** (theory-engine). Files: `src/music/keys.ts`, `src/music/chords.ts`, `src/music/progressions.ts`, plus tests. Depends: M1-1.
  Accept: adds the following:
  - `MAJOR_KEYS` (15, in circle-of-fifths order).
  - `keySignature(root)`, returning `{ count, notes }` (positive count = sharps, negative = flats).
  - `relativeMinor`.
  - `Chord { root: Note; quality }` with qualities maj, min, dim, maj7, 7, m7, m7b5.
  - `chordName`, `diatonicTriads`, `diatonicSevenths`, `romanNumeral(degree, quality)`.
  - `chordsFromDegrees(key, degrees)`, `keysContaining(chord)`.
  - `PROGRESSIONS` (I-V-vi-IV, I-vi-IV-V, ii-V-I, I-IV-iii-V, 12-bar blues, Canon).
- [ ] **M2-2 Theory skills and targets** (data-layer). Files: `src/mastery/skills.ts`, `src/mastery/targets.ts`. Depends: M1-3.
  Accept: adds these skill IDs: `int:up:{P5}`, `int:semis:{P5}`, `scale:major`, `keysig`, `diatonic:triads`, `diatonic:keys-of-chord`, `transpose:to-chords`, `transpose:to-numerals`, `fret:intnav:{M3}`, `fret:octave`. Targets are set for each.
- [ ] **M2-3 Answer pads** (drills-ui). Files: `src/components/SpellPad.tsx` (letter buttons plus a ♭/♮/♯ toggle), `src/components/ChordPad.tsx`, `src/components/NumeralPad.tsx`. Depends: M1-4.
- [ ] **M2-4 Theory drills** (drills-ui). Files: `src/drills/IntervalQuiz.tsx` (both directions), `ScaleSpell.tsx`, `KeySignature.tsx`, `DiatonicChords.tsx` (key → chords, chord → keys), `Transposer.tsx` (both directions). Depends: M2-1, M2-2, M2-3.
  Accept: every question uses a random key or root, and grading compares spelled notes (letter + accidental), not pitch class.
- [ ] **M2-5 Fretboard drills 5.1 items 5–6** (drills-ui). Files: `src/drills/IntervalNav.tsx`, `src/drills/OctaveFinder.tsx`. Depends: M2-1, M2-2.
- [ ] **M2-6 Key Explorer and fretboard labels** (drills-ui). Files: `src/screens/KeyExplorer.tsx`, `Fretboard.tsx` (adds a label toggle: names, intervals, degrees). Depends: M2-1.
  Accept: any key shows its notes, triads, sevenths, relative minor, and progressions as numerals and chord names. The fretboard highlights the scale.
- [ ] **M2-7 Practice screen and timer** (drills-ui). Files: `Practice.tsx`, `SessionTimer.tsx`. Depends: M2-4.
  Accept: theory drills are listed, and the timer gains a 5-minute mixed theory block.
- [ ] **M2-8 Tests** (tester) and **M2-9 Review** (reviewer). Depends: all of M2.

**Parallel groups (M2):** wave 1: M2-1, M2-2, M2-3 · wave 2: M2-4, M2-5, M2-6 · wave 3: M2-7, M2-8 · wave 4: M2-9

## Milestone 3: Planner, Home, session runner, metronome, .ics
- [ ] **M3-1 Data v2** (data-layer). Files: `src/data/types.ts`, `db.ts`. Depends: M1-2.
  Accept: adds a `SessionPlan` store, schedule and reminders fields in Settings, and an idb upgrade from version 1 to 2 that keeps existing data.
- [ ] **M3-2 Planner core** (planner). Files: `src/planner/schedule.ts`, `src/planner/generate.ts`, `src/planner/streak.ts`, `src/planner/phases.ts`, plus tests. Depends: M3-1, M2-2.
  Accept:
  - Day types (spec Section 3): MWF, Tu/Th and Saturday-optional sessions. Sunday is a rest day.
  - Block order and minutes follow spec Section 3.
  - Spaced review uses `nextDue` items. Repair blocks cover skills below 0.7. Each session has one new concept and mixes skills within blocks.
  - A 10-minute Minimum Session is available.
  - Phase gates use `isMastered`. Phase unlock triggers a celebration.
  - Streak: one missed day is forgiven. Weekly goal: sessions out of 5. Sunday never counts toward either.
  - Blocks for features that don't exist yet (Apply, Ear, Song Lab) become timed free-practice blocks with a one-line instruction. These include the spec 5.3 playing drills as self-graded instructions.
- [ ] **M3-3 Lessons, phases 1–3** (planner). Files: `src/planner/lessons.ts`. Depends: M3-2.
  Accept: each lesson takes under 5 minutes to read and ends with a recall drill.
- [ ] **M3-4 Metronome and audio unlock** (audio). Files: `src/audio/context.ts`, `src/audio/metronome.ts`. Depends: M1-0.
  Accept: the AudioContext is created or resumed inside the first tap handler, and clicks are scheduled ahead on the audio clock.
  **iOS:** sound starts after a tap, works in the installed PWA, and the silent-switch behavior is documented, with an on-screen hint if the app is muted.
- [ ] **M3-5 Session runner** (drills-ui). Files: `src/screens/SessionRunner.tsx` (replaces `SessionTimer`). Depends: M3-2, M3-4.
  Accept: runs the generated plan with block timer, auto-advance, an always-visible metronome, Pause and Skip block. It ends with a one-tap difficulty rating and a preview of tomorrow's focus.
  Also accept: Restore an in-progress session after the app is killed/reloaded (user feedback).
- [ ] **M3-6 Home** (drills-ui). Files: `src/screens/Home.tsx`, `App.tsx`. Depends: M3-2.
  Accept: opening the app shows today's session, one big Start button, the streak and the weekly goal. Nothing has to be set up first.
- [ ] **M3-7 Settings and .ics export** (planner owns `src/planner/ics.ts`; drills-ui owns `Settings.tsx`). Depends: M3-1.
  Accept:
  - The schedule is editable.
  - The .ics file has weekly RRULE events (MWF 14:00–15:00, Tu/Th 12:00–13:00), a VALARM 10 minutes before, and a URL pointing to the app. There are no Sunday events.
  **iOS:** the download imports into iPhone Calendar from the installed PWA; if it doesn't, use the documented fallback of opening the file in Safari. The alert fires, and the event link opens the app.
- [ ] **M3-8 Tests** (tester) and **M3-9 Review** (reviewer).

**Parallel groups (M3):** wave 1: M3-1, M3-4 · wave 2: M3-2, M3-7 · wave 3: M3-3, M3-5, M3-6 · wave 4: M3-8 → M3-9

## Milestone 4: Backing tracks, improvisation constraints, ear training
- [ ] **M4-1 Voicing and rhythm data** (theory-engine). Files: `src/music/voicing.ts`. Depends: M2-1.
  Accept: chord → MIDI notes for playback, and cadence builders for ear training.
- [ ] **M4-2 Synth and backing tracks** (audio). Files: `src/audio/synth.ts`, `src/audio/backing.ts`. Depends: M3-4, M4-1.
  Accept: any key and progression plays with tempo, pop/rock/funk/blues/swing styles and a loop count, all synthesized in the browser.
- [ ] **M4-3 Recorder** (audio). Files: `src/audio/recorder.ts`, `src/components/RecordButton.tsx`. Depends: M3-4.
  Accept: records 60 seconds and plays it back.
  **iOS:** the mic permission prompt appears in the standalone PWA and the permission persists, MediaRecorder output plays back, and headphones and the speaker both work.
- [ ] **M4-4 Improvisation constraints** (planner). Files: `src/planner/constraints.ts`. Depends: M3-2.
  Accept: one constraint per day, rotating, from the spec 5.4 list.
- [ ] **M4-5 Improvisation screen** (drills-ui). Files: `src/screens/Improv.tsx`. Depends: M4-2, M4-3, M4-4.
- [ ] **M4-6 Ear-training skills** (planner). Depends: M3-2.
- [ ] **M4-7 Ear drills** (drills-ui + audio). Files: `src/drills/ear/*`. Depends: M4-2, M4-6.
  Accept: all six spec 5.5 drills, with a random key on every question; the session's 7 minutes mix the drills together.
- [ ] **M4-8 (optional) Mic verification for fretboard drills 1–2** (audio). Files: `src/audio/pitch.ts` (McLeod pitch method). Depends: M4-3.
  Accept: Got it / Missed always remains available as a fallback.
  **iOS:** works when held near an acoustic or amplified guitar.
- [ ] **M4-9 Planner wiring** (planner). The Apply-Wednesday, Ear and jam blocks now use the real drills. Then **M4-10 tests**, **M4-11 review**.

**Parallel groups (M4):** wave 1: M4-1, M4-3, M4-4, M4-6 · wave 2: M4-2, M4-8 · wave 3: M4-5, M4-7 · wave 4: M4-9 → M4-10 → M4-11

## Milestone 5: Song Lab
- [ ] **M5-1 Song and Progression stores** (data-layer). Files: `src/data/*`. Depends: M3-1.
  Accept: a version 3 upgrade adds both stores. Songs have a `referenceVerified: boolean` field.
- [ ] **M5-2 Analysis comparison** (theory-engine). Files: `src/music/analysis.ts`. Depends: M2-1.
  Accept: numerals ↔ chords in a key, flagging of non-diatonic chords (borrowed, secondary dominant, other), and a diff between the user's analysis and the reference.
- [ ] **M5-3 Seed progressions** (song-lab). Accept: the five progressions from spec Section 7, plus Overdrive (A, F♯m, D, E in A).
- [ ] **M5-4 Song Lab screens** (song-lab). Files: `src/screens/SongLab/*`. Depends: M5-1, M5-2, M4-2.
  Accept:
  - Follows the 7-step workflow.
  - The user enters an analysis before the reference is revealed. A reference is shown only if `referenceVerified` is true.
  - Includes a transpose tool and a backing loop in the song's key.
  - Concept tags feed into the skills.
- [ ] **M5-5 Tu/Th planner blocks use Song Lab** (planner). Then **M5-6 tests**, **M5-7 review**.

**Parallel groups (M5):** wave 1: M5-1, M5-2, M5-3 · wave 2: M5-4 · wave 3: M5-5, M5-6 · wave 4: M5-7

## Milestone 6: Chord Lab and Harmony Navigator
- [ ] **M6-1 Chords and harmony** (theory-engine). Files: `src/music/chords.ts`, `voicing.ts`, `harmony.ts`. Depends: M2-1.
  Accept:
  - Every chord formula in spec Phase 6.
  - Shell voicings on strings 6/5/4, triad inversions on the top strings, quartal voicings, and a voice-leading distance measure.
  - Secondary dominants, borrowed iv/♭VII, tritone substitution.
  - Next-chord suggestions with function and a default mood label.
- [ ] **M6-2 Mood labels** (data-layer). Accept: mood labels the user edits are stored and override the defaults.
- [ ] **M6-3 Chord Lab recipes** (song-lab). Files: `src/screens/ChordLab/*`. Depends: M6-1, M4-2.
  Accept: each spec 5.6 recipe has a lesson, examples in 2–3 keys and a drill.
- [ ] **M6-4 Harmony Navigator and Sandbox** (drills-ui). Depends: M6-1, M6-2, M4-2.
  Accept: Play it buttons, and the Sandbox shows Roman numerals live.
- [ ] **M6-5 Drills: chord from formula, next chord** (drills-ui). Then **M6-6 Friday Apply block uses Chord Lab** (planner), **M6-7 tests**, **M6-8 review**.

**Parallel groups (M6):** wave 1: M6-1, M6-2 · wave 2: M6-3, M6-4, M6-5 · wave 3: M6-6, M6-7 · wave 4: M6-8

## Milestone 7: Piano mode, heatmap, Progress, polish, export
- [ ] **M7-1 Keyboard component and piano versions of the note and interval drills** (drills-ui). Depends: M2-5.
  Accept: Settings has an instrument switch. **iOS:** microphone checking of a real piano works if M4-8 shipped.
- [ ] **M7-2 Progress screen** (drills-ui). Accept: mastery map, fretboard heatmap of accuracy per note and string (built from attempt keys), streaks, total practice time, weekly summary.
- [ ] **M7-3 Left-handed view and tuning setting** (drills-ui).
- [ ] **M7-4 JSON export and import** (data-layer). Accept: the round trip passes a test. **iOS:** the exported file can be saved to Files.
- [ ] **M7-5 Polish pass** (reviewer + drills-ui). Accept: tap targets, contrast, and how quickly a drill responds after the user enters an answer.
- [ ] **M7-6 Tests**, **M7-7 final iOS regression** (user): install, offline launch, audio, mic, .ics, export.

**Parallel groups (M7):** wave 1: M7-1, M7-2, M7-3, M7-4 · wave 2: M7-5, M7-6 · wave 3: M7-7

---

## Open decisions / assumptions
1. **String numbering:** `stringIndex` 0 is string 1 (high E), so string number = index + 1, and skill IDs use string numbers.
2. **Fret range:** drills use frets 0–12. The neighborhood window is clamped to 0–12.
3. **Fretboard orientation:** horizontal like tab (string 1/high e on top, nut on the left, frets 0–12 left to right), per user feedback 2026-11-01; it replaces the original vertical layout. A left-handed mirror comes in M7.
4. **Spelling:** in `auto` mode with no key, chromatic notes are spelled C♯ E♭ F♯ A♭ B♭. With a key, they follow the key's major-scale spelling. Fretboard drills grade by pitch class; theory drills grade the spelled note.
5. **Key set:** theory drills draw from all 15 major key signatures, including C♯ and C♭.
6. **"Last three sessions":** the last 3 distinct local calendar days with attempts for the skill, with all attempts in those days pooled. `Attempt` therefore needs no session id.
7. **Leitner scope:** one box per skill, not per item. Weak items within a skill are handled by `pickWeighted`. A run counts as "correct" for Leitner if its accuracy is ≥ 90%.
8. **Mastery score formula:** the spec gives no formula, so the simple weighted version in `masteryScore` is used.
9. **Unassigned spec items:**
   - Fretboard drills 5.1 items 5–6 → M2.
   - The 5.3 playing drills → M3, as self-graded planner blocks.
   - Lessons → added with the milestone that covers each phase.
   - Chord-from-formula and next-chord drills → M6.
   - The Progress screen → M7.
   - Microphone verification → M4-8, optional.
10. **Neighborhood drill grading:** self-graded with Got it / Missed, with all locations revealed afterward. Tapping each location on the fretboard would take more work.
11. **M1 has a temporary Practice screen and a small Settings screen** (spelling plus drill options). The decision-free Home screen arrives in M3.
12. **Data safety:** `navigator.storage.persist()` is requested in M1. Export and import ship in M7, but could move earlier if the user worries about losing data before then.
13. **Packages:** `fake-indexeddb` is a dev dependency for data tests. No Tone.js; plain Web Audio only.
14. **.ics download:** if downloading from the standalone PWA fails on iOS, the fallback is a link that opens the file in Safari.
15. `noUncheckedIndexedAccess` is enabled in tsconfig (stricter indexing).
16. All strings drill (5.1 item 1) always uses all six strings; the string-subset option applies to the other drills.
17. Leitner promotion only when due; failures always reset to box 0.
