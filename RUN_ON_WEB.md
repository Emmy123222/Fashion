# 🌐 Run Fashion Match Game on Web

## Quick Start

### Option 1: Start with Web (Recommended)

```bash
cd FashionMatchGame
npm start -- --web
```

Or:

```bash
cd FashionMatchGame
npx expo start --web
```

### Option 2: Start Normal, Then Press 'w'

```bash
cd FashionMatchGame
npm start
```

Then press **`w`** in the terminal to open web browser.

---

## What Happens

1. Expo will compile your app for web
2. Opens automatically in your default browser
3. Usually at: `http://localhost:19006`
4. You can now use the app in the browser!

---

## Troubleshooting

### Error: "web dependencies not installed"

Install web dependencies:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

### Error: "Port 19006 already in use"

Kill the process:

```bash
# On Mac/Linux
lsof -ti:19006 | xargs kill -9

# On Windows
netstat -ano | findstr :19006
taskkill /PID <PID> /F
```

Or use a different port:

```bash
npx expo start --web --port 8080
```

### Browser doesn't open automatically

Manually open: `http://localhost:19006`

### App looks broken on web

Some React Native components don't work perfectly on web. Check console for errors.

---

## Features on Web

### ✅ Works:
- Login/Register
- Home screen
- Navigation
- Game screens
- Leaderboards
- Profile

### ⚠️ May have issues:
- Camera (for uploads)
- Native animations
- Some gestures
- Push notifications

### ❌ Won't work:
- Native modules (unless web-compatible)
- Device-specific features

---

## Development Tips

### Hot Reload

Changes auto-reload in browser. Just save your files!

### Open DevTools

Press **`F12`** or **`Ctrl+Shift+I`** (Windows/Linux) or **`Cmd+Option+I`** (Mac)

### View Console Logs

All `console.log()` statements appear in browser DevTools console.

### Responsive Testing

Use browser DevTools to test different screen sizes:
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select device or custom size

---

## Multiple Platforms at Once

You can run on multiple platforms simultaneously:

```bash
# Start Expo
npm start

# Then press:
# w - Open web
# a - Open Android
# i - Open iOS
```

---

## Build for Web Production

When ready to deploy:

```bash
# Build for production
npx expo export:web

# Output will be in: web-build/
# Upload to any static hosting (Vercel, Netlify, etc.)
```

---

## Quick Commands

```bash
# Start with web
npm start -- --web

# Start and clear cache
npm start -- --web --clear

# Start on specific port
npm start -- --web --port 8080

# Build for production
npx expo export:web
```

---

## Access from Other Devices

### On Same Network:

1. Start the app:
   ```bash
   npm start -- --web
   ```

2. Find your local IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

3. Open on other device:
   ```
   http://YOUR_IP:19006
   ```

Example: `http://192.168.1.100:19006`

---

## Common Issues

### Issue: White screen on web

**Solution:**
1. Check browser console for errors
2. Clear cache: `npm start -- --web --clear`
3. Check if all dependencies are installed

### Issue: Styles look different

**Solution:**
- Web uses different rendering than native
- Some styles may need web-specific adjustments
- Check `Platform.OS === 'web'` for web-specific code

### Issue: Images not loading

**Solution:**
- Check image URLs are accessible
- Use `require()` for local images
- Check CORS if loading from external URLs

---

## Browser Compatibility

### ✅ Fully Supported:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### ⚠️ Partial Support:
- Older browsers (may need polyfills)
- Mobile browsers (some features limited)

---

## Performance Tips

### For Better Web Performance:

1. **Lazy load images:**
   ```typescript
   <Image loading="lazy" source={{uri: url}} />
   ```

2. **Use web-optimized images:**
   - WebP format
   - Compressed sizes
   - Responsive images

3. **Code splitting:**
   - Use dynamic imports
   - Load routes on demand

4. **Cache assets:**
   - Use service workers
   - Cache API responses

---

## Debugging

### View Network Requests:

1. Open DevTools (F12)
2. Go to Network tab
3. See all API calls

### Check Performance:

1. Open DevTools (F12)
2. Go to Performance tab
3. Record and analyze

### React DevTools:

Install React DevTools browser extension for better debugging.

---

## Summary

**To run on web:**

```bash
cd FashionMatchGame
npm start -- --web
```

**Or press `w` after starting:**

```bash
npm start
# Then press 'w'
```

**Access at:** `http://localhost:19006`

That's it! Your app is now running in the browser! 🌐🎮
