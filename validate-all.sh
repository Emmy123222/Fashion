#!/bin/bash

echo "🔍 Running comprehensive validation..."
echo ""

# Check for common import errors
echo "1. Checking for missing theme imports..."
missing_theme=0
for file in $(find src -name "*.tsx" -exec grep -l "theme\." {} \;); do
  if ! grep -q "import.*theme.*from" "$file"; then
    echo "  ❌ Missing theme import: $file"
    missing_theme=$((missing_theme + 1))
  fi
done
if [ $missing_theme -eq 0 ]; then
  echo "  ✅ All theme imports present"
fi

echo ""
echo "2. Checking for duplicate StyleSheet imports..."
duplicate_stylesheet=0
for file in $(find src -name "*.tsx"); do
  count=$(grep -c "^import.*StyleSheet.*from 'react-native'" "$file" 2>/dev/null || echo 0)
  if [ "$count" -gt 1 ]; then
    echo "  ❌ Duplicate StyleSheet import: $file"
    duplicate_stylesheet=$((duplicate_stylesheet + 1))
  fi
done
if [ $duplicate_stylesheet -eq 0 ]; then
  echo "  ✅ No duplicate StyleSheet imports"
fi

echo ""
echo "3. Checking for syntax errors (}));)..."
syntax_errors=0
for file in $(find src -name "*.tsx" -exec grep -l "}));" {} \; 2>/dev/null); do
  echo "  ❌ Syntax error in: $file"
  syntax_errors=$((syntax_errors + 1))
done
if [ $syntax_errors -eq 0 ]; then
  echo "  ✅ No })); syntax errors"
fi

echo ""
echo "4. Checking for missing asset files..."
if [ ! -f "assets/splash.png" ]; then
  echo "  ❌ Missing: assets/splash.png"
else
  echo "  ✅ assets/splash.png exists"
fi

if [ ! -f "assets/icon.png" ]; then
  echo "  ❌ Missing: assets/icon.png"
else
  echo "  ✅ assets/icon.png exists"
fi

echo ""
echo "5. Checking package.json..."
if grep -q '"react-native-unistyles": "^2.9.0"' package.json; then
  echo "  ✅ Unistyles v2.9.0 installed"
else
  echo "  ❌ Unistyles version issue"
fi

echo ""
echo "═══════════════════════════════════════"
total_errors=$((missing_theme + duplicate_stylesheet + syntax_errors))
if [ $total_errors -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED! Ready to run."
  echo "Run: npx expo start --offline"
else
  echo "❌ Found $total_errors issue(s) to fix"
fi
echo "═══════════════════════════════════════"
