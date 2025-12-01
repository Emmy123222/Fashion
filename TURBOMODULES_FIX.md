# TurboModules Error Fix

## The Error
```
[runtime not ready]: Error: Failed to get NitroModules: The native "NitroModules" TurboNative-Module could not be found.
```

## Quick Fix (Run these commands in order)

### Option 1: Clear Cache and Restart (Fastest)
```bash
# Stop the current Expo server (Ctrl+C)

# Clear cache and restart
npx expo start --clear
```

Then in Expo Go on your Android device:
1. Press "R, R" (double tap R) to reload
2. Or shake your device and tap "Reload"

### Option 2: Full Clean (If Option 1 doesn't work)
```bash
# Stop the current Expo server (Ctrl+C)

# Clear all caches
rm -rf node_modules
npm install

# Clear Metro bundler cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# Clear watchman (if installed)
watchman watch-del-all

# Start fresh
npx expo start --clear
```

### Option 3: Use the Script
```bash
chmod +x fix-modules.sh
./fix-modules.sh
```

## Why This Happens
This error occurs when:
1. The Metro bundler cache is stale
2. Native modules aren't properly linked
3. The app needs to be rebuilt after dependency changes

## After Running the Fix
1. Wait for the bundler to finish
2. In Expo Go, reload the app (shake device → Reload)
3. If still not working, close Expo Go completely and reopen it

## Prevention
Always run `npx expo start --clear` after:
- Installing new packages
- Changing native dependencies
- Switching branches
- Long periods of inactivity
