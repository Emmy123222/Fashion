# Quick Reference Guide

## 🚀 Start Here

### What's Been Implemented?
✅ **Everything!** All features are complete and integrated.

### What Do I Need to Do?
1. Run database migrations (5 SQL files)
2. Test the complete flow
3. Deploy when ready

---

## 📋 Database Migrations (Run in Order)

```sql
-- In Supabase SQL Editor:

-- 1. Profile fields
\i sql/05_add_profile_fields.sql

-- 2. Organization fields
\i sql/06_add_detailed_organization_fields.sql

-- 3. Unique usernames
\i sql/07_enforce_unique_usernames.sql

-- 4. Leaderboard fix
\i sql/08_fix_leaderboard_aggregation.sql

-- 5. Reward system
\i sql/09_reward_system.sql
```

---

## 🎮 Game Flow

```
Home → PLAY → Category → Level → Game → Rewards → Collection
```

### Navigation Path:
1. **HomeScreen** → Tap PLAY button
2. **CategorySelectionScreen** → Choose from 9 categories
3. **LevelSelectionScreen** → Choose from 11+ levels
4. **SinglePlayerGameScreen** → Play with transparent backgrounds
5. **RoundResultScreen** → See results
6. **CollectionScreen** → View unlocked items

---

## 🎯 Key Features

### 1. Categories (9 total)
- Shoes, Shirts, Dresses, Pants, Hats, Blouses, Underwear, Suits, Accessories
- Each filters game items to that category

### 2. Difficulty Levels (11+)
- Level 1: Easy (85% win rate, 4x4 grid, 180s)
- Level 5: Expert (15% win rate, 5x10 grid, 60s)
- Level 11: IMPOSSIBLE (1% win rate, 5x16 grid, 30s)

### 3. Rewards
- Points based on: level, score, time, accuracy
- Unlocks items when threshold reached
- Different thresholds per category (600-2000 points)

### 4. Collection
- View all unlocked items
- Track progress per category
- See locked items as motivation

### 5. Leaderboards
- 12 scopes (Global, Country, State, etc.)
- 4 time periods (Today, Week, Month, All-Time)
- No duplicates (properly aggregated)

---

## 📁 Important Files

### Core Game Logic:
- `src/screens/game/SinglePlayerGameScreen.tsx` - Main game
- `src/services/DifficultyScaler.ts` - Difficulty system
- `src/services/GameEngine.ts` - Game mechanics

### New Screens:
- `src/screens/game/CategorySelectionScreen.tsx`
- `src/screens/game/LevelSelectionScreen.tsx`
- `src/screens/CollectionScreen.tsx`

### Navigation:
- `src/navigation/AppNavigator.tsx` - Main navigator
- `src/navigation/MainTabNavigator.tsx` - Tab navigation
- `src/navigation/types.ts` - Type definitions

### Database:
- `sql/09_reward_system.sql` - Reward tables and functions

---

## 🧪 Quick Test

### Minimal Test Flow:
1. Sign up (username, age, country)
2. Tap PLAY
3. Select "Shoes"
4. Select "Level 1"
5. Play game (verify transparent backgrounds)
6. Check console for reward points
7. Go to Profile → Collection
8. Verify progress tracked

### Expected Results:
- ✅ Only shoe items in game
- ✅ Transparent backgrounds (no white boxes)
- ✅ 4x4 grid, 180 second timer
- ✅ Reward points calculated
- ✅ Collection shows progress

---

## 🐛 Common Issues

### Issue: Categories not showing
**Fix:** Check `AppNavigator.tsx` has `CategorySelectionScreen` imported

### Issue: Wrong items in game
**Fix:** Verify category param passed: `navigation.navigate('LevelSelection', { category })`

### Issue: White backgrounds
**Fix:** Check `FashionCard.tsx` uses `resizeMode="contain"`

### Issue: No rewards
**Fix:** Verify `processRewards()` called in `handleGameEnd()`

### Issue: Collection empty
**Fix:** Run `sql/09_reward_system.sql` migration

---

## 📊 Difficulty Levels Quick Reference

| Level | Name | Grid | Time | Win % | Items |
|-------|------|------|------|-------|-------|
| 1 | Easy | 4x4 | 180s | 85% | 8 |
| 2 | Medium | 4x6 | 120s | 65% | 12 |
| 3 | Hard | 4x8 | 90s | 45% | 16 |
| 4 | Very Hard | 4x10 | 75s | 25% | 20 |
| 5 | Expert | 5x10 | 60s | 15% | 25 |
| 11 | IMPOSSIBLE | 5x16 | 30s | 1% | 40 |

---

## 🎁 Reward Thresholds

| Category | Points | Difficulty |
|----------|--------|------------|
| Underwear | 600 | Easiest |
| Accessories | 800 | Easy |
| Shoes | 1,000 | Medium |
| Pants | 1,000 | Medium |
| Shirts | 1,000 | Medium |
| Hats | 1,200 | Hard |
| Blouses | 1,200 | Hard |
| Dresses | 1,500 | Very Hard |
| Suits | 2,000 | Hardest |

---

## 🎨 Color Scheme

```typescript
Primary: #6C63FF (Royal Purple)
Secondary: #FF4F81 (Hot Pink)
Accent: #FFC736 (Gold Yellow)
Success: #22C55E (Neon Green)
Error: #EF4444 (Red)
```

---

## 🔍 Console Logs to Watch

### Game Start:
```
🎯 Level 1: Easy
⏱️ Time: 180s, Items: 8
📊 Grid: 4x4
🎲 Win probability: 85%
```

### Game End:
```
🎁 Reward Points: 1250
🎉 New Item Unlocked!
```

---

## 📞 Need Help?

### Documentation:
- `TESTING_GUIDE.md` - Full testing instructions
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `IMPLEMENTATION_COMPLETE.md` - Complete feature list

### Key Functions:
```typescript
// Get difficulty config
DifficultyScaler.getDifficultyConfig(level)

// Calculate rewards
DifficultyScaler.calculateRewardPoints(level, score, timeLeft, accuracy)

// Check unlock
supabase.rpc('check_and_unlock_items', { p_user_id, p_category, p_points_earned })
```

---

## ✅ Pre-Launch Checklist

- [ ] Database migrations run
- [ ] Fashion items seeded (all 9 categories)
- [ ] Environment variables set
- [ ] Test sign up flow
- [ ] Test category selection
- [ ] Test level selection
- [ ] Test game play
- [ ] Test reward system
- [ ] Test collection screen
- [ ] Test leaderboards
- [ ] No TypeScript errors
- [ ] No critical console errors

---

## 🚀 Ready to Launch?

### If all tests pass:
```bash
# Build for production
npm run build

# Or with Expo
eas build --platform all

# Deploy
eas submit --platform all
```

### If tests fail:
1. Check `TESTING_GUIDE.md` for specific test
2. Review relevant file
3. Fix issue
4. Re-test
5. Repeat until all pass

---

## 🎉 Success!

When everything works:
- ✅ 9 categories selectable
- ✅ 11+ levels playable
- ✅ Transparent backgrounds
- ✅ Rewards processing
- ✅ Collection tracking
- ✅ Leaderboards working
- ✅ Smooth navigation

**You're ready to launch! 🚀**

---

*Quick reference for the Fashion Match Game implementation. For detailed information, see the full documentation files.*
