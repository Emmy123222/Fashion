# Complete Database Migration Guide

This guide provides the exact order to run all SQL migrations for the Fashion Match Game.

## Prerequisites

1. Have Supabase project created
2. Have access to Supabase SQL Editor
3. Have all environment variables configured in `.env`

## Migration Order

Run these SQL files in the Supabase SQL Editor in this exact order:

### 1. Core Tables (REQUIRED)
```
sql/01_tables.sql
```
Creates all base tables: profiles, fashion_items, games, game_sessions, etc.

### 2. Database Functions (REQUIRED)
```
sql/02_functions.sql
```
Creates utility functions for the database.

### 3. Seed Data (REQUIRED)
```
sql/03_seed_data.sql
```
Adds initial game configurations and sample data.

### 4. RLS Policies (REQUIRED)
```
sql/04_rls_policies.sql
```
Sets up Row Level Security for all base tables.

### 5. Profile Fields (REQUIRED)
```
sql/05_add_profile_fields.sql
```
Adds additional profile fields like avatar, bio, etc.

### 6. Organization Fields (OPTIONAL)
```
sql/06_add_detailed_organization_fields.sql
```
Adds organization-related fields to profiles.

### 7. Username Uniqueness (REQUIRED)
```
sql/07_enforce_unique_usernames.sql
```
Ensures usernames are unique across the platform.

### 8. Leaderboard Fix (REQUIRED)
```
sql/08_fix_leaderboard_aggregation.sql
```
Fixes leaderboard aggregation and duplicate issues.

### 9. Reward System (REQUIRED FOR PREMIUM FEATURES)
```
sql/09_reward_system.sql
```
Creates tables for fashion collection and unlock progress.

### 10. Fashion Images Seed (OPTIONAL)
```
sql/10_seed_fashion_images.sql
```
Seeds initial fashion item images (customize with your URLs).

### 11. Category Constraint Update (REQUIRED)
```
sql/11_update_category_constraint.sql
```
Updates category constraints to support all 9 categories.

### 12. Stripe Subscription Tables (REQUIRED FOR PAYMENTS)
```
sql/12_stripe_subscription_tables.sql
```
Creates subscription, payment_history, and webhook tables.

### 13. Reward System RLS Policies (REQUIRED IF USING REWARDS)
```
sql/13_fix_reward_rls_policies.sql
```
Fixes RLS policies for user_fashion_collection and unlock_progress tables.

### 14. Subscription RLS Policies (REQUIRED FOR PAYMENTS)
```
sql/14_fix_subscription_rls_policies.sql
```
Adds RLS policies for subscription and payment tables.

### 15. Leaderboard Updates Fix (CRITICAL - REQUIRED)
```
sql/15_fix_leaderboard_updates_v2.sql
```
Fixes triggers to properly update leaderboards and profile stats when games complete.

### 16. Leaderboard Unique Constraint Fix (CRITICAL - REQUIRED)
```
sql/16_fix_leaderboard_unique_constraint.sql
```
Fixes unique constraint to properly handle NULL team_id for single-player games.

## Quick Copy-Paste Order

For easy reference, here's the order in a single list:

1. `sql/01_tables.sql`
2. `sql/02_functions.sql`
3. `sql/03_seed_data.sql`
4. `sql/04_rls_policies.sql`
5. `sql/05_add_profile_fields.sql`
6. `sql/06_add_detailed_organization_fields.sql`
7. `sql/07_enforce_unique_usernames.sql`
8. `sql/08_fix_leaderboard_aggregation.sql`
9. `sql/09_reward_system.sql`
10. `sql/10_seed_fashion_images.sql` (optional)
11. `sql/11_update_category_constraint.sql`
12. `sql/12_stripe_subscription_tables.sql`
13. `sql/13_fix_reward_rls_policies.sql`
14. `sql/14_fix_subscription_rls_policies.sql`
15. `sql/15_fix_leaderboard_updates_v2.sql` ⚠️ CRITICAL
16. `sql/16_fix_leaderboard_unique_constraint.sql` ⚠️ CRITICAL

## Verification

After running all migrations, verify with these queries:

### Check if all tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- profiles
- fashion_items
- games
- game_sessions
- leaderboard_entries
- multiplayer_games
- teams
- team_members
- user_fashion_collection
- unlock_progress
- unlock_thresholds
- subscriptions
- payment_history
- stripe_webhook_events

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

### Check subscription columns exist in profiles:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('subscription_status', 'subscription_expires_at');
```

Should return both columns.

## Troubleshooting

### Error: "relation already exists"
This is safe to ignore - it means the table/function already exists.

### Error: "column does not exist"
Run the migration that adds that column (likely 05 or 06).

### Error: "permission denied"
Make sure you're running as the postgres user in Supabase SQL Editor.

### RLS Policy Errors
If you get RLS policy violations:
1. Make sure migrations 04, 13, and 14 are run
2. Check that you're authenticated when testing
3. Verify the user_id matches auth.uid()

## Post-Migration Verification

After running all migrations, run this to recalculate leaderboard ranks:

```sql
SELECT recalculate_all_leaderboard_ranks();
```

This ensures all existing game data is properly ranked.

## Post-Migration Setup

After all migrations are complete:

1. **Configure Stripe** (if using payments):
   - Add Stripe keys to Supabase Edge Functions secrets
   - Deploy `create-checkout-session` function
   - Deploy `stripe-webhook` function
   - Configure Stripe webhook URL

2. **Upload Fashion Items**:
   - Use the Admin Dashboard to upload fashion images
   - Or manually insert into fashion_items table

3. **Test the App**:
   - Create a test user
   - Try playing a game
   - Check leaderboards
   - Test subscription flow (if enabled)

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify you ran migrations in order
3. Check that all required environment variables are set
4. Review the specific migration file for dependencies
