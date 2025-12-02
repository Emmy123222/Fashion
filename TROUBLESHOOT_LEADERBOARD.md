# Troubleshoot Leaderboard & Profile Stats

## Quick Diagnosis

Run this SQL file in Supabase SQL Editor:
```
sql/17_diagnose_and_fix_triggers.sql
```

This will:
1. Check if triggers exist
2. Show recent game sessions
3. Compare profile stats vs actual games
4. Show leaderboard entries
5. Manually test the update logic
6. Verify the manual update worked

## Common Issues & Solutions

### Issue 1: Triggers Don't Exist

**Symptom**: Step 1 of diagnostic returns 0 rows

**Solution**: Run these migrations in order:
```sql
-- 1. First run this:
sql/16_fix_leaderboard_unique_constraint.sql

-- 2. Then run this:
sql/15_fix_leaderboard_updates_v2.sql
```

### Issue 2: Triggers Exist But Don't Fire

**Symptom**: 
- Step 1 shows 2 triggers
- But profile stats don't match actual games

**Solution**: The trigger condition might not be met. Check:

```sql
-- See if games are actually marked as completed
SELECT 
  id,
  is_completed,
  completed_at,
  score
FROM game_sessions
ORDER BY created_at DESC
LIMIT 10;
```

If `is_completed` is FALSE, the game isn't finishing properly. Check the app logs.

### Issue 3: Duplicate Key Errors

**Symptom**: Error about duplicate keys in leaderboards table

**Solution**: Run the constraint fix first:
```sql
sql/16_fix_leaderboard_unique_constraint.sql
```

This removes duplicates before creating the unique index.

### Issue 4: Profile Stats Are Zero

**Symptom**: 
- Games complete successfully
- But total_score, total_matches, total_wins are all 0

**Solution**: Triggers aren't firing. Recreate them:
```sql
sql/15_fix_leaderboard_updates_v2.sql
```

Then test with a new game.

### Issue 5: Leaderboard Is Empty

**Symptom**: No entries in leaderboards table

**Solution**: 

1. Check if triggers are active:
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'on_game_completed_update_leaderboard';
```

2. If trigger exists, manually populate for existing games:
```sql
-- This will process all completed games
DO $$
DECLARE
  game_record RECORD;
BEGIN
  FOR game_record IN 
    SELECT * FROM game_sessions 
    WHERE is_completed = TRUE 
    ORDER BY completed_at ASC
  LOOP
    -- Call the upsert function
    PERFORM upsert_user_leaderboard(
      game_record.user_id,
      'global',
      'global',
      COALESCE(game_record.score, 0),
      CASE WHEN game_record.is_won THEN 1 ELSE 0 END
    );
  END LOOP;
  
  RAISE NOTICE 'Leaderboard populated from % games', 
    (SELECT COUNT(*) FROM game_sessions WHERE is_completed = TRUE);
END $$;

-- Recalculate ranks
SELECT recalculate_all_leaderboard_ranks();
```

## Step-by-Step Fix Process

### Step 1: Clean Database State

```sql
-- Remove duplicate leaderboard entries
sql/16_fix_leaderboard_unique_constraint.sql
```

### Step 2: Install Triggers

```sql
-- Install the fixed triggers
sql/15_fix_leaderboard_updates_v2.sql
```

### Step 3: Verify Triggers

```sql
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'game_sessions'
ORDER BY trigger_name;
```

Should show:
- `on_game_completed_update_leaderboard`
- `on_game_session_completed`

### Step 4: Test with New Game

1. Play a complete game in the app
2. Check the logs for these messages:
   - "Profile stats updated for user..."
   - "Updating leaderboards for user..."
   - "Global leaderboard updated"

3. Verify in database:
```sql
SELECT 
  p.username,
  p.total_score,
  p.total_matches,
  p.total_wins,
  l.score as leaderboard_score
FROM profiles p
LEFT JOIN leaderboards l ON l.user_id = p.id AND l.scope = 'global'
WHERE p.username = 'YOUR_USERNAME';
```

### Step 5: Backfill Old Games (Optional)

If you have old games that weren't counted:

```sql
-- Reset stats
UPDATE profiles SET 
  total_score = 0,
  total_matches = 0,
  total_wins = 0,
  win_streak = 0;

-- Clear leaderboards
DELETE FROM leaderboards;

-- Reprocess all games
DO $$
DECLARE
  game_record RECORD;
  user_profile RECORD;
  v_score INTEGER;
  v_wins INTEGER;
BEGIN
  FOR game_record IN 
    SELECT * FROM game_sessions 
    WHERE is_completed = TRUE 
    ORDER BY completed_at ASC
  LOOP
    v_score := COALESCE(game_record.score, 0);
    v_wins := CASE WHEN game_record.is_won THEN 1 ELSE 0 END;
    
    -- Update profile
    UPDATE profiles
    SET 
      total_score = COALESCE(total_score, 0) + v_score,
      total_matches = COALESCE(total_matches, 0) + 1,
      total_wins = COALESCE(total_wins, 0) + v_wins
    WHERE id = game_record.user_id;
    
    -- Get user profile for leaderboard scopes
    SELECT * INTO user_profile FROM profiles WHERE id = game_record.user_id;
    
    -- Update global leaderboard
    PERFORM upsert_user_leaderboard(
      game_record.user_id, 'global', 'global', v_score, v_wins
    );
    
    -- Update country leaderboard
    IF user_profile.country IS NOT NULL AND user_profile.country != '' THEN
      PERFORM upsert_user_leaderboard(
        game_record.user_id, 'country', user_profile.country, v_score, v_wins
      );
    END IF;
    
    -- Update state leaderboard
    IF user_profile.state IS NOT NULL AND user_profile.state != '' THEN
      PERFORM upsert_user_leaderboard(
        game_record.user_id, 'state', user_profile.state, v_score, v_wins
      );
    END IF;
    
    -- Update city leaderboard
    IF user_profile.city IS NOT NULL AND user_profile.city != '' THEN
      PERFORM upsert_user_leaderboard(
        game_record.user_id, 'city', user_profile.city, v_score, v_wins
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete!';
END $$;

-- Recalculate all ranks
SELECT recalculate_all_leaderboard_ranks();
```

## Checking Supabase Logs

1. Go to Supabase Dashboard
2. Click on your project
3. Go to "Database" → "Logs"
4. Look for NOTICE messages when a game completes

You should see:
```
NOTICE: Profile stats updated for user <uuid>
NOTICE: Updating leaderboards for user <uuid> with score <number>
NOTICE: Global leaderboard updated
NOTICE: Country leaderboard updated for <country>
```

If you don't see these, triggers aren't firing.

## App-Side Debugging

Add this to check if game completion is working:

In `SinglePlayerGameScreen.tsx`, after `gameService.completeGameSession()`:

```typescript
console.log('✅ Game session completed:', sessionResponse.data);

// Verify it was saved
const verifyResponse = await gameService.getUserGameSessions(user.id, 1);
if (verifyResponse.success && verifyResponse.data) {
  console.log('✅ Latest game session:', verifyResponse.data[0]);
  console.log('   is_completed:', verifyResponse.data[0].is_completed);
  console.log('   score:', verifyResponse.data[0].score);
}
```

## Final Checklist

- [ ] Ran `sql/16_fix_leaderboard_unique_constraint.sql`
- [ ] Ran `sql/15_fix_leaderboard_updates_v2.sql`
- [ ] Verified triggers exist (2 triggers)
- [ ] Played a complete game
- [ ] Checked Supabase logs for NOTICE messages
- [ ] Verified profile stats updated
- [ ] Verified leaderboard entry created
- [ ] Ran `SELECT recalculate_all_leaderboard_ranks();`

## Still Not Working?

If after all this it still doesn't work:

1. **Check RLS Policies**:
```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('game_sessions', 'profiles', 'leaderboards')
ORDER BY tablename, policyname;
```

2. **Check Function Exists**:
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'update_profile_stats',
  'update_leaderboard',
  'upsert_user_leaderboard'
)
ORDER BY routine_name;
```

Should return 3 functions.

3. **Test Function Directly**:
```sql
-- Test the upsert function
SELECT upsert_user_leaderboard(
  '<your-user-id>'::uuid,
  'global',
  'global',
  1000,
  1
);

-- Check if it worked
SELECT * FROM leaderboards 
WHERE user_id = '<your-user-id>'::uuid 
AND scope = 'global';
```

## Contact Support

If nothing works, provide:
1. Output from `sql/17_diagnose_and_fix_triggers.sql`
2. Supabase logs from when you complete a game
3. App console logs from game completion
4. Result of trigger verification query
