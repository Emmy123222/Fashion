-- Seed Fashion Items for Testing
-- Run this in Supabase SQL Editor to add sample fashion items

-- Insert sample fashion items (using placeholder image URLs)
INSERT INTO public.fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level) VALUES
-- Shoes
('Classic Sneakers', 'shoes', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('High Heels', 'shoes', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Running Shoes', 'shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Boots', 'shoes', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),

-- Dresses
('Summer Dress', 'dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Evening Gown', 'dresses', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 3),
('Casual Dress', 'dresses', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Cocktail Dress', 'dresses', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),

-- Hats
('Baseball Cap', 'hats', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Fedora', 'hats', 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Beanie', 'hats', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Sun Hat', 'hats', 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),

-- Suits
('Business Suit', 'suits', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 3),
('Tuxedo', 'suits', 'https://images.unsplash.com/photo-1621976498727-9e5d56476276?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 3),
('Casual Blazer', 'suits', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),

-- Accessories
('Sunglasses', 'accessories', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Watch', 'accessories', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Handbag', 'accessories', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Scarf', 'accessories', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),

-- Shirts
('T-Shirt', 'shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Polo Shirt', 'shirts', 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult'], 1),
('Dress Shirt', 'shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Flannel Shirt', 'shirts', 'https://images.unsplash.com/photo-1598032895397-b9c644f3c3e7?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 1),

-- Blouses
('Silk Blouse', 'blouses', 'https://images.unsplash.com/photo-1564257577-d18b2b6e3d4b?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Casual Blouse', 'blouses', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 1),
('Formal Blouse', 'blouses', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),

-- Belts
('Leather Belt', 'belts', 'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 1),
('Designer Belt', 'belts', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),

-- Ties
('Silk Tie', 'ties', 'https://images.unsplash.com/photo-1589756823695-278bc8356c59?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2),
('Bow Tie', 'ties', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult'], 2);

-- Verify the insert
SELECT COUNT(*) as total_items, category, COUNT(*) as count_per_category 
FROM public.fashion_items 
GROUP BY category 
ORDER BY category;
