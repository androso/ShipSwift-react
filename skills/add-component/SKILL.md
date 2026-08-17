---
name: add-component
description: >
  Add a React + TypeScript component from ShipSwift. Use when the user says "add component",
  "add a view", "add X view", "I need a chart", "add animation", or wants a specific UI element.
---

# Add Component from ShipSwift

Add production-ready React + TypeScript components to your Vite project from ShipSwift's local source library.

## Workflow

1. **Identify the component**: Read `skills/catalog.md` to find the right component. Common mappings:
   - "shimmer" / "loading skeleton" → `swanimation/SWShimmer.tsx`
   - "donut chart" / "pie chart" → `swchart/SWDonutChart.tsx`
   - "alert" / "popup" → `swcomponent/feedback/SWAlert.tsx`
   - "plasma" / "shader background" → `swanimation/swmetal/SWPlasma.tsx`

2. **Read the source file**: Read the file from `src/swpackage/<path>`. The file contains the complete implementation.

3. **Integrate into the project**:
   - Copy the file(s) into the user's project
   - Also copy `swutil/` if not already present
   - For Metal/WebGL recipes, copy the matching `.frag` file
   - Adapt naming, colors, and data models to match the project

4. **Verify**: Walk through any dependencies or setup steps needed.

## Guidelines

- Types use `SW` prefix (`SWDonutChart`, `SWTypewriter`).
- Components in `swanimation/`, `swchart/`, and `swcomponent/` are each self-contained (single file + swutil).
- Shader recipes need `SWShaderView` / `SWLayerEffectView` from swutil and Vite `?raw` imports for `.frag` files.
