import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { haptic, SWSymbol } from "@/swpackage/swutil";
import { cssRgba } from "./cssColor";

function useTrigger(trigger: unknown, fire: () => void) {
  const first = useRef(true);
  const fireRef = useRef(fire);
  fireRef.current = fire;
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    fireRef.current();
  }, [trigger]);
}

export function SWShake({
  trigger,
  amplitude = 9,
  children,
  className,
  style,
}: {
  trigger: unknown;
  amplitude?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const x = useMotionValue(0);
  const fire = () => {
    void animate(x, [-amplitude, amplitude * 0.9, -amplitude * 0.7, amplitude * 0.5, -amplitude * 0.3, 0], {
      duration: 0.42,
      times: [0, 0.14, 0.31, 0.48, 0.65, 1],
      ease: "easeInOut",
    });
  };
  useTrigger(trigger, fire);
  return (
    <motion.div className={className} style={{ x, display: "inline-block", ...style }}>
      {children}
    </motion.div>
  );
}

export function SWJump({
  trigger,
  height = 40,
  children,
  className,
  style,
}: {
  trigger: unknown;
  height?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const y = useMotionValue(0);
  const stretch = useMotionValue(1);
  const scaleX = useInverse(stretch);
  const fire = () => {
    void animate(y, [0, -height, 0, 0], {
      duration: 0.72,
      times: [0, 0.47, 0.72, 1],
      ease: "easeInOut",
    });
    void animate(stretch, [0.85, 1.12, 1, 0.88, 1], {
      duration: 0.72,
      times: [0, 0.28, 0.53, 0.61, 1],
      ease: "easeInOut",
    });
  };
  useTrigger(trigger, fire);
  return (
    <motion.div
      className={className}
      style={{
        y,
        scaleY: stretch,
        scaleX,
        display: "inline-block",
        transformOrigin: "bottom",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function useInverse(v: ReturnType<typeof useMotionValue<number>>) {
  const out = useMotionValue(1);
  useEffect(() => {
    return v.on("change", (n) => out.set(2 - n));
  }, [v, out]);
  return out;
}

export function SWSpin({
  trigger,
  duration = 0.6,
  children,
  className,
  style,
}: {
  trigger: unknown;
  duration?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const rotate = useMotionValue(0);
  const fire = () => {
    rotate.set(0);
    void animate(rotate, 360, { duration, ease: [0.42, 0, 0.58, 1] });
  };
  useTrigger(trigger, fire);
  return (
    <motion.div className={className} style={{ rotate, display: "inline-block", ...style }}>
      {children}
    </motion.div>
  );
}

export function SWPing({
  trigger,
  color = "var(--sw-accent)",
  rings = 2,
  children,
  className,
  style,
}: {
  trigger: unknown;
  color?: string;
  rings?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [fireCount, setFireCount] = useState(0);
  useTrigger(trigger, () => setFireCount((n) => n + 1));
  return (
    <div className={className} style={{ position: "relative", display: "inline-flex", ...style }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: rings }, (_, i) => (
          <PingRing key={`${fireCount}-${i}`} fire={fireCount} delay={i * 0.18} color={color} />
        ))}
      </div>
      {children}
    </div>
  );
}

function PingRing({ fire, delay, color }: { fire: number; delay: number; color: string }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (fire === 0) return;
    setActive(false);
    const t = window.setTimeout(() => setActive(true), delay * 1000);
    return () => window.clearTimeout(t);
  }, [fire, delay]);
  return (
    <motion.div
      key={fire}
      initial={{ scale: 1, opacity: 0 }}
      animate={active ? { scale: 2.4, opacity: [0.7, 0] } : { scale: 1, opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: `2px solid ${color}`,
      }}
    />
  );
}

type SprayParticle = {
  birth: number;
  startX: number;
  vx: number;
  vy: number;
  size: number;
  spin: number;
  color: string;
};

export function SWSpray({
  trigger,
  symbol = "circle.fill",
  colors = ["pink", "red", "orange"],
  children,
  className,
  style,
}: {
  trigger: unknown;
  symbol?: string;
  colors?: string[];
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<SprayParticle[]>([]);
  const fire = () => {
    if (!colors.length) return;
    const now = performance.now();
    const fresh: SprayParticle[] = Array.from({ length: 11 }, (_, i) => {
      const angle = ((-125 + Math.random() * 70) * Math.PI) / 180;
      const speed = 220 + Math.random() * 160;
      return {
        birth: now + Math.random() * 60,
        startX: Math.random() * 20 - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 10 + Math.random() * 8,
        spin: Math.random() * 440 - 220,
        color: cssRgba(colors[i % colors.length]!),
      };
    });
    const alive = particles.current.filter((p) => now - p.birth < 900);
    particles.current = alive.concat(fresh);
  };
  useTrigger(trigger, fire);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    const lifetime = 0.9;
    const gravity = 480;
    const glyph = symbol.includes("heart") ? "♥" : "●";
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
      const now = performance.now();
      const originX = rect.width / 2;
      const originY = rect.height / 2;
      for (const p of particles.current) {
        const t = (now - p.birth) / 1000;
        if (t < 0 || t > lifetime) continue;
        const life = t / lifetime;
        const px = originX + p.startX + p.vx * t;
        const py = originY + p.vy * t + 0.5 * gravity * t * t;
        const alpha = life < 0.6 ? 1 : 1 - (life - 0.6) / 0.4;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(px, py);
        ctx.rotate((p.spin * t * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(glyph, 0, 0);
        ctx.restore();
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [symbol]);

  return (
    <div className={className} style={{ position: "relative", display: "inline-flex", ...style }}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: -90,
          width: "calc(100% + 180px)",
          height: "calc(100% + 180px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

type RiseItem = { birth: number; drift: number; wobblePhase: number };

export function SWRise({
  trigger,
  text = "+1",
  color = "var(--sw-label)",
  children,
  className,
  style,
}: {
  trigger: unknown;
  text?: string;
  color?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const items = useRef<RiseItem[]>([]);
  const fire = () => {
    const now = performance.now();
    items.current = items.current.filter((it) => now - it.birth < 1100).concat({
      birth: now,
      drift: Math.random() * 24 - 12,
      wobblePhase: Math.random() * Math.PI * 2,
    });
  };
  useTrigger(trigger, fire);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    const lifetime = 1.1;
    const riseDistance = 60;
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
      const now = performance.now();
      ctx.font = "700 17px ui-rounded, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color.startsWith("var(") ? "#34c759" : cssRgba(color);
      for (const item of items.current) {
        const t = (now - item.birth) / 1000;
        if (t < 0 || t > lifetime) continue;
        const life = t / lifetime;
        const eased = 1 - (1 - life) * (1 - life);
        const x = rect.width / 2 + item.drift + Math.sin(life * 3 * Math.PI + item.wobblePhase) * 5;
        const y = rect.height * 0.25 - eased * riseDistance;
        const alpha = life < 0.15 ? life / 0.15 : life < 0.65 ? 1 : 1 - (life - 0.65) / 0.35;
        ctx.globalAlpha = alpha;
        ctx.fillText(text, x, y);
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [color, text]);

  return (
    <div className={className} style={{ position: "relative", display: "inline-flex", ...style }}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: -90,
          width: "calc(100% + 180px)",
          height: "calc(100% + 180px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export type SWHapticKind = "success" | "warning" | "error" | "impact" | "selection";

const HAPTIC_MS: Record<SWHapticKind, number> = {
  success: 24,
  warning: 32,
  error: 48,
  impact: 28,
  selection: 8,
};

export function SWHaptic({
  trigger,
  feedback = "success",
  children,
  className,
  style,
}: {
  trigger: unknown;
  feedback?: SWHapticKind;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  useTrigger(trigger, () => haptic(HAPTIC_MS[feedback]));
  return (
    <div className={className} style={{ display: "inline-flex", ...style }}>
      {children}
    </div>
  );
}

export function SWShine({
  trigger,
  duration = 0.75,
  children,
  className,
  style,
}: {
  trigger: unknown;
  duration?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [tick, setTick] = useState(0);
  useTrigger(trigger, () => setTick((n) => n + 1));
  return (
    <div className={className} style={{ position: "relative", display: "inline-block", overflow: "hidden", ...style }}>
      {children}
      <motion.div
        key={tick}
        initial={{ x: "-150%" }}
        animate={tick === 0 ? { x: "-150%" } : { x: "180%" }}
        transition={{ duration, ease: "easeInOut" }}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "60%",
          background: "linear-gradient(to right, transparent, rgba(255,255,255,0.75), transparent)",
          transform: "rotate(14deg)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function DemoRow({
  title,
  code,
  demo,
}: {
  title: string;
  code: string;
  demo: (count: number) => ReactNode;
}) {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setCount((n) => n + 1)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        background: "var(--sw-surface)",
        border: "none",
        borderBottom: "0.5px solid var(--sw-separator)",
        padding: "14px 16px",
        textAlign: "left",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, fontFamily: "var(--sw-mono)", color: "var(--sw-secondary-label)" }}>{code}</div>
      </div>
      <div style={{ width: 96, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {demo(count)}
      </div>
    </button>
  );
}

export function SWChangeEffectShowcase() {
  return (
    <div>
      <div className="sw-list-section-title" style={{ padding: "12px 16px 4px" }}>
        Tap any row to fire its effect
      </div>
      <DemoRow
        title="Shake"
        code=".swShake(trigger:)"
        demo={(count) => (
          <SWShake trigger={count}>
            <span
              style={{
                color: "var(--sw-red)",
                fontWeight: 600,
                background: "rgba(255,59,48,0.12)",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              PIN 0000
            </span>
          </SWShake>
        )}
      />
      <DemoRow
        title="Jump"
        code=".swJump(trigger:)"
        demo={(count) => (
          <SWJump trigger={count}>
            <span style={{ fontSize: 40 }}>🏀</span>
          </SWJump>
        )}
      />
      <DemoRow
        title="Spin"
        code=".swSpin(trigger:)"
        demo={(count) => (
          <SWSpin trigger={count}>
            <SWSymbol name="arrow.triangle.2.circlepath" size={30} color="var(--sw-blue)" />
          </SWSpin>
        )}
      />
      <DemoRow
        title="Ping"
        code=".swPing(trigger:)"
        demo={(count) => (
          <SWPing trigger={count} color="var(--sw-orange)">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: "rgba(255,149,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SWSymbol name="bell.badge.fill" size={26} color="var(--sw-orange)" />
            </div>
          </SWPing>
        )}
      />
      <DemoRow
        title="Spray"
        code=".swSpray(trigger:)"
        demo={(count) => (
          <SWSpray trigger={count} symbol="heart.fill" colors={["red", "pink", "orange"]}>
            <SWSymbol name="heart.fill" size={30} color="var(--sw-red)" />
          </SWSpray>
        )}
      />
      <DemoRow
        title="Rise"
        code=".swRise(trigger:)"
        demo={(count) => (
          <SWRise trigger={count} text="+1" color="green">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{count}</div>
              <div style={{ fontSize: 11, color: "var(--sw-secondary-label)" }}>points</div>
            </div>
          </SWRise>
        )}
      />
      <DemoRow
        title="Shine"
        code="SWShine(trigger:) { }"
        demo={(count) => (
          <SWShine trigger={count}>
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                padding: "8px 16px",
                borderRadius: 999,
                background: "linear-gradient(to right, #5856d6, #af52de)",
              }}
            >
              PRO
            </span>
          </SWShine>
        )}
      />
      <DemoRow
        title="Haptic"
        code=".swHaptic(.success, trigger:)"
        demo={(count) => (
          <SWHaptic trigger={count} feedback="success">
            <SWJump trigger={count} height={14}>
              <SWSymbol name="checkmark.seal.fill" size={28} color="var(--sw-green)" />
            </SWJump>
          </SWHaptic>
        )}
      />
    </div>
  );
}
