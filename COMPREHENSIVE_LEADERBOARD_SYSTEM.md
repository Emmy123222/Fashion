# Comprehensive Leaderboard System

## Overview
The Fashion Match Game features a comprehensive leaderboard system that tracks player rankings across multiple organizational and geographic scopes.

## Leaderboard Scopes

### Geographic Scopes
1. **Global** - Worldwide rankings
2. **Country** - Rankings by country (e.g., United States, Canada, UK)
3. **State** - Rankings by US state or province (e.g., California, Texas, Ontario)
4. **County** - Rankings by county (e.g., Los Angeles County, Cook County)
5. **City** - Rankings by city (e.g., San Francisco, New York, London)

### Educational Institution Scopes
6. **High School** - Rankings by high school name
7. **College** - Rankings by college name
8. **University** - Rankings by university name (same as college, for clarity)

### Organizational Scopes
9. **Nonprofit** - Rankings by nonprofit organization name
10. **Corporation** - Rankings by corporation/company name
11. **Government** - Rankings by government department (e.g., "Department of Education")
12. **Organization Chapter** - Rankings by organization chapter or branch (e.g., "San Francisco Chapter")

## Time Period Filters
Users can view rankings for different time periods:
- **Today** - Daily rankings (resets at midnight)
- **This Week** - Weekly rankings (resets on Sunday)
- **This Month** - Monthly rankings (resets on 1st of month)
- **All-Time** - Overall rankings since account creation

## Profile Fields

### Required at Sign-Up
- Username
- Age Group (Child, Teen, Adult)
- Country

### Optional (Added Later in Profile)
**Location:**
- Email
- State/Province
- County
- City

**Education:**
- High School Name
- College/University Name

**Organizations:**
- Company Name
- Nonprofit Name
- Corporation Name
- Government Department
- Organization Chapter

## Leaderboard Display

### Entry Information
Each leaderboard entry shows:
- **Rank Badge** - Special badges for top 3 (Gold, Silver, Bronze), number for others
- **Avatar** - Player's profile picture or default icon
- **Username** - Player's display name
- **Country** - Player's country with globe emoji 🌍
- **Total Score** - Accumulated points

### Public Profile View
Clicking any player opens their public profile with:

**Header:**
- Avatar
- Username
- Country

**Stats Grid:**
- Rank
- Total Score
- Wins
- Games Played

**Performance Stats:**
- Win Rate (%)
- Average Score
- Best Score
- Win Streak

**Privacy:** Only public stats shown, no private data (email, location details, organization details)

## Database Schema

### Profiles Table Fields
```sql
-- Location
country TEXT
state TEXT
county TEXT
city TEXT

-- Education
high_school_name TEXT
college_name TEXT

-- Organizations
company_name TEXT
nonprofit_name TEXT
corporation_name TEXT
government_department TEXT
organization_chapter TEXT
organization_type TEXT -- 'nonprofit', 'corporation', 'government', 'high_school', 'college', 'university'
```

### Leaderboards Table
```sql
scope TEXT -- 'global', 'country', 'state', 'county', 'city', 'high_school', 'college', 'university', 'nonprofit', 'corporation', 'government', 'organization_chapter'
scope_value TEXT -- The specific value (e.g., 'United States', 'Stanford University')
period TEXT -- 'daily', 'weekly', 'monthly', 'all_time'
rank INTEGER
score INTEGER
wins INTEGER
matches_played INTEGER
```

## Service Methods

### Leaderboard Service
```typescript
// Geographic
getLeaderboard(filter: LeaderboardFilter)
getGlobalTopPlayers(limit)
getCountryLeaderboard(country, limit)
getStateLeaderboard(state, limit)
getCountyLeaderboard(county, limit)
getCityLeaderboard(city, limit)

// Educational
getHighSchoolLeaderboard(schoolName, limit)
getCollegeLeaderboard(collegeName, limit)
getUniversityLeaderboard(universityName, limit)

// Organizational
getNonprofitLeaderboard(nonprofitName, limit)
getCorporationLeaderboard(corporationName, limit)
getGovernmentLeaderboard(departmentName, limit)
getOrganizationChapterLeaderboard(chapterName, limit)

// User specific
getUserRanks(userId)
getUserPosition(userId, scope, scopeValue)
```

## User Experience

### Navigation
1. User opens Leaderboard screen
2. Selects time period (Today, This Week, This Month, All-Time)
3. Scrolls through scope filters (Global, Country, State, etc.)
4. Views ranked list of players
5. Taps player to see public profile

### Filtering Flow
- Period tabs at top (4 options)
- Scope tabs below (12 options, horizontally scrollable)
- List updates automatically when filters change
- Pull to refresh for latest data

### Ranking Logic
- Rankings calculated based on total score
- Ties broken by number of wins
- Further ties broken by earliest achievement
- Rankings update in real-time after each game

## Use Cases

### Individual Players
- Track personal progress across different scopes
- Compare with friends in same school/organization
- Compete for top spots in local/global rankings

### Schools
- High schools can see their top players
- Colleges can track campus-wide competition
- Encourages friendly competition between institutions

### Organizations
- Nonprofits can engage members through rankings
- Corporations can run internal competitions
- Government departments can track employee participation

### Geographic Competition
- Cities compete for top rankings
- States/provinces track regional performance
- Countries see national leaderboards

## Privacy & Safety

### Public Information Only
- Username and country always visible
- Game statistics (score, wins, matches) public
- Performance metrics (win rate, streaks) public

### Private Information Protected
- Email never shown on leaderboards
- Specific location (state, county, city) not displayed
- Organization affiliations not shown publicly
- Only visible in user's own profile edit screen

### Age-Appropriate
- Child accounts have additional privacy protections
- Teen accounts follow youth privacy guidelines
- Adult accounts have full feature access

## Implementation Files

### Database
- `sql/01_tables.sql` - Main schema
- `sql/06_add_detailed_organization_fields.sql` - Organization fields migration

### Types
- `src/types/leaderboard.types.ts` - Leaderboard types and scopes
- `src/types/user.types.ts` - User profile types

### Services
- `src/services/leaderboard.service.ts` - Leaderboard data access

### Screens
- `src/screens/LeaderboardScreen.tsx` - Main leaderboard UI
- `src/screens/ProfileScreen.tsx` - Profile editing with organization fields

## Future Enhancements

### Potential Additions
- Team leaderboards (already supported in schema)
- Achievement badges for top rankings
- Historical rank tracking (rank over time charts)
- Leaderboard notifications (when you move up/down)
- Custom leaderboard creation (e.g., "Friends only")
- Export leaderboard data (for schools/organizations)
- Leaderboard challenges (time-limited competitions)

### Analytics
- Track which scopes are most popular
- Monitor engagement with different time periods
- Identify top-performing organizations
- Geographic heat maps of player activity
