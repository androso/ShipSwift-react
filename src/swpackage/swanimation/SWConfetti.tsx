import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SWSymbol } from "@/swpackage/swutil";
import { cssRgba } from "./cssColor";

export type SWConfettiShape = "rectangle" | "circle" | "triangle" | "strip";
export type SWConfettiSpread = "narrow" | "medium" | "wide";

const SPREAD_ANGLE: Record<SWConfettiSpread, number> = {
  narrow: Math.PI / 6,
  medium: Math.PI / 3,
  wide: Math.PI / 2,
};

const ALL_SHAPES: SWConfettiShape[] = ["rectangle", "circle", "triangle", "strip"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  scaleX: number;
  wobbleSpeed: number;
  wobblePhase: number;
  color: string;
  shape: SWConfettiShape;
  width: number;
  height: number;
};

export function SWConfetti({
  isActive,
  onActiveChange,
  particleCount = 80,
  colors = ["red", "orange", "yellow", "green", "blue", "purple"],
  shapes = ALL_SHAPES,
  spread = "medium",
  duration = 3,
  gravity = 500,
  autoReset = false,
  children,
  className,
  style,
}: {
  isActive: boolean;
  onActiveChange?: (value: boolean) => void;
  particleCount?: number;
  colors?: string[];
  shapes?: SWConfettiShape[];
  spread?: SWConfettiSpread;
  duration?: number;
  gravity?: number;
  autoReset?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {children}
      <SWConfettiCanvas
        isActive={isActive}
        onActiveChange={onActiveChange}
        particleCount={particleCount}
        colors={colors}
        shapes={shapes}
        spread={spread}
        duration={duration}
        gravity={gravity}
        autoReset={autoReset}
      />
    </div>
  );
}

function SWConfettiCanvas({
  isActive,
  onActiveChange,
  particleCount,
  colors,
  shapes,
  spread,
  duration,
  gravity,
  autoReset,
}: {
  isActive: boolean;
  onActiveChange?: (value: boolean) => void;
  particleCount: number;
  colors: string[];
  shapes: SWConfettiShape[];
  spread: SWConfettiSpread;
  duration: number;
  gravity: number;
  autoReset: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;
    if (!colors.length || !shapes.length) return;
    const next: Particle[] = [];
    const half = SPREAD_ANGLE[spread];
    for (let i = 0; i < particleCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 2 - 1) * half;
      const speed = 400 + Math.random() * 500;
      const shape = shapes[Math.floor(Math.random() * shapes.length)]!;
      const isStrip = shape === "strip";
      next.push({
        x: Math.random() * 40 - 20,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle: Math.random() * 360,
        angularVelocity: Math.random() * 800 - 400,
        scaleX: 0.6 + Math.random() * 0.4,
        wobbleSpeed: 4 + Math.random() * 6,
        wobblePhase: Math.random() * Math.PI * 2,
        color: cssRgba(colors[Math.floor(Math.random() * colors.length)]!),
        shape,
        width: isStrip ? 3 + Math.random() * 2 : 6 + Math.random() * 6,
        height: isStrip ? 14 + Math.random() * 14 : 6 + Math.random() * 6,
      });
    }
    particles.current = next;
    startTime.current = performance.now();
    if (autoReset) {
      const handle = window.setTimeout(() => onActiveChange?.(false), duration * 1000);
      return () => window.clearTimeout(handle);
    }
    return undefined;
  }, [isActive, autoReset, colors, duration, onActiveChange, particleCount, shapes, spread]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
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
      const start = startTime.current;
      if (start) {
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed <= duration) {
          const progress = elapsed / duration;
          const opacity = progress < 0.7 ? 1 : Math.max(0, 1 - (progress - 0.7) / 0.3);
          for (const p of particles.current) {
            const px = rect.width / 2 + p.x + p.vx * elapsed;
            const py = rect.height + p.y + p.vy * elapsed + 0.5 * gravity * elapsed * elapsed;
            const angle = ((p.angle + p.angularVelocity * elapsed) * Math.PI) / 180;
            const wobble = Math.cos(p.wobbleSpeed * elapsed + p.wobblePhase);
            const currentScaleX = p.scaleX * wobble;
            if (Math.abs(currentScaleX) < 0.001) continue;
            if (px < -50 || px > rect.width + 50) continue;
            if (py < -50 || py > rect.height + 200) continue;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.translate(px, py);
            ctx.rotate(angle);
            ctx.scale(currentScaleX, 1);
            ctx.fillStyle = p.color;
            drawShape(ctx, p);
            ctx.restore();
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
  }, [duration, gravity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}

function drawShape(ctx: CanvasRenderingContext2D, p: Particle) {
  const x = -p.width / 2;
  const y = -p.height / 2;
  if (p.shape === "rectangle") {
    ctx.fillRect(x, y, p.width, p.height);
    return;
  }
  if (p.shape === "circle") {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (p.shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(0, -p.height / 2);
    ctx.lineTo(p.width / 2, p.height / 2);
    ctx.lineTo(-p.width / 2, p.height / 2);
    ctx.closePath();
    ctx.fill();
    return;
  }
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, p.width, p.height, p.width / 2);
  } else {
    ctx.rect(x, y, p.width, p.height);
  }
  ctx.fill();
}

export type SWConfettiShowcaseMode = "confetti" | "fireworks";

export function SWConfettiShowcase() {
  const [mode, setMode] = useState<SWConfettiShowcaseMode>("confetti");
  const [celebrate, setCelebrate] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 420 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: 12 }}>
        <button
          type="button"
          className="sw-nav-back"
          onClick={() => setMode(mode === "confetti" ? "fireworks" : "confetti")}
        >
          <SWSymbol name={mode === "confetti" ? "party.popper" : "sparkles"} />
          {mode === "confetti" ? "Confetti" : "Fireworks"}
        </button>
      </div>
      {mode === "confetti" ? (
        <SWConfetti isActive={celebrate} onActiveChange={setCelebrate} autoReset>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: 360,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600 }}>Confetti Burst</div>
            <div style={{ color: "var(--sw-secondary-label)" }}>Tap to celebrate</div>
            <button type="button" className="sw-btn sw-btn-primary" style={{ width: "auto", padding: "12px 24px" }} onClick={() => setCelebrate(true)}>
              Celebrate!
            </button>
          </div>
        </SWConfetti>
      ) : (
        <SWConfettiFireworkShowView />
      )}
    </div>
  );
}

type BurstConfig = {
  delay: number;
  x: number;
  y: number;
  colors: string[];
  particleCount: number;
  duration: number;
  minSpeed: number;
  maxSpeed: number;
  gravity: number;
  launchDuration: number;
  launchY: number;
};

type FireworkParticle = {
  vx: number;
  vy: number;
  color: string;
  size: number;
  brightness: number;
};

const FIREWORK_BURSTS: BurstConfig[] = [
  { delay: 0.0, x: 0.5, y: 0.22, colors: ["#ffd94d", "#ffb319", "orange", "yellow"], particleCount: 100, duration: 2.8, minSpeed: 60, maxSpeed: 200, gravity: 30, launchDuration: 0.8, launchY: 0.72 },
  { delay: 0.4, x: 0.25, y: 0.18, colors: ["red", "#ff4d4d", "orange", "#ff8033"], particleCount: 80, duration: 2.5, minSpeed: 50, maxSpeed: 170, gravity: 25, launchDuration: 0.9, launchY: 0.72 },
  { delay: 0.7, x: 0.75, y: 0.2, colors: ["green", "mint", "cyan", "#4dff80"], particleCount: 80, duration: 2.5, minSpeed: 50, maxSpeed: 170, gravity: 25, launchDuration: 0.85, launchY: 0.72 },
  { delay: 2.5, x: 0.45, y: 0.14, colors: ["purple", "pink", "#cc66ff", "#ff99cc"], particleCount: 90, duration: 2.8, minSpeed: 55, maxSpeed: 190, gravity: 28, launchDuration: 1.0, launchY: 0.72 },
  { delay: 2.9, x: 0.68, y: 0.16, colors: ["blue", "cyan", "#4d99ff", "white"], particleCount: 70, duration: 2.4, minSpeed: 45, maxSpeed: 160, gravity: 22, launchDuration: 0.9, launchY: 0.72 },
  { delay: 3.3, x: 0.3, y: 0.25, colors: ["white", "#d9d9f2", "#b3ccff"], particleCount: 60, duration: 2.2, minSpeed: 40, maxSpeed: 150, gravity: 20, launchDuration: 0.7, launchY: 0.72 },
  { delay: 5.0, x: 0.5, y: 0.18, colors: ["#ffe666", "#ffcc33", "white", "yellow"], particleCount: 130, duration: 3.2, minSpeed: 70, maxSpeed: 230, gravity: 32, launchDuration: 0.85, launchY: 0.72 },
  { delay: 5.3, x: 0.18, y: 0.22, colors: ["red", "orange", "#ff6633"], particleCount: 60, duration: 2.5, minSpeed: 40, maxSpeed: 140, gravity: 22, launchDuration: 0.75, launchY: 0.72 },
  { delay: 5.6, x: 0.82, y: 0.22, colors: ["green", "cyan", "#66ff99"], particleCount: 60, duration: 2.5, minSpeed: 40, maxSpeed: 140, gravity: 22, launchDuration: 0.75, launchY: 0.72 },
  { delay: 6.0, x: 0.5, y: 0.1, colors: ["purple", "pink", "white", "#e680ff"], particleCount: 90, duration: 3.0, minSpeed: 60, maxSpeed: 200, gravity: 28, launchDuration: 1.1, launchY: 0.72 },
];

function generateParticles(bursts: BurstConfig[]): FireworkParticle[][] {
  return bursts.map((config) =>
    Array.from({ length: config.particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
      return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: cssRgba(config.colors[Math.floor(Math.random() * config.colors.length)]!),
        size: 1.5 + Math.random() * 2.5,
        brightness: 0.6 + Math.random() * 0.4,
      };
    }),
  );
}

export function SWConfettiFireworkShowView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(performance.now());
  const particlesRef = useRef(generateParticles(FIREWORK_BURSTS));
  const cycleDuration =
    (Math.max(...FIREWORK_BURSTS.map((b) => b.delay + b.launchDuration + b.duration)) || 5) + 1;

  const stars = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      x: ((i * 7 + 13) % 100) / 100,
      y: (((i * 11 + 37) % 100) / 100) * 0.5,
      size: 0.5 + (((i * 3 + 59) % 100) / 100) * 1.5,
      phase: (((i * 17 + 41) % 100) / 100) * Math.PI * 2,
    })),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
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
      const totalElapsed = (performance.now() - startRef.current) / 1000;
      const elapsed = totalElapsed % cycleDuration;

      for (const star of stars.current) {
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(totalElapsed * 1.5 + star.phase));
        ctx.globalAlpha = twinkle * 0.8;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(star.x * rect.width, star.y * rect.height, star.size * twinkle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      FIREWORK_BURSTS.forEach((config, i) => {
        const parts = particlesRef.current[i];
        if (!parts) return;
        const sinceDelay = elapsed - config.delay;
        if (sinceDelay <= 0 || sinceDelay >= config.launchDuration + config.duration) return;
        const originX = config.x * rect.width;
        const originY = config.y * rect.height;
        const groundY = config.launchY * rect.height;
        const headColor = cssRgba(config.colors[0]!);

        if (sinceDelay < config.launchDuration) {
          const lp = sinceDelay / config.launchDuration;
          const eased = 1 - (1 - lp) * (1 - lp);
          const headY = groundY + (originY - groundY) * eased;
          const tailLen = Math.min(eased, 0.35);
          const tailY = groundY + (originY - groundY) * Math.max(0, eased - tailLen);
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = headColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(originX, tailY);
          ctx.lineTo(originX, headY);
          ctx.stroke();
          for (let s = 0; s < 6; s++) {
            const seed = i * 100 + s;
            const age = sinceDelay - s * 0.04;
            if (age <= 0) continue;
            ctx.globalAlpha = Math.max(0, 1 - age * 3) * 0.7;
            ctx.fillStyle = headColor;
            ctx.beginPath();
            ctx.arc(
              originX + Math.sin(seed * 3.7 + age * 8) * 4,
              headY + age * 50 + Math.sin(seed * 2.3) * 10,
              1,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = headColor;
          ctx.beginPath();
          ctx.arc(originX, headY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(originX, headY, 2, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        const burstElapsed = sinceDelay - config.launchDuration;
        const progress = burstElapsed / config.duration;
        if (progress < 0.1) {
          const flashAlpha = 1 - progress / 0.1;
          const flashR = 20 + (progress / 0.1) * 40;
          ctx.globalAlpha = flashAlpha * 0.8;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(originX, originY, flashR, 0, Math.PI * 2);
          ctx.fill();
        }

        const waterY = rect.height * 0.78;
        for (const p of parts) {
          const t = burstElapsed;
          const drag = Math.pow(0.92, t * 3);
          const px = originX + p.vx * t * drag;
          const py = originY + p.vy * t * drag + 0.5 * config.gravity * t * t;
          if (px < -40 || px > rect.width + 40 || py < -40 || py > rect.height + 40) continue;
          const fadeStart = 0.35;
          const alpha =
            progress < fadeStart ? 1 : Math.max(0, 1 - (progress - fadeStart) / (1 - fadeStart));
          const particleSize = p.size * Math.max(0.2, 1 - progress * 0.6);
          ctx.globalAlpha = alpha * p.brightness * 0.9;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, particleSize, 0, Math.PI * 2);
          ctx.fill();
          const prevT = Math.max(0, t - 0.05);
          const prevDrag = Math.pow(0.92, prevT * 3);
          const prevX = originX + p.vx * prevT * prevDrag;
          const prevY = originY + p.vy * prevT * prevDrag + 0.5 * config.gravity * prevT * prevT;
          ctx.globalAlpha = alpha * 0.5 * p.brightness;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = particleSize * 0.6;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.globalAlpha = alpha * p.brightness;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(px, py, particleSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          if (originY < waterY) {
            const reflectedY = 2 * waterY - py;
            if (reflectedY > waterY && reflectedY < rect.height + 20) {
              ctx.globalAlpha = alpha * 0.12;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(px, reflectedY, particleSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        ctx.globalAlpha = 1;
      });

      if (running) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [cycleDuration]);

  const restart = () => {
    particlesRef.current = generateParticles(FIREWORK_BURSTS);
    startRef.current = performance.now();
  };

  return (
    <div
      onClick={restart}
      style={{
        position: "relative",
        minHeight: 520,
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(to bottom, #050514, #0d0d2e, #080a24, #03050f)",
        cursor: "pointer",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          left: -8,
          right: -8,
          bottom: 160,
          pointerEvents: "none",
        }}
      >
        <img
          src="/demo/singapore-skyline.svg"
          alt=""
          style={{
            width: "100%",
            display: "block",
            filter:
              "brightness(0) invert(12%) sepia(14%) saturate(700%) hue-rotate(201deg)",
          }}
        />
        <div style={{ height: 2, background: "rgba(8,10,36,0.6)" }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 60,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 6,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          HAPPY NEW YEAR
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 200,
            backgroundImage: "linear-gradient(to right, #ffd966, #ffb34d)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          2026
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>
          Marina Bay Sands, Singapore
        </div>
      </div>
    </div>
  );
}
