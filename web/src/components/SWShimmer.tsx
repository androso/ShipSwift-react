import type { ReactNode } from 'react'
import styles from './SWShimmer.module.css'

export interface SWShimmerProps {
  /** Seconds for the band to sweep across. Defaults to 2. */
  duration?: number
  /** Seconds to pause between sweeps. Defaults to 1. */
  delay?: number
  children: ReactNode
}

/**
 * Sweeps a translucent light band across its content in a continuous loop.
 * React port of the SwiftUI `SWShimmer`.
 */
export function SWShimmer({ duration = 2, delay = 1, children }: SWShimmerProps) {
  return (
    <div className={styles.wrapper}>
      {children}
      <div
        className={styles.band}
        style={{ animationDuration: `${duration + delay}s` }}
      />
    </div>
  )
}
