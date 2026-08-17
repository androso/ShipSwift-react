import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { demoSrc } from "./demoSrc";

type Dot = {
  radius: number;
  size: number;
  angle: number;
  circleIndex: number;
  hasIcon: boolean;
  iconIndex: number;
};

const GRADIENT: { angle: number; color: [number, number, number] }[] = [
  { angle: 0, color: [26 / 255, 127 / 255, 93 / 255] },
  { angle: Math.PI / 2, color: [52 / 255, 180 / 255, 140 / 255] },
  { angle: Math.PI, color: [80 / 255, 200 / 255, 160 / 255] },
  { angle: (3 * Math.PI) / 2, color: [40 / 255, 150 / 255, 115 / 255] },
  { angle: 2 * Math.PI, color: [26 / 255, 127 / 255, 93 / 255] },
];

function colorAt(angle: number): [number, number, number] {
  let a = angle;
  if (a < 0) a += Math.PI * 2;
  if (a >= Math.PI * 2) a -= Math.PI * 2;
  let startIndex = 0;
  for (let i = 0; i < GRADIENT.length; i++) {
    if (GRADIENT[i]!.angle <= a) startIndex = i;
  }
  const start = GRADIENT[startIndex]!;
  const end = GRADIENT[Math.min(startIndex + 1, GRADIENT.length - 1)]!;
  const span = end.angle - start.angle || 1;
  const p = (a - start.angle) / span;
  return [
    start.color[0] + (end.color[0] - start.color[0]) * p,
    start.color[1] + (end.color[1] - start.color[1]) * p,
    start.color[2] + (end.color[2] - start.color[2]) * p,
  ];
}

function generateCircles(): { radius: number; size: number }[] {
  const circles: { radius: number; size: number }[] = [];
  let dotSize = 4;
  for (let i = 0; i < 4; i++) {
    circles.push({ radius: 75 + i * 15, size: dotSize });
    dotSize += i === 0 ? 2 : i % 2 === 0 ? 3 : -1;
  }
  return circles.reverse();
}

export function SWOrbitingLogos({
  images,
  rotationDuration = 10,
  children,
  className,
  style,
}: {
  images: string[];
  rotationDuration?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dotsPerCircle = 23;
    const circles = generateCircles();
    const limited = images.slice(0, 8);
    const step = Math.max(1, Math.round(dotsPerCircle / Math.max(1, limited.length)));
    const dots: Dot[] = [];
    let angleOffset = 0;
    let iconCount = 0;
    for (let circleIndex = 0; circleIndex < circles.length; circleIndex++) {
      const circle = circles[circleIndex]!;
      for (let dotIndex = 0; dotIndex < dotsPerCircle; dotIndex++) {
        let angle = (2 * Math.PI / dotsPerCircle) * dotIndex + angleOffset;
        if (angle > 2 * Math.PI) angle -= 2 * Math.PI;
        const hasIcon = circleIndex === 0 && limited.length > 0 && dotIndex % step === 0 && iconCount < limited.length;
        dots.push({
          radius: circle.radius,
          size: circle.size,
          angle,
          circleIndex,
          hasIcon,
          iconIndex: hasIcon ? iconCount++ : -1,
        });
      }
      angleOffset += 0.4;
    }
    const iconDots = dots.filter((d) => d.hasIcon).reverse();

    const bitmaps: (HTMLImageElement | null)[] = limited.map(() => null);
    limited.forEach((name, i) => {
      const img = new Image();
      img.src = demoSrc(name);
      img.onload = () => {
        bitmaps[i] = img;
      };
    });

    let raf = 0;
    let running = true;
    const start = performance.now();
    let popIndex = 0;
    let popStart = start + 400;

    const draw = (now: number) => {
      const size = Math.min(wrap.clientWidth || 300, wrap.clientHeight || 300);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixel = Math.max(1, Math.floor(size * dpr));
      if (canvas.width !== pixel || canvas.height !== pixel) {
        canvas.width = pixel;
        canvas.height = pixel;
      }
      const scale = size / 300;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const elapsed = (now - start) / 1000;
      const rot = -(elapsed / rotationDuration) * Math.PI * 2;
      const cx = size / 2;
      const cy = size / 2;

      const popElapsed = (now - popStart) / 1000;
      const popCycle = 1.7;
      if (popElapsed > popCycle && iconDots.length) {
        popIndex = (popIndex + 1) % iconDots.length;
        popStart = now;
      }
      const localT = Math.max(0, (now - popStart) / 1000);
      const popping = iconDots[popIndex];

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      for (const dot of dots) {
        const worldAngle = dot.angle + rot;
        const x = dot.radius * Math.cos(worldAngle);
        const y = dot.radius * Math.sin(worldAngle);
        const isPop = popping === dot;
        let scaleDot = 1;
        let showIcon = false;
        let iconAlpha = 0;
        let fillAlpha = 1;
        if (isPop) {
          if (localT < 0.2) {
            scaleDot = localT < 0.1 ? 1 + (4.4 - 1) * (localT / 0.1) : 4.4 - 0.4 * ((localT - 0.1) / 0.1);
            showIcon = true;
            iconAlpha = 1;
            fillAlpha = 0;
          } else if (localT < 1.2) {
            scaleDot = 4;
            showIcon = true;
            iconAlpha = 1;
            fillAlpha = 0;
          } else {
            const k = Math.min(1, (localT - 1.2) / 0.6);
            const ease = k * k;
            scaleDot = 4 + (1 - 4) * ease;
            showIcon = k < 0.85;
            iconAlpha = k < 0.58 ? 1 : Math.max(0, 1 - (k - 0.58) / 0.25);
            fillAlpha = Math.min(1, Math.max(0, (k - 0.2) / 0.5));
          }
        }
        const rgb = colorAt(Math.atan2(y, x));
        ctx.beginPath();
        ctx.arc(x, y, dot.size * scaleDot, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)},${fillAlpha})`;
        ctx.fill();

        if (showIcon && dot.hasIcon) {
          const img = bitmaps[dot.iconIndex];
          if (img) {
            const r = 40 * 0.25 * scaleDot * 4;
            ctx.save();
            ctx.globalAlpha = iconAlpha;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
            ctx.restore();
          }
        }
      }
      ctx.restore();
      if (running) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [images, rotationDuration]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
