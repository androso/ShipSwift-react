/**
 * Page-level fullscreen loading overlay with blur material background,
 * customizable message text, optional SF Symbol icon with pulse animation,
 * and a progress indicator. Each page has independent loading state managed
 * through the SWLoadingPage union.
 *
 * Usage:
 *   <SWPageLoading page="home">
 *     <MyPageContent />
 *   </SWPageLoading>
 *
 *   SWLoadingManager.shared.show({ page: "home" })
 *   SWLoadingManager.shared.show({
 *     page: "home",
 *     message: "Syncing data...",
 *     systemImage: "arrow.triangle.2.circlepath",
 *   })
 *   SWLoadingManager.shared.updateMessage("home", "Almost done...")
 *   SWLoadingManager.shared.hide("home")
 */
import { useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SWSymbol } from "@/swpackage/swutil";

export type SWLoadingPage = "home" | "settings" | "profile";

export type SWPageLoadingState = {
  isShowing: boolean;
  message: string;
  systemImage?: string;
};

type SWLoadingSnapshot = {
  version: number;
  states: Partial<Record<SWLoadingPage, SWPageLoadingState>>;
};

const EMPTY_STATE: SWPageLoadingState = {
  isShowing: false,
  message: "Loading...",
};

const EMPTY_SNAPSHOT: SWLoadingSnapshot = { version: 0, states: {} };

export class SWLoadingManager {
  static readonly shared = new SWLoadingManager();

  private snapshot: SWLoadingSnapshot = EMPTY_SNAPSHOT;
  private listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly getSnapshot = (): SWLoadingSnapshot => this.snapshot;

  show(
    page: SWLoadingPage,
    message?: string,
    systemImage?: string,
  ): void;
  show(options: {
    page: SWLoadingPage;
    message?: string;
    systemImage?: string;
  }): void;
  show(
    pageOrOptions:
      | SWLoadingPage
      | { page: SWLoadingPage; message?: string; systemImage?: string },
    message = "Loading...",
    systemImage?: string,
  ): void {
    if (typeof pageOrOptions === "object") {
      this.patch(pageOrOptions.page, {
        isShowing: true,
        message: pageOrOptions.message ?? "Loading...",
        systemImage: pageOrOptions.systemImage,
      });
      return;
    }
    this.patch(pageOrOptions, { isShowing: true, message, systemImage });
  }

  updateMessage(page: SWLoadingPage, message: string): void {
    const current = this.state(page);
    this.patch(page, { ...current, message });
  }

  hide(page: SWLoadingPage): void {
    const current = this.state(page);
    this.patch(page, { ...current, isShowing: false });
  }

  state(page: SWLoadingPage): SWPageLoadingState {
    return this.snapshot.states[page] ?? EMPTY_STATE;
  }

  private patch(page: SWLoadingPage, next: SWPageLoadingState): void {
    this.snapshot = {
      version: this.snapshot.version + 1,
      states: { ...this.snapshot.states, [page]: next },
    };
    for (const listener of this.listeners) listener();
  }
}

export function useSWPageLoadingState(page: SWLoadingPage): SWPageLoadingState {
  const snapshot = useSyncExternalStore(
    SWLoadingManager.shared.subscribe,
    SWLoadingManager.shared.getSnapshot,
    SWLoadingManager.shared.getSnapshot,
  );
  return snapshot.states[page] ?? EMPTY_STATE;
}

/** Fullscreen blur overlay for a single page key. */
export function SWPageLoadingView({ page }: { page: SWLoadingPage }) {
  const state = useSWPageLoadingState(page);

  return (
    <AnimatePresence>
      {state.isShowing && (
        <motion.div
          className="sw-page-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {state.systemImage && (
            <motion.div
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <SWSymbol
                name={state.systemImage}
                size={64}
                color="color-mix(in srgb, var(--sw-label) 80%, transparent)"
              />
            </motion.div>
          )}
          <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 600,
                textAlign: "center",
                color: "color-mix(in srgb, var(--sw-label) 90%, transparent)",
              }}
            >
              {state.message}
            </p>
            <div className="sw-spinner" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Wrapper that hosts `SWPageLoadingView` over page content. */
export function SWPageLoading({
  page,
  children,
}: {
  page: SWLoadingPage;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      {children}
      <SWPageLoadingView page={page} />
    </div>
  );
}
