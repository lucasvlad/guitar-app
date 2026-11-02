import type { ComponentType } from 'react'
import type { DrillType } from '../data/types'
import { DiatonicChords } from './DiatonicChords'
import { IntervalSemitones } from './IntervalSemitones'
import { IntervalUp } from './IntervalUp'
import { KeySignature } from './KeySignature'
import { KeysOfChord } from './KeysOfChord'
import { ScaleSpell } from './ScaleSpell'
import { TransposeToChords, TransposeToNumerals } from './Transposer'
import type { TheoryDrillProps } from './useDrillRun'

export type TheoryDrillId = Extract<
  DrillType,
  | 'interval-up'
  | 'interval-semitones'
  | 'scale-spell'
  | 'key-signature'
  | 'diatonic-chords'
  | 'keys-of-chord'
  | 'transpose-to-chords'
  | 'transpose-to-numerals'
>

interface TheoryDrillInfo {
  id: TheoryDrillId
  title: string
  Component: ComponentType<TheoryDrillProps>
}

// The M2 theory drills (spec 5.2), no instrument needed. id is the Attempt.drill value.
export const THEORY_DRILLS: TheoryDrillInfo[] = [
  { id: 'interval-up', title: 'Interval above', Component: IntervalUp },
  { id: 'interval-semitones', title: 'Interval semitones', Component: IntervalSemitones },
  { id: 'scale-spell', title: 'Spell the scale', Component: ScaleSpell },
  { id: 'key-signature', title: 'Key signature', Component: KeySignature },
  { id: 'diatonic-chords', title: 'Diatonic chords', Component: DiatonicChords },
  { id: 'keys-of-chord', title: 'Keys of a chord', Component: KeysOfChord },
  { id: 'transpose-to-chords', title: 'Numerals to chords', Component: TransposeToChords },
  { id: 'transpose-to-numerals', title: 'Chords to numerals', Component: TransposeToNumerals },
]
