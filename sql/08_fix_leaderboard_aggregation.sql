-- Fix leaderboard to show one entry per user with aggregated scores
-- Run this in Supabase SQL Editor

-- Create or replace function to update leaderboard entries
CREATE OR REPLACE FUNCTION update_user_leaderboard(
  p_user_id UUID,
  p_scope TEXT,
  p_scope_value TEXT,
  p_period TEXT DEFAULT 'all_time'
)
RETURNS VOID AS $$
DECLARE
  v_total_score INTEGER;
  v_total_wins INTEGER;
  v_total_matches INTEGER;
  v_rank INTEGER;
BEGIN
  -- Calculate aggregated stats from game_sessions
  SELECT 
    COALESCE(SUM(score), 0),
    COALESCE(SUM(CASE WHEN is_won THEN 1 ELSE 0 END), 0),
    COALESCE(COUNT(*), 0)
  INTO v_total_score, v_total_wins, v_total_matches
  FROM game_sessions
  WHERE user_id = p_user_id
    AND is_completed = true;

  -- Also get from profiles table
  SELECT 
    COALESCE(total_score, 0),
    COALESCE(total_wins, 0),
    COALESCE(total_matches, 0)
  INTO v_total_score, v_total_wins, v_total_matches
  FROM profiles
  WHERE id = p_user_id;

  -- Upsert leaderboard entry
  INSERT INTO leaderboards (
    user_id,
    leaderboard_type,
    scope,
    scope_value,
    score,
    wins,
    matches_played,
    period,
    period_start,
    period_end,
    updated_at
  )
  VALUES (
    p_user_id,
    'user',
    p_scope,
    p_scope_value,
    v_total_score,
    v_total_wins,
    v_total_matches,
    p_period,
    CASE WHEN p_period = 'all_time' THEN NULL ELSE CURRENT_DATE END,
    CASE WHEN p_period = 'all_time' THEN NULL ELSE CURRENT_DATE END,
    NOW()
  )
  ON CONFLICT (user_id, team_id, scope, scope_value, period, period_start)
  DO UPDATE SET
    score = EXCLUDED.score,
    wins = EXCLUDED.wins,
    matches_played = EXCLUDED.matches_played,
    updated_at = NOW();

  -- Recalculate ranks for this scope
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, wins DESC, updated_at ASC) as new_rank
    FROM leaderboards
    WHERE scope = p_scope
      AND (scope_value = p_scope_value OR (scope_value IS NULL AND p_scope_value IS NULL))
      AND period = p_period
      AND leaderboard_type = 'user'
  )
  UPDATE leaderboards l
  SET rank = r.new_rank
  FROM ranked_users r
  WHERE l.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- Create function to refresh all leaderboards for a user
CREATE OR REPLACE FUNCTION refresh_user_leaderboards(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_country TEXT;
  v_state TEXT;
  v_county TEXT;
  v_city TEXT;
  v_high_school TEXT;
  v_college TEXT;
  v_nonprofit TEXT;
  v_corporation TEXT;
  v_government TEXT;
  v_chapter TEXT;
BEGIN
  -- Get user's profile data
  SELECT 
    country, state, county, city,
    high_school_name, college_name,
    nonprofit_name, corporation_name,
    government_department, organization_chapter
  INTO 
    v_country, v_state, v_county, v_city,
    v_high_school, v_college,
    v_nonprofit, v_corporation,
    v_government, v_chapter
  FROM profiles
  WHERE id = p_user_id;

  -- Update global leaderboard
  PERFORM update_user_leaderboard(p_user_id, 'global', 'global', 'all_time');

  -- Update country leaderboard
  IF v_country IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'country', v_country, 'all_time');
  END IF;

  -- Update state leaderboard
  IF v_state IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'state', v_state, 'all_time');
  END IF;

  -- Update county leaderboard
  IF v_county IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'county', v_county, 'all_time');
  END IF;

  -- Update city leaderboard
  IF v_city IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'city', v_city, 'all_time');
  END IF;

  -- Update high school leaderboard
  IF v_high_school IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'high_school', v_high_school, 'all_time');
  END IF;

  -- Update college leaderboard
  IF v_college IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'college', v_college, 'all_time');
  END IF;

  -- Update nonprofit leaderboard
  IF v_nonprofit IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'nonprofit', v_nonprofit, 'all_time');
  END IF;

  -- Update corporation leaderboard
  IF v_corporation IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'corporation', v_corporation, 'all_time');
  END IF;

  -- Update government leaderboard
  IF v_government IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'government', v_government, 'all_time');
  END IF;

  -- Update chapter leaderboard
  IF v_chapter IS NOT NULL THEN
    PERFORM update_user_leaderboard(p_user_id, 'organization_chapter', v_chapter, 'all_time');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update leaderboards when game completes
CREATE OR REPLACE FUNCTION trigger_update_leaderboards()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's profile stats
  UPDATE profiles
  SET 
    total_score = total_score + NEW.score,
    total_matches = total_matches + 1,
    total_wins = total_wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  -- Refresh all leaderboards for this user
  PERFORM refresh_user_leaderboards(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_leaderboards_on_game_complete ON game_sessions;
CREATE TRIGGER update_leaderboards_on_game_complete
  AFTER INSERT OR UPDATE OF is_completed ON game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = true)
  EXECUTE FUNCTION trigger_update_leaderboards();

-- Clean up duplicate leaderboard entries (keep highest score per user)
DELETE FROM leaderboards a
USING leaderboards b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.scope = b.scope
  AND COALESCE(a.scope_value, '') = COALESCE(b.scope_value, '')
  AND a.period = b.period
  AND COALESCE(a.period_start::TEXT, '') = COALESCE(b.period_start::TEXT, '');

-- Refresh leaderboards for all existing users
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT id FROM profiles LOOP
    PERFORM refresh_user_leaderboards(v_user.id);
  END LOOP;
END $$;

COMMENT ON FUNCTION update_user_leaderboard IS 'Update a single leaderboard entry for a user';
COMMENT ON FUNCTION refresh_user_leaderboards IS 'Refresh all leaderboard entries for a user';
COMMENT ON FUNCTION trigger_update_leaderboards IS 'Trigger function to update leaderboards when game completes';
