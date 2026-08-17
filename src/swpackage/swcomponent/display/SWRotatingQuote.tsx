/**
 * Auto-rotating quote display that cycles through an array of quotes with
 * animated transitions. Shows the quote text and an author name aligned to
 * the bottom-right. Uses a hidden placeholder of the longest quote to
 * maintain stable layout height.
 *
 * Usage:
 *   <SWRotatingQuote quotes={["Stay hungry, stay foolish."]} author="Steve Jobs" />
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export type SWFontDesign = "default" | "rounded" | "serif" | "monospaced";

const FONT_SIZE: Record<string, string> = {
  subheadline: "15px",
  headline: "17px",
  body: "17px",
  callout: "16px",
  title3: "20px",
  title2: "22px",
  title: "28px",
  caption: "12px",
  footnote: "13px",
};

const FONT_FAMILY: Record<SWFontDesign, string> = {
  default: "var(--sw-font)",
  rounded: 'ui-rounded, "SF Pro Rounded", var(--sw-font)',
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
  monospaced: "var(--sw-mono)",
};

function fontSize(token: string): string {
  return FONT_SIZE[token] ?? token;
}

export function SWRotatingQuote({
  quotes,
  author,
  interval = 5,
  quoteFont = "subheadline",
  authorFont = "headline",
  fontDesign = "rounded",
  foregroundStyle = "var(--sw-secondary-label)",
}: {
  quotes: string[];
  author: string;
  /** Rotation interval in seconds (default 5). */
  interval?: number;
  quoteFont?: string;
  authorFont?: string;
  fontDesign?: SWFontDesign;
  foregroundStyle?: string;
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const longestQuote = quotes.reduce(
    (longest, quote) => (quote.length > longest.length ? quote : longest),
    quotes[0] ?? "",
  );

  useEffect(() => {
    if (quotes.length <= 1) return;
    const id = window.setInterval(() => {
      setCurrentTextIndex((index) => (index + 1) % quotes.length);
    }, interval * 1000);
    return () => window.clearInterval(id);
  }, [quotes, interval]);

  const current = quotes[currentTextIndex] ?? quotes[0] ?? "";

  return (
    <div
      style={{
        position: "relative",
        color: foregroundStyle,
        fontFamily: FONT_FAMILY[fontDesign],
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        aria-hidden
        style={{
          visibility: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <p style={{ margin: 0, fontSize: fontSize(quoteFont) }}>{longestQuote}</p>
        <div style={{ flex: 1 }} />
        <p
          style={{
            margin: 0,
            fontSize: fontSize(authorFont),
            textAlign: "right",
          }}
        >
          {author}
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            style={{ margin: 0, fontSize: fontSize(quoteFont) }}
          >
            {current}
          </motion.p>
        </AnimatePresence>
        <div style={{ flex: 1 }} />
        <p
          style={{
            margin: 0,
            fontSize: fontSize(authorFont),
            textAlign: "right",
          }}
        >
          {author}
        </p>
      </div>
    </div>
  );
}
