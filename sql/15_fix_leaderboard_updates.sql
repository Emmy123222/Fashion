-- Fix Leaderboard Updates and Profile Stats
-- This fixes the triggers to properly update leaderboards and profile stats when games complete

-- ============================================
-- FIX 1: Update Profile Stats Trigger
-- ============================================

-- Drop and recreate the profile stats function with better logic
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
-- FIX 2: Update Leaderboard Trigger
-- ============================================

-- Drop and recreate the leaderboard update function with proper NULL handling
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
    
    -- Update global leaderboard (all_time)
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
      NEW.user_id,
      'user', 
      'global', 
      'global', 
      COALESCE(NEW.score, 0),
      CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
      1,
      'all_time',
      NULL
    )
    ON CONFLICT ON CONSTRAINT idx_leaderboards_user_unique
    DO UPDATE SET
      score = public.leaderboards.score + COALESCE(NEW.score, 0),
      wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
      matches_played = public.leaderboards.matches_played + 1,
      updated_at = NOW();
    
    RAISE NOTICE 'Global leaderboard updated';
    
    -- Update country leaderboard
    IF user_profile.country IS NOT NULL AND user_profile.country != '' THEN
      INSERT INTO public.leaderboards (
        user_id, 
        team_id,
        leaderboard_type, 
        scope, 
        scope_value, 
        score, 
        wins, 
        matches_played,
        period,
        period_start
      ) VALUES (
        NEW.user_id,
        NULL,
        'user', 
        'country', 
        user_profile.country, 
        COALESCE(NEW.score, 0),
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
      DO UPDATE SET
        score = public.leaderboards.score + COALESCE(NEW.score, 0),
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
      
      RAISE NOTICE 'Country leaderboard updated for %', user_profile.country;
    END IF;
    
    -- Update state leaderboard
    IF user_profile.state IS NOT NULL AND user_profile.state != '' THEN
      INSERT INTO public.leaderboards (
        user_id, 
        team_id,
        leaderboard_type, 
        scope, 
        scope_value, 
        score, 
        wins, 
        matches_played,
        period,
        period_start
      ) VALUES (
        NEW.user_id,
        NULL,
        'user', 
        'state', 
        user_profile.state, 
        COALESCE(NEW.score, 0),
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
      DO UPDATE SET
        score = public.leaderboards.score + COALESCE(NEW.score, 0),
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
      
      RAISE NOTICE 'State leaderboard updated for %', user_profile.state;
    END IF;
    
    -- Update city leaderboard
    IF user_profile.city IS NOT NULL AND user_profile.city != '' THEN
      INSERT INTO public.leaderboards (
        user_id, 
        team_id,
        leaderboard_type, 
        scope, 
        scope_value, 
        score, 
        wins, 
        matches_played,
        period,
        period_start
      ) VALUES (
        NEW.user_id,
        NULL,
        'user', 
        'city', 
        user_profile.city, 
        COALESCE(NEW.score, 0),
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
      DO UPDATE SET
        score = public.leaderboards.score + COALESCE(NEW.score, 0),
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
      
      RAISE NOTICE 'City leaderboard updated for %', user_profile.city;
    END IF;
    
    -- Update county leaderboard
    IF user_profile.county IS NOT NULL AND user_profile.county != '' THEN
      INSERT INTO public.leaderboards (
        user_id, 
        team_id,
        leaderboard_type, 
        scope, 
        scope_value, 
        score, 
        wins, 
        matches_played,
        period,
        period_start
      ) VALUES (
        NEW.user_id,
        NULL,
        'user', 
        'county', 
        user_profile.county, 
        COALESCE(NEW.score, 0),
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
      DO UPDATE SET
        score = public.leaderboards.score + COALESCE(NEW.score, 0),
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
      
      RAISE NOTICE 'County leaderboard updated for %', user_profile.county;
    END IF;
    
    -- Update school leaderboard
    IF user_profile.school_name IS NOT NULL AND user_profile.school_name != '' THEN
      INSERT INTO public.leaderboards (
        user_id, 
        team_id,
        leaderboard_type, 
        scope, 
        scope_value, 
        score, 
        wins, 
        matches_played,
        period,
        period_start
      ) VALUES (
        NEW.user_id,
        NULL,
        'user', 
        'school', 
        user_profile.school_name, 
        COALESCE(NEW.score, 0),
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
      DO UPDATE SET
        score = public.leaderboards.score + COALESCE(NEW.score, 0),
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
      
      RAISE NOTICE 'School leaderboard updated for %', user_profile.school_name;
    END IF;
    
    -- Update organization leaderboard
    IF user_profile.organization_name IS NOT NULL AND user_profile.organization_name != '' THEN
      INSERT INTO public.leaderboards (
        user_id, 
        team_id,
        leaderboard_type, 
        scope, 
        scope_value, 
        score, 
        wins, 
        matches_played,
        period,
        period_start
      ) VALUES (
        NEW.user_id,
        NULL,
        'user', 
        'organization', 
        user_profile.organization_name, 
        COALESCE(NEW.score, 0),
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
      DO UPDATE SET
        score = public.leaderboards.score + COALESCE(NEW.score, 0),
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
      
      RAISE NOTICE 'Organization leaderboard updated for %', user_profile.organization_name;
    END IF;
    
    RAISE NOTICE 'All leaderboards updated successfully for user %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIX 3: Recalculate Ranks Function
-- ============================================

-- Function to recalculate ranks for all leaderboards
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
-- FIX 4: Ensure Triggers Are Active
-- ============================================

-- Drop and recreate triggers to ensure they're active
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

-- ============================================
-- FIX 5: Backfill Existing Data (Optional)
-- ============================================

-- This will update profile stats and leaderboards for all completed games
-- Run this if you have existing game sessions that weren't counted

-- Uncomment the following to backfill:
/*
DO $$
DECLARE
  game_record RECORD;
BEGIN
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
    
    RAISE NOTICE 'Backfilled game session % for user %', game_record.id, game_record.user_id;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete. Recalculating leaderboard ranks...';
  PERFORM recalculate_all_leaderboard_ranks();
  RAISE NOTICE 'Done!';
END $$;
*/

-- Success message
SELECT 'Leaderboard and profile stats triggers fixed successfully!' as message;
SELECT 'Run recalculate_all_leaderboard_ranks() to update all ranks' as next_step;
