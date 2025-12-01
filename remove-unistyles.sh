#!/bin/bash

echo "🔧 Removing all unistyles imports and converting to StyleSheet..."

# Find all TypeScript/TSX files and remove unistyles imports
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "react-native-unistyles" "$file"; then
    echo "Fixing: $file"
    
    # Remove unistyles import lines
    sed -i '/react-native-unistyles/d' "$file"
    
    # Add StyleSheet import if not present
    if ! grep -q "import.*StyleSheet.*from 'react-native'" "$file"; then
      # Add StyleSheet to existing react-native import or create new one
      if grep -q "import.*from 'react-native'" "$file"; then
        sed -i "s/import {/import { StyleSheet, /" "$file"
      fi
    fi
    
    # Replace useUnistyles(stylesheet) with nothing (remove the line)
    sed -i '/const.*useUnistyles(stylesheet)/d' "$file"
    sed -i '/const.*useUnistyles()/d' "$file"
    
    # Replace createStyleSheet with StyleSheet.create
    sed -i 's/createStyleSheet/StyleSheet.create/g' "$file"
    
    # Remove theme parameter from stylesheet
    sed -i 's/StyleSheet.create((theme) => ({/StyleSheet.create({/g' "$file"
    sed -i 's/StyleSheet.create( (theme) => ({/StyleSheet.create({/g' "$file"
  fi
done

echo "✅ Done! Now restart Expo with: npx expo start --clear"
