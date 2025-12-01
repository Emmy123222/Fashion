#!/bin/bash

echo "🔧 Fixing all import paths..."

# Fix theme imports based on file location
echo "Fixing theme imports..."

# For files in src/screens/ (one level deep)
find src/screens -maxdepth 1 -name "*.tsx" -exec sed -i "s|from '../../theme'|from '../theme'|g" {} \;

# For files in src/screens/*/ (two levels deep)
find src/screens -mindepth 2 -name "*.tsx" -exec sed -i "s|from '../theme'|from '../../theme'|g" {} \;

# For files in src/components/ (one level deep)
find src/components -maxdepth 1 -name "*.tsx" -exec sed -i "s|from '../../theme'|from '../theme'|g" {} \;

# For files in src/components/*/ (two levels deep)
find src/components -mindepth 2 -name "*.tsx" -exec sed -i "s|from '../theme'|from '../../theme'|g" {} \;

# For files in src/navigation/
find src/navigation -name "*.tsx" -exec sed -i "s|from '../../theme'|from '../theme'|g" {} \;

echo "✅ All import paths fixed!"
echo ""
echo "Now checking for compilation errors..."
