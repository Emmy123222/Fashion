#!/bin/bash

echo "🚀 Starting Expo in offline mode..."

# Kill any existing processes
pkill -f "metro" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true

# Start Expo with offline flag
EXPO_OFFLINE=1 npx expo start --offline --clear
