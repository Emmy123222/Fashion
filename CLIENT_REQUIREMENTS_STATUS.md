# Client Requirements vs Current Implementation

## 📋 Client's Specific Requirements

### 1. Game Focus: SHOES
**Client Says:** "Shoes - Lots of Shoes are scrambled in a pile or in a grid or Shoe Store"

**Current Status:** ✅ IMPLEMENTED
- Game supports all fashion categories including shoes
- Can be configured to show ONLY shoes
- Grid layout implemented (4x4, 6x6, 8x8)
- Random shuffling creates "scrambled" effect

**To Make It Shoes-Only:**
```typescript
// In SinglePlayerGameScreen.tsx, change:
const itemsResponse = await fashionService.getRandomFashionItems(
  itemsNeeded,
  user.player_type,
  difficultyLevel
);

// To:
const itemsResponse = await fashionService.getFashionItemsByCategory(
  'shoes',
  user.player_type
);
```

---

### 2. Timer Gets 30 Seconds Shorter Each Round
**Client Says:** "Timer that gets 30 second shorter each round"

**Current Status:** ⚠️ PARTIALLY IMPLEMENTED
- Timer exists and counts down
- Currently fixed at 5 minutes (300 seconds)
- Need to add progressive reduction

**What Needs to Be Added:**
```typescript
// Round 1: 5:00 (300 seconds)
// Round 2: 4:30 (270 seconds)
// Round 3: 4:00 (240 seconds)
// Round 4: 3:30 (210 seconds)
// etc.

const getTimeLimitForRound = (round: number): number => {
  const baseTime = 300; // 5 minutes
  const reduction = 30; // 30 seconds per round
  return Math.max(60, baseTime - (reduction * (round - 1)));
};
```

---

### 3. Single Player vs Timer
**Client Says:** "Users single Player Option competes against a timer"

**Current Status:** ✅ FULLY IMPLEMENTED
- Single player mode exists
- Timer counts down
- Game ends when time runs out
- Score saved to database

---

### 4. Multiplayer Competition
**Client Says:** "Multiplayers compete against each other to match two items for points"

**Current Status:** ✅ IMPLEMENTED (needs real-time sync)
- Multiplayer screen exists
- Lobby system exists
- Match system in database
- Real-time sync needs Supabase Realtime enabled

---

### 5. Team Mode
**Client Says:** "Multiplayers can also compete as teams"

**Current Status:** ✅ IMPLEMENTED (needs completion)
- Team database tables exist
- Team service exists
- Team mode screen needs final touches

---

### 6. AI Difficulty Adaptation
**Client Says:** "AI should learn from players and increase game difficulty"

**Current Status:** ✅ IMPLEMENTED
- AI Difficulty Adapter service exists
- Tracks player performance metrics
- Adjusts:
  - Grid size (more items)
  - Time limit (less time)
  - Item complexity
- Performance metrics saved to database

**How It Works:**
```typescript
// AI tracks:
- Average match time
- Accuracy rate
- Combo frequency
- Speed score

// Then adjusts:
- Difficulty level (1-5)
- Grid size (4x4 → 6x6 → 8x8)
- Time limit (5min → 3min → 2min)
```

---

### 7. Player Types: Child, Teen, Adult
**Client Says:** "Children- Teen - Adult User Options: The difference is the amount of time"

**Current Status:** ✅ IMPLEMENTED
- User profile has `player_type` field
- Database supports: 'child', 'teen', 'adult'
- Fashion items filtered by age appropriateness

**Time Differences (Recommended):**
```typescript
const getBaseTimeForPlayerType = (playerType: string): number => {
  switch(playerType) {
    case 'child': return 420; // 7 minutes
    case 'teen': return 360;  // 6 minutes
    case 'adult': return 300; // 5 minutes
    default: return 300;
  }
};
```

---

### 8. Leaderboards by Location & Organization
**Client Says:** "Create Leaderboards by Country, US State, County, City, College, High School, Nonprofits, Corporation, Government+Department Organizations+Chapter"

**Current Status:** ⚠️ MOSTLY IMPLEMENTED

**✅ Currently Available:**
- Global
- Country
- State
- City
- School (covers College & High School)

**❌ Missing:**
- County
- Organization (Nonprofits, Corporation, Government)
- Organization Chapter/Department

**Database Already Supports:**
```sql
-- profiles table has:
- country
- state
- county ✅ (exists but not in UI)
- city
- school_name
- school_type (high_school, college, university)
- organization_name ✅ (exists but not in UI)
- organization_type (nonprofit, corporation, government) ✅
```

**What Needs to Be Added:**
Just add these to the LeaderboardScreen tabs:
- County
- Organization

---

## 🎯 Summary: What's Working vs What Needs Work

### ✅ FULLY WORKING (Ready to Use)
1. ✅ Game matching logic
2. ✅ Timer system
3. ✅ Scoring with combos
4. ✅ Single player mode
5. ✅ AI difficulty adaptation
6. ✅ Player types (child/teen/adult)
7. ✅ Database structure
8. ✅ Performance tracking
9. ✅ Leaderboards (Global, Country, State, City, School)

### ⚠️ NEEDS MINOR UPDATES
1. ⚠️ Make game shoes-only (5 min fix)
2. ⚠️ Add 30-second timer reduction per round (10 min fix)
3. ⚠️ Add County & Organization to leaderboards (15 min fix)
4. ⚠️ Adjust base time by player type (5 min fix)

### 🔧 NEEDS COMPLETION
1. 🔧 Multiplayer real-time sync (needs Supabase Realtime)
2. 🔧 Team mode final touches
3. 🔧 Seed database with LOTS of shoes

---

## 🚀 Quick Fixes to Match Client Requirements Exactly

### Fix 1: Make It Shoes-Only (5 minutes)
```typescript
// File: src/screens/game/SinglePlayerGameScreen.tsx
// Line ~60, change getRandomFashionItems to:

const itemsResponse = await fashionService.getFashionItemsByCategory(
  'shoes',
  user.player_type
);
```

### Fix 2: Timer Reduces 30 Seconds Per Round (10 minutes)
```typescript
// File: src/screens/game/SinglePlayerGameScreen.tsx
// Add round tracking and dynamic time:

const [currentRound, setCurrentRound] = useState(1);

const getTimeLimit = (round: number, playerType: string): number => {
  const baseTime = {
    child: 420,  // 7 minutes
    teen: 360,   // 6 minutes
    adult: 300   // 5 minutes
  }[playerType] || 300;
  
  const reduction = 30 * (round - 1);
  return Math.max(60, baseTime - reduction);
};

const timeLimit = getTimeLimit(currentRound, user.player_type);
```

### Fix 3: Add County & Organization Leaderboards (15 minutes)
```typescript
// File: src/screens/LeaderboardScreen.tsx
// Add to SCOPES array:

const SCOPES = [
  { label: 'Global', value: 'global' },
  { label: 'Country', value: 'country' },
  { label: 'State', value: 'state' },
  { la