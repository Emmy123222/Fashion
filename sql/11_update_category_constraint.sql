-- Update fashion_items category constraint to include 'pants' and 'all'
-- Run this BEFORE running the seed script

-- Step 1: Check what categories currently exist
SELECT 'Current categories in database:' as info;
SELECT DISTINCT category, COUNT(*) as count 
FROM fashion_items 
GROUP BY category;

-- Step 2: Update any invalid categories (if needed)
-- Replace 'belts' with 'accessories' if it exists
UPDATE fashion_items SET category = 'accessories' WHERE category = 'belts';

-- Replace 'ties' with 'accessories' if it exists
UPDATE fashion_items SET category = 'accessories' WHERE category = 'ties';

-- Step 3: Drop the old constraint
ALTER TABLE fashion_items DROP CONSTRAINT IF EXISTS fashion_items_category_check;

-- Step 4: Add new constraint with 'pants' and 'all' included
ALTER TABLE fashion_items 
ADD CONSTRAINT fashion_items_category_check 
CHECK (category IN ('all', 'shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses'));

-- Step 5: Verify the update
SELECT 'Category constraint updated successfully!' as message;
SELECT 'Allowed categories: all, shoes, dresses, suits, accessories, hats, pants, underwear, shirts, blouses' as info;
