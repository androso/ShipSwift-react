/**
 * Multi-page onboarding view with swipe-to-navigate support, a
 * Continue / Get Started button, and a Skip button at the bottom.
 *
 * Usage:
 *   <SWOnboardingView onComplete={() => setHasSeenOnboarding(true)} />
 */
import { useRef, useState } from "react";
import { SWButton, SWSymbol } from "@/swpackage/swutil";

export type SWOnboardingPage = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export const SW_ONBOARDING_PAGES: SWOnboardingPage[] = [
  {
    id: "shipFast",
    icon: "cpu.fill",
    title: "AI-First Development",
    description:
      "Recipes structured for AI models — Claude, Cursor, Windsurf get production-grade context instantly.",
  },
  {
    id: "components",
    icon: "doc.text.fill",
    title: "Production-Ready Recipes",
    description:
      "Auth, camera, AI chat, in-app purchase — every recipe battle-tested in real App Store apps.",
  },
  {
    id: "modular",
    icon: "terminal.fill",
    title: "One Command Setup",
    description:
      "Connect via MCP with one command. No downloads, no setup, no dependencies to manage.",
  },
  {
    id: "launch",
    icon: "paperplane.fill",
    title: "Ship 10x Faster",
    description:
      "Stop rebuilding auth and payments from scratch. Focus on what makes your app unique.",
  },
];

export function SWOnboardingView({
  onComplete,
  pages = SW_ONBOARDING_PAGES,
}: {
  onComplete: () => void;
  pages?: SWOnboardingPage[];
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isLast = currentPage >= pages.length - 1;

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, index));
    setCurrentPage(next);
    const track = trackRef.current;
    if (track) {
      const width = track.clientWidth;
      track.scrollTo({ left: width * next, behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        padding: "0 16px 16px",
      }}
    >
      <div
        ref={trackRef}
        className="sw-onboarding-track"
        onScroll={(event) => {
          const el = event.currentTarget;
          const index = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
          if (index !== currentPage) setCurrentPage(index);
        }}
      >
        {pages.map((page) => (
          <div key={page.id} className="sw-onboarding-page">
            <SWSymbol name={page.icon} size={80} color="var(--sw-accent)" />
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{page.title}</h2>
            <p style={{ margin: 0, color: "var(--sw-secondary-label)", maxWidth: 420 }}>
              {page.description}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          padding: "8px 0 16px",
        }}
      >
        {pages.map((page, index) => (
          <button
            key={page.id}
            type="button"
            aria-label={`Page ${index + 1}`}
            onClick={() => goTo(index)}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              border: "none",
              padding: 0,
              background:
                index === currentPage
                  ? "var(--sw-accent)"
                  : "var(--sw-fill)",
            }}
          />
        ))}
      </div>

      <SWButton
        variant="primary"
        onClick={() => {
          if (!isLast) goTo(currentPage + 1);
          else onComplete();
        }}
      >
        {isLast ? "Get Started" : "Continue"}
      </SWButton>

      <button
        type="button"
        onClick={onComplete}
        style={{
          border: "none",
          background: "none",
          color: "var(--sw-secondary-label)",
          padding: 12,
          opacity: isLast ? 0 : 1,
          pointerEvents: isLast ? "none" : "auto",
        }}
      >
        Skip
      </button>
    </div>
  );
}
