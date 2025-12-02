# 🎮 How the Fashion Match Game Works

## Game Overview

Fashion Match is a **memory matching card game** where players match pairs of fashion items (shoes, dresses, hats, etc.) against the clock.

---

## 📱 Visual Game Flow

```
┌─────────────────────────────────────────┐
│         GAME STARTS                     │
│  Timer: 5:00  |  Score: 0  |  Combo: 0 │
└─────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│  GAME BOARD (4x4 Grid = 16 Cards)        │
│                                           │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
│                                           │
│  All cards are face-down (hidden)        │
└───────────────────────────────────────────┘

STEP 1: Player taps first card
┌───────────────────────────────────────────┐
│   [?] [👟] [?] [?]    ← Sneaker revealed │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
└───────────────────────────────────────────┘

STEP 2: Player taps second card
┌───────────────────────────────────────────┐
│   [?] [👟] [?] [?]                       │
│   [?] [?] [👗] [?]    ← Dress revealed   │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
└───────────────────────────────────────────┘

RESULT: NO MATCH! (Sneaker ≠ Dress)
→ Both cards flip back face-down after 1 second
→ Combo resets to 0

┌───────────────────────────────────────────┐
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [?]                        │
└───────────────────────────────────────────┘

STEP 3: Player tries again
┌───────────────────────────────────────────┐
│   [?] [👟] [?] [?]    ← Sneaker again    │
│   [?] [?] [?] [?]                        │
│   [?] [?] [?] [👟]    ← Another Sneaker! │
│   [?] [?] [?] [?]                        │
└───────────────────────────────────────────┘

RESULT: MATCH! ✅ (Sneaker = Sneaker)
→ Both cards stay face-up
→ +100 points
→ Combo +1

┌───────────────────────────────────────────┐
│  Timer: 4:45  |  Score: 100  |  Combo: 1│
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│   [?] [✓] [?] [?]    ← Matched cards     │
│   [?] [?] [?] [?]       stay visible     │
│   [?] [?] [?] [✓]                        │
│   [?] [?] [?] [?]                        │
└───────────────────────────────────────────┘

Continue matching until...

WIN CONDITION: All pairs matched!
┌───────────────────────────────────────────┐
│   [✓] [✓] [✓] [✓]                        │
│   [✓] [✓] [✓] [✓]                        │
│   [✓] [✓] [✓] [✓]                        │
│   [✓] [✓] [✓] [✓]                        │
│                                           │
│  🎉 YOU WIN! 🎉                          │
│  Final Score: 1,250                      │
│  Time: 3:15                              │
└───────────────────────────────────────────┘
```

---

## 🎯 Detailed Game Mechanics

### 1. **Card Flipping**
- Tap any face-down card to reveal it
- Tap a second card to try to match
- Only 2 cards can be flipped at a time

### 2. **Matching Logic**
```javascript
IF (Card 1 === Card 2) {
  ✅ MATCH!
  - Both cards stay face-up
  - Add points to score
  - Increase combo counter
  - Check if game is won
} ELSE {
  ❌ NO MATCH!
  - Wait 1 second
  - Flip both cards back face-down
  - Reset combo to 0
  - Player tries again
}
```

### 3. **Scoring System**

**Base Score:**
- Each match = 100 points

**Combo Multiplier:**
- 2 matches in a row = 1.5x points (150 points)
- 3 matches in a row = 2.25x points (225 points)
- 4 matches in a row = 3.375x points (337 points)
- And so on...

**Speed Bonus:**
- Match in < 3 seconds = +50 bonus points
- Match in < 2 seconds = +100 bonus points
- Match in < 1 second = +150 bonus points

**Difficulty Multiplier:**
- Level 1 (Easy) = 1.0x
- Level 2 (Medium) = 1.5x
- Level 3 (Hard) = 2.0x
- Level 4 (Expert) = 2.5x
- Level 5 (Master) = 3.0x

**Example Score Calculation:**
```
Match at Level 3 with 3-combo in 2.5 seconds:
Base: 100 points
Combo: 100 × 2.25 = 225 points
Speed: +0 (took > 3 seconds)
Difficulty: 225 × 2.0 = 450 points
TOTAL: 450 points for this match!
```

### 4. **Timer**
- Each round has a time limit (default: 5 minutes)
- Timer counts down every second
- When timer reaches 0 → Game Over (Loss)
- Faster completion = Higher ranking on leaderboard

### 5. **Win/Loss Conditions**

**WIN:**
- Match all pairs before time runs out
- Navigate to victory screen
- Score saved to leaderboard
- Unlock next difficulty level

**LOSS:**
- Time runs out before all pairs matched
- Navigate to game over screen
- Score still saved (but marked as incomplete)
- Can retry same level

---

## 🎮 Game Modes

### 1. **Single Player** (Currently Implemented)
- Play solo against the clock
- Try to beat your high score
- Compete on global leaderboards

**Flow:**
```
Home → Play → Single Player → Select Difficulty → Game Starts
→ Match all pairs → Results Screen → Leaderboard Updated
```

### 2. **Multiplayer** (PvP)
- Two players, same board
- Race to match more pairs
- Real-time competition
- Winner = Most matches when time ends

### 3. **Team Mode**
- Teams of 2-4 players
- Collaborative or competitive
- Team score combined
- Team leaderboards

---

## 🧠 AI Features

### 1. **Adaptive Difficulty**
The game tracks your performance:
- **Average match time** (how fast you match)
- **Accuracy rate** (matches vs attempts)
- **Combo frequency** (how often you get combos)

Based on this, the AI adjusts:
- Grid size (4x4 → 6x6 → 8x8)
- Time limit (5 min → 3 min → 2 min)
- Item complexity (simple → detailed items)

### 2. **AI-Generated Fashion Items**
- Game can generate new fashion items using AI
- Ensures fresh content
- Maintains appropriate difficulty

---

## 📊 Progression System

```
Level 1: Easy
├─ 4x4 grid (8 pairs)
├─ 5 minutes
└─ Simple items (shoes, hats)

Level 2: Medium
├─ 4x4 grid (8 pairs)
├─ 4 minutes
└─ More categories

Level 3: Hard
├─ 6x6 grid (18 pairs)
├─ 3 minutes
└─ All categories

Level 4: Expert
├─ 6x6 grid (18 pairs)
├─ 2 minutes
└─ Similar-looking items

Level 5: Master
├─ 8x8 grid (32 pairs)
├─ 2 minutes
└─ Very similar items
```

---

## 🎯 How to Access the Game

### From Home Screen:
1. **Browse fashion items** (current screen)
2. Tap **"Play"** button (needs to be added to navigation)
3. Select game mode
4. Start playing!

### Current Navigation:
```
Home (Browse) → [Need Play Button] → Game Mode Selection → Game
```

---

## 🔧 Current Implementation Status

✅ **Fully Implemented:**
- Game engine with matching logic
- Timer system
- Scoring with combos
- Single player game screen
- Performance tracking
- Database integration

🔧 **Needs Work:**
- Add "Play" button to HomeScreen
- Game mode selection screen
- Multiplayer real-time sync
- Team mode
- AI difficulty adaptation (service exists, needs integration)

---

## 🎮 Quick Start to Play

To test the game right now:

1. **Seed the database** with fashion items:
   ```sql
   -- Run: seed-fashion-items.sql in Supabase
   ```

2. **Navigate directly to game** (for testing):
   ```typescript
   navigation.navigate('SinglePlayerGame');
   ```

3. **Or add a Play button** to HomeScreen:
   ```typescript
   <Button 
     title="Play Game" 
     onPress={() => navigation.navigate('SinglePlayerGame')}
   />
   ```

Would you like me to add the Play button and game mode selection screen so users can actually start playing?
