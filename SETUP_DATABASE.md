# Database Setup Instructions

## Step 1: Run Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run the following files in order:

### a. Create Tables
```sql
-- Copy and paste content from: sql/01_tables.sql
```

### b. Create Functions
```sql
-- Copy and paste content from: sql/02_functions.sql
```

### c. Seed Initial Data
```sql
-- Copy and paste content from: sql/03_seed_data.sql
```

### d. Setup RLS Policies
```sql
-- Copy and paste content from: sql/04_rls_policies.sql
```

### e. Seed Fashion Items (for testing)
```sql
-- Copy and paste content from: seed-fashion-items.sql
```

## Step 2: Verify Setup

Run this query to verify everything is working:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check fashion items
SELECT COUNT(*) as total_items, category 
FROM public.fashion_items 
WHERE is_approved = true 
GROUP BY category;

-- Check if your user profile exists
SELECT * FROM public.profiles LIMIT 5;
```

## Step 3: Test the App

1. Make sure your `.env` file has the correct Supabase credentials
2. Restart the Expo app: `npm start`
3. Login with your test account
4. The HomeScreen should now show real fashion items from the database

## Troubleshooting

### No items showing in HomeScreen?
- Check if fashion items exist: `SELECT COUNT(*) FROM fashion_items WHERE is_approved = true;`
- Run the seed script: `seed-fashion-items.sql`

### Authentication errors?
- Verify your Supabase URL and anon key in `.env`
- Check if RLS policies are set up correctly

### Images not loading?
- The seed script uses Unsplash URLs which should work
- If images don't load, check your internet connection
- You can replace URLs with your own image URLs

## Next Steps

Once the database is set up and working:

1. ✅ HomeScreen will show real fashion items
2. ✅ Users can browse approved fashion items
3. 🔧 Next: Implement the actual matching game functionality
4. 🔧 Next: Enable user uploads with moderation
5. 🔧 Next: Implement leaderboards with real data
6. 🔧 Next: Add multiplayer functionality
