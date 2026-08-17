---
name: explore-recipes
description: >
  Explore and browse available ShipSwift components. Use when the user says
  "explore", "browse", "show recipes", "list components", "what's available",
  or wants to discover what ShipSwift offers.
---

# Explore ShipSwift Recipes

Browse the full catalog of ShipSwift components — production-ready React + TypeScript implementations.

## Workflow

1. **Show the catalog**: Read `skills/catalog.md` and present components organized by category:

   | Category | Count | Examples |
   |----------|-------|---------|
   | Animation | 40+ | Shimmer, Typewriter, Plasma, Glass, Transitions |
   | Chart | 9 | Line, Bar, Area, Donut, Ring, Radar, Scatter, Heatmap, Network |
   | Component | 22 | Alert, Loading, Onboarding, Stepper, FloatingLabels |
   | Util | shader runtime, Date/String helpers, DebugLog, LocationManager |

2. **Show details on request**: When the user picks a component, read the source file and present:
   - What it does
   - Key features and customization points
   - Code structure overview
   - Dependencies

3. **Suggest combinations**: Recommend components that work well together:
   - **Onboarding flow**: OnboardingView + TypewriterText + Shimmer
   - **Analytics dashboard**: LineChart + BarChart + DonutChart + ActivityHeatmap
   - **Social feature**: Camera + Chat + Auth
   - **E-commerce**: OrderView + Loading + Alert + Stepper

## Guidelines

- Present in a scannable format (tables or bullet lists).
- When showing details, include the file path so the user can find it.
- All source is local under `src/swpackage/` — no network required.
