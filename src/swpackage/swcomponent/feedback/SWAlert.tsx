/**
 * Global alert overlay that displays toast-style notifications at the top of
 * the screen. Supports four preset styles (info, success, warning, error)
 * and fully custom styling. Auto-dismisses after a configurable duration.
 *
 * Usage:
 *   // Mount once at the app root
 *   <SWAlertHost />
 *
 *   SWAlertManager.shared.show("success", "Saved!")
 *   SWAlertManager.shared.show("error", "Something went wrong")
 *   SWAlertManager.shared.show("warning", "Slow connection", 5)
 *   SWAlertManager.shared.dismiss()
 */
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SWSymbol } from "@/swpackage/swutil";

export type SWAlertType = "info" | "success" | "warning" | "error";

export type SWAlertCustomOptions = {
  icon: string;
  message: string;
  textColor?: string;
  backgroundStyle?: string;
  borderColor?: string;
  duration?: number;
};

export type SWAlertState = {
  isShowing: boolean;
  icon: string;
  message: string;
  textColor: string;
  backgroundStyle: string;
  borderColor: string;
};

const MATERIAL =
  "color-mix(in srgb, var(--sw-surface) 72%, transparent)";

const PRESETS: Record<
  SWAlertType,
  Pick<SWAlertState, "icon" | "textColor" | "backgroundStyle" | "borderColor">
> = {
  info: {
    icon: "info.circle.fill",
    textColor: "var(--sw-label)",
    backgroundStyle: MATERIAL,
    borderColor: "color-mix(in srgb, var(--sw-secondary-label) 60%, transparent)",
  },
  success: {
    icon: "checkmark.circle.fill",
    textColor: "var(--sw-green)",
    backgroundStyle: MATERIAL,
    borderColor: "color-mix(in srgb, var(--sw-green) 60%, transparent)",
  },
  warning: {
    icon: "exclamationmark.triangle.fill",
    textColor: "var(--sw-orange)",
    backgroundStyle: MATERIAL,
    borderColor: "color-mix(in srgb, var(--sw-orange) 60%, transparent)",
  },
  error: {
    icon: "xmark.circle.fill",
    textColor: "var(--sw-red)",
    backgroundStyle: MATERIAL,
    borderColor: "color-mix(in srgb, var(--sw-red) 60%, transparent)",
  },
};

const DEFAULT_STATE: SWAlertState = {
  isShowing: false,
  icon: PRESETS.info.icon,
  message: "",
  textColor: PRESETS.info.textColor,
  backgroundStyle: PRESETS.info.backgroundStyle,
  borderColor: PRESETS.info.borderColor,
};

/**
 * Singleton toast manager. Call `show()` / `dismiss()` from anywhere;
 * `SWAlertHost` subscribes via `useSyncExternalStore`.
 */
export class SWAlertManager {
  static readonly shared = new SWAlertManager();

  private snapshot: SWAlertState = DEFAULT_STATE;
  private listeners = new Set<() => void>();
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly getSnapshot = (): SWAlertState => this.snapshot;

  show(type: SWAlertType, message: string, duration?: number): void;
  show(options: SWAlertCustomOptions): void;
  show(
    typeOrOptions: SWAlertType | SWAlertCustomOptions,
    message?: string,
    duration = 2,
  ): void {
    if (typeof typeOrOptions === "object") {
      const opts = typeOrOptions;
      this.showInternal({
        icon: opts.icon,
        message: opts.message,
        textColor: opts.textColor ?? "#fff",
        backgroundStyle: opts.backgroundStyle ?? "#000",
        borderColor: opts.borderColor ?? "var(--sw-secondary-label)",
        duration: opts.duration ?? 2,
      });
      return;
    }
    const preset = PRESETS[typeOrOptions];
    this.showInternal({
      icon: preset.icon,
      message: message ?? "",
      textColor: preset.textColor,
      backgroundStyle: preset.backgroundStyle,
      borderColor: preset.borderColor,
      duration,
    });
  }

  dismiss(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    this.snapshot = { ...this.snapshot, isShowing: false };
    this.emit();
  }

  private showInternal(opts: {
    icon: string;
    message: string;
    textColor: string;
    backgroundStyle: string;
    borderColor: string;
    duration: number;
  }): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    this.snapshot = {
      isShowing: true,
      icon: opts.icon,
      message: opts.message,
      textColor: opts.textColor,
      backgroundStyle: opts.backgroundStyle,
      borderColor: opts.borderColor,
    };
    this.emit();
    this.dismissTimer = setTimeout(() => {
      this.snapshot = { ...this.snapshot, isShowing: false };
      this.emit();
    }, opts.duration * 1000);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

export function useSWAlertState(): SWAlertState {
  return useSyncExternalStore(
    SWAlertManager.shared.subscribe,
    SWAlertManager.shared.getSnapshot,
    SWAlertManager.shared.getSnapshot,
  );
}

/** Top-of-screen overlay. Mount once at the app root. */
export function SWAlertHost() {
  const state = useSWAlertState();

  return (
    <div className="sw-alert-host" aria-live="polite">
      <AnimatePresence>
        {state.isShowing && (
          <motion.button
            key={state.message}
            type="button"
            className="sw-alert-toast sw-ultra-thin"
            onClick={() => SWAlertManager.shared.dismiss()}
            initial={{ opacity: 0, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ type: "spring", duration: 0.3 }}
            style={{
              color: state.textColor,
              background: state.backgroundStyle,
              borderColor: state.borderColor,
            }}
          >
            <SWSymbol name={state.icon} size={14} color={state.textColor} />
            <span>{state.message}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
