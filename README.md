# Fretboard Trainer

A local-first progressive web app that teaches the guitar fretboard and music theory through short, adaptive practice sessions. It is designed around one rule: open the app and press Start. There is no setup and no menu to get through first. The app picks what to practise based on what you are weakest at.

**Live demo:** https://lucasvlad.github.io/guitar-app/

**Install on iPhone:** open the link in Safari, then tap Share > Add to Home Screen. The installed app runs full-screen and works offline.

## Status

Milestone 1 of 7 is built. It includes:

- Project setup, PWA manifest and service worker, and CI/CD to GitHub Pages
- A music theory core: notes, enharmonic spelling, intervals, major scales and fretboard mapping
- Four fretboard drills, with natural or chromatic note sets and a string subset option (the All strings drill always uses all six)
- Mastery tracking, Leitner spaced repetition and an adaptive item picker
- Local storage in IndexedDB
- A 10-minute timed session

Roadmap:

2. Theory drills (intervals, scale spelling, keys, diatonic chords, transposer) and a Key Explorer
3. Adaptive planner (weekly schedule, session generator, spaced review), Home screen, `.ics` calendar reminders
4. Backing-track generator, improvisation constraints, ear training
5. Song Lab: analyse real songs' keys and progressions
6. Chord Lab and Harmony Navigator
7. Piano mode, fretboard heatmap, polish, data export

## Features (current)

- **Four fretboard drills**
  - *Note on string*: find a given note on a given string.
  - *Reverse*: a fret is highlighted and you name the note.
  - *Neighborhood*: find every location of a note within five frets of an anchor.
  - *All strings*: find a note on all six strings.
- **Adaptive item selection:** each next question is a weighted draw that favours notes you have recently missed or answered slowly, and the same item never comes up twice in a row.
- **Mastery tracking and spaced repetition:** every attempt is recorded. Skills move through Leitner boxes with review intervals of 1, 3, 7, 14 and 30 days. A skill counts as mastered when, across your last 3 practice days, accuracy is at least 90% and your median answer time is within its speed target.
- **10-minute timed session:** a fixed sequence of the four drills with Pause, Skip and a per-block tally. The timer runs on wall-clock time, and a wake lock keeps the screen on.
- **Offline support:** the service worker precaches the whole build, so the installed app works in airplane mode.
- **Data stays on the device:** everything is stored in IndexedDB. There are no accounts, no server and no tracking.

## Technical highlights

- **React 19 + TypeScript (strict) + Vite** with `vite-plugin-pwa`. A Workbox-generated service worker precaches the build and updates itself automatically.
- **IndexedDB via `idb`**, isolated in `src/data/`, the only module that touches storage. It has versioned stores for attempts, skills and settings, and asks for persistent storage.
- **A pure-function music theory engine** (`src/music/`) with no React, no I/O and no hidden randomness. Spelling is enharmonically correct: every major scale uses each letter name exactly once, so F♯ major contains E♯ (not F) and C♭ major contains F♭. Tests cover all 15 major keys, every open string at frets 0–12, and transposition by every interval.
- **A pure mastery and spaced-repetition module** (`src/mastery/`). You can pass in your own random source, so the tests check the weighted picker's statistics over 10,000 seeded draws.
- **Integration tests** for the drills and components, using Testing Library on jsdom with `fake-indexeddb` standing in for the real database.
- **117 tests across 15 files**, all run by `npx vitest run` in about 1.3 seconds.
- **CI/CD:** every push to `main` runs typecheck, tests and build in GitHub Actions, then deploys to GitHub Pages.
- **Code style constraints:** the codebase contains no regular expressions; all strings are parsed with plain code. Abstractions are kept minimal, files are small, and each milestone builds only what it needs. All music logic lives in `src/music`, and the UI never computes notes or intervals itself.
- No router or UI library: screens switch via React state, and styling is plain CSS with mobile-first tap targets of 48px or more.

## Project structure

```
src/music/       Pure music theory: notes, spelling, intervals, scales, fretboard (unit tested)
src/mastery/     Pure mastery scoring, Leitner scheduling, weighted item picker, skill targets
src/data/        Data model types and IndexedDB access (idb)
src/drills/      One component per fretboard drill, plus the shared drill-run hook and options
src/components/  Shared UI: vertical Fretboard, NotePad, grade buttons
src/screens/     Practice (start screen), SessionTimer, Settings
public/          App icons and PWA assets
docs/            SPEC.md (product spec) and PLAN.md (task plan)
.claude/agents/  Subagent definitions used to build the project
.github/         GitHub Actions deploy workflow
```

## Development

Requires Node 24 (the version used in CI).

```sh
npm install
npm run dev      # Vite dev server on the LAN; open the printed network URL on a phone
npm test         # Vitest, single run (npm run test:watch for watch mode)
npm run check    # typecheck + tests + production build
npm run build    # production build to dist/ (npm run preview to serve it)
```

The app is served from `/guitar-app/` by default. Set `BASE_PATH=/` to build for a host that serves from the root.

**Deploying:** push to `main`. GitHub Actions runs the checks and publishes `dist/` to GitHub Pages. `npm run deploy` runs `npm run check` first and then pushes.

## Built with Claude Code

This project was built with [Claude Code](https://claude.com/claude-code). An orchestrator assigns tasks to specialised subagents (theory engine, data layer, drills UI, tester, reviewer and others), each owning its own files. The agent definitions are in [`.claude/agents/`](.claude/agents/). The product spec is in [`docs/SPEC.md`](docs/SPEC.md), and [`docs/PLAN.md`](docs/PLAN.md) breaks it into milestone tasks with acceptance criteria and interface contracts.
