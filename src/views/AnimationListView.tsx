import { useParams } from "react-router";
import {
  SWAnimatedMeshGradient,
  SWBeforeAfterSlider,
  SWChangeEffectShowcase,
  SWCharSphere,
  SWConfettiShowcase,
  SWDotSphere,
  SWFullScreenButton,
  SWGlowSweep,
  SWLightSweep,
  SWOrbitingLogos,
  SWParticleTransitionShowcase,
  SWScanningOverlay,
  SWShakingIcon,
  SWShimmer,
  SWTransitionShowcase,
  SWTypewriterText,
} from "@/swpackage/swanimation";
import {
  SWAnimatedLoop,
  SWColorPanels,
  SWDotOrbit,
  SWDots,
  SWFractalClouds,
  SWGlass,
  SWGlassLogo,
  SWGlassOrb,
  SWGrainGradient,
  SWHalftone,
  SWInkSmoke,
  SWLiquidChrome,
  SWLiquidMetal,
  SWMetaballs,
  SWNeuroNoise,
  SWPlasma,
  SWSimplexNoise,
  SWSmokeRing,
  SWStarfield,
  SWStarNest,
  SWSwirl,
  SWVoronoi,
  SWWater,
} from "@/swpackage/swanimation/swmetal";
import { SWHolographicCardShowcase } from "./SWHolographicCardShowcase";
import { CatalogList, DemoPage } from "./DemoPage";
import type { ReactNode } from "react";

const ITEMS = [
  { id: "transitions", title: "Transitions", icon: "square.stack.3d.forward.dottedline", description: "16 modern view transitions: boing, skid, swoosh, flip, iris, wipe, blinds, clock, glare, dissolve, flicker, film exposure and more." },
  { id: "particles", title: "Particle Transitions", icon: "burst", description: "Poof smoke, pop ripple, and anvil slam particle transitions." },
  { id: "change", title: "Change Effects", icon: "wand.and.rays", description: "Micro-interactions: shake, jump, spin, ping, spray, rise, shine, haptics." },
  { id: "holographic", title: "Holographic Cards", icon: "rectangle.portrait.on.rectangle.portrait.angled", description: "Drag a card to tilt foil, glitter, intense bling, chromatic glass, and polished aluminum." },
  { id: "before-after", title: "Before / After Slider", icon: "slider.horizontal.below.rectangle", description: "Draggable image comparison slider with auto-oscillating animation." },
  { id: "typewriter", title: "Typewriter Text", icon: "character.cursor.ibeam", description: "Typing and deleting text that cycles through strings." },
  { id: "shaking", title: "Shaking Icon", icon: "iphone.radiowaves.left.and.right", description: "Periodic zoom and jiggle, like the iOS home-screen effect." },
  { id: "shimmer", title: "Shimmer", icon: "light.max", description: "Translucent light band sweep across any view." },
  { id: "glow", title: "Glow Sweep", icon: "wand.and.rays", description: "Sweeps a glowing highlight using the content as a mask." },
  { id: "light", title: "Light Sweep", icon: "light.beacon.max", description: "Gradient light band over clipped content." },
  { id: "scanning", title: "Scanning Overlay", icon: "barcode.viewfinder", description: "Grid, scan band, and noise overlay." },
  { id: "mesh", title: "Animated Mesh Gradient", icon: "circle.hexagongrid.fill", description: "3×3 mesh gradient cycling palettes." },
  { id: "dots", title: "Dots", icon: "circle.grid.3x3.fill", description: "WebGL 3D dot-grid backgrounds with live controls." },
  { id: "starfield", title: "Starfield", icon: "sparkles", description: "Multi-layer twinkling starfield." },
  { id: "starnest", title: "Star Nest", icon: "sparkles.rectangle.stack.fill", description: "Volumetric space-fold nebula." },
  { id: "glass-orb", title: "Glass Orb", icon: "circle.circle", description: "Draggable refractive glass orb." },
  { id: "glass-logo", title: "Glass Logo", icon: "apple.logo", description: "Frosted-glass symbol on a glowing canvas." },
  { id: "glass", title: "Glass", icon: "drop.halffull", description: "Refractive glass sheet over content." },
  { id: "clouds", title: "Fractal Clouds", icon: "cloud.fill", description: "Drifting FBM cumulus clouds." },
  { id: "ink", title: "Ink Smoke", icon: "drop.fill", description: "Domain-warped ink-in-water smoke." },
  { id: "chrome", title: "Liquid Chrome", icon: "circle.lefthalf.filled", description: "Animated liquid chrome surface." },
  { id: "plasma", title: "Plasma", icon: "flame.fill", description: "Five plasma styles: solar, prism, spectrum, ember, lilac." },
  { id: "loop", title: "Animated Loop", icon: "circle.dashed", description: "Pulsing concentric rings in four styles." },
  { id: "metaballs", title: "Metaballs", icon: "circle.hexagonpath.fill", description: "Gooey metaball cluster and fountain." },
  { id: "grain", title: "Grain Gradient", icon: "circle.grid.cross.fill", description: "Soft tri-color noise gradient with film grain." },
  { id: "halftone", title: "Halftone", icon: "circle.grid.3x3", description: "Halftone image filter over any source." },
  { id: "water", title: "Water", icon: "drop.fill", description: "Rippling water caustic distortion." },
  { id: "liquid-metal", title: "Liquid Metal", icon: "drop.triangle.fill", description: "Chrome stripe wrap over symbols." },
  { id: "neuro", title: "Neuro Noise", icon: "waveform.path", description: "Glowing organic web of fluid lines." },
  { id: "dot-orbit", title: "Dot Orbit", icon: "circle.hexagongrid.fill", description: "Voronoi dots orbiting cell centers." },
  { id: "voronoi", title: "Voronoi", icon: "hexagon.fill", description: "Animated Voronoi cells." },
  { id: "simplex", title: "Simplex Noise", icon: "swirl.circle.righthalf.filled", description: "Layered simplex-noise gradient." },
  { id: "panels", title: "Color Panels", icon: "fan.fill", description: "Pseudo-3D rotating translucent panels." },
  { id: "smoke-ring", title: "Smoke Ring", icon: "circle.dashed", description: "Polar smoke ring with FBM distortion." },
  { id: "swirl", title: "Swirl", icon: "hurricane", description: "Twisted polar color bands." },
  { id: "dot-sphere", title: "Dot Sphere", icon: "globe.americas.fill", description: "Canvas 3D Fibonacci dot sphere." },
  { id: "char-sphere", title: "Char Sphere", icon: "character.bubble.fill", description: "Canvas 3D glyph sphere." },
  { id: "confetti", title: "Confetti", icon: "party.popper", description: "Celebration burst and fireworks." },
  { id: "orbit", title: "Orbiting Logos", icon: "atom", description: "Concentric rotating rings of icons." },
  { id: "fullscreen", title: "Full-Screen Button", icon: "rectangle.expand.vertical", description: "Card that zooms into a full-screen view." },
];

export function AnimationListView() {
  return <CatalogList title="Animation" base="/animation" items={ITEMS} />;
}

function Face() {
  return <img src="/demo/face-picture.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
}

const DEMOS: Record<string, () => ReactNode> = {
  transitions: () => <SWTransitionShowcase />,
  particles: () => <SWParticleTransitionShowcase />,
  change: () => <SWChangeEffectShowcase />,
  holographic: () => <SWHolographicCardShowcase />,
  "before-after": () => (
    <SWBeforeAfterSlider before="/demo/smile-before.png" after="/demo/smile-after.png" />
  ),
  typewriter: () => (
    <div className="sw-demo-stack" style={{ background: "#000", color: "#fff" }}>
      <SWTypewriterText texts={["Level up your smile game", "AI-powered smile analysis", "Join the glow up era"]} animationStyle="spring" />
      <SWTypewriterText texts={["Level up your smile game", "AI-powered smile analysis"]} animationStyle="blur" />
    </div>
  ),
  shaking: () => (
    <div className="sw-demo-stack">
      <SWShakingIcon image="/demo/smile-after.png" height={100} cornerRadius={8} />
    </div>
  ),
  shimmer: () => (
    <div className="sw-demo-stack">
      <SWShimmer>
        <button type="button" className="sw-btn sw-btn-primary" style={{ width: 220 }}>
          Hello World
        </button>
      </SWShimmer>
      <SWShimmer>
        <div style={{ width: 280, height: 120, borderRadius: 12, background: "var(--sw-fill)" }} />
      </SWShimmer>
    </div>
  ),
  glow: () => (
    <div className="sw-demo-stack">
      <SWGlowSweep>
        <h1 style={{ margin: 0 }}>Start Scan Today</h1>
      </SWGlowSweep>
    </div>
  ),
  light: () => (
    <div className="sw-demo-stack">
      <SWLightSweep>
        <img src="/demo/smile-after.png" alt="" style={{ width: 180, borderRadius: 16 }} />
      </SWLightSweep>
    </div>
  ),
  scanning: () => (
    <div className="sw-demo-stack">
      <SWScanningOverlay>
        <img src="/demo/face-picture.png" alt="" style={{ width: 180, borderRadius: 12 }} />
      </SWScanningOverlay>
    </div>
  ),
  mesh: () => (
    <div className="sw-shader-stage">
      <SWAnimatedMeshGradient />
    </div>
  ),
  dots: () => (
    <div className="sw-shader-stage">
      <SWDots showsControls />
    </div>
  ),
  starfield: () => (
    <div className="sw-shader-stage">
      <SWStarfield showsControls />
    </div>
  ),
  starnest: () => (
    <div className="sw-shader-stage">
      <SWStarNest showsControls />
    </div>
  ),
  "glass-orb": () => (
    <div className="sw-shader-stage">
      <SWGlassOrb showsControls />
    </div>
  ),
  "glass-logo": () => (
    <div className="sw-shader-stage">
      <SWGlassLogo showsControls />
    </div>
  ),
  glass: () => (
    <div className="sw-shader-stage">
      <SWGlass showsControls>
        <Face />
      </SWGlass>
    </div>
  ),
  clouds: () => (
    <div className="sw-shader-stage">
      <SWFractalClouds showsControls />
    </div>
  ),
  ink: () => (
    <div className="sw-shader-stage">
      <SWInkSmoke showsControls />
    </div>
  ),
  chrome: () => (
    <div className="sw-shader-stage">
      <SWLiquidChrome showsControls />
    </div>
  ),
  plasma: () => (
    <div className="sw-shader-stage">
      <SWPlasma showsControls />
    </div>
  ),
  loop: () => (
    <div className="sw-shader-stage">
      <SWAnimatedLoop showsControls />
    </div>
  ),
  metaballs: () => (
    <div className="sw-shader-stage">
      <SWMetaballs showsControls />
    </div>
  ),
  grain: () => (
    <div className="sw-shader-stage">
      <SWGrainGradient showsControls />
    </div>
  ),
  halftone: () => (
    <div className="sw-shader-stage">
      <SWHalftone showsControls>
        <Face />
      </SWHalftone>
    </div>
  ),
  water: () => (
    <div className="sw-shader-stage">
      <SWWater showsControls>
        <Face />
      </SWWater>
    </div>
  ),
  "liquid-metal": () => (
    <div className="sw-shader-stage" style={{ display: "grid", placeItems: "center" }}>
      <SWLiquidMetal showsControls>
        <div style={{ fontSize: 180, color: "#fff", display: "grid", placeItems: "center", height: "100%" }}></div>
      </SWLiquidMetal>
    </div>
  ),
  neuro: () => (
    <div className="sw-shader-stage">
      <SWNeuroNoise showsControls />
    </div>
  ),
  "dot-orbit": () => (
    <div className="sw-shader-stage">
      <SWDotOrbit showsControls />
    </div>
  ),
  voronoi: () => (
    <div className="sw-shader-stage">
      <SWVoronoi showsControls />
    </div>
  ),
  simplex: () => (
    <div className="sw-shader-stage">
      <SWSimplexNoise showsControls />
    </div>
  ),
  panels: () => (
    <div className="sw-shader-stage">
      <SWColorPanels showsControls />
    </div>
  ),
  "smoke-ring": () => (
    <div className="sw-shader-stage">
      <SWSmokeRing showsControls />
    </div>
  ),
  swirl: () => (
    <div className="sw-shader-stage">
      <SWSwirl showsControls />
    </div>
  ),
  "dot-sphere": () => (
    <div className="sw-shader-stage">
      <SWDotSphere showsControls />
    </div>
  ),
  "char-sphere": () => (
    <div className="sw-shader-stage">
      <SWCharSphere showsControls />
    </div>
  ),
  confetti: () => <SWConfettiShowcase />,
  orbit: () => (
    <div className="sw-demo-stack">
      <SWOrbitingLogos
        images={["airpods", "business-shoes", "sunglasses", "tshirt", "wide-brimmed-hat", "golf-gloves", "suit"]}
      >
        <img src="/demo/fullpack-logo.png" alt="" width={60} height={60} style={{ borderRadius: 8 }} />
      </SWOrbitingLogos>
    </div>
  ),
  fullscreen: () => (
    <div className="sw-demo-stack">
      <SWFullScreenButton />
      <SWFullScreenButton title="SmileMax" subtitle="Daily smile analytics" footer="Open" gradientColors={["#ff2d55", "#af52de"]} />
    </div>
  ),
};

export function AnimationDemo() {
  const { id = "" } = useParams();
  const item = ITEMS.find((i) => i.id === id);
  const Demo = DEMOS[id];
  const fill = [
    "mesh", "dots", "starfield", "starnest", "glass-orb", "glass-logo", "glass", "clouds", "ink", "chrome",
    "plasma", "loop", "metaballs", "grain", "halftone", "water", "liquid-metal", "neuro", "dot-orbit",
    "voronoi", "simplex", "panels", "smoke-ring", "swirl", "dot-sphere", "char-sphere", "holographic",
  ].includes(id);
  return (
    <DemoPage title={item?.title ?? id} pad={!fill}>
      {Demo ? Demo() : <p>Unknown demo</p>}
    </DemoPage>
  );
}
