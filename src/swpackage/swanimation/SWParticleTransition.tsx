import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { haptic, SWSymbol } from "@/swpackage/swutil";
import { cssRgba } from "./cssColor";

export type SWParticleTransitionKind = "poof" | "pop" | "anvil";

type BurstParticle = {
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  gravity: number;
  size: number;
  growth: number;
  color: string;
  blur: number;
  delay: number;
};

export function SWParticleTransition({
  visible,
  kind,
  colors = ["pink", "orange", "yellow", "mint", "cyan"],
  dropDistance = 350,
  impactDelay = 0.2,
  children,
  className,
  style,
}: {
  visible: boolean;
  kind: SWParticleTransitionKind;
  colors?: string[];
  dropDistance?: number;
  impactDelay?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const variants =
    kind === "poof"
      ? {
          hidden: { opacity: 0, scale: 0.85 },
          shown: { opacity: 1, scale: 1 },
        }
      : kind === "pop"
        ? {
            hidden: { opacity: 0, scale: 0.1 },
            shown: { opacity: 1, scale: 1 },
          }
        : {
            hidden: { opacity: 1, y: -dropDistance },
            shown: { opacity: 1, y: 0 },
          };

  const transition =
    kind === "poof"
      ? { duration: 0.5, ease: "easeOut" as const }
      : kind === "pop"
        ? { type: "spring" as const, duration: 0.5, bounce: 0.55 }
        : { duration: 0.22, ease: "easeIn" as const };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={className}
          style={{ position: "relative", display: "inline-block", ...style }}
          initial="hidden"
          animate="shown"
          exit="hidden"
          variants={variants}
          transition={transition}
        >
          {children}
          <BurstEmitter
            kind={kind}
            colors={colors}
            fireDelay={kind === "anvil" ? impactDelay : 0}
            firesOnRemoval={kind !== "anvil"}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BurstEmitter({
  kind,
  colors,
  fireDelay,
  firesOnRemoval,
}: {
  kind: SWParticleTransitionKind;
  colors: string[];
  fireDelay: number;
  firesOnRemoval: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<BurstParticle[]>([]);
  const start = useRef<number | null>(null);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const fire = () => {
      particles.current = makeParticles(kind, colorsRef.current);
      start.current = performance.now();
    };
    const handle = window.setTimeout(fire, fireDelay * 1000);
    return () => {
      window.clearTimeout(handle);
      if (firesOnRemoval) {
        particles.current = makeParticles(kind, colorsRef.current);
        start.current = performance.now();
      }
    };
  }, [kind, fireDelay, firesOnRemoval]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    const duration = kind === "poof" ? 0.5 : 0.55;
    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const born = start.current;
      if (born) {
        const elapsed = (performance.now() - born) / 1000;
        if (elapsed <= duration + 0.05) {
          for (const p of particles.current) {
            const t = elapsed - p.delay;
            if (t <= 0) continue;
            const life = Math.min(t / (duration - p.delay), 1);
            const px = rect.width / 2 + p.startX + p.vx * t;
            const py = rect.height / 2 + p.startY + p.vy * t + 0.5 * p.gravity * t * t;
            const radius = (p.size * (1 + (p.growth - 1) * life)) / 2;
            const alpha = life < 0.5 ? 1 : 1 - (life - 0.5) / 0.5;
            ctx.save();
            ctx.globalAlpha = alpha;
            if (p.blur) ctx.filter = `blur(${p.blur}px)`;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          if (kind === "pop") {
            const life = Math.min(elapsed / 0.4, 1);
            if (life < 1) {
              const inset = 70;
              const base = Math.min(rect.width - inset * 2, rect.height - inset * 2);
              const ringR = (base * (0.3 + 0.55 * life)) / 2;
              ctx.globalAlpha = 1 - life;
              ctx.strokeStyle = "rgba(255,255,255,0.9)";
              ctx.lineWidth = 3 * (1 - life) + 1;
              ctx.beginPath();
              ctx.arc(rect.width / 2, rect.height / 2, ringR, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
          if (kind === "anvil") {
            const life = Math.min(elapsed / 0.3, 1);
            if (life < 1) {
              const inset = 70;
              const baseY = rect.height - inset;
              const wEllipse = (rect.width - inset * 2) * (0.4 + 0.8 * life);
              ctx.save();
              ctx.filter = "blur(4px)";
              ctx.globalAlpha = (1 - life) * 0.5;
              ctx.fillStyle = "#8e8e93";
              ctx.beginPath();
              ctx.ellipse(rect.width / 2, baseY, wEllipse / 2, 8, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [kind]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: -70,
        width: "calc(100% + 140px)",
        height: "calc(100% + 140px)",
        pointerEvents: "none",
      }}
    />
  );
}

function makeParticles(kind: SWParticleTransitionKind, colors: string[]): BurstParticle[] {
  if (kind === "poof") {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4 - 0.2;
      const rx = 30 + Math.random() * 25;
      const ry = 20 + Math.random() * 20;
      const speed = 40 + Math.random() * 50;
      const gray = 0.75 + Math.random() * 0.2;
      return {
        startX: Math.cos(angle) * rx,
        startY: Math.sin(angle) * ry,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 - 30,
        gravity: -40,
        size: 26 + Math.random() * 20,
        growth: 1.8,
        color: `rgb(${Math.round(gray * 255)},${Math.round(gray * 255)},${Math.round(gray * 255)})`,
        blur: 6,
        delay: Math.random() * 0.06,
      };
    });
  }
  if (kind === "pop") {
    if (!colors.length) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3 - 0.15;
      const speed = 160 + Math.random() * 120;
      return {
        startX: Math.cos(angle) * 20,
        startY: Math.sin(angle) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 150,
        size: 5 + Math.random() * 4,
        growth: 0.4,
        color: cssRgba(colors[i % colors.length]!),
        blur: 0,
        delay: 0,
      };
    });
  }
  return Array.from({ length: 18 }, () => {
    const side = Math.random() < 0.5 ? 1 : -1;
    const gray = 0.6 + Math.random() * 0.2;
    return {
      startX: side * (20 + Math.random() * 50),
      startY: 60 + Math.random() * 20,
      vx: side * (60 + Math.random() * 160),
      vy: -(20 + Math.random() * 60),
      gravity: 320,
      size: 10 + Math.random() * 12,
      growth: 1.5,
      color: `rgb(${Math.round(gray * 255)},${Math.round(gray * 255)},${Math.round(gray * 255)})`,
      blur: 3,
      delay: Math.random() * 0.05,
    };
  });
}

export function SWParticleTransitionShowcase() {
  const [kind, setKind] = useState<SWParticleTransitionKind>("poof");
  const [visible, setVisible] = useState(true);

  const replay = (next = kind) => {
    setVisible(false);
    window.setTimeout(() => {
      setVisible(true);
      if (next === "anvil") {
        window.setTimeout(() => haptic(32), 220);
      }
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 520 }}>
      <div
        style={{
          flex: 1,
          minHeight: 300,
          margin: "0 16px",
          borderRadius: 20,
          background: "var(--sw-fill)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <SWParticleTransition visible={visible} kind={kind}>
          <div
            style={{
              width: "min(330px, calc(100vw - 48px))",
              height: 420,
              maxHeight: "55vh",
              borderRadius: 24,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src="/demo/transition-demo.jpg"
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "12px 0",
                textAlign: "center",
                background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                color: "#fff",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700 }}>{labelFor(kind)}</div>
              <div style={{ fontFamily: "var(--sw-mono)", fontSize: 12, opacity: 0.85 }}>
                .transition(.sw{labelFor(kind)})
              </div>
            </div>
          </div>
        </SWParticleTransition>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 16px" }}>
        {(["poof", "pop", "anvil"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setKind(item);
              replay(item);
            }}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 10,
              padding: "8px 0",
              background: kind === item ? "var(--sw-accent)" : "var(--sw-fill)",
              color: kind === item ? "#fff" : "var(--sw-label)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontWeight: 500,
            }}
          >
            <SWSymbol
              name={item === "poof" ? "cloud.fill" : item === "pop" ? "burst" : "hammer.fill"}
              size={14}
            />
            {labelFor(item)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => replay()}
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

function labelFor(kind: SWParticleTransitionKind): string {
  if (kind === "poof") return "Poof";
  if (kind === "pop") return "Pop";
  return "Anvil";
}
