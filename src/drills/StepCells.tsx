import './drills.css'

interface StepCellsProps {
  given: string[] // shown in each cell
  wanted: string[] // the answer, shown once the cell is entered
  results: boolean[] // one per cell entered so far
}

// Cells answered in order: the current one is outlined; entered ones show the right answer, green or red.
export function StepCells({ given, wanted, results }: StepCellsProps) {
  return (
    <div className="drill-prog">
      {given.map((g, j) => {
        const r = results[j]
        const cls = r === undefined ? (j === results.length ? ' drill-cur' : '') : r ? ' drill-right' : ' drill-wrong'
        return (
          <div key={j} className={'drill-step' + cls}>
            <div className="drill-step-given">{g}</div>
            <div className="drill-step-ans">{r === undefined ? '?' : wanted[j]}</div>
          </div>
        )
      })}
    </div>
  )
}
