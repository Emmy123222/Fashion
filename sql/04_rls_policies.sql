-- Fashion Match Game - Row Level Security Policies

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- FASHION ITEMS POLICIES
-- ============================================

-- Everyone can view approved fashion items
CREATE POLICY "Approved fashion items are viewable by everyone"
  ON public.fashion_items FOR SELECT
  USING (is_approved = true AND is_active = true);

-- Admins can view all fashion items
CREATE POLICY "Admins can view all fashion items"
  ON public.fashion_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
  ON public.fashion_items FOR SELECT
  USING (uploader_id = auth.uid());

-- Admins can insert fashion items
CREATE POLICY "Admins can insert fashion items"
  ON public.fashion_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update fashion items
CREATE POLICY "Admins can update fashion items"
  ON public.fashion_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- USER UPLOADS POLICIES
-- ============================================

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
  ON public.user_uploads FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all uploads
CREATE POLICY "Admins can view all uploads"
  ON public.user_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can insert their own uploads
CREATE POLICY "Users can insert own uploads"
  ON public.user_uploads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can update uploads (for approval)
CREATE POLICY "Admins can update uploads"
  ON public.user_uploads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- GAMES POLICIES
-- ============================================

-- Everyone can view active games
CREATE POLICY "Active games are viewable by everyone"
  ON public.games FOR SELECT
  USING (is_active = true);

-- Admins can manage games
CREATE POLICY "Admins can manage games"
  ON public.games FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- GAME SESSIONS POLICIES
-- ============================================

-- Users can view their own game sessions
CREATE POLICY "Users can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own game sessions
CREATE POLICY "Users can insert own game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own game sessions
CREATE POLICY "Users can update own game sessions"
  ON public.game_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can view all game sessions
CREATE POLICY "Admins can view all game sessions"
  ON public.game_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- MATCHES POLICIES
-- ============================================

-- Users can view matches they're participating in
CREATE POLICY "Users can view their matches"
  ON public.matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.match_participants
      WHERE match_id = matches.id AND user_id = auth.uid()
    )
  );

-- Users can view waiting matches (for matchmaking)
CREATE POLICY "Users can view waiting matches"
  ON public.matches FOR SELECT
  USING (status = 'waiting');

-- Users can create matches
CREATE POLICY "Users can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

-- Users can update matches they're in
CREATE POLICY "Users can update their matches"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.match_participants
      WHERE match_id = matches.id AND user_id = auth.uid()
    )
  );

-- ============================================
-- MATCH PARTICIPANTS POLICIES
-- ============================================

-- Users can view participants in their matches
CREATE POLICY "Users can view match participants"
  ON public.match_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.match_participants mp
      WHERE mp.match_id = match_participants.match_id
        AND mp.user_id = auth.uid()
    )
  );

-- Users can join matches
CREATE POLICY "Users can join matches"
  ON public.match_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own participation
CREATE POLICY "Users can update own participation"
  ON public.match_participants FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- TEAMS POLICIES
-- ============================================

-- Everyone can view active teams
CREATE POLICY "Active teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (is_active = true);

-- Users can create teams
CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (captain_id = auth.uid());

-- Team captains can update their teams
CREATE POLICY "Captains can update their teams"
  ON public.teams FOR UPDATE
  USING (captain_id = auth.uid());

-- ============================================
-- TEAM MEMBERS POLICIES
-- ============================================

-- Everyone can view team members
CREATE POLICY "Team members are viewable by everyone"
  ON public.team_members FOR SELECT
  USING (true);

-- Users can join teams
CREATE POLICY "Users can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can leave teams
CREATE POLICY "Users can leave teams"
  ON public.team_members FOR DELETE
  USING (user_id = auth.uid());

-- Team captains can manage members
CREATE POLICY "Captains can manage team members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_members.team_id AND captain_id = auth.uid()
    )
  );

-- ============================================
-- LEADERBOARDS POLICIES
-- ============================================

-- Everyone can view leaderboards
CREATE POLICY "Leaderboards are viewable by everyone"
  ON public.leaderboards FOR SELECT
  USING (true);

-- System can insert/update leaderboards (via triggers)
CREATE POLICY "System can manage leaderboards"
  ON public.leaderboards FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- System can manage subscriptions (via backend)
CREATE POLICY "System can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- System can manage payments
CREATE POLICY "System can manage payments"
  ON public.payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PERFORMANCE METRICS POLICIES
-- ============================================

-- Users can view their own metrics
CREATE POLICY "Users can view own metrics"
  ON public.performance_metrics FOR SELECT
  USING (user_id = auth.uid());

-- System can insert metrics
CREATE POLICY "System can insert metrics"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all metrics
CREATE POLICY "Admins can view all metrics"
  ON public.performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- MODERATION QUEUE POLICIES
-- ============================================

-- Admins can view moderation queue
CREATE POLICY "Admins can view moderation queue"
  ON public.moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can manage moderation queue
CREATE POLICY "Admins can manage moderation queue"
  ON public.moderation_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- System can insert into moderation queue
CREATE POLICY "System can insert into moderation queue"
  ON public.moderation_queue FOR INSERT
  WITH CHECK (true);

-- ============================================
-- REPORTS POLICIES
-- ============================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (reporter_id = auth.uid());

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
