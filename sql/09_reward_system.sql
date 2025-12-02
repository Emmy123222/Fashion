-- Reward System - Fashion Collection
-- Run this in Supabase SQL Editor

-- User fashion collection (unlocked items)
CREATE TABLE IF NOT EXISTS user_fashion_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fashion_item_id UUID NOT NULL REFERENCES fashion_items(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_score INTEGER NOT NULL,
  unlock_level INTEGER NOT NULL,
  UNIQUE(user_id, fashion_item_id)
);

-- Track unlock progress per category
CREATE TABLE IF NOT EXISTS unlock_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  current_points INTEGER DEFAULT 0,
  next_unlock_threshold INTEGER NOT NULL,
  items_unlocked INTEGER DEFAULT 0,
  last_unlock_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Unlock thresholds per category
CREATE TABLE IF NOT EXISTS unlock_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL UNIQUE,
  points_required INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default thresholds
INSERT INTO unlock_thresholds (category, points_required, description) VALUES
  ('shoes', 1000, 'Unlock 1 new shoe design'),
  ('dresses', 1500, 'Unlock 1 new dress design'),
  ('suits', 2000, 'Unlock 1 new suit design'),
  ('accessories', 800, 'Unlock 1 new accessory'),
  ('hats', 1200, 'Unlock 1 new hat design'),
  ('pants', 1000, 'Unlock 1 new pants design'),
  ('underwear', 600, 'Unlock 1 new underwear design'),
  ('shirts', 1000, 'Unlock 1 new shirt design'),
  ('blouses', 1200, 'Unlock 1 new blouse design')
ON CONFLICT (category) DO NOTHING;

-- Function to check and process unlocks
CREATE OR REPLACE FUNCTION check_and_unlock_items(
  p_user_id UUID,
  p_category TEXT,
  p_points_earned INTEGER
)
RETURNS TABLE (
  unlocked BOOLEAN,
  new_item_id UUID,
  new_item_name TEXT,
  total_unlocked INTEGER
) AS $$
DECLARE
  v_current_points INTEGER;
  v_threshold INTEGER;
  v_new_item RECORD;
  v_items_unlocked INTEGER;
BEGIN
  -- Get or create progress record
  INSERT INTO unlock_progress (user_id, category, current_points, next_unlock_threshold)
  SELECT 
    p_user_id,
    p_category,
    0,
    COALESCE((SELECT points_required FROM unlock_thresholds WHERE category = p_category), 1000)
  ON CONFLICT (user_id, category) DO NOTHING;

  -- Get current progress
  SELECT current_points, next_unlock_threshold, items_unlocked
  INTO v_current_points, v_threshold, v_items_unlocked
  FROM unlock_progress
  WHERE user_id = p_user_id AND category = p_category;

  -- Add new points
  v_current_points := v_current_points + p_points_earned;

  -- Check if threshold reached
  IF v_current_points >= v_threshold THEN
    -- Find a random item from category that user doesn't have
    SELECT fi.id, fi.name
    INTO v_new_item
    FROM fashion_items fi
    WHERE fi.category = p_category
      AND fi.is_approved = true
      AND fi.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM user_fashion_collection ufc
        WHERE ufc.user_id = p_user_id AND ufc.fashion_item_id = fi.id
      )
    ORDER BY RANDOM()
    LIMIT 1;

    IF v_new_item.id IS NOT NULL THEN
      -- Unlock the item
      INSERT INTO user_fashion_collection (
        user_id,
        fashion_item_id,
        category,
        unlock_score,
        unlock_level
      ) VALUES (
        p_user_id,
        v_new_item.id,
        p_category,
        v_current_points,
        1 -- We'll update this with actual level later
      );

      -- Update progress
      v_items_unlocked := v_items_unlocked + 1;
      v_current_points := v_current_points - v_threshold;

      UPDATE unlock_progress
      SET 
        current_points = v_current_points,
        items_unlocked = v_items_unlocked,
        last_unlock_at = NOW(),
        updated_at = NOW()
      WHERE user_id = p_user_id AND category = p_category;

      -- Return unlock info
      RETURN QUERY SELECT 
        true,
        v_new_item.id,
        v_new_item.name,
        v_items_unlocked;
    ELSE
      -- No more items to unlock
      UPDATE unlock_progress
      SET current_points = v_current_points, updated_at = NOW()
      WHERE user_id = p_user_id AND category = p_category;

      RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, v_items_unlocked;
    END IF;
  ELSE
    -- Not enough points yet
    UPDATE unlock_progress
    SET current_points = v_current_points, updated_at = NOW()
    WHERE user_id = p_user_id AND category = p_category;

    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, v_items_unlocked;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_fashion_collection_user 
  ON user_fashion_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fashion_collection_category 
  ON user_fashion_collection(user_id, category);
CREATE INDEX IF NOT EXISTS idx_unlock_progress_user 
  ON unlock_progress(user_id);

-- Enable RLS
ALTER TABLE user_fashion_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlock_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlock_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own collection"
  ON user_fashion_collection FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress"
  ON unlock_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view thresholds"
  ON unlock_thresholds FOR SELECT
  TO public
  USING (true);

-- Comments
COMMENT ON TABLE user_fashion_collection IS 'Tracks fashion items unlocked by users as rewards';
COMMENT ON TABLE unlock_progress IS 'Tracks progress towards unlocking new items per category';
COMMENT ON TABLE unlock_thresholds IS 'Defines point thresholds required to unlock items per category';
COMMENT ON FUNCTION check_and_unlock_items IS 'Checks if user has earned enough points to unlock a new item';
