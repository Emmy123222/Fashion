# Fashion Match Game - Quick Start Guide

## 🚀 Get Running in 15 Minutes!

### Step 1: Supabase Setup (5 min)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to SQL Editor and run these scripts **in order**:
   ```
   1. sql/01_tables.sql
   2. sql/02_functions.sql
   3. sql/04_rls_policies.sql
   4. sql/03_seed_data.sql
   ```
4. Go to Storage → Create bucket → Name: `fashion-items` → Make it public
5. Go to Authentication → Enable Email provider

### Step 2: Install & Run (5 min)

```bash
cd FashionMatchGame
npm install
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for Web

### Step 3: Test the App (5 min)

1. **Sign Up**: Create a new account
2. **Play Single Player**: Tap "Play" → "Single Player"
3. **Match Cards**: Tap two matching fashion items
4. **View Results**: See your score and stats
5. **Check Leaderboard**: View rankings
6. **Try Multiplayer**: Create or join a match

## ✅ What Works Right Now

- ✅ User authentication
- ✅ Single player game (FULLY PLAYABLE)
- ✅ Multiplayer game (FULLY FUNCTIONAL)
- ✅ Leaderboards
- ✅ User uploads
- ✅ Settings
- ✅ Admin dashboard

## 🎮 How to Play

1. **Start Game**: Choose Single Player or Multiplayer
2. **Match Cards**: Tap two cards to flip them
3. **Find Pairs**: Match identical fashion items
4. **Beat the Clock**: Complete before time runs out
5. **Build Combos**: Match quickly for bonus points

## 🔧 Optional Enhancements

### Add Stripe (for payments)
```bash
# Get key from stripe.com
# Add to .env:
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Add AI Images (optional)
```bash
# Get key from replicate.com
# Add to .env:
EXPO_PUBLIC_AI_API_KEY=your_key
```

### Add Audio Files (optional)
```bash
# Add to assets/audio/:
- music/background.mp3
- sfx/flip.mp3
- sfx/match.mp3
- sfx/win.mp3
- sfx/lose.mp3
```

## 📱 Test on Real Device

1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App loads on your device!

## 🐛 Troubleshooting

### "Module not found"
```bash
npm install
```

### "Supabase error"
- Check .env file has correct URL and key
- Verify SQL scripts ran successfully

### "Images not loading"
- Seed data uses placeholder images
- They work fine for testing

## 📚 Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup
- `100_PERCENT_COMPLETE.md` - Full feature list
- `ASSETS_NEEDED.md` - Asset requirements

## 🎉 You're Ready!

The app is **100% functional** and ready to use. All features work out of the box!

**Have fun playing!** 🎮👗✨
