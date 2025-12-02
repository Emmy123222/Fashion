-- FRESH START: Clear existing data and update category constraint
-- Use this if you want to start fresh with new data

-- Step 1: Check current data
SELECT 'Current fashion items count:' as info, COUNT(*) as count FROM fashion_items;

-- Step 2: BACKUP WARNING
SELECT '⚠️  WARNING: This will DELETE all existing fashion items!' as warning;
SELECT 'If you want to keep existing data, use 11_update_category_constraint.sql instead' as note;

-- Step 3: Delete all existing fashion items (UNCOMMENT to execute)
-- DELETE FROM fashion_items;

-- Step 4: Drop the old constraint
ALTER TABLE fashion_items DROP CONSTRAINT IF EXISTS fashion_items_category_check;

-- Step 5: Add new constraint with all categories
ALTER TABLE fashion_items 
ADD CONSTRAINT fashion_items_category_check 
CHECK (category IN ('all', 'shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses'));

-- Step 6: Verify
SELECT 'Category constraint updated successfully!' as message;
SELECT 'You can now run 10_seed_fashion_images.sql to add 123 fashion items' as next_step;
