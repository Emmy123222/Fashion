-- Fix Leaderboard Unique Constraint
-- The original UNIQUE constraint doesn't handle NULL team_id properly
-- This creates separate constraints for user and team leaderboards

-- ============================================
-- STEP 1: Remove Duplicates
-- ============================================

-- First, let's see what duplicates exist
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date) as ps, COUNT(*) as cnt
    FROM public.leaderboards
    WHERE team_id IS NULL AND leaderboard_type = 'user'
    GROUP BY user_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date)
    HAVING COUNT(*) > 1
  ) dups;
  
  RAISE NOTICE 'Found % duplicate user leaderboard entries', duplicate_count;
END $$;

-- Remove duplicates, keeping the one with highest score
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

-- ============================================
-- STEP 2: Drop old constraint
-- ============================================

-- Drop the old unique constraint
ALTER TABLE public.leaderboards 
DROP CONSTRAINT IF EXISTS leaderboards_user_id_team_id_scope_scope_value_period_period_st_key;

-- ============================================
-- STEP 3: Create new unique indexes
-- ============================================

-- Create a unique constraint for user leaderboards (team_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboards_user_unique
ON public.leaderboards (user_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
WHERE team_id IS NULL AND leaderboard_type = 'user';

-- Create a unique constraint for team leaderboards (user_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboards_team_unique
ON public.leaderboards (team_id, scope, scope_value, period, COALESCE(period_start, '1970-01-01'::date))
WHERE user_id IS NULL AND leaderboard_type = 'team';

-- ============================================
-- STEP 4: Add check constraint
-- ============================================

-- Add check constraint to ensure either user_id or team_id is set (not both)
ALTER TABLE public.leaderboards
DROP CONSTRAINT IF EXISTS check_user_or_team;

ALTER TABLE public.leaderboards
ADD CONSTRAINT check_user_or_team CHECK (
  (user_id IS NOT NULL AND team_id IS NULL AND leaderboard_type = 'user') OR
  (user_id IS NULL AND team_id IS NOT NULL AND leaderboard_type = 'team')
);

-- Success message
SELECT 'Leaderboard unique constraints fixed!' as message;
SELECT 'Duplicates removed and unique indexes created' as details;
