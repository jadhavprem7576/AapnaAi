#!/usr/bin/env bash
# ==============================================================================
# AwaazAI (J.A.R.V.I.S. Edition) — Official Android APK & iOS Build Script
# Generates a signed Android APK (AwaazAI-v2.4-release-signed.apk)
# ==============================================================================

set -e

echo "============================================================"
echo "🚀 AwaazAI (J.A.R.V.I.S. Edition) - Android APK Builder v2.4"
echo "============================================================"

if command -v npx &> /dev/null; then
  echo "📦 Using @bubblewrap/cli with android-apk/twa-manifest.json..."
  npx @bubblewrap/cli update --manifest=./android-apk/twa-manifest.json || true
  npx @bubblewrap/cli build
  echo "✅ Signed APK generated: ./app-release-signed.apk"
else
  echo "⚠️ Node/NPX not found. Please install Node.js or open /android-apk in Android Studio."
fi
