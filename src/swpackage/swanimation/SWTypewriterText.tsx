import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";

export type SWTypewriterStyle = "none" | "spring" | "blur" | "fade" | "scale" | "wave";

type CharState = { id: string; character: string };

export function SWTypewriterText({
  texts,
  typingSpeed = 0.04,
  deletingSpeed = 0.03,
  pauseDuration = 2.5,
  animationStyle = "spring",
  gradient = "linear-gradient(to right, #32ade6, #af52de)",
  className,
  style,
}: {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  animationStyle?: SWTypewriterStyle;
  gradient?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const uid = useId();
  const displayed = useRef("");
  const index = useRef(0);
  const deleting = useRef(false);
  const active = useRef(true);
  const seq = useRef(0);

  useEffect(() => {
    active.current = true;
    displayed.current = "";
    index.current = 0;
    deleting.current = false;
    seq.current = 0;
    setCharStates([]);
    setIsDeleting(false);

    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const tick = () => {
      if (!active.current || texts.length === 0) return;
      const currentText = texts[index.current] ?? "";

      if (deleting.current) {
        if (displayed.current.length === 0) {
          deleting.current = false;
          setIsDeleting(false);
          index.current = (index.current + 1) % texts.length;
          later(tick, 300);
          return;
        }
        later(() => {
          if (!active.current) return;
          displayed.current = displayed.current.slice(0, -1);
          setCharStates((prev) => prev.slice(0, -1));
          tick();
        }, deletingSpeed * 1000);
        return;
      }

      if (displayed.current.length < currentText.length) {
        later(() => {
          if (!active.current) return;
          const next = currentText[displayed.current.length] ?? "";
          displayed.current += next;
          const id = `${uid}-${seq.current++}`;
          setCharStates((prev) => [...prev, { id, character: next }]);
          tick();
        }, typingSpeed * 1000);
        return;
      }

      later(() => {
        if (!active.current) return;
        deleting.current = true;
        setIsDeleting(true);
        tick();
      }, pauseDuration * 1000);
    };

    tick();
    return () => {
      active.current = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [texts, typingSpeed, deletingSpeed, pauseDuration, uid]);

  const motionProps = charMotion(animationStyle, isDeleting);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        ...style,
      }}
    >
      <span style={{ display: "inline-flex" }}>
        <AnimatePresence initial={false}>
          {charStates.map((ch) => (
            <motion.span
              key={ch.id}
              {...motionProps}
              style={{
                display: "inline-block",
                backgroundImage: gradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                whiteSpace: "pre",
              }}
            >
              {ch.character}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      <span style={{ visibility: "hidden" }} aria-hidden>
        |
      </span>
    </span>
  );
}

function charMotion(style: SWTypewriterStyle, isDeleting: boolean) {
  const transition: Transition = isDeleting
    ? style === "none"
      ? { duration: 0 }
      : style === "spring"
        ? { duration: 0.15, ease: "easeOut" }
        : { duration: 0.12, ease: "easeOut" }
    : style === "none"
      ? { duration: 0 }
      : style === "spring"
        ? { type: "spring", duration: 0.3, bounce: 0.4 }
        : style === "scale"
          ? { type: "spring", duration: 0.25, bounce: 0.3 }
          : style === "wave"
            ? { duration: 0.15, ease: "easeInOut" }
            : { duration: 0.2, ease: "easeOut" };

  if (style === "none") {
    return { initial: {}, animate: {}, exit: {}, transition };
  }
  if (style === "spring") {
    return {
      initial: { scale: 0.3, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.3, opacity: 0 },
      transition,
    };
  }
  if (style === "blur") {
    return {
      initial: { filter: "blur(10px)", opacity: 0 },
      animate: { filter: "blur(0px)", opacity: 1 },
      exit: { filter: "blur(10px)", opacity: 0 },
      transition,
    };
  }
  if (style === "fade") {
    return {
      initial: { y: -10, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 10, opacity: 0 },
      transition,
    };
  }
  if (style === "scale") {
    return {
      initial: { scale: 1.5, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.5, opacity: 0 },
      transition,
    };
  }
  return {
    initial: { y: -8, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 8, opacity: 0 },
    transition,
  };
}

SWTypewriterText.spring = function spring(texts: string[]) {
  return <SWTypewriterText texts={texts} animationStyle="spring" />;
};
SWTypewriterText.blur = function blur(texts: string[]) {
  return <SWTypewriterText texts={texts} animationStyle="blur" />;
};
SWTypewriterText.scale = function scale(texts: string[]) {
  return <SWTypewriterText texts={texts} animationStyle="scale" />;
};
SWTypewriterText.fade = function fade(texts: string[]) {
  return <SWTypewriterText texts={texts} animationStyle="fade" />;
};
