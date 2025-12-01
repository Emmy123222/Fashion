#!/bin/bash

echo "🔧 Fixing broken imports..."

# Fix the duplicate StyleSheet imports
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Remove StyleSheet from non-react-native imports
  sed -i 's/import { StyleSheet,  /import { /g' "$file"
  sed -i 's/import { StyleSheet, /import { /g' "$file"
done

echo "✅ Done!"
