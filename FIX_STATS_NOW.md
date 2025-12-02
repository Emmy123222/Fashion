# Fix Profile Stats & Recent Games - DO THIS NOW!

## The Problem
- ❌ Recent games not showing in profile
- ❌ Games played not updating
- ❌ Wins not updating
- ❌ Win rate not calculating

## The Solution (ONE STEP!)

### Run This SQL File in Supabase:

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the ENTIRE contents of this file:
   ```
   sql/18_complete_fix_all_in_one.sql
   ```
5. Click "Run" button

That's it! The fix will:
- ✅ Remove duplicate leaderboard entries
- ✅ Fix database constraints
- ✅ Install triggers that update profile stats
- ✅ Install triggers that update leaderboards
- ✅ Recalculate all ranks

## After Running the SQL:

1. **Play a complete game** (win or lose)
2. **Go to Profile screen**
3. **Tap the refresh button** (top right)
4. You should now see:
   - ✅ Games played incremented
   - ✅ Wins updated (if you won)
   - ✅ Win rate calculated
   - ✅ Recent games showing

## Verify It Worked

Run this query in Supabase SQL Editor to check:

```sql
-- Check if triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'game_sessions'
ORDER BY trigger_name;
```

Should return 2 triggers:
- `on_game_completed_update_leaderboard`
- `on_game_session_completed`

## Still Not Working?

If after running the SQL and playing a game, stats still don't update:

1. Check Supabase logs:
   - Go to Database → Logs
   - Look for NOTICE messages when you complete a game

2. Run the diagnostic:
   ```
   sql/17_diagnose_and_fix_triggers.sql
   ```

3. Check if game is actually completing:
   ```sql
   SELECT id, user_id, score, is_completed, is_won, completed_at
   FROM game_sessions
   ORDER BY started_at DESC
   LIMIT 5;
   ```
   
   The `is_completed` should be TRUE for finished games.

## Why This Happens

The database triggers that automatically update profile stats and leaderboards when you complete a game were not installed. The SQL file installs these triggers so everything updates automatically.

## Important Notes

- You only need to run the SQL file ONCE
- After running it, all future games will update stats automatically
- The triggers work in real-time - no manual updates needed
- If you already played games before the fix, those won't be counted (only new games after the fix)

## Need to Backfill Old Games?

If you want to count games you played before the fix, see the "Backfill" section in:
```
TROUBLESHOOT_LEADERBOARD.md
```

---

**TL;DR**: Run `sql/18_complete_fix_all_in_one.sql` in Supabase SQL Editor, then play a game. Stats will update automatically! 🎉
