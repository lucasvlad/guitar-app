import './components.css'

interface GradeButtonsProps {
  onAnswer: (correct: boolean) => void
  disabled?: boolean
}

// Big self-grading buttons for the "play it" drills.
export function GradeButtons({ onAnswer, disabled }: GradeButtonsProps) {
  return (
    <div className="grade">
      <button type="button" className="grade-btn grade-missed" disabled={disabled} onClick={() => onAnswer(false)}>
        Missed
      </button>
      <button type="button" className="grade-btn grade-got" disabled={disabled} onClick={() => onAnswer(true)}>
        Got it
      </button>
    </div>
  )
}
