import type { ComponentType } from 'react'
import { FindAllStrings } from './FindAllStrings'
import { IntervalNav } from './IntervalNav'
import { Neighborhood } from './Neighborhood'
import { NoteOnString } from './NoteOnString'
import { OctaveFinder } from './OctaveFinder'
import { ReverseNote } from './ReverseNote'
import type { FretDrillProps } from './useDrillRun'

export type DrillId = 'note-on-string' | 'reverse' | 'neighborhood' | 'all-strings' | 'interval-nav' | 'octave-finder'

interface DrillInfo {
  id: DrillId
  title: string
  Component: ComponentType<FretDrillProps>
}

// The fretboard drills. The first four are the session's fretboard blocks, in order.
export const DRILLS: DrillInfo[] = [
  { id: 'note-on-string', title: 'Note on string', Component: NoteOnString },
  { id: 'reverse', title: 'Reverse', Component: ReverseNote },
  { id: 'neighborhood', title: 'Neighborhood', Component: Neighborhood },
  { id: 'all-strings', title: 'All strings', Component: FindAllStrings },
  { id: 'interval-nav', title: 'Interval navigation', Component: IntervalNav },
  { id: 'octave-finder', title: 'Octave finder', Component: OctaveFinder },
]
