# 🔧 Game Not Showing? Troubleshooting Guide

## Most Common Issue: No Fashion Items in Database

### ⚠️ The Problem:
The game needs fashion items (shoes) in the database to work. If the database is empty, the game can't start.

### ✅ The Solution:

**Step 1: Add Fashion Items to Database**

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Copy and paste this script:

```sql
-- Quick test: Check if you have any fashion items
SELECT COUNT(*) as total_items FROM fashion_items WHERE is_approved = true;

-- If the count is 0, run this to add shoes:
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level) VALUES
('Nike Sneakers', 'shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Adidas Shoes', 'shoes', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Converse', 'shoes', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Vans', 'shoes', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Running Shoes', 'shoes', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Boots', 'shoes', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Sandals', 'shoes', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('High Heels', 'shoes', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2);

-- Verify items were added:
SELECT name, category FROM fashion_items WHERE category = 'shoes' AND is_approved = true;
```

5. Click "Run"
6. You should see 8 shoes added

**Step 2: Restart the App**

```bash
# Stop the app (Ctrl+C)
# Start again
npm start
```

**Step 3: Try Playing**

1. Login to the app
2. Tap the PLAY button (bottom right)
3. Choose Single Player
4. Game should now show cards!

---

## Other Possible Issues

### Issue 1: "Failed to load fashion items" Error

**Symptoms:** Error message when starting game

**Causes:**
- Database not set up
- Supabase credentials wrong
- No internet connection

**Fix:**
1. Check `.env` file has correct Supabase URL and key
2. Verify internet connection
3. Check Supabase dashboard is accessible

### Issue 2: Cards Show But No Images

**Symptoms:** Cards flip but show blank/broken image

**Causes:**
- Image URLs are broken
- No internet connection
- Images blocked

**Fix:**
1. Check internet connection
2. Try different image URLs
3. Use local images instead

### Issue 3: Game Doesn't Start

**Symptoms:** Stuck on loading screen

**Causes:**
- Database query failing
- Authentication issue
- Missing user profile

**Fix:**
1. Check console for errors
2. Verify you're logged in
3. Check user has player_type set

### Issue 4: Cards Don't Flip

**Symptoms:** Tapping cards does nothing

**Causes:**
- Game is paused
- Cards already flipped
- JavaScript error

**Fix:**
1. Check console for errors
2. Restart the game
3. Check if timer is running

---

## Quick Diagnostic Checklist

Run through this checklist:

### ✅ Database Setup
- [ ] Supabase project created
- [ ] Tables created (run `sql/01_tables.sql`)
- [ ] Fashion items added (run `seed-fashion-items.sql`)
- [ ] At least 8 shoes in database

### ✅ App Configuration
- [ ] `.env` file exists
- [ ] `EXPO_PUBLIC_SUPABASE_URL` is set
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Values are correct (no quotes, no spaces)

### ✅ User Setup
- [ ] User registered
- [ ] User logged in
- [ ] User has player_type (child/teen/adult)
- [ ] User profile exists in database

### ✅ App Running
- [ ] `npm start` running without errors
- [ ] App opens on device/emulator
- [ ] Can see HomeScreen
- [ ] Can see PLAY button

### ✅ Game Access
- [ ] Can tap PLAY button
- [ ] Game mode screen appears
- [ ] Can tap Single Player
- [ ] Game screen loads

---

## Console Error Messages

### "No fashion items found"
→ Database is empty. Run seed script.

### "Failed to create game session"
→ User not authenticated or database error.

### "Cannot read property 'player_type'"
→ User profile incomplete. Check profiles table.

### "Network request failed"
→ No internet or Supabase unreachable.

### "Invalid API key"
→ Wrong Supabase credentials in `.env`

---

## Manual Database Check

Run these queries in Supabase SQL Editor:

```sql
-- 1. Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check fashion items count
SELECT 
  category, 
  COUNT(*) as count,
  SUM(CASE WHEN is_approved THEN 1 ELSE 0 END) as approved
FROM fashion_items 
GROUP BY category;

-- 3. Check your user profile
SELECT id, username, player_type, subscription_status 
FROM profiles 
LIMIT 5;

-- 4. Check game sessions
SELECT id, user_id, game_mode, score, is_completed 
FROM game_sessions 
ORDER BY started_at DESC 
LIMIT 5;
```

---

## Still Not Working?

### Check Console Logs

Look for these messages:

**Good Signs:**
```
✅ Auth successful! User: your@email.com
✅ Loaded 8 fashion items
✅ Game session created
✅ Game engine initialized
```

**Bad Signs:**
```
❌ Failed to load fashion items
❌ No fashion items found
❌ Database error
❌ Network request failed
```

### Enable Debug Mode

Add this to your game screen to see what's happening:

```typescript
console.log('Cards:', gameState?.cards?.length);
console.log('Grid Size:', gridSize);
console.log('Fashion Items:', fashionItems?.length);
```

---

## Quick Fix Script

If nothing works, try this complete reset:

```sql
-- 1. Clear old data
DELETE FROM game_sessions;
DELETE FROM performance_metrics;
DELETE FROM fashion_items;

-- 2. Add fresh shoes
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level) VALUES
('Shoe 1', 'shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Shoe 2', 'shoes', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Shoe 3', 'shoes', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Shoe 4', 'shoes', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Shoe 5', 'shoes', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Shoe 6', 'shoes', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Shoe 7', 'shoes', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Shoe 8', 'shoes', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2);

-- 3. Verify
SELECT COUNT(*) FROM fashion_items WHERE is_approved = true;
```

Then restart the app and try again.

---

## 🎯 Most Likely Fix

**99% of the time, the issue is:**

1. **No fashion items in database** → Run seed script
2. **Wrong Supabase credentials** → Check `.env` file
3. **Not logged in** → Login first

**Run the seed script and it should work!**
