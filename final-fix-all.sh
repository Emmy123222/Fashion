#!/bin/bash

echo "🔧 Final fix for all files..."

# List of files to fix
files=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "const stylesheet = StyleSheet.create" {} \;)

for file in $files; do
  echo "Fixing: $file"
  
  # Change stylesheet to styles
  sed -i 's/const stylesheet = StyleSheet.create/const styles = StyleSheet.create/g' "$file"
  
  # Remove useStyles/useUnistyles lines
  sed -i '/const.*useStyles(stylesheet)/d' "$file"
  sed -i '/const.*useUnistyles(stylesheet)/d' "$file"
  
  # Add theme import if not present and file uses theme
  if grep -q "theme\." "$file" && ! grep -q "import.*theme.*from.*theme" "$file"; then
    # Add theme import after other imports
    sed -i "/^import.*from 'react-native'/a import { theme } from '../../theme';" "$file" 2>/dev/null || \
    sed -i "/^import.*from 'react-native'/a import { theme } from '../theme';" "$file" 2>/dev/null
  fi
done

echo "✅ All files fixed!"
