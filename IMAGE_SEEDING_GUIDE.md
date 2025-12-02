# Fashion Items Image Seeding Guide

## 📸 Adding Fashion Images to Supabase

### Quick Start

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `sql/10_seed_fashion_images.sql`
4. Click "Run"
5. Done! ✅

---

## What Gets Added

### Total Items: 123 fashion items across 9 categories

| Category | Items | Difficulty Levels |
|----------|-------|-------------------|
| Shoes | 15 | 1-2 |
| Dresses | 15 | 1-3 |
| Suits | 12 | 2-3 |
| Accessories | 15 | 1-3 |
| Hats | 12 | 1-3 |
| Pants | 15 | 1-2 |
| Underwear | 12 | 1-2 |
| Shirts | 15 | 1-2 |
| Blouses | 12 | 2 |

---

## Image Sources

All images are from **Unsplash** - a free, high-quality image service with:
- ✅ Free to use
- ✅ No attribution required
- ✅ High resolution
- ✅ Transparent backgrounds (where applicable)
- ✅ Reliable CDN

### Example URLs:
```
https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400
https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400
```

The `?w=400` parameter optimizes images to 400px width for faster loading.

---

## Step-by-Step Instructions

### Method 1: SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy SQL Script**
   - Open `FashionMatchGame/sql/10_seed_fashion_images.sql`
   - Copy all contents (Ctrl+A, Ctrl+C)

4. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for completion

5. **Verify Success**
   - You should see: "Fashion items seeded successfully!"
   - Total items: 123
   - Total categories: 9

### Method 2: Table Editor (Manual)

If you prefer to add items manually:

1. **Go to Table Editor**
   - Click "Table Editor" in sidebar
   - Select "fashion_items" table

2. **Click "Insert Row"**

3. **Fill in Fields:**
   - name: "Classic White Sneakers"
   - category: "shoes"
   - image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"
   - source: "ai_generated"
   - is_approved: true
   - is_active: true
   - age_appropriate_for: ["child", "teen", "adult"]
   - difficulty_level: 1

4. **Repeat for all items**

---

## Verification

### Check Item Count:
```sql
SELECT category, COUNT(*) as count
FROM fashion_items
WHERE is_approved = true
GROUP BY category
ORDER BY category;
```

### Expected Results:
```
accessories | 15
blouses     | 12
dresses     | 15
hats        | 12
pants       | 15
shirts      | 15
shoes       | 15
suits       | 12
underwear   | 12
```

### Test Image Loading:
```sql
SELECT name, category, image_url
FROM fashion_items
WHERE category = 'shoes'
LIMIT 5;
```

---

## Using Your Own Images

### Option 1: Supabase Storage

1. **Create Storage Bucket**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('fashion-items', 'fashion-items', true);
   ```

2. **Upload Images**
   - Go to Storage in Supabase dashboard
   - Select "fashion-items" bucket
   - Upload your images

3. **Get Public URLs**
   ```
   https://[your-project].supabase.co/storage/v1/object/public/fashion-items/shoes/sneaker1.png
   ```

4. **Update SQL Script**
   ```sql
   INSERT INTO fashion_items (name, category, image_url, ...)
   VALUES ('My Sneaker', 'shoes', 'https://[your-project].supabase.co/storage/v1/object/public/fashion-items/shoes/sneaker1.png', ...);
   ```

### Option 2: External CDN

Use any image hosting service:
- Cloudinary
- Imgix
- AWS S3
- Google Cloud Storage
- Your own server

Just update the `image_url` field with your URLs.

---

## Image Requirements

### Technical Specs:
- **Format:** PNG, JPG, or WebP
- **Size:** 400x400px to 800x800px recommended
- **Background:** Transparent PNG preferred
- **File Size:** < 500KB for fast loading
- **Aspect Ratio:** Square (1:1) works best

### Content Guidelines:
- Clear, high-quality images
- Single item per image
- Neutral or transparent background
- Well-lit and in focus
- Age-appropriate content

---

## Troubleshooting

### Issue: Images not loading
**Solution:** Check if URLs are accessible
```bash
curl -I https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400
```

### Issue: Duplicate items
**Solution:** Clear existing data first
```sql
DELETE FROM fashion_items WHERE source = 'ai_generated';
```

### Issue: Wrong category
**Solution:** Update category
```sql
UPDATE fashion_items
SET category = 'shoes'
WHERE name = 'Classic White Sneakers';
```

### Issue: Images too large
**Solution:** Add size parameter to URL
```
?w=400  -- Width 400px
?w=800  -- Width 800px
?h=400  -- Height 400px
```

---

## Advanced: Bulk Image Upload

### Using Supabase CLI:

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login**
   ```bash
   supabase login
   ```

3. **Link Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Run Migration**
   ```bash
   supabase db push
   ```

---

## Image Optimization Tips

### 1. Use CDN Parameters:
```
?w=400&q=80&fm=webp
```
- `w=400`: Width 400px
- `q=80`: Quality 80%
- `fm=webp`: WebP format

### 2. Lazy Loading:
Already implemented in `FashionCard.tsx`

### 3. Caching:
Unsplash CDN automatically caches images

### 4. Responsive Images:
```typescript
const imageUrl = `${baseUrl}?w=${width}&q=80`;
```

---

## Alternative Image Sources

### Free Stock Photos:
1. **Unsplash** (Current) - https://unsplash.com
2. **Pexels** - https://pexels.com
3. **Pixabay** - https://pixabay.com

### Fashion-Specific:
1. **Fashion Stock** - https://fashionstock.com
2. **Burst by Shopify** - https://burst.shopify.com

### AI-Generated:
1. **DALL-E** - OpenAI
2. **Midjourney** - Discord bot
3. **Stable Diffusion** - Open source

---

## Next Steps

After seeding images:

1. ✅ Run the SQL script
2. ✅ Verify item count
3. ✅ Test image loading in app
4. ✅ Play a game to see images
5. ✅ Check all categories work

---

## Summary

**What you have:**
- 123 fashion items ready to use
- All 9 categories covered
- Real image URLs from Unsplash
- Proper difficulty levels
- Age-appropriate tagging

**What to do:**
1. Run `sql/10_seed_fashion_images.sql` in Supabase
2. Test the game
3. Enjoy! 🎉

---

*All images are from Unsplash and are free to use. You can replace them with your own images anytime by updating the `image_url` field in the database.*
