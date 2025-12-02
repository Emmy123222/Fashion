# Leaderboard Duplicate Fix

## Problem
The leaderboard was showing duplicate entries for the same user (e.g., "Emmanuel" appearing multiple times) instead of consolidating all their points into a single entry.

## Root Cause
- The `leaderboards` table was creating a new entry for each game session
- No aggregation logic to sum up scores per user
- Missing unique constraint on (user_id, scope, scope_value, period)

## Solution Implemented

### 1. Database Functions

#### `update_user_leaderboard(user_id, scope, scope_value, period)`
- Calculates total score, wins, and matches for a user
- Upserts a single leaderboard entry per user per scope
- Recalculates ranks after update

#### `refresh_user_leaderboards(user_id)`
- Refreshes all leaderboard entries for a user across all scopes
- Updates global, country, state, city, school, organization leaderboards
- Called automatically when a game completes

#### `trigger_update_leaderboards()`
- Trigger function that runs when a game session completes
- Updates user's profile stats (total_score, total_wins, total_matches)
- Calls `refresh_user_leaderboards()` to update all leaderboards

### 2. Service Layer Deduplication

The leaderboard service now includes client-side deduplication:
```typescript
// Remove duplicates by user_id, keeping the highest score
const uniqueUsers = new Map();
mappedData.forEach((entry: any) => {
  const existing = uniqueUsers.get(entry.user_id);
  if (!existing || entry.score > existing.score) {
    uniqueUsers.set(entry.user_id, entry);
  }
});
```

### 3. Cleanup Process

The migration script includes:
- Deletion of duplicate entries (keeps highest score)
- Refresh of all user leaderboards
- Proper ranking recalculation

## How to Apply the Fix

### Step 1: Run the Migration
Execute in Supabase SQL Editor:
```sql
-- Run the entire script
\i sql/08_fix_leaderboard_aggregation.sql
```

### Step 2: Verify Results
Check that each user appears only once per scope:
```sql
SELECT 
  scope,
  scope_value,
  user_id,
  COUNT(*) as entry_count
FROM leaderboards
WHERE leaderboard_type = 'user'
  AND period = 'all_time'
GROUP BY scope, scope_value, user_id
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### Step 3: Test in App
1. Open the leaderboard screen
2. Verify each user appears only once
3. Check that scores are properly aggregated
4. Play a game and verify leaderboard updates correctly

## Expected Behavior After Fix

### Before Fix
```
#1 Emmanuel - 0 points
#2 Emmanuel - 0 points
#3 Emmanuel - 0 points
#4 Emmanuel - 0 points
#5 Emmanuel - 850 points
```

### After Fix
```
#1 Emmanuel - 850 points
#2 Player2 - 500 points
#3 Player3 - 300 points
```

## Automatic Updates

The system now automatically:
1. **On Game Complete:**
   - Updates user's total_score in profiles table
   - Refreshes all leaderboard entries for that user
   - Recalculates ranks for affected scopes

2. **On Profile Update:**
   - If user changes country/city/school/organization
   - Leaderboards are updated to reflect new affiliations

3. **On Leaderboard Query:**
   - Client-side deduplication as safety net
   - Proper ranking based on score, then wins, then time

## Data Integrity

### Unique Constraint
The leaderboards table should have a unique constraint:
```sql
UNIQUE(user_id, team_id, scope, scope_value, period, period_start)
```

This prevents duplicate entries at the database level.

### Aggregation Logic
- **Score:** Sum of all completed game scores
- **Wins:** Count of games where is_won = true
- **Matches:** Count of all completed games
- **Rank:** Ordered by score DESC, wins DESC, updated_at ASC

## Troubleshooting

### Still Seeing Duplicates?
1. Check if migration ran successfully
2. Verify trigger is active:
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'update_leaderboards_on_game_complete';
```

3. Manually refresh leaderboards:
```sql
SELECT refresh_user_leaderboards('user-id-here');
```

### Scores Not Adding Up?
1. Check profile total_score:
```sql
SELECT id, username, total_score, total_wins, total_matches
FROM profiles
WHERE username = 'Emmanuel';
```

2. Check game_sessions:
```sql
SELECT user_id, SUM(score), COUNT(*)
FROM game_sessions
WHERE user_id = 'user-id-here'
  AND is_completed = true
GROUP BY user_id;
```

### Ranks Not Updating?
The trigger automatically recalculates ranks. If needed, manually recalculate:
```sql
WITH ranked_users AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      ORDER BY score DESC, wins DESC, updated_at ASC
    ) as new_rank
  FROM leaderboards
  WHERE scope = 'global'
    AND period = 'all_time'
    AND leaderboard_type = 'user'
)
UPDATE leaderboards l
SET rank = r.new_rank
FROM ranked_users r
WHERE l.id = r.id;
```

## Performance Considerations

### Indexing
Ensure these indexes exist:
```sql
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_scope 
  ON leaderboards(user_id, scope, scope_value);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank 
  ON leaderboards(scope, scope_value, rank);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_completed 
  ON game_sessions(user_id, is_completed);
```

### Optimization
- Trigger only runs on completed games
- Batch updates for multiple scopes
- Efficient ranking with window functions
- Client-side caching of leaderboard data

## Future Enhancements

### Potential Improvements
- Real-time leaderboard updates via Supabase Realtime
- Leaderboard snapshots for historical data
- Periodic leaderboards (daily, weekly, monthly)
- Leaderboard reset functionality
- Archived leaderboards for past seasons
