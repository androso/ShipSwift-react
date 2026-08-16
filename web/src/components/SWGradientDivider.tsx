import styles from './SWGradientDivider.module.css'

export interface SWGradientDividerProps {
  /** Any CSS color. Defaults to cyan. */
  color?: string
  /** Center opacity of the fade, 0–1. Defaults to 0.3. */
  opacity?: number
  /** Line thickness in pixels. Defaults to 1. */
  height?: number
}

/**
 * Horizontal divider with a center-fade gradient (clear -> color -> clear).
 * React port of the SwiftUI `SWGradientDivider`.
 */
export function SWGradientDivider({
  color = 'cyan',
  opacity = 0.3,
  height = 1,
}: SWGradientDividerProps) {
  const mid = `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`
  return (
    <div
      className={styles.divider}
      style={{
        height,
        background: `linear-gradient(to right, transparent, ${mid}, transparent)`,
      }}
    />
  )
}
