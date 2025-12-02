-- Diagnostic Script: Check current fashion_items data
-- Run this FIRST to see what's in your database

-- 1. Check total items
SELECT '=== TOTAL ITEMS ===' as section;
SELECT COUNT(*) as total_items FROM fashion_items;

-- 2. Check categories and counts
SELECT '=== ITEMS PER CATEGORY ===' as section;
SELECT category, COUNT(*) as count 
FROM fashion_items 
GROUP BY category 
ORDER BY category;

-- 3. Check for invalid categories (not in our new list)
SELECT '=== INVALID CATEGORIES (need to fix) ===' as section;
SELECT category, COUNT(*) as count 
FROM fashion_items 
WHERE category NOT IN ('shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses')
GROUP BY category;

-- 4. Check current constraint
SELECT '=== CURRENT CONSTRAINT ===' as section;
SELECT conname as constraint_name, 
       pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'fashion_items_category_check';

-- 5. Sample items
SELECT '=== SAMPLE ITEMS (first 10) ===' as section;
SELECT id, name, category, is_approved 
FROM fashion_items 
LIMIT 10;

-- RECOMMENDATIONS:
SELECT '=== RECOMMENDATIONS ===' as section;
SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM fashion_items WHERE category IN ('belts', 'ties')) 
  THEN '⚠️  You have items with categories "belts" or "ties" - run 11_update_category_constraint.sql to convert them to "accessories"'
  WHEN EXISTS (SELECT 1 FROM fashion_items WHERE category NOT IN ('shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses'))
  THEN '⚠️  You have items with invalid categories - check the "INVALID CATEGORIES" section above'
  WHEN (SELECT COUNT(*) FROM fashion_items) = 0
  THEN '✅ No existing data - you can run 11b_fresh_start_categories.sql then 10_seed_fashion_images.sql'
  ELSE '✅ All categories are valid - you can run 11_update_category_constraint.sql'
END as recommendation;
