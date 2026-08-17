/**
 * Debug logging that is a no-op in production builds.
 */
export function swDebugLog(...items: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log(...items);
  }
}

export function swDebugLogAt(message: string, file = "unknown", line = 0): void {
  if (import.meta.env.DEV) {
    console.log(`[${file}:${line}] ${message}`);
  }
}
