-- Fashion Items Seed Data with Images
-- Run this in Supabase SQL Editor to populate fashion_items table

-- Clear existing data (optional - comment out if you want to keep existing items)
-- DELETE FROM fashion_items;

-- SHOES (15 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Classic White Sneakers', 'shoes', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Running Shoes', 'shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Red High Heels', 'shoes', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Brown Leather Boots', 'shoes', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Blue Canvas Sneakers', 'shoes', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Pink Ballet Flats', 'shoes', 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Dress Shoes', 'shoes', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Gray Slip-On Shoes', 'shoes', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('White High Tops', 'shoes', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Beige Sandals', 'shoes', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Navy Blue Loafers', 'shoes', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Green Athletic Shoes', 'shoes', 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Yellow Sneakers', 'shoes', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Purple Slip-Ons', 'shoes', 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Orange Running Shoes', 'shoes', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1);


-- DRESSES (15 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Red Evening Dress', 'dresses', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Blue Summer Dress', 'dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Cocktail Dress', 'dresses', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('White Maxi Dress', 'dresses', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Pink Floral Dress', 'dresses', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Green Midi Dress', 'dresses', 'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Yellow Sundress', 'dresses', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Purple Party Dress', 'dresses', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Navy Blue Dress', 'dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Coral Beach Dress', 'dresses', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Burgundy Gown', 'dresses', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Mint Green Dress', 'dresses', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Peach Formal Dress', 'dresses', 'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Teal Casual Dress', 'dresses', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Silver Evening Gown', 'dresses', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3);


-- SUITS (12 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Black Business Suit', 'suits', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Navy Blue Suit', 'suits', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Gray Formal Suit', 'suits', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Charcoal Suit', 'suits', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Brown Tweed Suit', 'suits', 'https://images.unsplash.com/photo-1598808503491-c8e0e4c0e8b1?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Beige Linen Suit', 'suits', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Dark Blue Tuxedo', 'suits', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Light Gray Suit', 'suits', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Pinstripe Suit', 'suits', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Olive Green Suit', 'suits', 'https://images.unsplash.com/photo-1598808503491-c8e0e4c0e8b1?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Burgundy Suit', 'suits', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Cream Suit', 'suits', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2);


-- ACCESSORIES (15 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Gold Necklace', 'accessories', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Silver Bracelet', 'accessories', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Black Leather Bag', 'accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Brown Belt', 'accessories', 'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Pearl Earrings', 'accessories', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Red Handbag', 'accessories', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Blue Scarf', 'accessories', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Diamond Ring', 'accessories', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Green Backpack', 'accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Pink Sunglasses', 'accessories', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('White Watch', 'accessories', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Yellow Clutch', 'accessories', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Purple Wallet', 'accessories', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1),
  ('Orange Tote Bag', 'accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Beige Crossbody Bag', 'accessories', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2);


-- HATS (12 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Black Baseball Cap', 'hats', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Red Beanie', 'hats', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Brown Fedora', 'hats', 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('White Sun Hat', 'hats', 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Blue Bucket Hat', 'hats', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Gray Snapback', 'hats', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Pink Visor', 'hats', 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Green Trucker Hat', 'hats', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Navy Beret', 'hats', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Tan Cowboy Hat', 'hats', 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 2),
  ('Black Top Hat', 'hats', 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 3),
  ('Yellow Straw Hat', 'hats', 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1);


-- PANTS (15 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('Blue Jeans', 'pants', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Dress Pants', 'pants', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Khaki Chinos', 'pants', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Gray Sweatpants', 'pants', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('White Linen Pants', 'pants', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Dark Blue Jeans', 'pants', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Beige Cargo Pants', 'pants', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Leggings', 'pants', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Navy Trousers', 'pants', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Green Joggers', 'pants', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Brown Corduroy Pants', 'pants', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Red Track Pants', 'pants', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Light Blue Jeans', 'pants', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Olive Cargo Shorts', 'pants', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Purple Yoga Pants', 'pants', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1);


-- UNDERWEAR (12 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('White Cotton Briefs', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Boxer Shorts', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1),
  ('Blue Sports Bra', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1),
  ('Gray Tank Top', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Pink Underwear Set', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1),
  ('Navy Compression Shorts', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1),
  ('White Undershirt', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Athletic Underwear', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1),
  ('Red Thermal Underwear', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Green Base Layer', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1),
  ('Beige Shapewear', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['adult']::text[], 2),
  ('Purple Sports Underwear', 'underwear', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 1);


-- SHIRTS (15 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('White T-Shirt', 'shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Black Polo Shirt', 'shirts', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Blue Button-Up Shirt', 'shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Red Flannel Shirt', 'shirts', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Gray Henley Shirt', 'shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Green Dress Shirt', 'shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Yellow Graphic Tee', 'shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Navy Oxford Shirt', 'shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Pink Polo Shirt', 'shirts', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Purple V-Neck Shirt', 'shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Orange Sports Shirt', 'shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Brown Casual Shirt', 'shirts', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Teal Long Sleeve Shirt', 'shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 'ai_generated', true, true, ARRAY['child', 'teen', 'adult']::text[], 1),
  ('Maroon Striped Shirt', 'shirts', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Beige Linen Shirt', 'shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2);


-- BLOUSES (12 items)
INSERT INTO fashion_items (name, category, image_url, source, is_approved, is_active, age_appropriate_for, difficulty_level)
VALUES
  ('White Silk Blouse', 'blouses', 'https://images.unsplash.com/photo-1564257577-4f0b4c8b8d0c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Black Chiffon Blouse', 'blouses', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Pink Ruffled Blouse', 'blouses', 'https://images.unsplash.com/photo-1564257577-4f0b4c8b8d0c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Blue Floral Blouse', 'blouses', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Red Satin Blouse', 'blouses', 'https://images.unsplash.com/photo-1564257577-4f0b4c8b8d0c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Green Peasant Blouse', 'blouses', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Yellow Lace Blouse', 'blouses', 'https://images.unsplash.com/photo-1564257577-4f0b4c8b8d0c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Navy Wrap Blouse', 'blouses', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Cream Embroidered Blouse', 'blouses', 'https://images.unsplash.com/photo-1564257577-4f0b4c8b8d0c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Purple Tie-Front Blouse', 'blouses', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Coral Peplum Blouse', 'blouses', 'https://images.unsplash.com/photo-1564257577-4f0b4c8b8d0c?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2),
  ('Mint Green Blouse', 'blouses', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', 'ai_generated', true, true, ARRAY['teen', 'adult']::text[], 2);

-- Success message
SELECT 'Fashion items seeded successfully!' as message,
       COUNT(*) as total_items,
       COUNT(DISTINCT category) as total_categories
FROM fashion_items;
