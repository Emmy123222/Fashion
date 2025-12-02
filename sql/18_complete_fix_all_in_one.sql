-- Complete Fix - All in One
-- This script does everything needed to fix leaderboards and profile stats
-- Run this ONCE in Supabase SQL Editor

-- ============================================
-- PART 1: Clean Up Duplicates
-- ============================================

DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date) as ps, COUNT(*) as cnt
    FROM public.leaderboards
    WHERE team_id IS NULL AND leaderboard_type = 'user'
    GROUP BY user_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date)
    HAVING COUNT(*) > 1
  ) dups;
  
  RAISE NOTICE 'Found % duplicate entries', duplicate_count;
  
  -- Remove duplicates, keeping highest score
  DELETE FROM public.leaderboards
  WHERE id IN (
    SELECT id
    FROM (
      SELECT 
        id,
        ROW_NUMBER() OVER (
          PARTITION BY user_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date)
          ORDER BY score DESC, wins DESC, updated_at DESC
        ) as rn
      FROM public.leaderboards
      WHERE team_id IS NULL AND leaderboard_type = 'user'
    ) ranked
    WHERE rn > 1
  );
  
  RAISE NOTICE 'Duplicates removed';
END $$;

-- ============================================
-- PART 2: Fix Constraints
-- ============================================

-- Drop old constraint
ALTER TABLE public.leaderboards 
DROP CONSTRAINT IF EXISTS leaderboards_user_id_team_id_scope_scope_value_period_period_st_key;

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_leaderboards_user_unique;
DROP INDEX IF EXISTS idx_leaderboards_team_unique;

-- Create new unique indexes
CREATE UNIQUE INDEX idx_leaderboards_user_unique
ON public.leaderboards (user_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
WHERE team_id IS NULL AND leaderboard_type = 'user';

CREATE UNIQUE INDEX idx_leaderboards_team_unique
ON public.leaderboards (team_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
WHERE user_id IS NULL AND leaderboard_type = 'team';

-- Add check constraint
ALTER TABLE public.leaderboards
DROP CONSTRAINT IF EXISTS check_user_or_team;

ALTER TABLE public.leaderboards
ADD CONSTRAINT check_user_or_team CHECK (
  (user_id IS NOT NULL AND team_id IS NULL AND leaderboard_type = 'user') OR
  (user_id IS NULL AND team_id IS NOT NULL AND leaderboard_type = 'team')
);

-- ============================================
-- PART 3: Create Helper Function
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
-- PART 4: Create Profile Stats Trigger
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

DROP TRIGGER IF EXISTS on_game_session_completed ON public.game_sessions;
CREATE TRIGGER on_game_session_completed
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION update_profile_stats();

-- ============================================
-- PART 5: Create Leaderboard Update Trigger
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
    
    -- Update country leaderboard
    IF user_profile.country IS NOT NULL AND user_profile.country != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'country', user_profile.country, v_score, v_wins);
    END IF;
    
    -- Update state leaderboard
    IF user_profile.state IS NOT NULL AND user_profile.state != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'state', user_profile.state, v_score, v_wins);
    END IF;
    
    -- Update county leaderboard
    IF user_profile.county IS NOT NULL AND user_profile.county != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'county', user_profile.county, v_score, v_wins);
    END IF;
    
    -- Update city leaderboard
    IF user_profile.city IS NOT NULL AND user_profile.city != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'city', user_profile.city, v_score, v_wins);
    END IF;
    
    -- Update school leaderboard
    IF user_profile.school_name IS NOT NULL AND user_profile.school_name != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'school', user_profile.school_name, v_score, v_wins);
    END IF;
    
    -- Update organization leaderboard
    IF user_profile.organization_name IS NOT NULL AND user_profile.organization_name != '' THEN
      PERFORM upsert_user_leaderboard(NEW.user_id, 'organization', user_profile.organization_name, v_score, v_wins);
    END IF;
    
    RAISE NOTICE 'All leaderboards updated for user %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_game_completed_update_leaderboard ON public.game_sessions;
CREATE TRIGGER on_game_completed_update_leaderboard
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION update_leaderboard();

-- ============================================
-- PART 6: Create Rank Recalculation Function
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_all_leaderboard_ranks()
RETURNS void AS $$
BEGIN
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
-- PART 7: Recalculate Ranks
-- ============================================

SELECT recalculate_all_leaderboard_ranks();

-- ============================================
-- PART 8: Verification
-- ============================================

-- Check triggers
SELECT 
  'Triggers installed: ' || COUNT(*)::text as status
FROM information_schema.triggers
WHERE trigger_name IN (
  'on_game_session_completed',
  'on_game_completed_update_leaderboard'
);

-- Check functions
SELECT 
  'Functions installed: ' || COUNT(*)::text as status
FROM information_schema.routines
WHERE routine_name IN (
  'update_profile_stats',
  'update_leaderboard',
  'upsert_user_leaderboard',
  'recalculate_all_leaderboard_ranks'
);

-- ============================================
-- PART 9: Create Performance Metrics Table (Optional)
-- ============================================

-- Create performance_metrics table for AI analysis
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID, -- Keep for backward compatibility
  avg_match_time DECIMAL,
  accuracy DECIMAL,
  hesitation_count INTEGER,
  combo_max INTEGER,
  difficulty_level INTEGER,
  category TEXT,
  performance_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.performance_metrics;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON public.performance_metrics;

-- RLS Policies
CREATE POLICY "Users can view their own metrics"
  ON public.performance_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON public.performance_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.performance_metrics TO authenticated;
GRANT ALL ON public.performance_metrics TO service_role;

-- Success message
SELECT '✅ Complete fix applied successfully!' as message;
SELECT 'Triggers are active and will update on next game completion' as status;
SELECT 'Performance metrics table created' as bonus;
SELECT 'Play a game to test!' as next_step;
