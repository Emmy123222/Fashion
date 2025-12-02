# Database Migrations - Run in This Exact Order

## ⚠️ IMPORTANT: Run these in order!

Each migration depends on the previous ones. Running them out of order will cause errors.

---

## Step-by-Step Migration Guide

### 1. Profile Fields (Required)
```sql
-- File: sql/05_add_profile_fields.sql
-- Adds: subscription_status, subscription_expires_at, and other profile fields
```
**Run this first!**

### 2. Organization Fields (Optional but Recommended)
```sql
-- File: sql/06_add_detailed_organization_fields.sql
-- Adds: high_school_name, college_name, company_name, etc.
```

### 3. Username Uniqueness (Required)
```sql
-- File: sql/07_enforce_unique_usernames.sql
-- Adds: Unique constraint on usernames
```

### 4. Leaderboard Fix (Required)
```sql
-- File: sql/08_fix_leaderboard_aggregation.sql
-- Fixes: Duplicate entries in leaderboards
```

### 5. Reward System (Required for Collection)
```sql
-- File: sql/09_reward_system.sql
-- Creates: user_unlocked_items, user_category_progress tables
-- Creates: check_and_unlock_items() function
```
**Run this BEFORE step 6!**

### 6. Reward RLS Policies (Required for Collection)
```sql
-- File: sql/13_fix_reward_rls_policies.sql
-- Adds: Row Level Security policies for reward tables
```
**Run this AFTER step 5!**

### 7. Category Constraint (Required)
```sql
-- File: sql/11_update_category_constraint.sql
-- OR
-- File: sql/11b_fresh_start_categories.sql (if you want to clear data)
-- Updates: Allows 'pants' and 'all' categories
```

### 8. Fashion Items (Required)
```sql
-- File: sql/10_seed_fashion_images.sql
-- Seeds: 123 fashion items with images
```
**Run this AFTER step 7!**

### 9. Stripe Tables (Required for Payments)
```sql
-- File: sql/12_stripe_subscription_tables.sql
-- Creates: subscriptions, payment_history, stripe_webhook_events tables
```

---

## Quick Copy-Paste Order

Run these in Supabase SQL Editor, one at a time:

```sql
-- 1. Profile fields
\i sql/05_add_profile_fields.sql

-- 2. Organization fields
\i sql/06_add_detailed_organization_fields.sql

-- 3. Username uniqueness
\i sql/07_enforce_unique_usernames.sql

-- 4. Leaderboard fix
\i sql/08_fix_leaderboard_aggregation.sql

-- 5. Reward system (creates tables)
\i sql/09_reward_system.sql

-- 6. Reward RLS policies (secures tables)
\i sql/13_fix_reward_rls_policies.sql

-- 7. Category constraint
\i sql/11_update_category_constraint.sql

-- 8. Fashion items (123 items)
\i sql/10_seed_fashion_images.sql

-- 9. Stripe tables
\i sql/12_stripe_subscription_tables.sql
```

---

## What Each Migration Does

### 05_add_profile_fields.sql
- Adds `subscription_status` column
- Adds `subscription_expires_at` column
- Required for: Feature gating, premium checks

### 06_add_detailed_organization_fields.sql
- Adds organization-specific fields
- Required for: Leaderboard scopes (school, company, etc.)

### 07_enforce_unique_usernames.sql
- Makes usernames unique
- Required for: User identification, leaderboards

### 08_fix_leaderboard_aggregation.sql
- Fixes duplicate leaderboard entries
- Required for: Clean leaderboards

### 09_reward_system.sql
- Creates `user_unlocked_items` table
- Creates `user_category_progress` table
- Creates `check_and_unlock_items()` function
- Required for: Rewards, Collection screen

### 13_fix_reward_rls_policies.sql
- Adds RLS policies to reward tables
- Required for: Users to access their rewards

### 11_update_category_constraint.sql
- Allows 'pants' and 'all' categories
- Required for: All categories to work

### 10_seed_fashion_images.sql
- Inserts 123 fashion items
- Required for: Game to have items

### 12_stripe_subscription_tables.sql
- Creates subscription tracking tables
- Required for: Payment processing

---

## Troubleshooting

### Error: "relation does not exist"
**Cause:** Trying to run a migration before its dependencies  
**Solution:** Run migrations in order from step 1

### Error: "column already exists"
**Cause:** Migration already ran  
**Solution:** Skip that migration, continue to next

### Error: "violates row-level security"
**Cause:** RLS policies not set up  
**Solution:** Run sql/13_fix_reward_rls_policies.sql

### Error: "check constraint violated"
**Cause:** Category constraint not updated  
**Solution:** Run sql/11_update_category_constraint.sql first

---

## Verification

After running all migrations, verify with:

```sql
-- Check profile fields exist
SELECT subscription_status, subscription_expires_at 
FROM profiles 
LIMIT 1;

-- Check reward tables exist
SELECT COUNT(*) FROM user_unlocked_items;
SELECT COUNT(*) FROM user_category_progress;

-- Check fashion items loaded
SELECT category, COUNT(*) 
FROM fashion_items 
GROUP BY category;

-- Check Stripe tables exist
SELECT COUNT(*) FROM subscriptions;
```

---

## Current Error Fix

You're getting: **"relation user_unlocked_items does not exist"**

**Solution:** Run migrations in this order:
1. sql/09_reward_system.sql (creates the tables)
2. sql/13_fix_reward_rls_policies.sql (adds RLS policies)

The RLS policy file assumes the tables exist, so you must create them first!

---

## Summary

**Minimum Required (for basic game):**
- 05, 07, 11, 10

**For Feature Gating:**
- Add: 05 (subscription fields)

**For Rewards/Collection:**
- Add: 09, 13 (reward system + RLS)

**For Leaderboards:**
- Add: 06, 08 (organization fields + aggregation fix)

**For Payments:**
- Add: 12 (Stripe tables)

**Recommended: Run all 9 migrations for full functionality!**

---

**Your next step: Run sql/09_reward_system.sql first, then sql/13_fix_reward_rls_policies.sql**
