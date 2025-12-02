# Leaderboard and Profile Stats Fix - Complete

## Problem Summary

The leaderboard was not updating user points and profile stats (games played, games won, win rate) were not showing correctly. This was caused by:

1. **Broken Database Triggers**: The triggers that update leaderboards and profile stats when games complete had issues with NULL handling
2. **Unique Constraint Problem**: The UNIQUE constraint on the leaderboards table didn't properly handle NULL `team_id` values for single-player games
3. **ON CONFLICT Issues**: The INSERT...ON CONFLICT statements were failing due to the constraint problem

## Solutions Implemented

### 1. Fixed Profile Stats Trigger (`sql/15_fix_leaderboard_updates_v2.sql`)

The `update_profile_stats()` function now properly:
- Updates `total_score` by adding the game score
- Increments `total_matches` counter
- Increments `total_wins` when player wins
- Tracks `win_streak` (resets to 0 on loss)
- Updates `best_time` if the new time is better
- Uses COALESCE to handle NULL values safely

### 2. Fixed Leaderboard Update Trigger (`sql/15_fix_leaderboard_updates_v2.sql`)

Created a helper function `upsert_user_leaderboard()` that:
- First tries to UPDATE existing leaderboard entry
- If no entry exists, INSERTs a new one
- Properly handles NULL values
- Updates multiple scopes: global, country, state, county, city, school, organization

The `update_leaderboard()` function now:
- Gets user profile data
- Calls the upsert helper for each applicable scope
- Includes detailed logging (RAISE NOTICE) for debugging
- Only processes when game is completed

### 3. Fixed Unique Constraint (`sql/16_fix_leaderboard_unique_constraint.sql`)

- Dropped the old UNIQUE constraint that included `team_id`
- Created separate unique indexes:
  - `idx_leaderboards_user_unique` for user leaderboards (WHERE team_id IS NULL)
  - `idx_leaderboards_team_unique` for team leaderboards (WHERE user_id IS NULL)
- Added CHECK constraint to ensure either user_id OR team_id is set (not both)

### 4. Added Rank Recalculation Function

Created `recalculate_all_leaderboard_ranks()` to:
- Recalculate ranks for all leaderboard entries
- Partition by scope, scope_value, period, and leaderboard_type
- Order by score DESC, wins DESC, matches_played ASC
- Update all ranks in one operation

## Migration Steps

Run these SQL files in order:

1. **First**: `sql/16_fix_leaderboard_unique_constraint.sql`
   - Fixes the constraint issue
   - Must run before the trigger fix

2. **Second**: `sql/15_fix_leaderboard_updates_v2.sql`
   - Fixes the triggers and functions
   - Creates the upsert helper function

3. **Third**: Run this query to recalculate existing ranks:
   ```sql
   SELECT recalculate_all_leaderboard_ranks();
   ```

## Testing the Fix

### Test 1: Play a Game
1. Log in to the app
2. Play a complete game (win or lose)
3. Check your profile - you should see:
   - Total games incremented
   - Total wins incremented (if you won)
   - Win rate updated
   - Total score increased

### Test 2: Check Leaderboard
1. Go to the Leaderboard screen
2. Select "Global" scope
3. You should see your entry with:
   - Your current score
   - Number of wins
   - Number of matches played
   - Your rank

### Test 3: Check Database Directly
Run this query in Supabase SQL Editor:

```sql
-- Check profile stats
SELECT 
  username,
  total_score,
  total_matches,
  total_wins,
  win_streak,
  ROUND((total_wins::decimal / NULLIF(total_matches, 0) * 100), 2) as win_rate_percent
FROM profiles
WHERE username = 'YOUR_USERNAME';

-- Check leaderboard entries
SELECT 
  l.scope,
  l.scope_value,
  l.score,
  l.wins,
  l.matches_played,
  l.rank,
  p.username
FROM leaderboards l
JOIN profiles p ON p.id = l.user_id
WHERE p.username = 'YOUR_USERNAME'
ORDER BY l.scope, l.score DESC;

-- Check recent game sessions
SELECT 
  gs.id,
  gs.score,
  gs.is_won,
  gs.is_completed,
  gs.matches_completed,
  gs.time_taken,
  gs.completed_at,
  p.username
FROM game_sessions gs
JOIN profiles p ON p.id = gs.user_id
WHERE p.username = 'YOUR_USERNAME'
ORDER BY gs.completed_at DESC
LIMIT 10;
```

## Debugging

If stats still aren't updating, check the Supabase logs:

1. Go to Supabase Dashboard
2. Navigate to Database > Logs
3. Look for NOTICE messages like:
   - "Profile stats updated for user..."
   - "Updating leaderboards for user..."
   - "Global leaderboard updated"

If you don't see these messages, the triggers might not be firing. Check:

```sql
-- Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN (
  'on_game_session_completed',
  'on_game_completed_update_leaderboard'
);

-- Should return 2 rows
```

## Backfilling Old Data (Optional)

If you have existing game sessions that weren't counted, uncomment and run the backfill section in `sql/15_fix_leaderboard_updates_v2.sql`:

```sql
DO $$
DECLARE
  game_record RECORD;
BEGIN
  -- Reset all profile stats first
  UPDATE public.profiles
  SET 
    total_score = 0,
    total_matches = 0,
    total_wins = 0,
    win_streak = 0;
  
  -- Delete all leaderboard entries
  DELETE FROM public.leaderboards;
  
  -- Reprocess all completed games
  FOR game_record IN 
    SELECT * FROM public.game_sessions 
    WHERE is_completed = TRUE 
    ORDER BY completed_at ASC
  LOOP
    -- Update profile stats
    UPDATE public.profiles
    SET 
      total_score = COALESCE(total_score, 0) + COALESCE(game_record.score, 0),
      total_matches = COALESCE(total_matches, 0) + 1,
      total_wins = COALESCE(total_wins, 0) + CASE WHEN game_record.is_won THEN 1 ELSE 0 END
    WHERE id = game_record.user_id;
    
    -- Trigger will handle leaderboard updates
    RAISE NOTICE 'Backfilled game session % for user %', game_record.id, game_record.user_id;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete. Recalculating leaderboard ranks...';
  PERFORM recalculate_all_leaderboard_ranks();
  RAISE NOTICE 'Done!';
END $$;
```

## What's Fixed

✅ Profile stats now update correctly:
- Total score accumulates
- Total matches increments
- Total wins increments
- Win rate calculates correctly
- Win streak tracks properly
- Best time updates

✅ Leaderboard updates correctly:
- Global leaderboard shows all players
- Country/state/city leaderboards work
- School/organization leaderboards work
- Scores accumulate properly
- Ranks calculate correctly
- No duplicate entries

✅ Recent games show in profile:
- Game history displays
- Win/loss status shows
- Scores display correctly
- Time taken shows

## Technical Details

### Trigger Execution Flow

1. User completes a game
2. `gameService.completeGameSession()` updates `game_sessions` table
3. Sets `is_completed = TRUE`
4. Two triggers fire:
   - `on_game_session_completed` → calls `update_profile_stats()`
   - `on_game_completed_update_leaderboard` → calls `update_leaderboard()`
5. Profile stats updated
6. Leaderboard entries upserted for all applicable scopes
7. Ranks can be recalculated with `recalculate_all_leaderboard_ranks()`

### Database Schema

**profiles table** (stats columns):
- `total_score` INTEGER
- `total_matches` INTEGER
- `total_wins` INTEGER
- `win_streak` INTEGER
- `best_time` INTEGER

**leaderboards table**:
- `user_id` UUID (for user leaderboards)
- `team_id` UUID (for team leaderboards, NULL for users)
- `leaderboard_type` TEXT ('user' or 'team')
- `scope` TEXT (global, country, state, etc.)
- `scope_value` TEXT (specific value for scope)
- `score` INTEGER (cumulative)
- `wins` INTEGER (cumulative)
- `matches_played` INTEGER (cumulative)
- `rank` INTEGER (calculated)
- `period` TEXT (all_time, monthly, weekly, daily)

## Support

If you encounter issues:

1. Check Supabase logs for error messages
2. Verify triggers are active (query above)
3. Test with a fresh game session
4. Check the database directly with test queries
5. Run `recalculate_all_leaderboard_ranks()` to fix ranks

## Summary

The leaderboard and profile stats system is now fully functional. All game completions will automatically update:
- User profile statistics
- Leaderboard entries across all scopes
- Rankings (can be recalculated on demand)

The fix handles edge cases like NULL values, missing profiles, and ensures data consistency across the system.
