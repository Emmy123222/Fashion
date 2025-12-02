# Complete Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. Database migrations applied (all 5 SQL files)
2. Fashion items seeded in database
3. App running on device/simulator

### Test Flow Order
Test in this exact order to verify the complete integration:

---

## 1️⃣ Sign Up & Authentication

### Test Steps:
1. Open app → See Onboarding screen
2. Tap "Get Started" → Navigate to Register
3. Fill in ONLY 3 required fields:
   - Username: `testplayer123`
   - Age Group: Select any
   - Country: Select any
4. Tap "Sign Up"

### Expected Results:
✅ Account created successfully
✅ Navigate to Home screen
✅ No errors about missing fields

### Common Issues:
- ❌ Username already exists → Use different username
- ❌ Database error → Check if SQL migrations ran

---

## 2️⃣ Home Screen & Navigation

### Test Steps:
1. See Home screen with fashion feed
2. Locate floating PLAY button (bottom right)
3. Tap PLAY button

### Expected Results:
✅ Navigate to Category Selection screen
✅ See 9 fashion categories displayed
✅ Each category has icon, name, description

### Common Issues:
- ❌ PLAY button missing → Check HomeScreen.tsx
- ❌ Navigation error → Check AppNavigator.tsx

---

## 3️⃣ Category Selection

### Test Steps:
1. On Category Selection screen
2. Review all 9 categories:
   - 👟 Shoes
   - 👔 Shirts
   - 👗 Dresses
   - 👖 Pants
   - 🎩 Hats
   - 👚 Blouses
   - 🩲 Underwear
   - 🕴️ Suits
   - 💍 Accessories
3. Tap on "Shoes" category

### Expected Results:
✅ Navigate to Level Selection screen
✅ Category parameter passed correctly
✅ Back button works

### Common Issues:
- ❌ Categories not showing → Check CategorySelectionScreen.tsx
- ❌ Navigation fails → Check navigation types

---

## 4️⃣ Level Selection

### Test Steps:
1. On Level Selection screen
2. See 11+ difficulty levels displayed
3. Review Level 1 details:
   - Difficulty: "Easy"
   - Time: 180s
   - Win rate: 85%
   - Color: Green
4. Tap "Level 1: Store View"

### Expected Results:
✅ All 11+ levels visible
✅ Difficulty labels correct (Easy → IMPOSSIBLE)
✅ Colors match difficulty (Green → Red)
✅ Navigate to game with correct params

### Common Issues:
- ❌ Only 2 levels showing → Check LevelSelectionScreen.tsx
- ❌ Wrong difficulty info → Check DifficultyScaler.ts

---

## 5️⃣ Game Play - Level 1

### Test Steps:
1. Game loads with:
   - Category: Shoes
   - Level: 1
   - Grid: 4x4 (8 pairs)
   - Time: 180 seconds
2. Check console logs for:
   ```
   🎯 Level 1: Easy
   ⏱️ Time: 180s, Items: 8
   📊 Grid: 4x4
   🎲 Win probability: 85%
   ```
3. Verify images:
   - All shoe images load
   - Transparent backgrounds (no white boxes)
   - Images display properly
4. Play the game:
   - Tap cards to flip
   - Match pairs
   - Watch timer count down
5. Complete the game (match all pairs)

### Expected Results:
✅ Only shoe items displayed
✅ Transparent backgrounds work
✅ 4x4 grid (8 pairs)
✅ 180 second timer
✅ Game ends when all matched
✅ Navigate to Round Result screen

### Common Issues:
- ❌ Wrong category items → Check SinglePlayerGameScreen.tsx
- ❌ White backgrounds → Check FashionCard.tsx resizeMode
- ❌ Wrong grid size → Check DifficultyScaler integration

---

## 6️⃣ Reward Processing

### Test Steps:
1. After game ends, check console logs:
   ```
   🎁 Reward Points: [calculated points]
   ```
2. If points >= 1000 (shoes threshold):
   ```
   🎉 New Item Unlocked!
   You unlocked: [item name]
   Total shoes unlocked: [count]
   ```
3. Tap "Awesome!" on unlock notification

### Expected Results:
✅ Points calculated based on performance
✅ Unlock check runs automatically
✅ Notification shows if threshold reached
✅ Database updated with unlock

### Common Issues:
- ❌ No reward processing → Check processRewards call
- ❌ No unlock notification → Check point threshold
- ❌ Database error → Check SQL function exists

---

## 7️⃣ Collection Screen

### Test Steps:
1. From Round Result, go back to Home
2. Tap Profile tab (bottom navigation)
3. Find "My Fashion Collection" button
4. Tap collection button

### Expected Results:
✅ Navigate to Collection screen
✅ See all 9 categories
✅ Unlocked items show with images
✅ Locked items show as locked
✅ Progress bars display correctly

### Common Issues:
- ❌ Collection tab missing → Check MainTabNavigator.tsx
- ❌ Button not in Profile → Check ProfileScreen.tsx
- ❌ No items showing → Check database unlocks

---

## 8️⃣ Progressive Difficulty

### Test Steps:
1. Play Level 1 (Easy - 85% win rate)
2. Play Level 2 (Medium - 65% win rate)
3. Play Level 3 (Hard - 45% win rate)
4. Play Level 5 (Expert - 15% win rate)
5. Try Level 11 (IMPOSSIBLE - 1% win rate)

### Expected Results:
✅ Level 1: 4x4 grid, 180s, very easy
✅ Level 2: 4x6 grid, 120s, moderate
✅ Level 3: 4x8 grid, 90s, challenging
✅ Level 5: 5x10 grid, 60s, very hard
✅ Level 11: 5x16 grid, 30s, nearly impossible

### Common Issues:
- ❌ Same difficulty → Check DifficultyScaler.getDifficultyConfig
- ❌ Wrong grid sizes → Check config application

---

## 9️⃣ Leaderboard Testing

### Test Steps:
1. Tap Leaderboard tab
2. Test all 12 scopes:
   - Global
   - Country
   - State
   - County
   - City
   - High School
   - College
   - University
   - Nonprofit
   - Corporation
   - Government
   - Chapter
3. Test all 4 time periods:
   - Today
   - This Week
   - This Month
   - All-Time
4. Check for duplicate usernames

### Expected Results:
✅ All scopes work
✅ All time periods filter correctly
✅ NO duplicate usernames
✅ Scores aggregate properly
✅ Public profiles show stats only

### Common Issues:
- ❌ Duplicates → Check SQL aggregation fix
- ❌ Wrong scope data → Check leaderboard service

---

## 🔟 Multi-Category Testing

### Test Steps:
1. Play game with "Dresses" category
2. Earn 1500+ points (dress threshold)
3. Check for dress unlock
4. View Collection → Dresses section
5. Repeat for other categories

### Expected Results:
✅ Each category filters correctly
✅ Different point thresholds work:
   - Underwear: 600 points
   - Accessories: 800 points
   - Shoes/Pants/Shirts: 1,000 points
   - Hats/Blouses: 1,200 points
   - Dresses: 1,500 points
   - Suits: 2,000 points
✅ Unlocks tracked per category
✅ Collection shows category progress

---

## 🎯 Complete Integration Test

### Full Flow Test:
1. ✅ Sign up (3 fields)
2. ✅ Home → PLAY button
3. ✅ Select category (Shoes)
4. ✅ Select level (Level 1)
5. ✅ Play game (transparent backgrounds)
6. ✅ Earn points (reward calculation)
7. ✅ Unlock item (notification)
8. ✅ View collection (progress tracking)
9. ✅ Check leaderboard (no duplicates)
10. ✅ Try harder level (difficulty scaling)

### Success Criteria:
✅ All 10 steps complete without errors
✅ No TypeScript errors
✅ No console errors (warnings OK)
✅ Smooth navigation throughout
✅ Data persists correctly

---

## 🐛 Common Issues & Solutions

### Issue: Categories not showing
**Solution:** Check if CategorySelectionScreen is imported in AppNavigator

### Issue: Wrong items in game
**Solution:** Verify category parameter is passed through navigation

### Issue: White backgrounds on images
**Solution:** Check FashionCard.tsx uses resizeMode="contain"

### Issue: Same difficulty every level
**Solution:** Verify DifficultyScaler.getDifficultyConfig is called

### Issue: No reward notifications
**Solution:** Check processRewards is called in handleGameEnd

### Issue: Collection empty
**Solution:** Verify SQL reward system migration ran successfully

### Issue: Duplicate leaderboard entries
**Solution:** Run SQL aggregation fix (08_fix_leaderboard_aggregation.sql)

### Issue: Navigation errors
**Solution:** Check all screens registered in AppNavigator.tsx

---

## 📊 Performance Testing

### Test on Different Devices:
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical iPhone
- [ ] Physical Android

### Test Different Scenarios:
- [ ] Slow network connection
- [ ] Offline mode (should show error)
- [ ] Multiple games in succession
- [ ] Rapid navigation
- [ ] Background/foreground switching

---

## ✅ Final Checklist

Before marking as complete, verify:

- [ ] All 9 categories selectable
- [ ] All 11+ levels playable
- [ ] Transparent backgrounds work
- [ ] Reward system processes correctly
- [ ] Unlocks trigger properly
- [ ] Collection displays progress
- [ ] Leaderboards have no duplicates
- [ ] Navigation flows smoothly
- [ ] No TypeScript errors
- [ ] No critical console errors
- [ ] Database migrations applied
- [ ] Fashion items seeded

---

## 🎉 Success Indicators

You'll know everything works when:

1. **Category Selection:** All 9 categories display beautifully
2. **Level Selection:** 11+ levels with correct difficulty info
3. **Game Play:** Items match selected category, transparent backgrounds
4. **Rewards:** Points calculated, unlocks trigger, notifications show
5. **Collection:** Progress tracked per category, unlocked items visible
6. **Leaderboards:** No duplicates, all scopes work, proper aggregation
7. **Difficulty:** Gets progressively harder (85% → 1% win rate)
8. **Integration:** Everything connects seamlessly

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

✅ Sign Up (3 fields)
✅ Category Selection (9 categories)
✅ Level Selection (11+ levels)
✅ Game Play (transparent backgrounds)
✅ Reward Processing (points & unlocks)
✅ Collection Screen (progress tracking)
✅ Leaderboards (no duplicates)
✅ Difficulty Scaling (Easy → IMPOSSIBLE)
✅ Navigation (smooth flow)
✅ Performance (no lag)

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: PASS / FAIL
```

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Mark implementation as complete
2. ✅ Deploy to staging environment
3. ✅ Conduct user acceptance testing
4. ✅ Prepare for production release

If tests fail:
1. ❌ Document specific failures
2. ❌ Check relevant files
3. ❌ Apply fixes
4. ❌ Re-test affected areas

---

**Happy Testing! 🎮**
