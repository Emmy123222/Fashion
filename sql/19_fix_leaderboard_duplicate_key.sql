-- Fix for duplicate key error in leaderboards
-- Error: duplicate key value violates unique constraint "idx_leaderboards_user_unique"
-- Root cause: The UNIQUE constraint includes period_start which can be NULL, causing issues

-- ============================================
-- PART 1: Drop the problematic constraint
-- ============================================

-- Drop the existing unique constraint
ALTER TABLE public.leaderboards 
DROP CONSTRAINT IF EXISTS leaderboards_user_id_team_id_scope_scope_value_period_period_st_key;

-- ============================================
-- PART 2: Add a better unique constraint
-- ============================================

-- Create a unique index that handles NULLs properly
-- This allows multiple NULL values for team_id and period_start
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboards_user_unique
ON public.leaderboards (
  COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
  COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
  scope,
  COALESCE(scope_value, ''),
  period,
  COALESCE(period_start, '1970-01-01'::date)
)
WHERE leaderboard_type = 'user';

-- ============================================
-- PART 3: Clean up any existing duplicates
-- ============================================

-- Delete duplicate entries, keeping only the most recent one
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY 
        user_id, 
        team_id, 
        scope, 
        scope_value, 
        period, 
        period_start
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM public.leaderboards
  WHERE leaderboard_type = 'user'
)
DELETE FROM public.leaderboards
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- ============================================
-- PART 4: Update the trigger function to use UPSERT properly
-- ============================================

CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    -- Get user profile data
    SELECT * INTO user_profile FROM public.profiles WHERE id = NEW.user_id;
    
    -- Update global leaderboard using UPSERT
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
      NEW.score, 
      CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
      1,
      'all_time',
      NULL
    )
    ON CONFLICT (
      COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
      COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
      scope,
      COALESCE(scope_value, ''),
      period,
      COALESCE(period_start, '1970-01-01'::date)
    )
    WHERE leaderboard_type = 'user'
    DO UPDATE SET
      score = public.leaderboards.score + EXCLUDED.score,
      wins = public.leaderboards.wins + EXCLUDED.wins,
      matches_played = public.leaderboards.matches_played + EXCLUDED.matches_played,
      updated_at = NOW();
    
    -- Update country leaderboard
    IF user_profile.country IS NOT NULL THEN
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
        'country', 
        user_profile.country, 
        NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (
        COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
        COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
        scope,
        COALESCE(scope_value, ''),
        period,
        COALESCE(period_start, '1970-01-01'::date)
      )
      WHERE leaderboard_type = 'user'
      DO UPDATE SET
        score = public.leaderboards.score + EXCLUDED.score,
        wins = public.leaderboards.wins + EXCLUDED.wins,
        matches_played = public.leaderboards.matches_played + EXCLUDED.matches_played,
        updated_at = NOW();
    END IF;
    
    -- Update state leaderboard
    IF user_profile.state IS NOT NULL THEN
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
        'state', 
        user_profile.state, 
        NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (
        COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
        COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
        scope,
        COALESCE(scope_value, ''),
        period,
        COALESCE(period_start, '1970-01-01'::date)
      )
      WHERE leaderboard_type = 'user'
      DO UPDATE SET
        score = public.leaderboards.score + EXCLUDED.score,
        wins = public.leaderboards.wins + EXCLUDED.wins,
        matches_played = public.leaderboards.matches_played + EXCLUDED.matches_played,
        updated_at = NOW();
    END IF;
    
    -- Update city leaderboard
    IF user_profile.city IS NOT NULL THEN
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
        'city', 
        user_profile.city, 
        NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (
        COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
        COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
        scope,
        COALESCE(scope_value, ''),
        period,
        COALESCE(period_start, '1970-01-01'::date)
      )
      WHERE leaderboard_type = 'user'
      DO UPDATE SET
        score = public.leaderboards.score + EXCLUDED.score,
        wins = public.leaderboards.wins + EXCLUDED.wins,
        matches_played = public.leaderboards.matches_played + EXCLUDED.matches_played,
        updated_at = NOW();
    END IF;
    
    -- Update school leaderboard
    IF user_profile.school_name IS NOT NULL THEN
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
        'school', 
        user_profile.school_name, 
        NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (
        COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
        COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
        scope,
        COALESCE(scope_value, ''),
        period,
        COALESCE(period_start, '1970-01-01'::date)
      )
      WHERE leaderboard_type = 'user'
      DO UPDATE SET
        score = public.leaderboards.score + EXCLUDED.score,
        wins = public.leaderboards.wins + EXCLUDED.wins,
        matches_played = public.leaderboards.matches_played + EXCLUDED.matches_played,
        updated_at = NOW();
    END IF;
    
    -- Update organization leaderboard
    IF user_profile.organization_name IS NOT NULL THEN
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
        'organization', 
        user_profile.organization_name, 
        NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 
        1,
        'all_time',
        NULL
      )
      ON CONFLICT (
        COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
        COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
        scope,
        COALESCE(scope_value, ''),
        period,
        COALESCE(period_start, '1970-01-01'::date)
      )
      WHERE leaderboard_type = 'user'
      DO UPDATE SET
        score = public.leaderboards.score + EXCLUDED.score,
        wins = public.leaderboards.wins + EXCLUDED.wins,
        matches_played = public.leaderboards.matches_played + EXCLUDED.matches_played,
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_game_completed_update_leaderboard ON public.game_sessions;
CREATE TRIGGER on_game_completed_update_leaderboard
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION update_leaderboard();

-- Success message
SELECT '✅ Leaderboard duplicate key fix applied!' as message;
SELECT 'The unique constraint has been updated to handle NULLs properly' as status;
SELECT 'Existing duplicates have been cleaned up' as cleanup;
SELECT 'Trigger function updated to use proper UPSERT' as trigger_status;
