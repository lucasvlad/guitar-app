import { useMemo } from 'react'
import { enharmonicLabel } from '../music'
import { Fretboard } from '../components/Fretboard'
import { NotePad } from '../components/NotePad'
import { reverseItems } from './items'
import { useDrillLoop, type FretDrillProps } from './useDrillRun'
import './drills.css'

// 5.1 item 4: name the highlighted fret. Graded by pitch class, so either enharmonic name is right.
export function ReverseNote({ mode, strings, spelling, paused, onAnswer }: FretDrillProps) {
  const items = useMemo(() => reverseItems(mode, strings), [mode, strings.join(',')])
  const { item, graded, answer } = useDrillLoop('fret-reverse', items, paused, onAnswer)
  if (!item) return <div className="drill" />

  const color = graded === null ? 'prompt' : graded ? 'correct' : 'wrong'
  const highlight = { stringIndex: item.stringNum - 1, fret: item.fret, color } as const

  return (
    <div className="drill">
      <div className="drill-prompt">
        <div className={'drill-note drill-answer' + (graded === null ? '' : graded ? ' drill-right' : ' drill-wrong')}>
          {graded === null ? '?' : enharmonicLabel(item.pc, spelling)}
        </div>
      </div>
      <Fretboard highlights={[highlight]} activeStrings={[item.stringNum]} />
      <NotePad
        mode={mode}
        labelFor={(pc) => enharmonicLabel(pc, spelling)}
        onAnswer={(pc) => answer(pc === item.pc)}
        disabled={paused || graded !== null}
      />
    </div>
  )
}
