-- Fashion Match Game - Functions and Triggers

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILE FUNCTIONS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, player_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'player_type', 'adult')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile stats after game
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE THEN
    UPDATE public.profiles
    SET 
      total_score = total_score + NEW.score,
      total_matches = total_matches + 1,
      total_wins = total_wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
      win_streak = CASE 
        WHEN NEW.is_won THEN win_streak + 1 
        ELSE 0 
      END,
      best_time = CASE
        WHEN best_time IS NULL OR NEW.time_taken < best_time THEN NEW.time_taken
        ELSE best_time
      END,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile stats
DROP TRIGGER IF EXISTS on_game_session_completed ON public.game_sessions;
CREATE TRIGGER on_game_session_completed
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION update_profile_stats();

-- ============================================
-- LEADERBOARD FUNCTIONS
-- ============================================

-- Function to update leaderboard after game
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
BEGIN
  IF NEW.is_completed = TRUE THEN
    -- Get user profile data
    SELECT * INTO user_profile FROM public.profiles WHERE id = NEW.user_id;
    
    -- Update global leaderboard
    INSERT INTO public.leaderboards (
      user_id, leaderboard_type, scope, scope_value, score, wins, matches_played
    ) VALUES (
      NEW.user_id, 'user', 'global', 'global', NEW.score, 
      CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 1
    )
    ON CONFLICT (user_id, team_id, scope, scope_value, period, period_start)
    DO UPDATE SET
      score = public.leaderboards.score + NEW.score,
      wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
      matches_played = public.leaderboards.matches_played + 1,
      updated_at = NOW();
    
    -- Update country leaderboard
    IF user_profile.country IS NOT NULL THEN
      INSERT INTO public.leaderboards (
        user_id, leaderboard_type, scope, scope_value, score, wins, matches_played
      ) VALUES (
        NEW.user_id, 'user', 'country', user_profile.country, NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 1
      )
      ON CONFLICT (user_id, team_id, scope, scope_value, period, period_start)
      DO UPDATE SET
        score = public.leaderboards.score + NEW.score,
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
    END IF;
    
    -- Update state leaderboard
    IF user_profile.state IS NOT NULL THEN
      INSERT INTO public.leaderboards (
        user_id, leaderboard_type, scope, scope_value, score, wins, matches_played
      ) VALUES (
        NEW.user_id, 'user', 'state', user_profile.state, NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 1
      )
      ON CONFLICT (user_id, team_id, scope, scope_value, period, period_start)
      DO UPDATE SET
        score = public.leaderboards.score + NEW.score,
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
    END IF;
    
    -- Update city leaderboard
    IF user_profile.city IS NOT NULL THEN
      INSERT INTO public.leaderboards (
        user_id, leaderboard_type, scope, scope_value, score, wins, matches_played
      ) VALUES (
        NEW.user_id, 'user', 'city', user_profile.city, NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 1
      )
      ON CONFLICT (user_id, team_id, scope, scope_value, period, period_start)
      DO UPDATE SET
        score = public.leaderboards.score + NEW.score,
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
    END IF;
    
    -- Update school leaderboard
    IF user_profile.school_name IS NOT NULL THEN
      INSERT INTO public.leaderboards (
        user_id, leaderboard_type, scope, scope_value, score, wins, matches_played
      ) VALUES (
        NEW.user_id, 'user', 'school', user_profile.school_name, NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 1
      )
      ON CONFLICT (user_id, team_id, scope, scope_value, period, period_start)
      DO UPDATE SET
        score = public.leaderboards.score + NEW.score,
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
    END IF;
    
    -- Update organization leaderboard
    IF user_profile.organization_name IS NOT NULL THEN
      INSERT INTO public.leaderboards (
        user_id, leaderboard_type, scope, scope_value, score, wins, matches_played
      ) VALUES (
        NEW.user_id, 'user', 'organization', user_profile.organization_name, NEW.score,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END, 1
      )
      ON CONFLICT (user_id, team_id, scope, scope_value, period, period_start)
      DO UPDATE SET
        score = public.leaderboards.score + NEW.score,
        wins = public.leaderboards.wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        matches_played = public.leaderboards.matches_played + 1,
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboards
DROP TRIGGER IF EXISTS on_game_completed_update_leaderboard ON public.game_sessions;
CREATE TRIGGER on_game_completed_update_leaderboard
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION update_leaderboard();

-- Function to recalculate leaderboard ranks
CREATE OR REPLACE FUNCTION recalculate_leaderboard_ranks(
  p_scope TEXT,
  p_scope_value TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, wins DESC, matches_played ASC) as new_rank
    FROM public.leaderboards
    WHERE scope = p_scope
      AND (p_scope_value IS NULL OR scope_value = p_scope_value)
      AND leaderboard_type = 'user'
  )
  UPDATE public.leaderboards l
  SET rank = r.new_rank
  FROM ranked_users r
  WHERE l.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEAM FUNCTIONS
-- ============================================

-- Function to update team stats
CREATE OR REPLACE FUNCTION update_team_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_team_id UUID;
BEGIN
  IF NEW.is_completed = TRUE AND NEW.game_mode = 'team' THEN
    -- Get team_id from match_participants for the most recent match
    SELECT mp.team_id INTO v_team_id
    FROM public.match_participants mp
    INNER JOIN public.matches m ON m.id = mp.match_id
    WHERE mp.user_id = NEW.user_id
      AND mp.team_id IS NOT NULL
    ORDER BY m.created_at DESC
    LIMIT 1;
    
    IF v_team_id IS NOT NULL THEN
      UPDATE public.teams
      SET
        total_score = total_score + NEW.score,
        total_matches = total_matches + 1,
        total_wins = total_wins + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        updated_at = NOW()
      WHERE id = v_team_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update team stats
DROP TRIGGER IF EXISTS on_team_game_completed ON public.game_sessions;
CREATE TRIGGER on_team_game_completed
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE AND NEW.game_mode = 'team')
  EXECUTE FUNCTION update_team_stats();

-- ============================================
-- FASHION ITEMS FUNCTIONS
-- ============================================

-- Function to increment fashion item usage
CREATE OR REPLACE FUNCTION increment_fashion_item_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE THEN
    UPDATE public.fashion_items
    SET usage_count = usage_count + 1
    WHERE id = ANY(NEW.items_used);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track fashion item usage
DROP TRIGGER IF EXISTS on_game_completed_track_items ON public.game_sessions;
CREATE TRIGGER on_game_completed_track_items
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
  EXECUTE FUNCTION increment_fashion_item_usage();

-- ============================================
-- SUBSCRIPTION FUNCTIONS
-- ============================================

-- Function to check and update subscription status
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS void AS $$
BEGIN
  -- Update expired subscriptions
  UPDATE public.subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
  
  -- Update profile subscription status
  UPDATE public.profiles p
  SET 
    subscription_status = CASE
      WHEN EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = p.id
          AND s.status = 'active'
          AND s.expires_at > NOW()
      ) THEN 'premium'
      ELSE 'free'
    END,
    subscription_expires_at = (
      SELECT expires_at FROM public.subscriptions s
      WHERE s.user_id = p.id
        AND s.status = 'active'
      ORDER BY expires_at DESC
      LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();