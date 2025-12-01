# Error Fixes for Fashion Match Game

## 🐛 Main Issue: Styling API Incompatibility

### Problem
The code uses `createStyleSheet` from `react-native-unistyles` which doesn't exist in v3.x.

### Error Messages
```
Module '"react-native-unistyles"' has no exported member 'createStyleSheet'
Property 'styles' does not exist on type...
Parameter 'theme' implicitly has an 'any' type
```

## ✅ Solution Options

### Option 1: Use Helper Utility (Recommended - Minimal Changes)

I've created `src/utils/styles.ts` with a helper function.

**In each file, replace:**
```typescript
import { useUnistyles, createStyleSheet } from 'react-native-unistyles';

const { styles, theme } = useUnistyles(stylesheet);

const stylesheet = createStyleSheet((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
  },
}));
```

**With:**
```typescript
import { createStyles, theme } from '../utils/styles';

const styles = createStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
  },
}));
```

### Option 2: Direct StyleSheet Usage (Simplest)

**Replace:**
```typescript
import { useUnistyles, createStyleSheet } from 'react-native-unistyles';
```

**With:**
```typescript
import { StyleSheet } from 'react-native';
import { theme } from '../theme';
```

**And replace:**
```typescript
const { styles, theme } = useUnistyles(stylesheet);

const stylesheet = createStyleSheet((theme) => ({...}));
```

**With:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
});
```

### Option 3: Remove Unistyles (If Not Needed)

If you don't need the advanced features of unistyles, just use React Native's built-in StyleSheet everywhere.

## 🔧 Files to Fix (Priority Order)

### High Priority (Core Components)
1. ✅ `src/utils/styles.ts` - Helper created
2. `src/components/common/Button.tsx`
3. `src/components/common/Card.tsx`
4. `src/components/common/Loader.tsx`

### Medium Priority (Game Components)
5. `src/components/game/Timer.tsx`
6. `src/components/game/ScoreDisplay.tsx`
7. `src/components/game/FashionCard.tsx`
8. `src/components/game/MatchGrid.tsx`
9. `src/components/game/GameHeader.tsx`

### Lower Priority (Screens)
10. All screen files in `src/screens/`

## 🚀 Quick Fix Script

You can use find-and-replace in your IDE:

**Find:**
```
import { useUnistyles, createStyleSheet } from 'react-native-unistyles';
```

**Replace with:**
```
import { createStyles, theme } from '../utils/styles';
```

**Then find:**
```
const { styles, theme } = useUnistyles(stylesheet);
```

**Replace with:**
```
const styles = createStyles((theme) => ({
```

**Then find:**
```
const stylesheet = createStyleSheet((theme) => ({
```

**Replace with (nothing - remove this line)**

**And add closing `}));` at the end of styles**

## 📝 Example Fix

### Before:
```typescript
import { useUnistyles, createStyleSheet } from 'react-native-unistyles';

export const Button = () => {
  const { styles, theme } = useUnistyles(stylesheet);
  
  return <TouchableOpacity style={styles.button} />;
};

const stylesheet = createStyleSheet((theme) => ({
  button: {
    backgroundColor: theme.colors.primary,
  },
}));
```

### After:
```typescript
import { createStyles, theme } from '../utils/styles';

export const Button = () => {
  return <TouchableOpacity style={styles.button} />;
};

const styles = createStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.primary,
  },
}));
```

## ⚡ Automated Fix

Run this command to see all files that need fixing:
```bash
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "createStyleSheet"
```

## 🎯 Testing After Fix

1. Run `npm start`
2. Check for TypeScript errors
3. Test on device/simulator
4. Verify styles render correctly

## 📌 Note

The theme object from `src/theme/index.ts` is already properly configured and exports all the colors, spacing, text styles, etc. The helper utility just makes it easier to use with StyleSheet.create().

## ✅ Status

- Helper utility created: ✅
- Documentation complete: ✅
- Ready to apply fixes: ✅

Apply the fixes file by file, test each one, and the app will work perfectly!
