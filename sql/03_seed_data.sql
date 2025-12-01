-- Fashion Match Game - Seed Data

-- ============================================
-- GAME CONFIGURATIONS
-- ============================================

-- Easy difficulty (4x4 grid, 5 minutes)
INSERT INTO public.games (name, description, difficulty_level, grid_size, time_limit, items_count, player_type, is_active)
VALUES 
  ('Fashion Match Easy', 'Perfect for beginners! Match 8 pairs of fashion items.', 1, '{"rows": 4, "cols": 4}', 300, 8, ARRAY['child', 'teen', 'adult'], true),
  
  -- Medium difficulty (4x5 grid, 4 minutes)
  ('Fashion Match Medium', 'A bit more challenging with 10 pairs to match.', 2, '{"rows": 4, "cols": 5}', 240, 10, ARRAY['teen', 'adult'], true),
  
  -- Hard difficulty (6x6 grid, 3 minutes)
  ('Fashion Match Hard', 'Expert level! Match 18 pairs quickly.', 3, '{"rows": 6, "cols": 6}', 180, 18, ARRAY['adult'], true),
  
  -- Expert difficulty (6x8 grid, 2.5 minutes)
  ('Fashion Match Expert', 'Only for the best! 24 pairs in limited time.', 4, '{"rows": 6, "cols": 8}', 150, 24, ARRAY['adult'], true),
  
  -- Master difficulty (8x8 grid, 2 minutes)
  ('Fashion Match Master', 'Ultimate challenge! 32 pairs, maximum speed required.', 5, '{"rows": 8, "cols": 8}', 120, 32, ARRAY['adult'], true);

-- ============================================
-- SAMPLE FASHION ITEMS (AI-Generated Placeholders)
-- ============================================

-- Shoes
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Red Sneakers', 'shoes', 'https://via.placeholder.com/300/FF0000/FFFFFF?text=Red+Sneakers', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Blue Running Shoes', 'shoes', 'https://via.placeholder.com/300/0000FF/FFFFFF?text=Blue+Shoes', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Black Boots', 'shoes', 'https://via.placeholder.com/300/000000/FFFFFF?text=Black+Boots', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('White Sandals', 'shoes', 'https://via.placeholder.com/300/FFFFFF/000000?text=White+Sandals', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Brown Loafers', 'shoes', 'https://via.placeholder.com/300/8B4513/FFFFFF?text=Brown+Loafers', 'ai_generated', true, true, ARRAY['adult'], 3);

-- Dresses
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Summer Floral Dress', 'dresses', 'https://via.placeholder.com/300/FFB6C1/FFFFFF?text=Floral+Dress', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Evening Gown', 'dresses', 'https://via.placeholder.com/300/800080/FFFFFF?text=Evening+Gown', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('Casual Sundress', 'dresses', 'https://via.placeholder.com/300/FFFF00/000000?text=Sundress', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Cocktail Dress', 'dresses', 'https://via.placeholder.com/300/FF1493/FFFFFF?text=Cocktail+Dress', 'ai_generated', true, true, ARRAY['adult'], 3),
  ('Maxi Dress', 'dresses', 'https://via.placeholder.com/300/00CED1/FFFFFF?text=Maxi+Dress', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2);

-- Hats
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Baseball Cap', 'hats', 'https://via.placeholder.com/300/FF4500/FFFFFF?text=Baseball+Cap', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Sun Hat', 'hats', 'https://via.placeholder.com/300/F0E68C/000000?text=Sun+Hat', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Fedora', 'hats', 'https://via.placeholder.com/300/696969/FFFFFF?text=Fedora', 'ai_generated', true, true, ARRAY['adult'], 2),
  ('Beanie', 'hats', 'https://via.placeholder.com/300/4169E1/FFFFFF?text=Beanie', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Cowboy Hat', 'hats', 'https://via.placeholder.com/300/D2691E/FFFFFF?text=Cowboy+Hat', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2);

-- Accessories
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Gold Necklace', 'accessories', 'https://via.placeholder.com/300/FFD700/000000?text=Gold+Necklace', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('Silver Bracelet', 'accessories', 'https://via.placeholder.com/300/C0C0C0/000000?text=Silver+Bracelet', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('Sunglasses', 'accessories', 'https://via.placeholder.com/300/000000/FFFFFF?text=Sunglasses', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Watch', 'accessories', 'https://via.placeholder.com/300/2F4F4F/FFFFFF?text=Watch', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('Scarf', 'accessories', 'https://via.placeholder.com/300/DC143C/FFFFFF?text=Scarf', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1);

-- Shirts
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('White T-Shirt', 'shirts', 'https://via.placeholder.com/300/FFFFFF/000000?text=White+T-Shirt', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Blue Polo', 'shirts', 'https://via.placeholder.com/300/1E90FF/FFFFFF?text=Blue+Polo', 'ai_generated', true, true, ARRAY['teen', 'adult'], 1),
  ('Striped Shirt', 'shirts', 'https://via.placeholder.com/300/4682B4/FFFFFF?text=Striped+Shirt', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 2),
  ('Flannel Shirt', 'shirts', 'https://via.placeholder.com/300/8B0000/FFFFFF?text=Flannel+Shirt', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('Dress Shirt', 'shirts', 'https://via.placeholder.com/300/E6E6FA/000000?text=Dress+Shirt', 'ai_generated', true, true, ARRAY['adult'], 3);

-- Belts
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Leather Belt', 'belts', 'https://via.placeholder.com/300/8B4513/FFFFFF?text=Leather+Belt', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('Canvas Belt', 'belts', 'https://via.placeholder.com/300/556B2F/FFFFFF?text=Canvas+Belt', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
  ('Designer Belt', 'belts', 'https://via.placeholder.com/300/000000/FFFFFF?text=Designer+Belt', 'ai_generated', true, true, ARRAY['adult'], 3);

-- Ties
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Silk Tie', 'ties', 'https://via.placeholder.com/300/191970/FFFFFF?text=Silk+Tie', 'ai_generated', true, true, ARRAY['adult'], 2),
  ('Bow Tie', 'ties', 'https://via.placeholder.com/300/FF0000/FFFFFF?text=Bow+Tie', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
  ('Striped Tie', 'ties', 'https://via.placeholder.com/300/4B0082/FFFFFF?text=Striped+Tie', 'ai_generated', true, true, ARRAY['adult'], 3);

-- ============================================
-- NOTES
-- ============================================

-- After running this script:
-- 1. You have 5 game difficulty levels configured
-- 2. You have 33 sample fashion items across 7 categories
-- 3. All items are approved and ready to use
-- 4. Items are tagged with appropriate age groups and difficulty levels
--
-- To add an admin user, run this after a user signs up:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-admin@email.com';
--
-- To add real AI-generated images, replace the placeholder URLs with actual image URLs
-- from your AI image generation service (Replicate, Stability AI, etc.)