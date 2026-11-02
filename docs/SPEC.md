# Fretboard & Theory Trainer: App Spec for Claude Code

Hand this document to Claude Code. Build iteratively, one milestone at a time (see Build Order), and confirm each milestone with the user before starting the next.

## 1. Who this is for and what it must do

The user (Lucas) is an intermediate guitarist and songwriter who writes original pop punk. He plays guitar by feel and wants to become fluent in theory so he can:

- Build any chord on the fly and know which chords can come next.
- Know every key (its notes and chords) and transpose instantly by thinking in scale degrees and Roman numerals (a 1-4-3-5 progression in any key).
- Hear a song, find the key and the progression by ear, and play along.
- Improvise over a track using the key's scale, pentatonics, or modes, chosen deliberately.
- Learn scales from their construction (interval formulas), not as memorized shapes.
- Know the fretboard by note name, the way a pianist knows the keys.
- Break down songs by artists he admires, learn the scales and harmony behind the riffs, then improvise over the track and change things. John Mayer is the stated inspiration for this method.
- Make plain chords sound funkier or jazzier and eventually jam freely, including over jazz.

Theory should be taught guitar-first, but every concept must be instrument-neutral (notes, intervals, scale degrees), and the app needs a Piano mode so the same drills work on a keyboard.

### The most important design constraint

Lucas has said plainly that he will not practice if it is not very easy. The app's job is to remove every decision. Opening the app should show today's session and one big Start button. No setup, no choosing what to work on, no menus. If a feature adds friction before the first note is played, cut it.

## 2. Practice schedule model

Default schedule, editable in Settings:

- Monday, Wednesday, Friday: 2:00 to 3:00 pm, 60 minutes.
- Tuesday and Thursday: 12:00 to 1:00 pm, 60 minutes (the user's free hour once his noon class ends).
- Saturday and Sunday: optional, with no required sessions. Sunday is a rest day (Sabbath), so the app sends no Sunday reminder and Sunday never affects streaks or the weekly goal. Saturday morning is an optional slot the user may use. On either day the user can open the app for a 10-minute Minimum Session or a full session if he has time.

Support:

- Reminders shortly before each scheduled slot, delivered as iPhone Calendar events (see Tech Notes).
- A Minimum Session of 10 minutes (fretboard drill plus one theory drill) that counts as showing up on a bad day. Streaks are forgiving: one missed day does not reset the streak, and the weekly goal is sessions completed out of 5.
- Skipped sessions never pile up as guilt. The planner simply continues from where the user is.

## 3. Session structure

Sessions are auto-generated from the user's skill mastery data (Section 6). The session runner shows a timer per block, advances automatically, and has a metronome and a pause button always visible.

### Monday, Wednesday, Friday (60 minutes, instrument in hand)

1. Spaced review warm-up (5 min): items due for review from earlier lessons, as quick prompts (intervals, key signatures, diatonic chords, chord formulas).
2. Fretboard (10 min): the fretboard drills in Section 5.1, weighted toward the user's weak notes and strings.
3. Theory build (15 min): a short lesson (3 to 5 minutes of reading, maximum) followed by active drills on the new concept. Always recall, never just reading.
4. Apply (20 min), which rotates by day:
   - Monday: progressions and transposing. Given Roman numerals and a key, play the progression in two or three places on the neck.
   - Wednesday: scales and improvisation over a generated backing track, with a constraint of the day.
   - Friday: Chord Lab (voicings, extensions, funk and jazz treatments of a plain progression).
5. Ear training (7 min): Section 5.5.
6. Log and preview (3 min): the user rates difficulty with one tap, the app shows tomorrow's focus.

### Tuesday and Thursday (60 minutes, listening-heavy)

- Tuesday is Song Lab analysis: pick a song, find the key by ear, write the progression as Roman numerals, identify the scale material in the riffs and solo, flag non-diatonic chords. Then check against the reference (Section 7).
- Thursday is Song Lab application: play along, improvise over the original track or a generated backing track in the same key, then modify (transpose it, swap a chord, rewrite a melody, change the feel). End with 10 to 15 minutes of free jamming over a backing track with one constraint.
- Both days begin with 5 minutes of spaced review and 5 minutes of fretboard.

## 4. Curriculum: phases with mastery gates

Progress is gated by mastery, not by the calendar. A phase unlocks when the previous phase's core skills meet the gate in Section 6. Rough pacing is given only as a guide, assuming five sessions a week; some phases will go faster or slower.

### Phase 1: Fretboard and intervals (about weeks 1 to 4)

- Note names on every string, natural notes first, then sharps and flats.
- Half steps and whole steps; interval names and their semitone counts (minor 2nd through octave); major and minor 3rd, perfect 4th and 5th by sight, sound, and fretboard distance.
- Octave shapes across strings as navigation landmarks.

### Phase 2: Major scale construction and keys (about weeks 3 to 6)

- Build the major scale from its formula (whole, whole, half, whole, whole, whole, half) from any root, spelled on paper first, then located on the neck.
- Sharps and flats in keys, the circle of fifths, and relative minors.
- Scale degrees (1 through 7) as a language.

### Phase 3: Diatonic harmony and transposing (about weeks 5 to 9)

- Build triads by stacking thirds from the scale: I ii iii IV V vi vii-dim in any major key.
- Diatonic seventh chords: Imaj7, ii7, iii7, IVmaj7, V7, vi7, vii half-diminished.
- Roman numeral progressions: translating between a numeral progression and chord names in any key, and transposing on the fly.
- Common progressions library (I-V-vi-IV, I-vi-IV-V, ii-V-I, 12-bar blues, and others).
- Chord function: tonic, subdominant, dominant, and what each one makes the ear expect.

### Phase 4: Minor keys, pentatonics, and first improvisation (about weeks 8 to 14)

- Natural minor from its formula; harmonic and melodic minor and the chords they create; the relationship to the relative major.
- Minor and major pentatonic as subsets of the full scale (they come from removing two notes, not from a shape); the blues scale as minor pentatonic plus the flat 5.
- Choosing a scale for a key; chord tones as targets; phrasing basics.

### Phase 5: Modes (about weeks 12 to 18)

- Modes as the same notes with a different home, then as formulas relative to the major scale (for example, Dorian is a major scale with a flat 3 and flat 7).
- Hearing each mode against a static chord or drone.
- Matching modes to chords and progressions: Mixolydian over dominant vamps, Dorian over minor vamps, Lydian for a bright major sound.

### Phase 6: Chord extensions, voicings, and color (about weeks 16 to 26)

- Chord formulas from the root: major, minor, diminished, augmented, sus2, sus4, add9, 6, 7, maj7, m7, m7b5, 9, 11, 13.
- Voicings you can derive instead of memorize: shell voicings (root, 3rd, and 7th) on strings 6, 5, and 4; top-string triad inversions; quartal voicings.
- Voice leading: moving each note by the smallest distance between chords.
- Funk and jazz treatments of plain chords (Section 5.6).

### Phase 7: Advanced harmony and jazz improvisation (about week 24 onward)

- Secondary dominants, borrowed chords (modal interchange), the ii-V-I in major and minor, tritone substitution, passing diminished chords.
- Guide tones (the 3rd and 7th) and outlining changes while improvising.
- Jazz standards form (blues, rhythm changes, and a short list of standards) and jam-session skills such as comping, trading fours, and call and response.

## 5. Exercise library

Every drill should record accuracy and response time per item. Items are chosen by a weighted random draw that favors weak and slow items, and finished items re-appear on a spaced schedule.

### 5.1 Fretboard drills (guitar)

The user's own idea, kept and extended:

1. Random note, every string: the app shows a note name (for example, F sharp) and the user finds and plays it on all six strings. Optional microphone verification (see Tech Notes); otherwise tap Got it or Missed.
2. Random note and random string: find that note on that string. Targets a response in under two seconds.
3. Neighborhood drill: random note plus a random fret as an anchor; name every location of that note within five frets of the anchor. This trains the habit of seeing a region of the neck at once, which is what later replaces memorized scale boxes.
4. Reverse drill: the app highlights a fret on a string; the user names the note.
5. Interval navigation: start on a highlighted note and find the major 3rd, perfect 5th, or other interval on a different string, without counting from the nut.
6. Octave and unison finder: find the same note one or two strings up or down, as a landmark skill.
7. Natural-notes-only mode and a full chromatic mode; a Strings subset option (for example, only strings 6, 5, and 4) to scope the work.
8. Piano mode: the same note-naming and interval drills on an on-screen keyboard, plus Play it on the real piano with microphone verification where possible.

Progression: naming slowly, then under 2 seconds, then under 1 second, then with the metronome at a fixed pace.

### 5.2 Theory drills (no instrument required)

- Interval quiz in both directions: name the note a perfect 5th above a random note; give the semitone count for a named interval.
- Scale spelling: given a random root and a scale formula, type or tap all the notes in order. Starts with major, then minor, then pentatonics, then modes.
- Key signature and circle of fifths: how many sharps or flats, and which ones.
- Diatonic chord builder: given a key, name all seven chords; given a chord, name the key or keys it belongs to.
- The transposer drill: given Roman numerals (for example I-IV-iii-V) and a random key, say or tap the chord names; and the reverse, given chords in a key, give the numerals.
- Chord from formula: spell any chord from its formula in any root (for example, a minor 7th chord on E flat).
- Next chord drill: given a key and the current chord, name three chords that could plausibly follow and say what each one does (resolves, lifts, surprises).

### 5.3 Playing drills on guitar or piano

- Locate the whole key on the neck: given a key, find every note of the scale across the fretboard in one region, naming them as you go.
- Play a progression from numerals in a key, in three different positions on the neck.
- Chord tone targeting: over a looping chord, play only the chord tones, then add one passing note.
- Pentatonic-as-subset drill: starting from the full scale in a region, remove the two notes that make it pentatonic and play it.

### 5.4 Improvisation constraints (rotate daily, one at a time)

- Use only three notes of the scale for the whole loop.
- Land on a chord tone on the first beat of every bar.
- Rhythm first: improvise with a single note, focusing only on rhythm.
- Call and response: play a short phrase, answer it with a variation.
- Motif development: invent a four-note motif and develop it for a minute (repeat, shift, invert, change rhythm).
- Target the 3rd of each new chord.
- Sing or hum the line a moment before playing it.
- Hard rule for every improv session: record 60 seconds and replay the best 15 seconds. The app should include a simple record and playback button.

### 5.5 Ear training (7 minutes, interleaved)

- Interval recognition with song references (for example, an interval that opens a well-known melody). Mix three or four intervals per session rather than drilling one in isolation.
- Chord quality recognition: major, minor, diminished, dominant 7, major 7, minor 7.
- Functional ear training: the app plays a cadence to establish a key, then a single note, and the user names the scale degree. This is the fastest route to hearing in numbers.
- Progression recognition: the app plays a four-chord progression and the user answers in Roman numerals.
- Find the key: a short melody is played; the user identifies the tonic.
- Sing back: the app plays two notes; the user sings the second one before it is revealed.

Use randomly chosen keys on every question so the user learns relative relationships rather than specific pitches.

### 5.6 Chord Lab: giving plain chords color

Start from any progression the user enters or picks. The app suggests treatments and teaches each as a short recipe, with audio:

- Add a 7th or 9th to every chord and listen to how the mood changes.
- Swap a chord for its relative, or for a sus chord.
- Replace open chords with shell voicings (root, 3rd, and 7th) on strings 6, 5, and 4.
- Funk treatment: 9th chords, small voicings on the top three or four strings, and 16th-note strumming with muted scratches between hits.
- Jazz treatment: ii-V-I movement, extensions, and chromatic approach chords one fret above or below the target.
- Secondary dominants: insert a V7 of the next chord to pull toward it.
- Borrowed chords: try the minor IV or flat VII in a major key.
- Voice leading check: does each voice move by the smallest step?

Each recipe is a lesson, a set of examples in two or three keys, and then a drill where the user applies the same idea to a new progression.

### 5.7 Harmony Navigator (where to go next)

The feature that answers the question of what chord to play next to get a specific sound.

- The user picks a key and a current chord. The app lists chords that could follow, grouped by function and by feel (resolved, lifted, bittersweet, tense, surprising, nostalgic).
- Each suggestion has a Play it button and a one-line explanation of why it works.
- Include a Sandbox: the user builds a progression by tapping chords, the app plays it with a simple backing synth, and shows the Roman numerals live.
- Seed the mood labels from standard harmonic function and common practice, and keep them editable by the user.

## 6. Skills, mastery, and the adaptive planner

Treat the curriculum as a graph of skills (for example, Fretboard: natural notes on string 5, Intervals: perfect 5th, Key: spell E major, Chords: diatonic triads in major keys, Ear: functional degrees).

For each skill, store a mastery score from 0 to 1 using recent accuracy, response time, and time since last review. A skill is mastered when accuracy is at least 90 percent and median response time meets the target across the last three sessions that included it.

Planner rules:

- Use spaced repetition for review scheduling (a simple Leitner box system or SM-2 is enough). Items start with a one-day interval, then roughly three days, a week, two weeks, a month.
- Interleave: mix related skills within a block instead of drilling one thing for the whole block.
- Vary: change keys, strings, and positions within a drill.
- One new concept per session. Everything else is review or application.
- When a skill drops below 70 percent, schedule a repair block the next session.
- When the user completes a phase gate, show a short celebratory summary and unlock the next phase.

## 7. Song Lab: learn theory from real songs

The method (as Lucas describes it, and as is commonly practiced by working musicians): do not just learn the chords and riffs. Work out the key, the harmony as numbers, and the scales behind the riffs, then improvise over the original track and make changes. One published account of a Berklee songwriting workshop describes John Mayer treating songs as puzzles to crack, which is the spirit of this module. Claude Code should not attribute any specific quote or routine to him that is not in the app's own data.

### Workflow for each song

1. Listen without the instrument and sing the tonic. Guess the key.
2. Find the chords by ear, then write them as Roman numerals.
3. Identify the scale material of the main riff, verse melody, and solo (major or minor pentatonic, major scale, a mode, or a mix; for example, many blues-pop solos blend major and minor pentatonic over the same chord).
4. Mark any non-diatonic chord and name why it is there (borrowed chord, secondary dominant, or other).
5. Play along, then improvise over the original track or a generated backing loop in the same key.
6. Modify it: transpose to another key, swap one chord, change the rhythm or feel, rewrite the melody.
7. Save notes and tag the concepts learned, which feed back into the skill graph.

### Data and checking

Each song entry stores title, artist, key, tempo, a chord chart by section with Roman numerals, scale notes for the riffs and solo, and notable theory points. The user does the analysis first and types in their answer; the app then reveals a reference analysis and highlights differences. Reference analyses must be hand-verified (by ear or by a trusted source) before they are shown, because a wrong reference is worse than none.

Seed with a few progressions that are safe to start from:

- Stand By Me style: I-vi-IV-V (the same structure as the user's own song Overdrive: A, F sharp minor, D, E in the key of A).
- Let It Be style: I-V-vi-IV.
- Canon-style descending bass: I-V-vi-iii-IV-I-IV-V.
- 12-bar blues in a chosen key.
- A ii-V-I in major.

The user will add songs over time. A good pattern: the user picks a song, studies it with a slow-down tool, and the app guides the analysis. Add the user's own songs as entries too, so he can analyze his own writing.

## 8. Screens and features

- Home: today's session summary, a large Start button, streak, and weekly goal.
- Session runner: block timer, current drill, metronome, pause, Skip block.
- Drill screens for each exercise in Section 5, with big tap targets and fast feedback.
- Fretboard view: an interactive fretboard (guitar) and keyboard (piano) that can highlight notes, intervals, scales, and chords. Toggle between note names, intervals, and scale degrees.
- Key Explorer: choose any key and see its notes, diatonic chords (triads and sevenths), relative minor, and common progressions in numerals and chord names.
- Backing track player: generated loops from any key and progression, with tempo, simple styles (pop, rock, funk, blues, jazz swing), and a loop count. Synthesized in the browser; no audio files required.
- Chord Lab and Harmony Navigator (Sections 5.6 and 5.7).
- Song Lab (Section 7).
- Progress: mastery map by skill, a fretboard heatmap showing accuracy per note and string, streaks, total practice time, and a weekly summary.
- Settings: schedule, reminders, instrument (guitar or piano), tuning (default standard), flats versus sharps preference, left-handed view, and a data export.

## 9. Data model sketch

- Skill: id, name, phase, prerequisites, mastery score, last reviewed, next due.
- Attempt: skill id, drill type, prompt, correct, response time, timestamp.
- SessionPlan: date, type, blocks (each with drill type, skill ids, target minutes), completed flag, difficulty rating.
- Song: title, artist, key, tempo, sections with Roman numerals, scale notes, theory tags, user analysis, reference analysis.
- Progression: name, numerals, mode (major or minor), tags, mood tags.
- Settings: schedule, reminders, instrument, preferences.

All data is stored locally on the device and exportable as JSON.

## 10. Technical notes and constraints

- Recommended approach: a Progressive Web App (PWA), installable from the phone's home screen, built with React and TypeScript on Vite, with data in IndexedDB (a small wrapper library is fine). Reason: fastest path to a phone app with no app store, and everything is local.
- Audio: use the Web Audio API or Tone.js for the metronome, chord and note playback, and backing tracks. On iOS, sound must start from a user tap, and the silent (ringer) switch can mute web audio, so test on the device.
- Pitch detection for Play it verification: use the microphone and a pitch detection library (for example, a McLeod pitch method implementation). Treat this as optional: always provide a manual Got it or Missed fallback, because guitar pitch detection in a noisy room can fail.
- Target device: iPhone 17 Pro Max on iOS 26.0, using Safari and installing the PWA to the home screen. Reminders: iOS web apps do not support scheduled local notifications and Web Push needs a push server (verify against current Apple documentation before relying on this), so version 1 uses calendar events. The app generates a downloadable .ics file with recurring events (Monday, Wednesday, Friday 2:00 to 3:00 pm; Tuesday and Thursday 12:00 to 1:00 pm; an alert 10 minutes before; the event link opens the app) that the user adds to the iPhone Calendar. Do not build a push server for version 1. If calendar reminders prove insufficient, revisit with Expo and React Native.
- Keep it offline-first with a service worker.
- Code style (the user's stated preferences): minimal, tightly scoped solutions, no regular expressions, no speculative abstractions. Build only what the current milestone needs. Prefer plain, readable code.
- Music logic (notes, intervals, scales, chords, transposition) should live in one small pure-function module with tests, because every feature depends on it being correct. Treat enharmonic spelling carefully: a major scale must use each letter name once (so an F sharp major scale has E sharp, not F).

## 11. Build order

Build incrementally and stop for feedback at the end of each milestone.

1. Milestone 1: project setup with free static hosting (so the phone can install the app), the music theory module with tests, fretboard drills 5.1 (items 1 to 4), mastery tracking, local storage, a simple session timer.
2. Milestone 2: theory drills from 5.2 (intervals, scale spelling, keys, diatonic chords, the transposer drill) and the Key Explorer.
3. Milestone 3: the planner (weekly schedule, session generator, spaced review, Minimum Session), the Home screen, and the calendar (.ics) reminder export.
4. Milestone 4: backing track generator, improvisation constraints, and ear training.
5. Milestone 5: Song Lab.
6. Milestone 6: Chord Lab and Harmony Navigator.
7. Milestone 7: Piano mode, the fretboard heatmap, polish, and data export.

## 12. Practice principles the app should enforce

These are the methods behind the design. They come from the research literature on skill learning and from common practice among guitar teachers:

- Deliberate practice: work on a specific, slightly uncomfortable target with immediate feedback, not just playing through things you already know.
- Retrieval practice: test yourself instead of rereading. Every lesson ends with recall drills.
- Spaced repetition: review at growing intervals (flashcard tools such as Anki use the same idea).
- Interleaving and varied practice: mix keys, strings, and concepts within a session.
- Short, frequent sessions beat rare long ones, which is why the Minimum Session exists.
- Slow practice: accuracy first, then speed.
- Constraints breed creativity: improvise with one rule at a time.
- Record and listen back: you hear your playing differently from the outside.
- Sing what you play: connecting voice, ear, and fingers strengthens all three.
- Transcribe and analyze real music: the stated method for learning from favorite artists.
- Teach it back: explaining a concept in one sentence is the test that you understand it.

## 13. External resources worth linking inside the app

- Hooktheory (TheoryTab and Hookpad): crowd-sourced songs with Roman numeral analysis, a good second opinion for Song Lab.
- musictheory.net: free lessons and exercises for intervals, keys, and chords.
- Anki: a spaced repetition flashcard app, useful alongside this app.
- Functional ear training apps (for example, Functional Ear Trainer) and EarMaster: ear training practice.
- Slow-down and stem-separation tools (for example, Moises and Chordify) for analyzing songs.
- Books: Music Theory for Guitarists by Tom Kolb, The Jazz Theory Book by Mark Levine, and the Guitar Fretboard Workbook by Barrett Tagliarino.
- Video: Adam Neely (theory and jazz), Rick Beato (song analysis and ear training), and Justin Guitar (structured guitar lessons).

## 14. Decisions confirmed by the user

- Phone: iPhone 17 Pro Max on iOS 26.0, so build and test for iOS Safari as an installed PWA.
- Tuesday and Thursday slot: 12:00 to 1:00 pm.
- Piano: the user does not own a keyboard but can always access a real piano or keyboard. No MIDI in version 1; use on-screen keys plus optional microphone checking. Piano mode stays the last milestone.
- Sharps or flats: not yet decided. Default to the conventional spelling for each key, with a setting to override.
