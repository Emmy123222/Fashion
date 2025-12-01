#!/bin/bash

echo "🔧 Fixing all syntax errors..."

# Fix all files with })); at the end - change to });
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/}));$/});/g' {} \;

# Fix createStyleSheet to StyleSheet.create
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/createStyleSheet/StyleSheet.create/g' {} \;

# Remove (theme) => from StyleSheet.create
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/StyleSheet\.create((theme) => (/StyleSheet.create(/g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/StyleSheet\.create( (theme) => (/StyleSheet.create(/g' {} \;

echo "✅ Syntax errors fixed!"
echo "Now checking for missing imports..."

# Add StyleSheet import to files that use it but don't import it
for file in $(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "StyleSheet\.create" {} \;); do
  if ! grep -q "import.*StyleSheet.*from 'react-native'" "$file"; then
    echo "Adding StyleSheet import to: $file"
    # Check if there's already a react-native import
    if grep -q "^import.*from 'react-native'" "$file"; then
      # Add StyleSheet to existing import
      sed -i "0,/^import {/s/^import {/import { StyleSheet, /" "$file"
    else
      # Add new import after the first import
      sed -i "1a import { StyleSheet } from 'react-native';" "$file"
    fi
  fi
done

echo "✅ All fixes applied!"
