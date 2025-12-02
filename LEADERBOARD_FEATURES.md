# Leaderboard Features

## Overview
The leaderboard displays player rankings with comprehensive filtering options and public profile views.

## Display Information
Each leaderboard entry shows:
- **Rank** - Position with special badges for top 3 (Gold, Silver, Bronze)
- **Username** - Player's display name
- **Total Score** - Accumulated points
- **Country** - Player's country with globe emoji 🌍

## Filter Options

### Time Period Filters (Top Row)
- **Today** - Rankings for the current day
- **This Week** - Rankings for the current week
- **This Month** - Rankings for the current month
- **All-Time** - Overall rankings since account creation

### Scope Filters (Second Row - Scrollable)
- **Global** - Worldwide rankings
- **Country** - Rankings by country
- **State** - Rankings by state/province
- **City** - Rankings by city
- **School** - Rankings by school
- **Company** - Rankings by company
- **Organization** - Rankings by organization

## Public Profile View

### Accessing Profiles
- Tap any player in the leaderboard to view their public profile
- Modal slides up from bottom with player information

### Profile Information (Public Only)
**Header:**
- Avatar (or default icon)
- Username
- Country

**Stats Grid:**
- Rank
- Total Score
- Wins
- Games Played

**Performance Stats:**
- Win Rate (percentage)
- Average Score
- Best Score
- Win Streak

### Privacy
- Only public stats are shown
- No private data (email, city, school, company, organization)
- No contact information displayed
- Safe for all age groups

## Technical Implementation

### Components
- Period filter tabs (4 options)
- Scrollable scope filter tabs (7 options)
- Leaderboard list with rank badges
- Public profile modal

### Data Flow
1. User selects period and scope filters
2. Service fetches leaderboard data with country info
3. List displays with rank, username, country, and score
4. Tap player → fetch detailed stats → show modal

### Database Queries
- Leaderboard entries include country from profiles table
- Stats fetched from game_sessions table
- Efficient joins for performance
- Proper indexing for fast queries

## User Experience

### Visual Hierarchy
- Top 3 players have colored badges (Gold, Silver, Bronze)
- Remaining players show rank number
- Score prominently displayed on right
- Country adds context without clutter

### Interactions
- Smooth tab switching
- Horizontal scroll for scope filters
- Pull to refresh leaderboard
- Tap to view profile
- Swipe down to close modal

### Performance
- Limit 100 entries per query
- Cached results for quick switching
- Lazy loading for large lists
- Optimized queries with proper indexes

## Benefits
- Easy to find rankings in different contexts
- Time-based competition encourages daily play
- Public profiles foster community
- Privacy-focused (no sensitive data)
- Motivates players to improve rank
