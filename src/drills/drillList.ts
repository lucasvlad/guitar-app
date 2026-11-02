import type { ComponentType } from 'react'
import { FindAllStrings } from './FindAllStrings'
import { Neighborhood } from './Neighborhood'
import { NoteOnString } from './NoteOnString'
import { ReverseNote } from './ReverseNote'
import type { FretDrillProps } from './useDrillRun'

export type DrillId = 'note-on-string' | 'reverse' | 'neighborhood' | 'all-strings'

interface DrillInfo {
  id: DrillId
  title: string
  Component: ComponentType<FretDrillProps>
}

// The M1 fretboard drills, in session order.
export const DRILLS: DrillInfo[] = [
  { id: 'note-on-string', title: 'Note on string', Component: NoteOnString },
  { id: 'reverse', title: 'Reverse', Component: ReverseNote },
  { id: 'neighborhood', title: 'Neighborhood', Component: Neighborhood },
  { id: 'all-strings', title: 'All strings', Component: FindAllStrings },
]
