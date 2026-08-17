# ShipSwift Recipe Catalog

All source files are under `src/swpackage/`. Each component is self-contained — copy the file(s) plus `swutil/` into your Vite + React + TypeScript project.

## Animation (`swanimation/`)

| Component | File | Description |
|-----------|------|-------------|
| AnimatedMeshGradient | `SWAnimatedMeshGradient.tsx` | Animated mesh gradient background |
| BeforeAfterSlider | `SWBeforeAfterSlider.tsx` | Drag-to-compare before/after image slider |
| GlowSweep | `SWGlowSweep.tsx` | Glowing sweep animation overlay |
| LightSweep | `SWLightSweep.tsx` | Light sweep / skeleton loading effect |
| OrbitingLogos | `SWOrbitingLogos.tsx` | Logos orbiting around a center point |
| ScanningOverlay | `SWScanningOverlay.tsx` | Scanning line animation overlay |
| ShakingIcon | `SWShakingIcon.tsx` | Icon with shake animation on trigger |
| Shimmer | `SWShimmer.tsx` | Shimmer / skeleton loading placeholder |
| TypewriterText | `SWTypewriterText.tsx` | Character-by-character typing animation |
| Confetti | `SWConfetti.tsx` | Canvas confetti / fireworks overlay |
| Transition | `SWTransition.tsx` | 16 enter/exit view transitions |
| ChangeEffect | `SWChangeEffect.tsx` | Value-change micro-interactions |
| DotSphere | `SWDotSphere.tsx` | Canvas 3D Fibonacci dot sphere |
| CharSphere | `SWCharSphere.tsx` | Canvas 3D glyph sphere |

## Metal / WebGL (`swanimation/swmetal/`)

Procedural backgrounds and content-sampling effects. Each recipe is a `.tsx` wrapper plus a `.frag` GLSL shader.

Plasma · Dots · Starfield · StarNest · FractalClouds · InkSmoke · LiquidChrome · AnimatedLoop · Metaballs · GrainGradient · NeuroNoise · DotOrbit · Voronoi · SimplexNoise · ColorPanels · SmokeRing · Swirl · Glass · GlassLogo · GlassOrb · Halftone · Water · LiquidMetal · Foil · Glitter · IntenseBling · ChromaticGlass · PolishedAluminum

## Chart (`swchart/`)

| Component | File | Description |
|-----------|------|-------------|
| ActivityHeatmap | `SWActivityHeatmap.tsx` | GitHub-style contribution heatmap |
| AreaChart | `SWAreaChart.tsx` | Filled area chart with gradient |
| BarChart | `SWBarChart.tsx` | Vertical bar chart |
| DonutChart | `SWDonutChart.tsx` | Donut / pie chart with center label |
| LineChart | `SWLineChart.tsx` | Line chart with markers |
| RadarChart | `SWRadarChart.tsx` | Spider / radar chart |
| RingChart | `SWRingChart.tsx` | Circular progress ring chart |
| ScatterChart | `SWScatterChart.tsx` | Scatter plot chart |
| NetworkGraph | `SWNetworkGraph.tsx` | Interactive 3D knowledge graph |

## Component — Display (`swcomponent/display/`)

| Component | File | Description |
|-----------|------|-------------|
| BulletPointText | `SWBulletPointText.tsx` | Styled bullet point list |
| FloatingLabels | `SWFloatingLabels.tsx` | Floating animated labels |
| GradientDivider | `SWGradientDivider.tsx` | Gradient-styled divider line |
| Label | `SWLabel.tsx` | Styled label with icon support |
| MarkdownText | `SWMarkdownText.tsx` | Markdown-rendered text view |
| OnboardingView | `SWOnboardingView.tsx` | Multi-page onboarding flow |
| OrderView | `SWOrderView.tsx` | Order / receipt summary view |
| RootTabView | `SWRootTabView.tsx` | Tab bar navigation root view |
| RotatingQuote | `SWRotatingQuote.tsx` | Auto-rotating quote display |
| ScrollingFAQ | `SWScrollingFAQ.tsx` | Infinite FAQ pill marquee |
| Wallet | `SWWallet.tsx` | Payment card stack |
| VideoPlayer | `SWVideoPlayer.tsx` | HTML5 video player |
| StatusBadge | `SWStatusBadge.tsx` | Semantic status capsule |
| KPICard | `SWKPICard.tsx` | Dashboard metric card |
| ImageThumbnail | `SWImageThumbnail.tsx` | Square image tile |

## Component — Feedback (`swcomponent/feedback/`)

| Component | File | Description |
|-----------|------|-------------|
| Alert | `SWAlert.tsx` | Custom alert with SWAlertManager |
| Loading | `SWLoading.tsx` | Page loading overlay |
| ThinkingIndicator | `SWThinkingIndicator.tsx` | AI thinking / typing indicator |

## Component — Input (`swcomponent/input/`)

| Component | File | Description |
|-----------|------|-------------|
| AddSheet | `SWAddSheet.tsx` | Bottom sheet for adding items |
| SearchBar | `SWSearchBar.tsx` | Frosted capsule search field |
| Stepper | `SWStepper.tsx` | Custom stepper control |
| TabButton | `SWTabButton.tsx` | Styled tab bar button |

## Utilities (`swutil/`)

| File | Description |
|------|-------------|
| `SWDate.ts` | Date formatting helpers |
| `SWDebugLog.ts` | Debug logging utility |
| `SWLocationManager.ts` | Geolocation API wrapper |
| `SWString.ts` | String utility helpers |
| `SWViewStyles.tsx` | Button and card styles |
| `SWShaderView.tsx` | WebGL colorEffect runtime |
| `SWLayerEffectView.tsx` | WebGL layerEffect runtime |

## Dependency Rules

```
swutil         ← no dependencies
swanimation    ← swutil only
swchart        ← swutil only
swcomponent    ← swutil only
```

## Naming Conventions

- Types: `SW` prefix (`SWAlertManager`, `SWPlasma`)
- File name matches primary export
- No TypeScript enums — use string union types
