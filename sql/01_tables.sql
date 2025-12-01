-- Fashion Match Game Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  player_type TEXT NOT NULL CHECK (player_type IN ('child', 'teen', 'adult')),
  date_of_birth DATE,
  country TEXT,
  state TEXT,
  county TEXT,
  city TEXT,
  school_name TEXT,
  school_type TEXT CHECK (school_type IN ('high_school', 'college', 'university')),
  organization_name TEXT,
  organization_type TEXT CHECK (organization_type IN ('nonprofit', 'corporation', 'government')),
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  total_score INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FASHION ITEMS
-- ============================================

-- Fashion items catalog (AI-generated and user-uploaded)
CREATE TABLE IF NOT EXISTS public.fashion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shoes', 'dresses', 'hats', 'suits', 'accessories', 'shirts', 'blouses', 'underwear', 'belts', 'ties')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source TEXT NOT NULL CHECK (source IN ('ai_generated', 'user_upload')),
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  age_appropriate_for TEXT[] DEFAULT ARRAY['child', 'teen', 'adult'],
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- User uploads tracking
CREATE TABLE IF NOT EXISTS public.user_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fashion_item_id UUID REFERENCES public.fashion_items(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  rejection_reason TEXT,
  moderation_notes TEXT,
  ai_moderation_score DECIMAL(3,2),
  ai_moderation_flags JSONB,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMES & SESSIONS
-- ============================================

-- Game configurations
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  grid_size JSONB NOT NULL, -- {rows: 4, cols: 4}
  time_limit INTEGER NOT NULL, -- seconds
  items_count INTEGER NOT NULL,
  player_type TEXT[] DEFAULT ARRAY['child', 'teen', 'adult'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual game sessions (single player)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('single_player', 'multiplayer', 'team')),
  difficulty_level INTEGER NOT NULL,
  grid_size JSONB NOT NULL,
  items_used UUID[] NOT NULL,
  score INTEGER DEFAULT 0,
  matches_completed INTEGER DEFAULT 0,
  time_taken INTEGER, -- seconds
  time_limit INTEGER,
  combo_max INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_won BOOLEAN DEFAULT FALSE,
  performance_metrics JSONB, -- {speed: 0.8, accuracy: 0.95, etc}
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- MULTIPLAYER
-- ============================================

-- Multiplayer matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_type TEXT NOT NULL CHECK (match_type IN ('pvp', 'team')),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  difficulty_level INTEGER NOT NULL,
  grid_size JSONB NOT NULL,
  items_used UUID[] NOT NULL,
  time_limit INTEGER NOT NULL,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  winning_team_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Match participants
CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID,
  score INTEGER DEFAULT 0,
  matches_completed INTEGER DEFAULT 0,
  time_taken INTEGER,
  rank INTEGER,
  is_ready BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

-- ============================================
-- TEAMS
-- ============================================

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  captain_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('captain', 'co_captain', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ============================================
-- LEADERBOARDS
-- ============================================

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('user', 'team')),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'country', 'state', 'county', 'city', 'school', 'organization')),
  scope_value TEXT, -- e.g., 'USA', 'California', 'Stanford University'
  score INTEGER NOT NULL DEFAULT 0,
  wins INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  rank INTEGER,
  period TEXT DEFAULT 'all_time' CHECK (period IN ('all_time', 'monthly', 'weekly', 'daily')),
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id, scope, scope_value, period, period_start)
);

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_scope ON public.leaderboards(user_id, scope, scope_value);
CREATE INDEX IF NOT EXISTS idx_leaderboards_team_scope ON public.leaderboards(team_id, scope, scope_value);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON public.leaderboards(scope, scope_value, rank);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Subscription records
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  plan_type TEXT DEFAULT 'annual' CHECK (plan_type IN ('annual', 'monthly')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_payment_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERFORMANCE METRICS (for AI)
-- ============================================

-- Player performance tracking for adaptive difficulty
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  avg_match_time DECIMAL(10,2), -- seconds
  accuracy_rate DECIMAL(5,4), -- 0.0 to 1.0
  combo_frequency DECIMAL(5,4),
  difficulty_level INTEGER,
  suggested_difficulty INTEGER,
  items_count INTEGER,
  grid_size JSONB,
  time_limit INTEGER,
  performance_score DECIMAL(5,2), -- overall performance rating
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODERATION
-- ============================================

-- Content moderation queue
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('upload', 'profile', 'team', 'report')),
  content_id UUID NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  ai_flags JSONB,
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- User reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_content_type TEXT CHECK (reported_content_type IN ('upload', 'profile', 'behavior')),
  reported_content_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_player_type ON public.profiles(player_type);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_status);

-- Fashion items indexes
CREATE INDEX IF NOT EXISTS idx_fashion_items_category ON public.fashion_items(category);
CREATE INDEX IF NOT EXISTS idx_fashion_items_approved ON public.fashion_items(is_approved, is_active);
CREATE INDEX IF NOT EXISTS idx_fashion_items_uploader ON public.fashion_items(uploader_id);

-- Game sessions indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_mode ON public.game_sessions(game_mode);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON public.game_sessions(is_completed, started_at);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created ON public.matches(created_at);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_captain ON public.teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON public.subscriptions(expires_at);