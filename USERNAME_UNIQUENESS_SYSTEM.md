# Username Uniqueness System

## Overview
The Fashion Match Game enforces unique usernames to prevent duplicate names on leaderboards and ensure clear player identification.

## Database Constraints

### Unique Username Constraint
- The `profiles` table has a `UNIQUE` constraint on the `username` column
- This prevents duplicate usernames at the database level
- Case-insensitive checking (e.g., "Player1" and "player1" are considered duplicates)

### Username Validation Rules
1. **Minimum Length:** 3 characters
2. **Maximum Length:** 30 characters
3. **Allowed Characters:** Letters (a-z, A-Z), numbers (0-9), underscore (_), hyphen (-)
4. **No Spaces:** Spaces are not allowed
5. **No Special Characters:** Only alphanumeric, underscore, and hyphen allowed
6. **Trimmed:** Leading and trailing whitespace automatically removed

## Database Functions

### check_username_available(username)
Checks if a username is available (case-insensitive).

```sql
SELECT check_username_available('Player123');
-- Returns: true (available) or false (taken)
```

### suggest_username(base_username)
Suggests an alternative username if the requested one is taken.

```sql
SELECT suggest_username('Player');
-- Returns: 'Player1', 'Player2', etc. (first available)
```

### normalize_username() Trigger
Automatically validates and normalizes usernames on insert/update:
- Trims whitespace
- Checks length requirements
- Validates character format
- Raises exception if invalid

## Application Logic

### Registration Flow
1. User enters desired username
2. Client validates format (length, characters)
3. Service checks if username is available
4. If taken, suggests alternative (e.g., "Player" → "Player1")
5. Shows error with suggestion
6. User can try again with different username

### Username Check Service
```typescript
// Check availability
const isAvailable = await authService.checkUsernameAvailable('Player123');

// Get suggestion if taken
const suggested = await authService.suggestUsername('Player');
```

### Error Handling
When username is taken:
```
Error: Username "Player" is already taken. Try "Player1" instead.
```

## Leaderboard Display

### Username Priority
The leaderboard displays usernames in this priority:
1. **Username** (primary identifier)
2. **Full Name** (if username not available)
3. **"Anonymous"** (only if both are missing)

### Data Mapping
The leaderboard service automatically maps nested profile data:
```typescript
{
  username: entry.profiles?.username || entry.username,
  full_name: entry.profiles?.full_name || entry.full_name,
  avatar_url: entry.profiles?.avatar_url || entry.avatar_url,
  country: entry.profiles?.country || entry.country,
}
```

## Implementation Files

### Database
- `sql/07_enforce_unique_usernames.sql` - Constraints and functions

### Services
- `src/services/auth.service.ts` - Username checking and suggestions
- `src/services/leaderboard.service.ts` - Data mapping for display

### Screens
- `src/screens/auth/RegisterScreen.tsx` - Client-side validation

## User Experience

### Registration
1. User enters username
2. Real-time validation (length, format)
3. Submit registration
4. If username taken, clear error message with suggestion
5. User can modify and try again

### Leaderboard
- All players show their unique username
- No "Anonymous" entries (unless data is missing)
- Clear identification of each player
- Country displayed for additional context

## Best Practices

### For Users
- Choose a unique, memorable username
- Use letters, numbers, underscores, or hyphens
- Keep it between 3-30 characters
- Avoid common names (they're likely taken)

### For Developers
- Always check username availability before registration
- Provide helpful error messages with suggestions
- Validate on both client and server
- Use case-insensitive comparison
- Handle edge cases (empty, too long, special characters)

## Testing Scenarios

### Valid Usernames
- ✅ "Player123"
- ✅ "cool_gamer"
- ✅ "fashion-pro"
- ✅ "ABC"
- ✅ "user_2024"

### Invalid Usernames
- ❌ "AB" (too short)
- ❌ "a" (too short)
- ❌ "Player 123" (contains space)
- ❌ "user@123" (special character)
- ❌ "player#1" (special character)
- ❌ "very_long_username_that_exceeds_thirty_characters" (too long)

### Duplicate Handling
1. User tries "Player" → Taken
2. System suggests "Player1"
3. User tries "Player1" → Taken
4. System suggests "Player2"
5. User tries "Player2" → Available ✅

## Migration Guide

### Existing Users
If you have existing users with duplicate usernames:

1. Run the migration script:
```sql
-- Find duplicates
SELECT username, COUNT(*) 
FROM profiles 
GROUP BY LOWER(username) 
HAVING COUNT(*) > 1;

-- Update duplicates with numbered suffix
-- (Manual process or custom script needed)
```

2. Apply unique constraint:
```sql
-- Already in 07_enforce_unique_usernames.sql
```

### New Installations
Simply run all migration scripts in order:
1. `01_tables.sql` (includes UNIQUE constraint)
2. `07_enforce_unique_usernames.sql` (adds validation)

## Troubleshooting

### "Username already taken" Error
- Try a different username
- Add numbers or underscores
- Use the suggested alternative
- Be creative!

### "Invalid username format" Error
- Remove spaces
- Remove special characters
- Use only letters, numbers, _, -
- Check length (3-30 characters)

### Leaderboard Shows "Anonymous"
- User profile missing username
- Database sync issue
- Check profile data integrity
- Verify leaderboard data mapping

## Future Enhancements

### Potential Features
- Username change (with cooldown period)
- Display name separate from username
- Username history tracking
- Reserved usernames (admin, system, etc.)
- Profanity filter
- Username suggestions based on interests
- Social media username import
