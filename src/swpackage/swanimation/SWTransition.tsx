import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { SWSymbol } from "@/swpackage/swutil";

export type SWTransitionKind =
  | "boing"
  | "skid"
  | "swoosh"
  | "flip"
  | "rotate3D"
  | "move"
  | "blur"
  | "iris"
  | "wipe"
  | "blinds"
  | "clock"
  | "glare"
  | "dissolve"
  | "flicker"
  | "filmExposure"
  | "snapshot";

export type SWIrisOrigin =
  | "center"
  | "top"
  | "bottom"
  | "leading"
  | "trailing"
  | "topLeading"
  | "topTrailing"
  | "bottomLeading"
  | "bottomTrailing";

const ORIGIN: Record<SWIrisOrigin, string> = {
  center: "50% 50%",
  top: "50% 0%",
  bottom: "50% 100%",
  leading: "0% 50%",
  trailing: "100% 50%",
  topLeading: "0% 0%",
  topTrailing: "100% 0%",
  bottomLeading: "0% 100%",
  bottomTrailing: "100% 100%",
};

export type SWTransitionProps = {
  visible: boolean;
  kind: SWTransitionKind;
  children: ReactNode;
  radius?: number;
  distance?: number;
  angle?: number;
  axis?: [number, number, number];
  origin?: SWIrisOrigin;
  slatHeight?: number;
  cellSize?: number;
  className?: string;
  style?: CSSProperties;
};

export function SWTransition({
  visible,
  kind,
  children,
  radius = 24,
  distance,
  angle = 45,
  origin = "center",
  slatHeight = 24,
  cellSize = 8,
  className,
  style,
}: SWTransitionProps) {
  const transition = animationFor(kind);
  const dist = distance ?? defaultDistance(kind);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          className={className}
          style={{ transformStyle: "preserve-3d", perspective: 800, ...style }}
          initial="hidden"
          animate="shown"
          exit="hidden"
          variants={variantsFor(kind, { radius, distance: dist, angle, origin, slatHeight })}
          transition={transition}
          custom={{ radius, distance: dist, angle, origin, slatHeight, cellSize }}
        >
          <MaskLayer kind={kind} slatHeight={slatHeight} cellSize={cellSize} angle={angle}>
            {children}
          </MaskLayer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function defaultDistance(kind: SWTransitionKind): number {
  if (kind === "boing") return 80;
  if (kind === "skid") return 160;
  return 400;
}

function animationFor(kind: SWTransitionKind): Transition {
  if (kind === "boing" || kind === "skid" || kind === "swoosh") {
    return { type: "spring", duration: 0.6, bounce: 0.5 };
  }
  if (
    kind === "flicker" ||
    kind === "dissolve" ||
    kind === "wipe" ||
    kind === "blinds" ||
    kind === "clock" ||
    kind === "glare" ||
    kind === "iris"
  ) {
    return { duration: 0.55, ease: "linear" };
  }
  if (kind === "filmExposure") return { duration: 0.8, ease: "easeInOut" };
  return { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
}

function variantsFor(
  kind: SWTransitionKind,
  opts: {
    radius: number;
    distance: number;
    angle: number;
    origin: SWIrisOrigin;
    slatHeight: number;
  },
) {
  const rad = (opts.angle * Math.PI) / 180;
  if (kind === "blur") {
    return {
      hidden: { filter: `blur(${opts.radius}px)`, opacity: 0 },
      shown: { filter: "blur(0px)", opacity: 1 },
    };
  }
  if (kind === "flip") {
    return {
      hidden: { rotateX: -85, opacity: 0, transformPerspective: 400 },
      shown: { rotateX: 0, opacity: 1, transformPerspective: 400 },
    };
  }
  if (kind === "rotate3D") {
    return {
      hidden: { rotateY: 90, opacity: 0, transformPerspective: 400 },
      shown: { rotateY: 0, opacity: 1, transformPerspective: 400 },
    };
  }
  if (kind === "swoosh") {
    return {
      hidden: { scale: 2.4, rotateX: 20, filter: "blur(8px)", opacity: 0, transformPerspective: 300 },
      shown: { scale: 1, rotateX: 0, filter: "blur(0px)", opacity: 1, transformPerspective: 300 },
    };
  }
  if (kind === "boing") {
    return {
      hidden: { scaleX: 0.9, scaleY: 1.25, y: -opts.distance, opacity: 0, transformOrigin: "bottom" },
      shown: { scaleX: 1, scaleY: 1, y: 0, opacity: 1, transformOrigin: "bottom" },
    };
  }
  if (kind === "skid") {
    return {
      hidden: { x: -opts.distance, skewX: -20, opacity: 0 },
      shown: { x: 0, skewX: 0, opacity: 1 },
    };
  }
  if (kind === "move") {
    return {
      hidden: { x: Math.cos(rad) * opts.distance, y: Math.sin(rad) * opts.distance, opacity: 0 },
      shown: { x: 0, y: 0, opacity: 1 },
    };
  }
  if (kind === "flicker") {
    return {
      hidden: { opacity: 0 },
      shown: {
        opacity: [0, 1, 0, 0, 1, 0, 1, 0, 1, 1],
      },
    };
  }
  if (kind === "filmExposure") {
    return {
      hidden: { filter: "brightness(0) saturate(0.2)" },
      shown: { filter: "brightness(1) saturate(1)" },
    };
  }
  if (kind === "snapshot") {
    return {
      hidden: { filter: "brightness(2)", opacity: 1 },
      shown: { filter: "brightness(1)", opacity: 1 },
    };
  }
  if (kind === "iris") {
    return {
      hidden: { clipPath: `circle(0% at ${ORIGIN[opts.origin]})` },
      shown: { clipPath: `circle(150% at ${ORIGIN[opts.origin]})` },
    };
  }
  if (kind === "wipe" || kind === "glare") {
    return {
      hidden: { ["--p" as string]: 0 },
      shown: { ["--p" as string]: 1 },
    };
  }
  if (kind === "blinds" || kind === "clock" || kind === "dissolve") {
    return {
      hidden: { ["--p" as string]: 0 },
      shown: { ["--p" as string]: 1 },
    };
  }
  return { hidden: { opacity: 0 }, shown: { opacity: 1 } };
}

function MaskLayer({
  kind,
  slatHeight,
  cellSize,
  angle,
  children,
}: {
  kind: SWTransitionKind;
  slatHeight: number;
  cellSize: number;
  angle: number;
  children: ReactNode;
}) {
  if (kind === "wipe" || kind === "glare" || kind === "blinds" || kind === "clock" || kind === "dissolve") {
    const p = "var(--p, 1)";
    let mask = "";
    if (kind === "wipe" || kind === "glare") {
      mask = `linear-gradient(${angle}deg, #000 calc(${p} * 100%), transparent calc(${p} * 100%))`;
    } else if (kind === "blinds") {
      mask = `repeating-linear-gradient(to bottom, #000 0, #000 calc(${p} * ${slatHeight}px), transparent calc(${p} * ${slatHeight}px), transparent ${slatHeight}px)`;
    } else if (kind === "clock") {
      mask = `conic-gradient(from -90deg, #000 calc(${p} * 360deg), transparent 0)`;
    } else {
      mask = dissolveMask(cellSize);
    }
    return (
      <div style={{ position: "relative" }}>
        <div
          style={{
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        >
          {children}
        </div>
        {kind === "glare" && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              mixBlendMode: "screen",
              background: `linear-gradient(${angle + 90}deg, transparent, rgba(255,255,255,0.9), transparent)`,
              opacity: 0.85,
              WebkitMaskImage: mask,
              maskImage: mask,
            }}
          />
        )}
      </div>
    );
  }
  return <>{children}</>;
}

function dissolveMask(cellSize: number): string {
  const n = 32;
  const canvas = dissolveCanvas(n, cellSize);
  return `url(${canvas})`;
}

let cachedDissolve = "";
function dissolveCanvas(n: number, cellSize: number): string {
  if (typeof document === "undefined") return "";
  if (cachedDissolve) return cachedDissolve;
  const c = document.createElement("canvas");
  c.width = n * cellSize;
  c.height = n * cellSize;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#000";
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const seed = Math.sin(row * 73 + col * 151 + 1.23) * 43758.5453;
      const threshold = seed - Math.floor(seed);
      if (threshold < 0.55) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
  cachedDissolve = c.toDataURL();
  return cachedDissolve;
}

export const SW_TRANSITION_KINDS: { kind: SWTransitionKind; label: string }[] = [
  { kind: "boing", label: "Boing" },
  { kind: "skid", label: "Skid" },
  { kind: "swoosh", label: "Swoosh" },
  { kind: "flip", label: "Flip" },
  { kind: "rotate3D", label: "Rotate 3D" },
  { kind: "move", label: "Move" },
  { kind: "blur", label: "Blur" },
  { kind: "iris", label: "Iris" },
  { kind: "wipe", label: "Wipe" },
  { kind: "blinds", label: "Blinds" },
  { kind: "clock", label: "Clock" },
  { kind: "glare", label: "Glare" },
  { kind: "dissolve", label: "Dissolve" },
  { kind: "flicker", label: "Flicker" },
  { kind: "filmExposure", label: "Film Exposure" },
  { kind: "snapshot", label: "Snapshot" },
];

function swSyntax(label: string): string {
  return `.transition(.sw${label.replaceAll(" ", "")})`;
}

export function SWTransitionShowcase() {
  const [kind, setKind] = useState<SWTransitionKind>("boing");
  const [visible, setVisible] = useState(true);
  const meta = useMemo(
    () => SW_TRANSITION_KINDS.find((k) => k.kind === kind) ?? SW_TRANSITION_KINDS[0]!,
    [kind],
  );

  const replay = () => {
    setVisible(false);
    window.setTimeout(() => setVisible(true), 750);
  };

  const select = (next: SWTransitionKind) => {
    if (next === kind) {
      replay();
      return;
    }
    setKind(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 520 }}>
      <div style={{ flex: 1, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SWTransition
          key={kind}
          visible={visible}
          kind={kind}
          angle={kind === "move" ? 135 : 45}
          style={{ width: "min(100%, 420px)" }}
        >
          <div
            key={kind}
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              margin: "0 30px",
            }}
          >
            <img
              src="/demo/transition-demo.jpg"
              alt=""
              style={{ width: "100%", display: "block", borderRadius: 24 }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "12px 30px",
                textAlign: "center",
                background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
              }}
            >
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{meta.label}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--sw-mono)", fontSize: 12 }}>
                {swSyntax(meta.label)}
              </div>
            </div>
          </div>
        </SWTransition>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
          gap: 8,
          padding: "0 16px",
        }}
      >
        {SW_TRANSITION_KINDS.map((item) => {
          const active = item.kind === kind;
          return (
            <button
              key={item.kind}
              type="button"
              onClick={() => select(item.kind)}
              style={{
                padding: "7px 0",
                border: "none",
                borderRadius: 999,
                background: active ? "var(--sw-accent)" : "var(--sw-fill)",
                color: active ? "#fff" : "var(--sw-label)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
        <button
          type="button"
          onClick={replay}
          style={{
            border: "1px solid var(--sw-separator)",
            background: "var(--sw-surface)",
            borderRadius: 999,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <SWSymbol name="arrow.triangle.2.circlepath" size={14} />
          Replay
        </button>
      </div>
    </div>
  );
}
