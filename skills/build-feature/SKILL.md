---
name: build-feature
description: >
  Build a web feature using ShipSwift components. Use when the user says
  "build", "create", "add a feature", or describes a React/Vite feature they want to implement.
---

# Build Feature with ShipSwift

Build production-ready Vite + React features by combining ShipSwift components — copy-paste-ready TypeScript implementations covering animations, charts, and UI components.

## Workflow

1. **Browse the catalog**: Read `skills/catalog.md` to see all available components organized by category.

2. **Read the source**: For each relevant component, read the file directly from `src/swpackage/`. For example:
   - Shimmer animation → read `src/swpackage/swanimation/SWShimmer.tsx`
   - Donut chart → read `src/swpackage/swchart/SWDonutChart.tsx`
   - Plasma shader → read `src/swpackage/swanimation/swmetal/SWPlasma.tsx`

3. **Present an integration plan**: Before writing code, show the user:
   - Which components will be used
   - How they connect together
   - What customizations are needed

4. **Generate code**: Adapt the component patterns to the user's project. Combine multiple components when the feature spans several areas (e.g., a chart view with shimmer loading).

5. **Integration checklist**: List required copies (`swutil/`, `.frag` shaders) and Vite setup (`?raw` imports).

## Guidelines

- Always check the catalog before writing code from scratch — ShipSwift likely has a ready-made solution.
- Use `SW`-prefixed naming (`SWShimmer`, `SWDonutChart`).
- Copy `swutil/` alongside any component — it provides shared helpers and the WebGL runtime.
- Recipes may only depend on `swutil`.

## Pro Recipes (MCP)

Some full-stack recipes (backend + compliance + pitfall guides) are available via the MCP server at `https://api.shipswift.app/mcp`. If MCP tools (`listRecipes`, `searchRecipes`, `getRecipe`) are available, use them for extended content. The local source code works independently.
