#!/bin/bash

echo "🧹 Cleaning up..."

# Stop any running Metro bundler
pkill -f "react-native" || true
pkill -f "expo" || true

# Clear watchman
watchman watch-del-all 2>/dev/null || echo "Watchman not installed, skipping..."

# Clear Metro bundler cache
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Clear node modules and reinstall
echo "📦 Reinstalling dependencies..."
rm -rf node_modules
npm install

# Clear Expo cache
echo "🗑️  Clearing Expo cache..."
npx expo start --clear

echo "✅ Done! Now try running the app again."
