# Fix Leaderboard & Profile Stats - Quick Start

## The Problem
- ❌ Leaderboard not updating with user points
- ❌ Profile not showing games played, wins, or win rate
- ❌ Recent games not displaying

## The Solution (3 Steps)

### Step 1: Run SQL Migration #16
Open Supabase SQL Editor and run this file:
```
sql/16_fix_leaderboard_unique_constraint.sql
```

This fixes the unique constraint issue that was preventing leaderboard updates.

### Step 2: Run SQL Migration #15
In Supabase SQL Editor, run this file:
```
sql/15_fix_leaderboard_updates_v2.sql
```

This fixes the triggers that update profile stats and leaderboards.

### Step 3: Recalculate Ranks
In Supabase SQL Editor, run this query:
```sql
SELECT recalculate_all_leaderboard_ranks();
```

This recalculates all leaderboard ranks based on current scores.

## That's It!

Now when you:
1. Play a game
2. Complete it (win or lose)
3. Check your profile

You'll see:
- ✅ Total games incremented
- ✅ Total wins updated
- ✅ Win rate calculated
- ✅ Total score increased
- ✅ Recent games displayed
- ✅ Leaderboard entry created/updated

## Verify It Works

### Test in App:
1. Log in
2. Play a complete game
3. Go to Profile screen
4. You should see your stats updated
5. Go to Leaderboard screen
6. You should see your entry

### Test in Database:
Run this in Supabase SQL Editor (replace YOUR_USERNAME):

```sql
-- Check profile stats
SELECT 
  username,
  total_score,
  total_matches,
  total_wins,
  ROUND((total_wins::decimal / NULLIF(total_matches, 0) * 100), 2) as win_rate_percent
FROM profiles
WHERE username = 'YOUR_USERNAME';

-- Check leaderboard
SELECT 
  l.scope,
  l.score,
  l.wins,
  l.matches_played,
  l.rank
FROM leaderboards l
JOIN profiles p ON p.id = l.user_id
WHERE p.username = 'YOUR_USERNAME'
ORDER BY l.scope;
```

## Troubleshooting

### Stats still not updating?

Check if triggers are active:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN (
  'on_game_session_completed',
  'on_game_completed_update_leaderboard'
);
```

Should return 2 rows. If not, re-run Step 2.

### Leaderboard empty?

Check if you have completed games:
```sql
SELECT COUNT(*) as completed_games
FROM game_sessions
WHERE is_completed = TRUE;
```

If > 0 but leaderboard is empty, re-run Step 3.

### Need to reset everything?

```sql
-- Reset profile stats
UPDATE profiles SET 
  total_score = 0,
  total_matches = 0,
  total_wins = 0,
  win_streak = 0;

-- Clear leaderboards
DELETE FROM leaderboards;

-- Then play a new game to test
```

## What Was Fixed

**Database Triggers**: 
- `update_profile_stats()` - Updates profile when game completes
- `update_leaderboard()` - Updates leaderboard entries when game completes

**Database Constraints**:
- Fixed UNIQUE constraint to handle NULL team_id properly
- Separate indexes for user vs team leaderboards

**Helper Functions**:
- `upsert_user_leaderboard()` - Safely insert or update leaderboard entries
- `recalculate_all_leaderboard_ranks()` - Recalculate all ranks

## Files Involved

- `sql/15_fix_leaderboard_updates_v2.sql` - Trigger fixes
- `sql/16_fix_leaderboard_unique_constraint.sql` - Constraint fix
- `LEADERBOARD_FIX_COMPLETE.md` - Full documentation
- `FIXES_SUMMARY.md` - All fixes summary

## Need More Help?

See `LEADERBOARD_FIX_COMPLETE.md` for:
- Detailed technical explanation
- Debugging steps
- Backfill instructions for old data
- Complete testing procedures

---

**TL;DR**: Run migrations #16 and #15, then run `SELECT recalculate_all_leaderboard_ranks();` and you're done! 🎉
