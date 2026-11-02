# Fretboard Trainer

Mobile-first PWA for Lucas, an intermediate guitarist and pop punk songwriter. It teaches the fretboard and music theory through adaptive daily sessions generated from mastery data. Top product rule (spec Section 1): opening the app shows today's session and one big Start button. No setup, no menus, no decisions before the first note. If a feature adds friction, cut it.

- Spec (source of truth): `docs/SPEC.md`
- Task plan: `docs/PLAN.md`. Keep it updated as tasks complete.

## Tech stack

- React + TypeScript (strict) + Vite
- `vite-plugin-pwa`: service worker, offline-first, precache
- IndexedDB via `idb`
- Vitest for tests
- Plain CSS, no UI library
- No router library: screens switch via React state
- Web Audio API for sound. Tone.js may be considered in Milestone 4 only if plain Web Audio is clearly insufficient.
- Pitch detection (later): a McLeod pitch method library (e.g. `pitchy`). Always optional, always with a manual Got it / Missed fallback.

## Hosting

- GitHub Pages, deployed by GitHub Actions on push to `main`
- Repo: github.com/lucasvlad/guitar-app (public, required for free Pages)
- Live URL: https://lucasvlad.github.io/guitar-app/
- Vite `base: '/guitar-app/'`
- `BASE_PATH` env var overrides the Vite base (default `/guitar-app/`; use `/` for a root-hosted static site).
- Status: live; repo is public with user approval (also used as a portfolio project).

## Folder structure

Create folders only when needed.

- `src/music/`: THE pure-function music theory module (notes, spelling, intervals, scales, keys, chords, Roman numerals, transposition). No React, no IO, no randomness inside core functions (pass randomness in, or keep random pickers in drills). Fully unit tested in `src/music/*.test.ts`.
- `src/mastery/`: pure mastery scoring and spaced repetition (Leitner) logic, tested.
- `src/data/`: data model types (spec Section 9) and IndexedDB access via `idb`. The only module that touches IndexedDB.
- `src/planner/`: session generator (Milestone 3), pure and tested.
- `src/audio/`: Web Audio (metronome, note/chord playback, backing tracks, recording).
- `src/components/`: shared UI (Fretboard view, Keyboard, Timer, big buttons).
- `src/drills/`: one component per drill type.
- `src/screens/`: Home, SessionRunner, KeyExplorer, Progress, Settings, SongLab, ChordLab, etc.
- `public/`: icons. `.github/workflows/deploy.yml`: CI deploy.

## Commands

- `npm run dev`: `vite --host`. Open the LAN URL on the phone (same Wi-Fi).
- `npm test` / `npm run test:watch`
- `npm run typecheck`
- `npm run build` / `npm run preview`
- `npm run check`: typecheck + test + build
- `npm run deploy`: check, then `git push origin main`; Actions deploys.
- Install on iPhone: open the live URL in Safari > Share > Add to Home Screen.

## Code style (mandatory, user's stated preferences)

- Minimal, tightly scoped solutions.
- NO regular expressions anywhere. Parse strings with plain code.
- No speculative abstractions or unused generality.
- Build only what the current milestone needs.
- Plain, readable code; small files.
- Mobile-first UI: big tap targets (min 48px, prefer 56px+). Functionality before polish.

## Hard rule: music logic lives in src/music

- ALL music logic lives in `src/music` as pure functions with tests.
- UI and other modules never compute intervals, spelling, or chords themselves; they call `src/music`.
- Enharmonic spelling must be correct: a major scale uses each letter name once (F# major contains E#, not F).

## iOS Safari notes

- Audio must start from a user tap: resume the `AudioContext` inside the tap handler.
- The silent (ringer) switch can mute Web Audio. Must verify on device.
- Microphone permission inside the installed PWA must be verified on device.
- Web apps get no scheduled local notifications, so reminders are `.ics` calendar events.
- Anything that cannot be verified without the device must be flagged to the user.

## Milestones (spec Section 11)

Stop and wait for the user's go-ahead after each milestone.

1. Project setup with free static hosting (so the phone can install the app), the music theory module with tests, fretboard drills 5.1 (items 1 to 4), mastery tracking, local storage, a simple session timer.
2. Theory drills from 5.2 (intervals, scale spelling, keys, diatonic chords, the transposer drill) and the Key Explorer.
3. The planner (weekly schedule, session generator, spaced review, Minimum Session), the Home screen, and the calendar (.ics) reminder export.
4. Backing track generator, improvisation constraints, and ear training.
5. Song Lab.
6. Chord Lab and Harmony Navigator.
7. Piano mode, the fretboard heatmap, polish, and data export.

## Workflow

For each milestone:

1. Implement via subagents (`.claude/agents/`) with non-overlapping file ownership.
2. A `reviewer` subagent checks the work against the spec and these rules.
3. Run `npm run check`.
4. Commit. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Decisions (append-only log)

- 2026-11-01: PWA stack chosen over native, Flutter, or React Native: fastest path, no App Store, recommended by the spec.
- 2026-11-01: Hosting on GitHub Pages via GitHub Actions; repo is public.
- 2026-11-01: Spelling default is the conventional spelling per key (the key signature decides sharps vs flats). For random notes outside a key context, use the common name: C# Eb F# Ab Bb. Settings override: auto / sharps / flats.
- 2026-11-01: No router library.
- 2026-11-01: Plain CSS, no UI library.
- 2026-11-01: Web Audio first; Tone.js only if clearly needed (Milestone 4).
- 2026-11-01: `idb` as the IndexedDB wrapper.
- 2026-11-01: Spaced repetition uses Leitner boxes with intervals of 1, 3, 7, 14, 30 days (spec Section 6 allows Leitner or SM-2).
- 2026-11-01: Sunday is excluded from streaks and the weekly goal (rest day, no reminder).
- 2026-11-01: Fretboard is vertical on screen (nut at top, string 6 left), frets 0-12; stringIndex 0 = string 1 (high E).
- 2026-11-01: All strings drill (5.1 item 1) always uses all six strings; the string-subset option applies to the other drills.
- 2026-11-01: Leitner promotion only when a skill is due (prevents double promotion within a session); failures always reset to box 0.
