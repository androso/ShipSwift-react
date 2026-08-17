import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { SWSymbol } from "@/swpackage/swutil";
import { demoSrc } from "./demoSrc";

export function SWBeforeAfterSlider({
  before,
  after,
  width = 360,
  aspectRatio = 3 / 4,
  cornerRadius = 24,
  speed = 0.8,
  showLabels = true,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
  style,
}: {
  before: string;
  after: string;
  width?: number;
  aspectRatio?: number;
  cornerRadius?: number;
  speed?: number;
  showLabels?: boolean;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const height = width / aspectRatio;
  const startRef = useRef(performance.now());
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState(0.5);
  const [sliderPos, setSliderPos] = useState(0.5);
  const dragging = useRef(false);
  const dragValue = useRef(0.5);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!dragging.current) {
        const t = (performance.now() - startRef.current) / 1000;
        setSliderPos(0.5 + Math.sin(t * speed) * 0.3);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const pos = isDragging ? dragPos : sliderPos;
  const sliderX = pos * width;

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const next = Math.min(Math.max((e.clientX - rect.left) / width, 0.05), 0.95);
      dragValue.current = next;
      setDragPos(next);
    },
    [width],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const next = Math.min(Math.max((e.clientX - rect.left) / width, 0.05), 0.95);
      dragValue.current = next;
      setDragPos(next);
    },
    [width],
  );

  const onPointerUp = useCallback(() => {
    const normalized = Math.min(Math.max((dragValue.current - 0.5) / 0.3, -1), 1);
    const phase = Math.asin(normalized) / speed;
    startRef.current = performance.now() + phase * 1000 * -1;
    dragging.current = false;
    setIsDragging(false);
  }, [speed]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width,
        height,
        borderRadius: cornerRadius,
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
        cursor: "ew-resize",
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={demoSrc(before)}
        alt={beforeLabel}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: sliderX,
          overflow: "hidden",
        }}
      >
        <img
          src={demoSrc(after)}
          alt={afterLabel}
          draggable={false}
          style={{
            width,
            height,
            objectFit: "cover",
            display: "block",
            maxWidth: "none",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: sliderX - 1.5,
          width: 3,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: sliderX,
          transform: "translate(-50%, -50%)",
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "rgba(255,255,255,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(60,60,67,0.45)",
        }}
      >
        <SWSymbol name="arrow.left.and.right" size={22} />
      </div>
      {showLabels && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "space-between",
            padding: 12,
            pointerEvents: "none",
          }}
        >
          <LabelTag text={beforeLabel} />
          <LabelTag text={afterLabel} />
        </div>
      )}
    </div>
  );
}

function LabelTag({ text }: { text: string }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: "#fff",
        padding: "5px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(12px)",
      }}
    >
      {text}
    </span>
  );
}
