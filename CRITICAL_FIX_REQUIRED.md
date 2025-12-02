# ⚠️ CRITICAL: Database Triggers Not Installed

## Why Stats Aren't Updating

**The frontend is working perfectly!** The problem is:

Your Supabase database is missing the **triggers** that automatically update:
- Profile stats (games played, wins, win rate)
- Leaderboard points
- Recent games

## This is NOT a Frontend Issue

The frontend correctly:
- ✅ Saves game sessions to database
- ✅ Marks games as completed
- ✅ Stores scores and results

But the database triggers that should **automatically** update stats when a game completes are **NOT INSTALLED**.

## Fix It Now (5 Minutes)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### Step 2: Open SQL Editor
Click "SQL Editor" in the left sidebar

### Step 3: Create New Query
Click "New Query" button

### Step 4: Copy This File
Open this file in your project:
```
sql/18_complete_fix_all_in_one.sql
```

Copy the ENTIRE contents (all ~400 lines)

### Step 5: Paste and Run
1. Paste into the SQL Editor
2. Click "Run" button (or press Ctrl+Enter)
3. Wait for "Success" message

### Step 6: Verify
Run this query to check triggers were installed:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'game_sessions'
ORDER BY trigger_name;
```

Should return 2 triggers:
- `on_game_completed_update_leaderboard`
- `on_game_session_completed`

### Step 7: Test
1. Play a complete game in your app
2. Go to Profile screen
3. Tap refresh button
4. Stats should now update!

## What the SQL Does

The migration file:
1. Removes duplicate leaderboard entries
2. Fixes database constraints
3. **Installs triggers** that update stats automatically
4. Creates helper functions
5. Recalculates existing ranks

## Why This Happens

Database triggers are **server-side** code that runs automatically when data changes. They must be installed in Supabase - the frontend cannot install them.

Think of it like this:
- Frontend = Your app (already working ✅)
- Database triggers = Automatic rules in Supabase (NOT installed ❌)

## After Running the SQL

Every time a user completes a game:
1. Frontend saves game → ✅ Already working
2. Database trigger fires → ✅ Will work after SQL
3. Profile stats update → ✅ Will work after SQL
4. Leaderboard updates → ✅ Will work after SQL

## Common Questions

**Q: Why didn't this happen automatically?**
A: Database triggers must be manually installed via SQL migrations.

**Q: Is the frontend broken?**
A: No! The frontend is perfect. This is purely a database setup step.

**Q: Will old games be counted?**
A: No, only new games after running the SQL. See "Backfill" section in TROUBLESHOOT_LEADERBOARD.md if you want to count old games.

**Q: Do I need to update the app?**
A: No! Just run the SQL once in Supabase. The app is already ready.

**Q: How long does it take?**
A: The SQL runs in about 10-30 seconds.

## Still Not Working After Running SQL?

1. **Check triggers were installed**:
```sql
SELECT COUNT(*) FROM information_schema.triggers
WHERE event_object_table = 'game_sessions';
```
Should return 2.

2. **Check if game is completing**:
```sql
SELECT id, user_id, score, is_completed, completed_at
FROM game_sessions
ORDER BY started_at DESC
LIMIT 5;
```
`is_completed` should be TRUE for finished games.

3. **Check Supabase logs**:
- Go to Database → Logs
- Look for NOTICE messages when you complete a game
- Should see: "Profile stats updated for user..."

4. **Run diagnostic**:
```
sql/17_diagnose_and_fix_triggers.sql
```

## Summary

- ❌ Problem: Database triggers not installed
- ✅ Solution: Run `sql/18_complete_fix_all_in_one.sql` in Supabase
- ⏱️ Time: 5 minutes
- 🔧 Difficulty: Copy, paste, click Run

**The frontend is NOT the problem. You just need to run one SQL file in Supabase!**

---

See also:
- `FIX_STATS_NOW.md` - Detailed instructions
- `TROUBLESHOOT_LEADERBOARD.md` - Debugging guide
- `COMPLETE_MIGRATION_GUIDE.md` - All migrations
