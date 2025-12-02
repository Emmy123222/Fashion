# 🚨 GAME NOT SHOWING? FIX IT NOW!

## The #1 Reason: No Fashion Items in Database

### 🎯 Quick Fix (5 minutes)

**Step 1: Open Supabase**
- Go to: https://supabase.com/dashboard
- Click your project
- Click "SQL Editor" (left sidebar)

**Step 2: Copy & Paste This**

```sql
-- Add 8 shoes to database
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level) VALUES
('Nike Air Max', 'shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Adidas Ultraboost', 'shoes', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Converse Chuck Taylor', 'shoes', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Vans Old Skool', 'shoes', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Puma Suede', 'shoes', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Reebok Classic', 'shoes', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('New Balance 574', 'shoes', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Jordan 1', 'shoes', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2);
```

**Step 3: Click "RUN"**

**Step 4: Verify**
```sql
SELECT COUNT(*) FROM fashion_items WHERE category = 'shoes';
```
Should show: 8

**Step 5: Restart App & Play!**

---

## What You'll See Now

### Console Logs (Check These):

**When Starting Game:**
```
🎮 Setting up game with 8 fashion items
📊 Grid size: { rows: 4, cols: 4 }
⏱️ Time limit: 300 seconds
🎯 Difficulty level: 1
✅ Game initialized successfully!
🎴 Total cards: 16
🎯 Total pairs: 8
```

**If Database Empty:**
```
⚠️ Not enough shoes, using fallback...
❌ Fallback also failed!
Error: No fashion items found in database
```

### What You'll See in App:

**Before Fix:**
- Loading screen forever, OR
- Error message, OR
- Blank screen

**After Fix:**
- 4x4 grid of cards appears
- Cards show fashion icon (face-down)
- Timer starts counting down
- Can tap cards to flip them
- Cards show shoe images when flipped

---

## Visual Guide

### Step-by-Step What Should Happen:

**1. Tap PLAY Button**
```
HomeScreen
    ↓
[PLAY] button (bottom right)
```

**2. Choose Single Player**
```
Game Mode Screen
    ↓
[Single Player] card
```

**3. Game Loads**
```
Loading...
    ↓
Game Screen appears
```

**4. See Game Board**
```
┌─────────────────────────┐
│  Timer: 5:00  Score: 0  │
├─────────────────────────┤
│  [?] [?] [?] [?]       │
│  [?] [?] [?] [?]       │
│  [?] [?] [?] [?]       │
│  [?] [?] [?] [?]       │
└─────────────────────────┘
```

**5. Tap a Card**
```
[?] → Flips → [SHOE IMAGE]
```

**6. Tap Another Card**
```
[?] → Flips → [SHOE IMAGE]
```

**7. If Match**
```
Both cards stay face-up
Green checkmark appears ✓
Score increases
```

**8. If No Match**
```
Wait 1 second
Both cards flip back to [?]
Try again
```

---

## Common Errors & Fixes

### Error: "No fashion items found"
**Fix:** Run the SQL script above

### Error: "Failed to create game session"
**Fix:** Make sure you're logged in

### Error: "Cannot read property 'player_type'"
**Fix:** User profile incomplete. Re-register or update profile

### Cards show but no images
**Fix:** Check internet connection (images from Unsplash)

### Cards don't flip when tapped
**Fix:** Check console for JavaScript errors

---

## Verify Everything Works

### Checklist:

1. ✅ Run SQL script in Supabase
2. ✅ Verify 8 shoes added
3. ✅ Restart app (`npm start`)
4. ✅ Login to app
5. ✅ Tap PLAY button
6. ✅ Choose Single Player
7. ✅ See 4x4 grid of cards
8. ✅ Tap card → see it flip
9. ✅ See shoe image on flipped card
10. ✅ Match pairs and play!

---

## Still Not Working?

### Check Console Output:

Open your terminal/console and look for:

**Good:**
```
✅ Found 8 shoes in database
✅ Game initialized successfully!
🎴 Total cards: 16
```

**Bad:**
```
❌ No fashion items found
❌ Failed to load fashion items
❌ Database error
```

### If Still Broken:

1. **Check `.env` file:**
```
EXPO_PUBLIC_SUPABASE_URL=your-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

2. **Check Supabase is accessible:**
- Open dashboard
- Can you see tables?
- Can you run queries?

3. **Check you're logged in:**
- See your email in profile?
- Can access other screens?

4. **Clear and restart:**
```bash
# Stop app
Ctrl+C

# Clear cache
npm start -- --clear

# Or
expo start -c
```

---

## 🎯 TL;DR - Just Do This:

1. **Open Supabase SQL Editor**
2. **Paste the INSERT script** (from top of this file)
3. **Click RUN**
4. **Restart app**
5. **Tap PLAY → Single Player**
6. **Game should work!**

**That's it!** 🎮👟
