# 🔥 RUN THIS SQL NOW TO FIX THE ERROR

## The Real Problem

The error you're seeing is:
```
duplicate key value violates unique constraint "idx_leaderboards_user_unique"
```

This is a **DATABASE** issue, not a frontend issue. The database trigger that updates the leaderboard is trying to insert duplicate entries.

## The Fix

**Run this SQL file in Supabase:**
```
sql/19_fix_leaderboard_duplicate_key.sql
```

## How to Run It

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `sql/19_fix_leaderboard_duplicate_key.sql`
5. Click "Run"

## What This Does

1. **Fixes the unique constraint** to handle NULL values properly
2. **Cleans up existing duplicates** in your database
3. **Updates the trigger function** to use proper UPSERT logic
4. **Prevents future duplicate key errors**

## After Running the SQL

1. Refresh your app (Ctrl+Shift+R or Cmd+Shift+R)
2. Play a complete game
3. The errors should be gone!

## Why This Happened

The leaderboard table has a UNIQUE constraint on:
- `user_id`
- `team_id` 
- `scope`
- `scope_value`
- `period`
- `period_start`

When `team_id` and `period_start` are NULL, PostgreSQL was creating duplicate entries. The fix uses `COALESCE` to replace NULLs with default values in the unique index, and updates the trigger to use proper `ON CONFLICT` handling.

---

**This is the REAL fix. Run the SQL file now!** 🚀
