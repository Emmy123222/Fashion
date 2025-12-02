-- Fix RLS Policies for Reward System Tables
-- Run this to allow users to access their own reward data

-- Enable RLS on reward tables (these are the correct table names from 09_reward_system.sql)
ALTER TABLE user_fashion_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlock_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own collection" ON user_fashion_collection;
DROP POLICY IF EXISTS "Users can insert their own collection items" ON user_fashion_collection;
DROP POLICY IF EXISTS "System can insert collection items" ON user_fashion_collection;

DROP POLICY IF EXISTS "Users can view their own progress" ON unlock_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON unlock_progress;
DROP POLICY IF EXISTS "System can manage progress" ON unlock_progress;

-- User Fashion Collection Policies
CREATE POLICY "Users can view their own collection"
  ON user_fashion_collection
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collection items"
  ON user_fashion_collection
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert collection items"
  ON user_fashion_collection
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Unlock Progress Policies
CREATE POLICY "Users can view their own progress"
  ON unlock_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON unlock_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage progress"
  ON unlock_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON user_fashion_collection TO authenticated;
GRANT ALL ON unlock_progress TO authenticated;
GRANT ALL ON unlock_thresholds TO authenticated;

-- Success message
SELECT 'RLS policies for reward system fixed successfully!' as message;
