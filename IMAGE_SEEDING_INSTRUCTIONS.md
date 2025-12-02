# Fashion Items Image Seeding Instructions

## Quick Steps

### Step 1: Update Category Constraint
Run this first to allow 'pants' category:

```sql
-- In Supabase SQL Editor, run:
\i sql/11_update_category_constraint.sql
```

Or copy and paste:
```sql
ALTER TABLE fashion_items DROP CONSTRAINT IF EXISTS fashion_items_category_check;

ALTER TABLE fashion_items 
ADD CONSTRAINT fashion_items_category_check 
CHECK (category IN ('all', 'shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses'));
```

### Step 2: Seed Fashion Items
Run the seed script:

```sql
-- In Supabase SQL Editor, run:
\i sql/10_seed_fashion_images.sql
```

Or copy and paste the entire contents of `sql/10_seed_fashion_images.sql`

---

## What Gets Seeded

### Total Items: 123 fashion items

- **Shoes:** 15 items
- **Dresses:** 15 items
- **Suits:** 12 items
- **Accessories:** 15 items
- **Hats:** 12 items
- **Pants:** 15 items
- **Underwear:** 12 items
- **Shirts:** 15 items
- **Blouses:** 12 items

---

## Image Sources

All images are from Unsplash (free to use):
- High quality fashion photography
- Transparent backgrounds where possible
- Appropriate for all age groups
- Properly sized for game display

---

## Verify Seeding

After running the scripts, verify with:

```sql
-- Check total items
SELECT COUNT(*) as total_items FROM fashion_items;

-- Check items per category
SELECT category, COUNT(*) as count 
FROM fashion_items 
GROUP BY category 
ORDER BY category;

-- Check approved items
SELECT category, COUNT(*) as approved_count 
FROM fashion_items 
WHERE is_approved = true 
GROUP BY category;
```

Expected results:
```
total_items: 123

category     | count
-------------|------
accessories  | 15
blouses      | 12
dresses      | 15
hats         | 12
pants        | 15
shirts       | 15
shoes        | 15
suits        | 12
underwear    | 12
```

---

## Troubleshooting

### Error: "category_check constraint"
**Solution:** Run Step 1 first to update the constraint

### Error: "duplicate key value"
**Solution:** Clear existing data first:
```sql
DELETE FROM fashion_items;
```

### Images not loading
**Check:**
- Internet connection (images are from Unsplash)
- Image URLs are accessible
- CORS settings in Supabase

---

## Alternative: Use Your Own Images

If you want to use your own images:

1. Upload images to Supabase Storage
2. Get public URLs
3. Replace image URLs in the seed script

Example:
```sql
-- Instead of Unsplash URL:
'https://images.unsplash.com/photo-xxx?w=400'

-- Use your Supabase Storage URL:
'https://your-project.supabase.co/storage/v1/object/public/fashion-items/shoe1.png'
```

---

## Next Steps

After seeding:
1. ✅ Verify all items loaded
2. ✅ Test game with each category
3. ✅ Test "All Categories" mode
4. ✅ Check images display correctly
5. ✅ Verify transparent backgrounds work

---

**Ready to play with real fashion items!** 🎉
