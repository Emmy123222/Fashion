-- Fix Leaderboard Updates and Profile Stats (Version 2 - Simplified)
-- This fixes the triggers to properly update leaderboards and profile stats when games complete

-- ============================================
-- FIX 1: Update Profile Stats Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    UPDATE public.profiles
    SET 
      total_score = COALESCE(total_score, 0) + COALESCE(NEW.score, 0),
      total_matches = COALESCE(total_matches, 0) + 1,
      total_wins = COALESCE(total_wins, 0) + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
      win_streak = CASE 
        WHEN NEW.is_won THEN COALESCE(win_streak, 0) + 1 
        ELSE 0 
      END,
      best_time = CASE
        WHEN best_time IS NULL OR (NEW.time_taken IS NOT NULL AND NEW.time_taken < best_time) 
        THEN NEW.time_taken
        ELSE best_time
      END,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RAISE NOTICE 'Profile stats updated for user %', NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIX 2: Helper Function to Upsert Leaderboard
-- ============================================

CREATE OR REPLACE FUNCTION upsert_user_leaderboard(
  p_user_id UUID,
  p_scope TEXT,
  p_scope_value TEXT,
  p_score INTEGER,
  p_wins INTEGER
)
RETURNS void AS $$
BEGIN
  -- Try to update existing entry
  UPDATE public.leaderboards
  SET 
    score = score + p_score,
    wins = wins + p_wins,
    matches_played = matches_played + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND scope = p_scope
    AND scope_value = p_scope_value
    AND period = 'all_time'
    AND leaderboard_type = 'user';
  
  -- If no row was updated, insert new one
  IF NOT FOUND THEN
    INSERT INTO public.leaderboards (
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
      p_user_id,
      'user',
      p_scope,
      p_scope_value,
      p_score,
      p_wins,
      1,
      'all_time',
      NULL
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIX 3: Update Leaderboard Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  v_score INTEGER;
  v_wins INTEGER;
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    -- Get user profile data
    SELECT * INTO user_profile FROM public.profiles WHERE id = NEW.user_id;
    
    IF user_profile IS NULL THEN
      RAISE NOTICE 'User profile not found for user_id %', NEW.user_id;
      RETURN NEW;
    END IF;
    
    v_score := COALESCE(NEW.score, 0);
    v_wins := CASE WHEN NEW.is_won THEN 1 ELSE 0 END;
    
    RAISE NOTICE 'Updating leaderboards for user % with score %', NEW.user_id, v_score;
    
    -- Update global leaderboard
    PERFORM upsert_user_leaderboard(NEW.user_id, 'global', 'global', v_score, v_wins);
    RAISE NOTICE 'Global leaderboard updated';
    
    -- Update country leaderboard
    IF user_profile.country IS NOT NULL AND user_profile.country != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'country', user_profile.country, v_score, v_wins);
      RAISE NOTICE 'Country leaderboard updated for %', user_profile.country;
    END IF;
    
    -- Update state leaderboard
    IF user_profile.state IS NOT NULL AND user_profile.state != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'state', user_profile.state, v_score, v_wins);
      RAISE NOTICE 'State leaderboard updated for %', user_profile.state;
    END IF;
    
    -- Update county leaderboard
    IF user_profile.county IS NOT NULL AND user_profile.county != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'county', user_profile.county, v_score, v_wins);
      RAISE NOTICE 'County leaderboard updated for %', user_profile.county;
    END IF;
    
    -- Update city leaderboard
    IF user_profile.city IS NOT NULL AND user_profile.city != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'city', user_profile.city, v_score, v_wins);
      RAISE NOTICE 'City leaderboard updated for %', user_profile.city;
    END IF;
    
    -- Update school leaderboard
    IF user_profile.school_name IS NOT NULL AND user_profile.school_name != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'school', user_profile.school_name, v_score, v_wins);
      RAISE NOTICE 'School leaderboard updated for %', user_profile.school_name;
    END IF;
    
    -- Update organization leaderboard
    IF user_profile.organization_name IS NOT NULL AND user_profile.organization_name != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'organization', user_profile.organization_name, v_score, v_wins);
      RAISE NOTICE 'Organization leaderboard updated for %', user_profile.organization_name;
    END IF;
    
    RAISE NOTICE 'All leaderboards updated successfully for user %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIX 4: Recalculate Ranks Function
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_all_leaderboard_ranks()
RETURNS void AS $$
BEGIN
  -- Recalculate ranks for each scope
  WITH ranked_entries AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY scope, scope_value, period, leaderboard_type
        ORDER BY score DESC, wins DESC, matches_played ASC, updated_at ASC
      ) as new_rank
    FROM public.leaderboards
    WHERE leaderboard_type = 'user'
  )
  UPDATE public.leaderboards l
  SET rank = r.new_rank, updated_at = NOW()
  FROM ranked_entries r
  WHERE l.id = r.id;
  
  RAISE NOTICE 'All leaderboard ranks recalculated';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIX 5: Ensure Triggers Are Active
-- ============================================

DROP TRIGGER IF EXISTS on_game_session_completed ON public.game_sessions;
CREATE TRIGGER on_game_session_completed
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION update_profile_stats();

DROP TRIGGER IF EXISTS on_game_completed_update_leaderboard ON public.game_sessions;
CREATE TRIGGER on_game_completed_update_leaderboard
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION update_leaderboard();

-- Success message
SELECT 'Leaderboard and profile stats triggers fixed successfully!' as message;
SELECT 'Triggers are now active and will update on game completion' as status;
SELECT 'Run: SELECT recalculate_all_leaderboard_ranks(); to update existing ranks' as next_step;
