import styles from './SWStepper.module.css'

export interface SWStepperProps {
  /** Current value. */
  value: number
  /** Called with the next value when the user increments/decrements. */
  onChange: (value: number) => void
  /** Minimum allowed value; decrement is disabled at this bound. Defaults to 0. */
  min?: number
}

/**
 * Compact numeric stepper with chevron-style increment/decrement buttons.
 * The decrement button is disabled once `value` reaches `min`.
 * React port of the SwiftUI `SWStepper`.
 */
export function SWStepper({ value, onChange, min = 0 }: SWStepperProps) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.button}
        aria-label="Decrement"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        &lsaquo;
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        className={styles.button}
        aria-label="Increment"
        onClick={() => onChange(value + 1)}
      >
        &rsaquo;
      </button>
    </div>
  )
}
