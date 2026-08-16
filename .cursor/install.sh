#!/usr/bin/env bash
# Cloud Agent install script for the ShipSwift React + TypeScript port.
#
# ShipSwift is migrating from its SwiftUI/iOS origins to a React + TypeScript
# component library. The migration target lives in `web/` (Vite + React + TS).
# Full iOS/Xcode builds are intentionally out of scope for this environment.
#
# Idempotent: uses `npm ci` against the committed lockfile when present.
set -euo pipefail

echo "==> Node $(node --version), npm $(npm --version)"

if [ -f web/package-lock.json ]; then
  echo "==> Installing web/ dependencies with npm ci"
  npm --prefix web ci
else
  echo "==> No lockfile found; installing web/ dependencies with npm install"
  npm --prefix web install
fi

echo "==> web/ dependencies ready"
