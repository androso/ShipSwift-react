# AGENTS.md

## Project Overview
- ShipSwift React + TypeScript component template library (Vite showcase app)
- 1:1 port of the original SwiftUI visual library (animations, charts, UI components, utils)
- SWModule frameworks (Auth, Camera, Paywall, Chat, Setting, Subject Lifting, TikTok) are not part of this web port

## Directory Structure
- Reusable components live under `src/swpackage/` in four directories:
  - `swanimation/` — Self-contained animation components (each works independently, may depend on swutil only)
    - `swmetal/` — WebGL/GLSL ports of the Metal shader recipes (`.tsx` + `.frag`)
  - `swchart/` — Self-contained chart components (each works independently, may depend on swutil only)
  - `swcomponent/` — Self-contained UI components organized by category:
    - `display/` — Display components (FloatingLabels, MarkdownText, ScrollingFAQ, RotatingQuote, BulletPointText, GradientDivider, Label, OnboardingView, OrderView, RootTabView, Wallet, VideoPlayer, StatusBadge, KPICard, ImageThumbnail)
    - `feedback/` — Feedback components (Alert, Loading, ThinkingIndicator)
    - `input/` — Input components (TabButton, Stepper, AddSheet, SearchBar)
  - `swutil/` — Shared utilities (no dependencies on other swpackage directories), including the WebGL shader runtime
- Showcase app views live under `src/views/` (HomeView, AnimationListView, ChartListView, UIListView, RootTabView, SWHolographicCardShowcase)
- Shared app components live under `src/components/` (ListItem)
- Demo assets live under `public/demo/`

## Naming Conventions
- All type names use the `SW` prefix: `SWAlertManager`, `SWShaderView`, `SWPlasma`
- File names match their primary type: `SWAlert.tsx` contains `SWAlertManager`
- Do not use TypeScript `enum` (erasableSyntaxOnly). Use string union types and `as const` arrays.

## Dependency Rules
- `swutil` has zero dependencies on other swpackage directories
- `swanimation`, `swchart`, and `swcomponent` may only depend on `swutil`

## Self-Containment Principle
- Every file in `swanimation/`, `swchart/`, and `swcomponent/` must work without importing other swpackage files (except `swutil`)
- Alert and Loading merge their managers into the same file for self-containment
- GLSL shaders are imported with Vite `?raw` next to their TSX wrapper

## Shader Runtime
- `SWShaderView` = SwiftUI `colorEffect` (fullscreen-quad fragment shader)
- `SWLayerEffectView` = SwiftUI `layerEffect` (snapshots children to a texture, then applies the shader)
- Uniforms: `uSize`, `uTime`, plus `u` + Capitalized metal parameter names
- Layer sampling uses `layerSample(vec2)` / `uniform sampler2D uLayer`

## Code Style
- All comments and documentation in English (this is a public repo)
- No external constants file — product IDs, URLs, and config values are inlined or configurable via props

## 组件变更同步规则
When `src/swpackage/` components change (add/modify/delete), update the matching showcase page:

| Component directory | Showcase file |
|---------|-----------|
| `swanimation/` | `AnimationListView.tsx` |
| `swchart/` | `ChartListView.tsx` |
| `swcomponent/` (display / feedback / input) | `UIListView.tsx` |

## Scripts
```bash
npm install
npm run dev      # Vite showcase at http://localhost:5173
npm run build    # tsc -b && vite build
```

## 关联项目

- **Skills & Plugin 分发**: https://github.com/signerlabs/shipswift-skills
