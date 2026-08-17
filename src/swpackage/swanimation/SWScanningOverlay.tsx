import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export function SWScanningOverlay({
  gridOpacity = 0.2,
  bandOpacity = 0.3,
  bandHeightRatio = 0.2,
  gridSpacing = 16,
  speed = 2,
  children,
  className,
  style,
}: {
  gridOpacity?: number;
  bandOpacity?: number;
  bandHeightRatio?: number;
  gridSpacing?: number;
  speed?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(performance.now());

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
      const t = (performance.now() - startRef.current) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const phase = t * 0.8;
      const dx = Math.sin(phase) * 3;
      const dy = Math.cos(phase * 0.9) * 3;
      const step = Math.max(10, gridSpacing);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = `rgba(255,255,255,${gridOpacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = -step; x <= rect.width + step; x += step) {
        const xx = x + dx + Math.sin(x / 80 + phase) * 1.5;
        ctx.moveTo(xx, 0);
        ctx.lineTo(xx, rect.height);
      }
      for (let y = -step; y <= rect.height + step; y += step) {
        const yy = y + dy + Math.cos(y / 80 + phase) * 1.5;
        ctx.moveTo(0, yy);
        ctx.lineTo(rect.width, yy);
      }
      ctx.stroke();

      const p = (t * (0.22 * speed)) % 1;
      const bandH = rect.height * bandHeightRatio;
      const y = -bandH + (rect.height + bandH * 2) * p;
      const bandGrad = ctx.createLinearGradient(0, y - bandH / 2, 0, y + bandH / 2);
      bandGrad.addColorStop(0, "rgba(255,255,255,0)");
      bandGrad.addColorStop(0.25, `rgba(255,255,255,${bandOpacity * 0.4})`);
      bandGrad.addColorStop(0.5, `rgba(255,255,255,${bandOpacity})`);
      bandGrad.addColorStop(0.75, `rgba(255,255,255,${bandOpacity * 0.4})`);
      bandGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(0, y - bandH / 2, rect.width, bandH);
      ctx.fillStyle = `rgba(255,255,255,${bandOpacity * 0.65})`;
      ctx.fillRect(0, y - 1, rect.width, 2);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.globalCompositeOperation = "overlay";
      const nx = Math.sin(t * 0.9) * 20;
      const ny = Math.cos(t * 1.1) * 20;
      const noise = ctx.createLinearGradient(
        nx,
        ny,
        rect.width * 1.6 + nx,
        rect.height * 1.6 + ny,
      );
      noise.addColorStop(0, "rgba(255,255,255,0)");
      noise.addColorStop(0.5, "rgba(255,255,255,1)");
      noise.addColorStop(1, "rgba(255,255,255,0)");
      ctx.filter = "blur(12px)";
      ctx.fillStyle = noise;
      ctx.fillRect(-20, -20, rect.width + 40, rect.height + 40);
      ctx.restore();

      if (running) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [bandHeightRatio, bandOpacity, gridOpacity, gridSpacing, speed]);

  return (
    <div className={className} style={{ position: "relative", display: "inline-block", ...style }}>
      {children}
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
    </div>
  );
}
