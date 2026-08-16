#!/usr/bin/env bash
# Cloud Agent install script for ShipSwift.
#
# ShipSwift is an iOS/macOS SwiftUI Xcode project. A full app build requires
# macOS + Xcode + the Apple SDKs (SwiftUI, StoreKit, AVFoundation, Vision,
# SpriteKit, VisionKit, Metal, Amplify) and cannot run on this Linux VM.
#
# What this script installs is the open-source Swift toolchain for Linux, which
# provides the tooling an agent can genuinely use on this codebase here:
#   - swiftc -parse  : whole-codebase Swift syntax checking (no Apple SDK needed)
#   - swift-format   : lint/format Swift sources
#
# The script is idempotent: re-running it is a no-op once the toolchain exists.
set -euo pipefail

SWIFT_VERSION="6.3.3"
SWIFT_HOME="/opt/swift"
SWIFT_BIN="${SWIFT_HOME}/usr/bin"
TARBALL_URL="https://download.swift.org/swift-${SWIFT_VERSION}-release/ubuntu2404/swift-${SWIFT_VERSION}-RELEASE/swift-${SWIFT_VERSION}-RELEASE-ubuntu24.04.tar.gz"

echo "==> Installing Swift toolchain runtime dependencies"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  binutils \
  git \
  gnupg2 \
  libc6-dev \
  libcurl4-openssl-dev \
  libedit2 \
  libgcc-13-dev \
  libncurses-dev \
  libpython3-dev \
  libsqlite3-0 \
  libstdc++-13-dev \
  libxml2-dev \
  libz3-dev \
  pkg-config \
  tzdata \
  zip \
  unzip \
  zlib1g-dev

if [ -x "${SWIFT_BIN}/swift" ]; then
  echo "==> Swift already installed at ${SWIFT_HOME}; skipping download"
else
  echo "==> Downloading Swift ${SWIFT_VERSION} for Ubuntu 24.04"
  tmp_tarball="$(mktemp --suffix=.tar.gz)"
  curl -fL --retry 4 --retry-delay 4 -o "${tmp_tarball}" "${TARBALL_URL}"
  echo "==> Extracting to ${SWIFT_HOME}"
  sudo mkdir -p "${SWIFT_HOME}"
  sudo tar xzf "${tmp_tarball}" -C "${SWIFT_HOME}" --strip-components=1
  rm -f "${tmp_tarball}"
fi

echo "==> Linking Swift binaries into /usr/local/bin"
for bin in swift swiftc swift-format; do
  sudo ln -sf "${SWIFT_BIN}/${bin}" "/usr/local/bin/${bin}"
done

echo "==> Swift toolchain ready"
swift --version
swift-format --version
