# Fix Category Constraint Error

## The Problem
You're getting this error:
```
ERROR: check constraint "fashion_items_category_check" of relation "fashion_items" is violated by some row
```

This means you have existing data with categories that don't match the new constraint.

---

## Solution: 3 Easy Steps

### Step 1: Diagnose
Run this to see what's in your database:

```sql
-- Copy and paste: sql/00_diagnose_categories.sql
```

This will show you:
- How many items you have
- What categories exist
- Which categories are invalid
- Recommendations

---

### Step 2: Choose Your Path

#### Option A: Keep Existing Data (Recommended)
If you want to keep your existing fashion items:

```sql
-- Run: sql/11_update_category_constraint.sql
-- This will:
-- 1. Convert 'belts' → 'accessories'
-- 2. Convert 'ties' → 'accessories'  
-- 3. Update the constraint
```

#### Option B: Fresh Start
If you want to delete everything and start fresh:

```sql
-- Run: sql/11b_fresh_start_categories.sql
-- IMPORTANT: Uncomment the DELETE line first!
-- This will:
-- 1. Delete all existing items
-- 2. Update the constraint
```

---

### Step 3: Seed New Data
After fixing the constraint:

```sql
-- Run: sql/10_seed_fashion_images.sql
-- This adds 123 fashion items with images
```

---

## Quick Fix (If You Don't Care About Existing Data)

Just run these 3 commands in order:

```sql
-- 1. Delete all existing items
DELETE FROM fashion_items;

-- 2. Drop old constraint
ALTER TABLE fashion_items DROP CONSTRAINT IF EXISTS fashion_items_category_check;

-- 3. Add new constraint
ALTER TABLE fashion_items 
ADD CONSTRAINT fashion_items_category_check 
CHECK (category IN ('all', 'shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses'));
```

Then run the seed script:
```sql
-- Run: sql/10_seed_fashion_images.sql
```

---

## What Changed?

### Old Categories (from original schema):
- shoes, dresses, hats, suits, accessories, shirts, blouses, underwear, **belts, ties**

### New Categories (what we need):
- **all**, shoes, dresses, suits, accessories, hats, **pants**, underwear, shirts, blouses

### Changes:
- ✅ Added: **'all'** (for mixed category mode)
- ✅ Added: **'pants'** (was missing)
- ❌ Removed: **'belts'** (converted to 'accessories')
- ❌ Removed: **'ties'** (converted to 'accessories')

---

## Troubleshooting

### Still getting errors?
1. Run the diagnostic script first
2. Check what categories you have
3. Manually update or delete problematic rows

### Example: Manually fix invalid categories
```sql
-- See what's invalid
SELECT * FROM fashion_items 
WHERE category NOT IN ('shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses');

-- Fix them
UPDATE fashion_items SET category = 'accessories' WHERE category = 'belts';
UPDATE fashion_items SET category = 'accessories' WHERE category = 'ties';

-- Or delete them
DELETE FROM fashion_items 
WHERE category NOT IN ('shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses');
```

---

## Summary

**Easiest Path:**
1. Run `00_diagnose_categories.sql` to see what you have
2. Run `11b_fresh_start_categories.sql` (uncomment DELETE line)
3. Run `10_seed_fashion_images.sql`
4. Done! You now have 123 fashion items ready to use

---

**Need help?** Check the diagnostic output and follow the recommendations!
