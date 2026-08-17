export function haptic(ms = 12): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Unsupported — silent no-op, matching iOS haptics on web.
  }
}
