/**
 * Auto-scrolling horizontal FAQ carousel that displays rows of question
 * pills scrolling in alternating directions (left, right, left).
 * Uses requestAnimationFrame for smooth infinite looping.
 *
 * Usage:
 *   <SWScrollingFAQ rows={[["How does AI work?", "What can I ask?"]]} onTap={console.log} />
 */
import { useEffect, useRef } from "react";

export function SWScrollingFAQ({
  rows,
  title,
  onTap,
}: {
  /** FAQ data organized by rows. Each inner array is one scrolling row. */
  rows: string[][];
  /** Optional title displayed above the scrolling rows. */
  title?: string | null;
  /** Callback when a question pill is tapped. */
  onTap: (question: string) => void;
}) {
  return (
    <div style={{ padding: "16px 0", display: "grid", gap: 8 }}>
      {title ? (
        <p
          style={{
            margin: 0,
            padding: 8,
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          {title}
        </p>
      ) : null}
      <div className="sw-faq-mask" style={{ display: "grid", gap: 8 }}>
        {rows.map((row, index) => (
          <InfiniteRow
            key={index}
            questions={row}
            direction={index % 2 === 0 ? "left" : "right"}
            onTap={onTap}
          />
        ))}
      </div>
    </div>
  );
}

function InfiniteRow({
  questions,
  direction,
  onTap,
}: {
  questions: string[];
  direction: "left" | "right";
  onTap: (question: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const copies = [...questions, ...questions, ...questions];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    let offset = 0;
    let unitWidth = 0;
    let started = false;
    const speed = 30 / 60;

    const measure = () => {
      unitWidth = el.scrollWidth / 3;
      if (unitWidth > 0 && !started) {
        offset = unitWidth;
        el.scrollLeft = offset;
        started = true;
      }
    };

    const tick = () => {
      measure();
      if (unitWidth > 0) {
        if (direction === "left") {
          offset += speed;
          if (offset >= unitWidth * 2) offset -= unitWidth;
        } else {
          offset -= speed;
          if (offset <= 0) offset += unitWidth;
        }
        el.scrollLeft = offset;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [questions, direction]);

  return (
    <div
      ref={scrollerRef}
      style={{
        height: 34,
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
      }}
    >
      {copies.map((question, index) => (
        <button
          key={`${question}-${index}`}
          type="button"
          className="sw-faq-pill"
          onClick={() => onTap(question)}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
