import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  SWChromaticGlass,
  SWFoil,
  SWGlitter,
  SWIntenseBling,
  SWPolishedAluminum,
} from "@/swpackage/swanimation/swmetal";
import { demoSrc } from "@/swpackage/swanimation/swmetal/shaderHost";

export const SWHolographicCardEffects = [
  "foil",
  "glitter",
  "intenseBling",
  "chromaticGlass",
  "polishedAluminum",
] as const;
export type SWHolographicCardEffect = (typeof SWHolographicCardEffects)[number];

const CATALOG: Record<
  SWHolographicCardEffect,
  {
    title: string;
    imageName: string;
    sceneTitle: string;
    sceneSubtitle: string;
    fallback: string;
  }
> = {
  foil: {
    title: "Foil",
    imageName: "aurora",
    sceneTitle: "AURORA BOREALIS",
    sceneSubtitle: "ALASKA · NORTHERN LIGHTS",
    fallback: "linear-gradient(160deg, #0b1d3a, #1b6b4a 40%, #c4f0c2)",
  },
  glitter: {
    title: "Glitter",
    imageName: "fireworks",
    sceneTitle: "FIREWORKS",
    sceneSubtitle: "SYDNEY HARBOUR",
    fallback: "linear-gradient(160deg, #12061c, #7a1f6b 45%, #ffb347)",
  },
  intenseBling: {
    title: "Intense Bling",
    imageName: "galaxy",
    sceneTitle: "THE MILKY WAY",
    sceneSubtitle: "PARANAL OBSERVATORY",
    fallback: "linear-gradient(160deg, #050014, #2a1a6b 50%, #8ec8ff)",
  },
  chromaticGlass: {
    title: "Chromatic Glass",
    imageName: "glacier",
    sceneTitle: "GLACIER",
    sceneSubtitle: "GREENLAND ICE",
    fallback: "linear-gradient(160deg, #d7eef7, #7fb7d4 50%, #1d4e6e)",
  },
  polishedAluminum: {
    title: "Polished Aluminum",
    imageName: "peak",
    sceneTitle: "THE MATTERHORN",
    sceneSubtitle: "SWISS ALPS",
    fallback: "linear-gradient(160deg, #e8eef5, #8a9bb0 55%, #2c3340)",
  },
};

const DEFAULTS: Record<
  SWHolographicCardEffect,
  { intensity: number; separation: number; density: number; speed: number }
> = {
  foil: { intensity: 0.5, separation: 0.9, density: 70, speed: 1 },
  glitter: { intensity: 0.5, separation: 0.9, density: 70, speed: 1 },
  intenseBling: { intensity: 0.5, separation: 0.9, density: 70, speed: 1 },
  chromaticGlass: { intensity: 1, separation: 0.9, density: 70, speed: 1 },
  polishedAluminum: { intensity: 0.4, separation: 0.9, density: 70, speed: 1 },
};

const CARD_WIDTH = 260;
const CARD_HEIGHT = CARD_WIDTH * (3.5 / 2.5);

function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", opacity: 0.6 }}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function CardArtwork({ effect }: { effect: SWHolographicCardEffect }) {
  const meta = CATALOG[effect];
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: meta.fallback,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src={demoSrc(meta.imageName)}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.75))",
        }}
      />
      <div style={{ position: "absolute", left: 18, bottom: 18, right: 18 }}>
        <div
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: 0.4,
            lineHeight: 1.15,
          }}
        >
          {meta.sceneTitle}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: 1.5,
            marginTop: 4,
          }}
        >
          {meta.sceneSubtitle}
        </div>
      </div>
    </div>
  );
}

function HolographicCard({
  effect,
  intensity,
  separation,
  density,
  speed,
}: {
  effect: SWHolographicCardEffect;
  intensity: number;
  separation: number;
  density: number;
  speed: number;
}) {
  const [drag, setDrag] = useState({ width: 0, height: 0 });
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0 });

  const tilt = useMemo(
    () => ({
      width: Math.max(-1, Math.min(1, drag.width / 120)),
      height: Math.max(-1, Math.min(1, drag.height / 120)),
    }),
    [drag],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    origin.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setDrag({ width: e.clientX - origin.current.x, height: e.clientY - origin.current.y });
  };
  const onPointerUp = () => {
    dragging.current = false;
    setDrag({ width: 0, height: 0 });
  };

  const artwork = <CardArtwork effect={effect} />;
  let face = artwork;
  if (effect === "foil") {
    face = (
      <SWFoil tilt={tilt} intensity={intensity} speed={speed}>
        {artwork}
      </SWFoil>
    );
  } else if (effect === "glitter") {
    face = (
      <SWGlitter tilt={tilt} density={density} speed={speed}>
        {artwork}
      </SWGlitter>
    );
  } else if (effect === "intenseBling") {
    face = (
      <SWIntenseBling tilt={tilt} intensity={intensity} speed={speed}>
        {artwork}
      </SWIntenseBling>
    );
  } else if (effect === "chromaticGlass") {
    face = (
      <SWChromaticGlass tilt={tilt} intensity={intensity} separation={separation}>
        {artwork}
      </SWChromaticGlass>
    );
  } else {
    face = (
      <SWPolishedAluminum tilt={tilt} intensity={intensity} speed={speed}>
        {artwork}
      </SWPolishedAluminum>
    );
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 18px 24px rgba(0,0,0,0.5)",
        transform: `perspective(800px) rotateY(${tilt.width * 14}deg) rotateX(${-tilt.height * 14}deg)`,
        transition: dragging.current ? "none" : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        touchAction: "none",
        cursor: "grab",
        outline: "2px solid rgba(255,255,255,0.35)",
      }}
    >
      {face}
    </div>
  );
}

export function SWHolographicCardShowcase() {
  const [selection, setSelection] = useState<SWHolographicCardEffect>("foil");
  const [intensity, setIntensity] = useState(0.5);
  const [separation, setSeparation] = useState(0.9);
  const [density, setDensity] = useState(70);
  const [speed, setSpeed] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const select = useCallback((effect: SWHolographicCardEffect) => {
    setSelection(effect);
    const d = DEFAULTS[effect];
    setIntensity(d.intensity);
    setSeparation(d.separation);
    setDensity(d.density);
    setSpeed(d.speed);
    setMenuOpen(false);
  }, []);

  const sliders =
    selection === "foil" || selection === "intenseBling" || selection === "polishedAluminum"
      ? [
          { label: "Intensity", value: intensity, min: 0, max: 1, step: 0.01, set: setIntensity },
          { label: "Speed", value: speed, min: 0, max: 3, step: 0.05, set: setSpeed },
        ]
      : selection === "glitter"
        ? [
            { label: "Density", value: density, min: 10, max: 120, step: 1, set: setDensity },
            { label: "Speed", value: speed, min: 0, max: 3, step: 0.05, set: setSpeed },
          ]
        : [
            { label: "Intensity", value: intensity, min: 0, max: 1, step: 0.01, set: setIntensity },
            { label: "Separation", value: separation, min: 0, max: 1, step: 0.01, set: setSeparation },
          ];

  return (
    <div
      style={{
        minHeight: "100%",
        background: "linear-gradient(#f2f5fa, #d9dee8)",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 28px 32px",
        position: "relative",
      }}
    >
      <div style={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Holographic Cards</h1>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            aria-label="Choose Effect"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 36,
              height: 36,
              border: "none",
              borderRadius: 18,
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✦
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 40,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                minWidth: 200,
                padding: 6,
                zIndex: 4,
              }}
            >
              {SWHolographicCardEffects.map((effect) => (
                <button
                  key={effect}
                  type="button"
                  onClick={() => select(effect)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    border: "none",
                    background: selection === effect ? "rgba(0,0,0,0.06)" : "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: selection === effect ? 600 : 400,
                  }}
                >
                  {selection === effect ? "✓ " : ""}
                  {CATALOG[effect].title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 24 }}>
        <HolographicCard
          key={selection}
          effect={selection}
          intensity={intensity}
          separation={separation}
          density={density}
          speed={speed}
        />
        <div style={{ fontSize: 22, fontWeight: 700 }}>{CATALOG[selection].title}</div>
        <div style={{ width: "min(420px, 100%)", display: "flex", flexDirection: "column", gap: 12 }}>
          {sliders.map((s) => (
            <ParameterSlider
              key={s.label}
              label={s.label}
              value={s.value}
              min={s.min}
              max={s.max}
              step={s.step}
              onChange={s.set}
            />
          ))}
        </div>
        <p style={{ fontSize: 13, opacity: 0.55, margin: 0 }}>Drag the card to tilt its holographic finish</p>
      </div>
    </div>
  );
}
