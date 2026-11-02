import { useRef, useState } from 'react'
import { THEORY_DRILLS } from './theoryDrillList'
import type { TheoryDrillProps } from './useDrillRun'
import './drills.css'

const ITEMS_PER_DRILL = 3

function otherIndex(current: number): number {
  const i = Math.floor(Math.random() * (THEORY_DRILLS.length - 1))
  return i < current ? i : i + 1
}

// Session block: one random theory drill at a time, switching to a different one
// after 3 finished items. The key remounts the drill so its skills flush.
export function TheoryMix({ spelling, paused, onAnswer }: TheoryDrillProps) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * THEORY_DRILLS.length))
  const done = useRef(0)

  function itemDone() {
    done.current++
    if (done.current < ITEMS_PER_DRILL) return
    done.current = 0
    setIndex(otherIndex)
  }

  const drill = THEORY_DRILLS[index]!
  const Drill = drill.Component
  return (
    <>
      <div className="mix-label">{drill.title}</div>
      <Drill key={drill.id} spelling={spelling} paused={paused} onAnswer={onAnswer} onItemDone={itemDone} />
    </>
  )
}
