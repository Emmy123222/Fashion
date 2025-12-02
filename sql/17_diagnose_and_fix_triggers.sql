-- Diagnose and Fix Leaderboard Triggers
-- Run this to check if triggers are working and fix them

-- ============================================
-- STEP 1: Check if triggers exist
-- ============================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name IN (
  'on_game_session_completed',
  'on_game_completed_update_leaderboard'
)
ORDER BY trigger_name;

-- Should return 2 rows. If not, triggers are missing!

-- ============================================
-- STEP 2: Check recent game sessions
-- ============================================

SELECT 
  id,
  user_id,
  score,
  is_completed,
  is_won,
  matches_completed,
  completed_at,
  started_at
FROM game_sessions
ORDER BY started_at DESC
LIMIT 5;

-- ============================================
-- STEP 3: Check if profile stats are updating
-- ============================================

SELECT 
  p.username,
  p.total_score,
  p.total_matches,
  p.total_wins,
  COUNT(gs.id) as actual_completed_games,
  SUM(gs.score) as actual_total_score
FROM profiles p
LEFT JOIN game_sessions gs ON gs.user_id = p.id AND gs.is_completed = TRUE
GROUP BY p.id, p.username, p.total_score, p.total_matches, p.total_wins
HAVING COUNT(gs.id) > 0
ORDER BY actual_completed_games DESC
LIMIT 10;

-- If total_matches doesn't match actual_completed_games, triggers aren't working!

-- ============================================
-- STEP 4: Check leaderboard entries
-- ============================================

SELECT 
  l.user_id,
  p.username,
  l.scope,
  l.score,
  l.wins,
  l.matches_played,
  l.updated_at
FROM leaderboards l
JOIN profiles p ON p.id = l.user_id
WHERE l.leaderboard_type = 'user'
ORDER BY l.updated_at DESC
LIMIT 10;

-- ============================================
-- STEP 5: Manual trigger test
-- ============================================

-- Let's manually trigger an update for the most recent completed game
DO $$
DECLARE
  latest_game RECORD;
  user_profile RECORD;
BEGIN
  -- Get the most recent completed game
  SELECT * INTO latest_game
  FROM game_sessions
  WHERE is_completed = TRUE
  ORDER BY completed_at DESC
  LIMIT 1;
  
  IF latest_game IS NULL THEN
    RAISE NOTICE 'No completed games found!';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Testing with game_session: %', latest_game.id;
  RAISE NOTICE 'User: %, Score: %, Won: %', latest_game.user_id, latest_game.score, latest_game.is_won;
  
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = latest_game.user_id;
  
  IF user_profile IS NULL THEN
    RAISE NOTICE 'User profile not found!';
    RETURN;
  END IF;
  
  RAISE NOTICE 'User profile found: %', user_profile.username;
  
  -- Manually update profile stats
  UPDATE profiles
  SET 
    total_score = COALESCE(total_score, 0) + COALESCE(latest_game.score, 0),
    total_matches = COALESCE(total_matches, 0) + 1,
    total_wins = COALESCE(total_wins, 0) + CASE WHEN latest_game.is_won THEN 1 ELSE 0 END,
    updated_at = NOW()
  WHERE id = latest_game.user_id;
  
  RAISE NOTICE 'Profile stats updated manually';
  
  -- Manually update leaderboard
  UPDATE leaderboards
  SET 
    score = score + COALESCE(latest_game.score, 0),
    wins = wins + CASE WHEN latest_game.is_won THEN 1 ELSE 0 END,
    matches_played = matches_played + 1,
    updated_at = NOW()
  WHERE user_id = latest_game.user_id
    AND scope = 'global'
    AND scope_value = 'global'
    AND period = 'all_time'
    AND leaderboard_type = 'user';
  
  IF NOT FOUND THEN
    -- Insert new leaderboard entry
    INSERT INTO leaderboards (
      user_id,
      leaderboard_type,
      scope,
      scope_value,
      score,
      wins,
      matches_played,
      period,
      period_start
    ) VALUES (
      latest_game.user_id,
      'user',
      'global',
      'global',
      COALESCE(latest_game.score, 0),
      CASE WHEN latest_game.is_won THEN 1 ELSE 0 END,
      1,
      'all_time',
      NULL
    );
    RAISE NOTICE 'New leaderboard entry created';
  ELSE
    RAISE NOTICE 'Leaderboard entry updated';
  END IF;
  
  RAISE NOTICE 'Manual update complete!';
END $$;

-- ============================================
-- STEP 6: Verify the manual update worked
-- ============================================

SELECT 
  p.username,
  p.total_score,
  p.total_matches,
  p.total_wins,
  l.score as leaderboard_score,
  l.matches_played as leaderboard_matches
FROM profiles p
LEFT JOIN leaderboards l ON l.user_id = p.id AND l.scope = 'global' AND l.leaderboard_type = 'user'
WHERE p.total_matches > 0
ORDER BY p.total_score DESC
LIMIT 10;

-- ============================================
-- RESULTS INTERPRETATION
-- ============================================

/*
If you see:
1. 2 triggers in Step 1 → Triggers exist ✓
2. 0 triggers in Step 1 → Need to run sql/15_fix_leaderboard_updates_v2.sql

If profile stats don't match actual games:
→ Triggers aren't firing, run sql/15_fix_leaderboard_updates_v2.sql

If manual update in Step 5 worked:
→ The logic is correct, but triggers aren't firing automatically
→ Run sql/15_fix_leaderboard_updates_v2.sql to recreate triggers

If manual update failed:
→ Check error messages in the output
→ May need to check RLS policies
*/

SELECT 'Diagnostic complete! Check the output above.' as status;
