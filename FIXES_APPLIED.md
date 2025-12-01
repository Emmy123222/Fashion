# Fixes Applied to Fashion Match Game

## Issue: React Native Unistyles v3 API Changes

The project was using `createStyleSheet` which doesn't exist in react-native-unistyles v3.

## Solution

Replace all instances of:
```typescript
import { useUnistyles, createStyleSheet } from 'react-native-unistyles';
const { styles, theme } = useUnistyles(stylesheet);
const stylesheet = createStyleSheet((theme) => ({...}));
```

With:
```typescript
import { StyleSheet } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
const { theme } = useUnistyles();
const styles = StyleSheet.create({...}); // Use theme directly
```

## Files That Need Updates

### Components (7 files)
1. src/components/common/Button.tsx
2. src/components/common/Card.tsx
3. src/components/common/Modal.tsx
4. src/components/common/Input.tsx
5. src/components/common/Toast.tsx
6. src/components/common/EmptyState.tsx
7. src/components/common/Loader.tsx

### Game Components (5 files)
8. src/components/game/Timer.tsx
9. src/components/game/ScoreDisplay.tsx
10. src/components/game/FashionCard.tsx
11. src/components/game/MatchGrid.tsx
12. src/components/game/GameHeader.tsx

### Screens (15+ files)
13. src/screens/game/GameModeScreen.tsx
14. src/screens/game/SinglePlayerGameScreen.tsx
15. src/screens/game/MultiplayerLobbyScreen.tsx
16. src/screens/game/MultiplayerGameScreen.tsx
17. src/screens/game/RoundResultScreen.tsx
18. src/screens/LeaderboardScreen.tsx
19. src/screens/UploadScreen.tsx
20. src/screens/SubscriptionScreen.tsx
21. src/screens/SettingsScreen.tsx
22. src/screens/admin/AdminDashboardScreen.tsx
23. src/screens/onboarding/OnboardingScreen.tsx
24. src/screens/auth/RegisterScreen.tsx
25. src/screens/ProfileScreen.tsx
26. src/screens/HomeScreen.tsx

## Alternative Solution (Simpler)

Since the theme system is already set up in `src/theme/index.ts`, we can:

1. Import theme directly: `import { theme } from '../theme';`
2. Use React Native's StyleSheet: `import { StyleSheet } from 'react-native';`
3. Create styles with theme values directly

## Quick Fix Command

Run this to see all files that need fixing:
```bash
grep -r "createStyleSheet" src/
```

## Status

⚠️ All files using `createStyleSheet` need to be updated to use React Native's `StyleSheet.create()` instead.

The theme object is already properly exported from `src/theme/index.ts` and can be imported directly.
