# Game Features Implementation Plan

## Overview
This document outlines the implementation of advanced game features including transparent backgrounds, category selection, multi-level environments, extreme difficulty scaling, and reward systems.

## 1. Transparent Backgrounds for All Items

### Requirements
- All fashion item images must have transparent backgrounds (PNG format)
- Applies to all categories: Shoes, Dresses, Suits, Accessories, Hats, Pants, Underwear, Shirts, Blouses
- Must work in all views and levels

### Implementation
```typescript
// FashionCard component update
<Image
  source={{ uri: item.image_url }}
  style={{
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Preserves transparency
    backgroundColor: 'transparent',
  }}
/>
```

### Database Update
```sql
-- Ensure image_url points to PNG files with transparency
ALTER TABLE fashion_items 
ADD COLUMN has_transparency BOOLEAN DEFAULT true;

-- Add validation
ALTER TABLE fashion_items
ADD CONSTRAINT check_image_format 
CHECK (image_url LIKE '%.png' OR image_url LIKE '%.PNG');
```

## 2. Category Selection System

### Categories
1. Shoes
2. Dresses
3. Suits
4. Accessories
5. Hats
6. Pants
7. Underwear
8. Shirts
9. Blouses

### UI Flow
```
Home Screen
    ↓
Category Selection Screen (NEW)
    ↓ (User selects category)
Level Selection Screen (NEW)
    ↓ (User selects Level 1 or Level 2)
Game Screen (with selected category)
```

### Category Selection Screen
```typescript
// src/screens/game/CategorySelectionScreen.tsx
const CATEGORIES = [
  { id: 'shoes', name: 'Shoes', icon: '👟', color: '#6C63FF' },
  { id: 'dresses', name: 'Dresses', icon: '👗', color: '#FF4F81' },
  { id: 'suits', name: 'Suits', icon: '🤵', color: '#FFC736' },
  { id: 'accessories', name: 'Accessories', icon: '👜', color: '#22C55E' },
  { id: 'hats', name: 'Hats', icon: '🎩', color: '#6C63FF' },
  { id: 'pants', name: 'Pants', icon: '👖', color: '#FF4F81' },
  { id: 'underwear', name: 'Underwear', icon: '🩲', color: '#FFC736' },
  { id: 'shirts', name: 'Shirts', icon: '👔', color: '#22C55E' },
  { id: 'blouses', name: 'Blouses', icon: '👚', color: '#FF4F81' },
];
```

### Database Query
```typescript
// Filter items by selected category
const items = await fashionService.getItemsByCategory(selectedCategory);
```

## 3. Multi-Level Game Environments

### Level 1: Store View (3 Minutes)

**Layout:**
- Store-style grid layout
- Items displayed on shelves/racks
- Clean, organized presentation
- Single category only

**Rules:**
- Time limit: 3 minutes (180 seconds)
- Items arranged in neat grid
- Standard matching rules
- Score based on speed and accuracy

**Implementation:**
```typescript
interface Level1Config {
  layout: 'store';
  timeLimit: 180; // 3 minutes
  category: FashionCategory;
  gridSize: { rows: 4, cols: 4 };
  itemsCount: 8; // 8 pairs = 16 items
}
```

**Visual Design:**
```
┌─────────────────────────────┐
│     STORE VIEW - SHOES      │
│  ⏱️ 2:45 remaining          │
├─────────────────────────────┤
│  👟  👟  👟  👟            │
│  👟  👟  👟  👟            │
│  👟  👟  👟  👟            │
│  👟  👟  👟  👟            │
└─────────────────────────────┘
```

### Level 2: Pile View (Harder Mode)

**Layout:**
- Items scattered in a pile
- Overlapping items
- Users must drag/spread items manually
- Chaotic, realistic pile

**Features:**
- ✅ Multiplayer support
- ✅ Team play support
- Drag and drop interaction
- Items can overlap
- More challenging to find matches

**Implementation:**
```typescript
interface Level2Config {
  layout: 'pile';
  timeLimit: 120; // 2 minutes (harder)
  category: FashionCategory;
  itemsCount: 12; // 12 pairs = 24 items
  allowDrag: true;
  multiplayerEnabled: true;
  teamPlayEnabled: true;
}
```

**Visual Design:**
```
┌─────────────────────────────┐
│     PILE VIEW - DRESSES     │
│  ⏱️ 1:30 remaining          │
├─────────────────────────────┤
│         👗                  │
│    👗      👗               │
│       👗        👗          │
│  👗         👗      👗      │
│      👗  👗     👗          │
└─────────────────────────────┘
```

## 4. Extreme Difficulty Scaling

### Difficulty Progression

**Level 1 (Easy):**
- 8 pairs (16 items)
- 3 minutes
- 4x4 grid
- Distinct items

**Level 2 (Medium):**
- 12 pairs (24 items)
- 2 minutes
- Pile layout
- Similar items

**Level 3 (Hard):**
- 16 pairs (32 items)
- 90 seconds
- Pile layout
- Very similar items

**Level 4 (Very Hard):**
- 20 pairs (40 items)
- 60 seconds
- Pile layout
- Nearly identical items

**Level 5+ (Nearly Impossible):**
- 25+ pairs (50+ items)
- 45 seconds
- Pile layout
- Identical-looking items
- Subtle differences only

### Difficulty Calculation
```typescript
interface DifficultyConfig {
  level: number;
  itemsCount: number;
  timeLimit: number;
  similarityThreshold: number; // 0-1, higher = more similar
  layout: 'store' | 'pile';
}

const calculateDifficulty = (level: number): DifficultyConfig => {
  return {
    level,
    itemsCount: Math.min(8 + (level * 4), 50), // Caps at 50 items
    timeLimit: Math.max(180 - (level * 20), 30), // Minimum 30 seconds
    similarityThreshold: Math.min(0.5 + (level * 0.1), 0.95),
    layout: level === 1 ? 'store' : 'pile',
  };
};
```

### Anti-Boredom Features
- Rapid difficulty increase
- Nearly impossible at high levels
- Rare wins feel rewarding
- Encourages replay
- Competitive leaderboards

## 5. Reward System - Fashion Collection

### Unlock Mechanism

**Point Thresholds:**
```typescript
const UNLOCK_THRESHOLDS = {
  shoes: 1000,      // Unlock 1 shoe at 1000 points
  dresses: 1500,    // Unlock 1 dress at 1500 points
  suits: 2000,      // Unlock 1 suit at 2000 points
  accessories: 800, // Unlock 1 accessory at 800 points
  hats: 1200,       // Unlock 1 hat at 1200 points
  pants: 1000,      // Unlock 1 pants at 1000 points
  underwear: 600,   // Unlock 1 underwear at 600 points
  shirts: 1000,     // Unlock 1 shirt at 1000 points
  blouses: 1200,    // Unlock 1 blouse at 1200 points
};
```

### Database Schema
```sql
-- User fashion collection
CREATE TABLE user_fashion_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fashion_item_id UUID NOT NULL REFERENCES fashion_items(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_score INTEGER NOT NULL,
  UNIQUE(user_id, fashion_item_id)
);

-- Track unlock progress
CREATE TABLE unlock_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  current_score INTEGER DEFAULT 0,
  next_unlock_threshold INTEGER NOT NULL,
  items_unlocked INTEGER DEFAULT 0,
  UNIQUE(user_id, category)
);
```

### Unlock Logic
```typescript
const checkForUnlocks = async (userId: string, category: string, newScore: number) => {
  const threshold = UNLOCK_THRESHOLDS[category];
  const progress = await getUnlockProgress(userId, category);
  
  if (progress.current_score + newScore >= threshold) {
    // Unlock a new item
    const newItem = await getRandomUnlockedItem(category);
    await unlockItem(userId, newItem.id, category, progress.current_score + newScore);
    
    // Show unlock notification
    showUnlockNotification(newItem);
    
    // Reset progress for next unlock
    await resetUnlockProgress(userId, category);
  } else {
    // Update progress
    await updateUnlockProgress(userId, category, newScore);
  }
};
```

### Collection/Wardrobe Screen
```typescript
// src/screens/CollectionScreen.tsx
const CollectionScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('shoes');
  const [unlockedItems, setUnlockedItems] = useState([]);
  
  return (
    <View>
      <CategoryTabs />
      <UnlockedItemsGrid items={unlockedItems} />
      <ProgressBar 
        current={progress.current_score}
        target={progress.next_unlock_threshold}
      />
    </View>
  );
};
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Update FashionCard for transparent backgrounds
- [ ] Create CategorySelectionScreen
- [ ] Update database schema for categories
- [ ] Add category filtering to fashion service

### Phase 2: Level System (Week 2)
- [ ] Implement Level 1 (Store View)
- [ ] Implement Level 2 (Pile View)
- [ ] Add drag-and-drop for Pile View
- [ ] Create LevelSelectionScreen

### Phase 3: Difficulty Scaling (Week 3)
- [ ] Implement difficulty calculation algorithm
- [ ] Add AI-based item similarity matching
- [ ] Test extreme difficulty levels
- [ ] Balance difficulty progression

### Phase 4: Multiplayer (Week 4)
- [ ] Enable multiplayer for Level 2
- [ ] Add team play support
- [ ] Implement real-time synchronization
- [ ] Test multiplayer gameplay

### Phase 5: Reward System (Week 5)
- [ ] Create user_fashion_collection table
- [ ] Implement unlock logic
- [ ] Build CollectionScreen
- [ ] Add unlock notifications
- [ ] Test reward progression

### Phase 6: Polish & Testing (Week 6)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User testing
- [ ] Final adjustments

## Technical Specifications

### Image Requirements
- Format: PNG with alpha channel
- Resolution: 512x512px minimum
- File size: < 500KB per image
- Background: Fully transparent
- Quality: High-resolution, clear details

### Performance Considerations
- Lazy load images
- Cache frequently used items
- Optimize pile view rendering
- Smooth drag-and-drop animations
- Efficient collision detection

### Multiplayer Architecture
- WebSocket for real-time updates
- Optimistic UI updates
- Conflict resolution
- Latency compensation
- Reconnection handling

## Success Metrics

### Engagement
- Average session duration > 10 minutes
- Replay rate > 60%
- Level completion rate
- Category preference distribution

### Difficulty
- Level 5+ win rate < 5%
- Average attempts per level
- Difficulty satisfaction rating
- Progression speed

### Rewards
- Unlock rate per user
- Collection completion rate
- Time to first unlock
- Motivation to continue playing

## Future Enhancements

### Potential Features
- Daily challenges per category
- Limited-time exclusive items
- Trading system between players
- Custom item creation
- Seasonal collections
- Fashion shows (showcase collections)
- Item rarity tiers (common, rare, legendary)
- Crafting system (combine items)
