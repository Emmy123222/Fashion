#!/bin/bash

echo "🧹 Cleaning up duplicate imports..."

# Find files with standalone StyleSheet import followed by another import with StyleSheet
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # Check if file has both patterns
  if grep -q "^import { StyleSheet } from 'react-native';" "$file" && \
     grep -q "^import {$" "$file"; then
    
    # Check if the multi-line import also has StyleSheet
    if sed -n '/^import {$/,/^} from/p' "$file" | grep -q "StyleSheet"; then
      echo "Removing duplicate StyleSheet import from: $file"
      # Remove the standalone import line
      sed -i "/^import { StyleSheet } from 'react-native';$/d" "$file"
    fi
  fi
done

echo "✅ Cleanup complete!"
