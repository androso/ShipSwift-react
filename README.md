# ShipSwift

<div align="center">

**AI-native React + TypeScript component library — production-ready code that LLMs can use to build real apps.**

[![Website](https://img.shields.io/badge/Website-shipswift.app-blue.svg)](https://www.shipswift.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](https://www.typescriptlang.org/)
[![Skills](https://img.shields.io/badge/Skills-Powered-8A2BE2.svg)](https://github.com/signerlabs/shipswift-skills)

[Quick Start](#quick-start) · [Components](#components) · [Recipes](#recipes)

</div>

## What is ShipSwift?

A 1:1 React + TypeScript port of the ShipSwift SwiftUI visual library. One command gives your AI production-ready components, full-stack recipes, and the context to build real apps without guessing.

> **Browse every recipe live at [shipswift.app](https://www.shipswift.app/)** — searchable catalog, copy-paste source, live previews.

```bash
npm install
npm run dev
```

Then open http://localhost:5173 to preview every component in the showcase app.

## Quick Start

### Option 1: Skills + Recipe Server (Recommended)

**Step 1** — Install ShipSwift Skills:

```bash
npx skills add signerlabs/shipswift-skills
```

**Step 2** — Connect the recipe server so your AI can fetch recipes:

```bash
# Claude Code
claude mcp add --transport http shipswift https://api.shipswift.app/mcp
```

**Step 3** — Ask your AI:
- "Add a shimmer loading animation"
- "Show me all chart components"

### Option 2: File Copy

1. Clone this repository
2. Copy the files you need from `src/swpackage/` into your Vite + React + TypeScript project
3. Each component in `swanimation/`, `swchart/`, and `swcomponent/` is self-contained — just copy the file and `swutil/` if needed

## Components

### SWAnimation — Animation Components

**CSS / Canvas animations:** Shimmer · TypewriterText · ShakingIcon · GlowSweep · LightSweep · ScanningOverlay · AnimatedMeshGradient · BeforeAfterSlider · OrbitingLogos · FullScreenButton

**Canvas-rendered 3D:** DotSphere · CharSphere

**WebGL procedural backgrounds:** Dots · Starfield · StarNest · FractalClouds · InkSmoke · LiquidChrome · Plasma · AnimatedLoop · Metaballs · NeuroNoise · DotOrbit · Voronoi · SimplexNoise · ColorPanels · SmokeRing · Swirl · GrainGradient

**WebGL content-sampling effects:** Glass · GlassLogo · GlassOrb · Halftone · Water · LiquidMetal · Foil · Glitter · IntenseBling · ChromaticGlass · PolishedAluminum

### SWChart — Chart Components

LineChart · BarChart · AreaChart · DonutChart · RingChart · RadarChart · ScatterChart · ActivityHeatmap · NetworkGraph

### SWComponent — UI Components

**Display:** FloatingLabels · ScrollingFAQ · RotatingQuote · BulletPointText · GradientDivider · Label · MarkdownText · OnboardingView · OrderView · RootTabView · VideoPlayer · Wallet · StatusBadge · KPICard · ImageThumbnail
**Feedback:** Alert · Loading · ThinkingIndicator
**Input:** TabButton · Stepper · AddSheet · SearchBar

### SWUtil — Shared Utilities

DebugLog · String/Date helpers · LocationManager (Geolocation API) · View styles · WebGL shader runtime (`SWShaderView`, `SWLayerEffectView`)

## Directory Structure

```
src/
├── swpackage/
│   ├── swanimation/          # Animation components
│   │   └── swmetal/          # WebGL/GLSL shader recipes
│   ├── swchart/              # Chart components
│   ├── swcomponent/          # UI components
│   │   ├── display/
│   │   ├── feedback/
│   │   └── input/
│   └── swutil/               # Shared utilities + shader runtime
├── views/                    # Showcase app views
└── components/               # Shared app components
```

## Naming Convention

All types use the `SW` prefix (e.g., `SWAlertManager`, `SWPlasma`).
Managers are singletons: `SWAlertManager.shared.show("success", "Saved!")`.

## Dependency Rules

```
swutil        ← no dependencies on other swpackage directories
swanimation   ← may depend on swutil only
swchart       ← may depend on swutil only
swcomponent   ← may depend on swutil only
```

## Recipes

ShipSwift provides **free and pro recipes** via Skills — each recipe includes complete source code, implementation steps, and best practices.

Learn more at [shipswift.app](https://shipswift.app) · Skills repo: [signerlabs/shipswift-skills](https://github.com/signerlabs/shipswift-skills)

## Tech Stack

- React 19 + TypeScript + Vite
- motion (Framer Motion) for springs and AnimatePresence
- Raw WebGL2 for Metal shader ports
- Custom SVG/Canvas charts (no chart library)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
