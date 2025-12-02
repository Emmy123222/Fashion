# Integration Guide - Connecting All Features

## Overview
This guide shows how to integrate all the new features (Category Selection, Difficulty Scaling, Rewards) into the existing game.

## Step 1: Update SinglePlayerGameScreen

### Add Imports
```typescript
import { DifficultyScaler } from '../../services/DifficultyScaler';
import { supabase } from '../../lib/supabase';
```

### Use DifficultyScaler in initializeGame
```typescript
const initializeGame = async () => {
  try {
    if (!user) {
      Alert.alert('Error', 'Please log in to play');
      navigation.goBack();
      return;
    }

    // Get difficulty configuration
    const difficultyConfig = DifficultyScaler.getDifficultyConfig(level);
    
    // Update game settings
    setGridSize(difficultyConfig.gridSize);
    setTimeLimit(difficultyConfig.timeLimit);
    
    // Get items for selected category
    const selectedCategory = (category as FashionCategory) || 'shoes';
    const itemsNeeded = difficultyConfig.itemsCount;
    
    console.log(`🎯 Level ${level}: ${difficultyConfig.description}`);
    console.log(`⏱️ Time: ${difficultyConfig.timeLimit}s`);
    console.log(`📊 Grid: ${difficultyConfig.gridSize.rows}x${difficultyConfig.gridSize.cols}`);
    console.log(`🎲 Win probability: ${(difficultyConfig.winProbability * 100).toFixed(0)}%`);
    
    // Load items...
    const itemsResponse = await fashionService.getFashionItems({
      category: selectedCategory as FashionCategory,
      player_type: user.player_type,
      approved_only: true,
      limit: 100,
    });
    
    // Continue with game setup...
  } catch (error: any) {
    console.error('Failed to initialize game:', error);
    Alert.alert('Error', error.message || 'Failed to start game');
    navigation.goBack();
  }
};
```

### Add Reward Processing After Game Ends
```typescript
const handleGameEnd = async (finalGameState: GameState) => {
  if (!user || !category) return;
  
  try {
    // Calculate match accuracy
    const totalMatches = finalGameState.matchedPairs.length;
    const totalAttempts = finalGameState.moves || totalMatches;
    const matchAccuracy = totalMatches / Math.max(totalAttempts, 1);
    
    // Calculate reward points using DifficultyScaler
    const rewardPoints = DifficultyScaler.calculateRewardPoints(
      level,
      finalGameState.score,
      finalGameState.timeRemaining || 0,
      matchAccuracy
    );
    
    console.log(`🎁 Reward Points: ${rewardPoints}`);
    
    // Check for unlocks
    const { data, error } = await supabase.rpc('check_and_unlock_items', {
      p_user_id: user.id,
      p_category: category,
      p_points_earned: rewardPoints
    });
    
    if (error) {
      console.error('Error checking unlocks:', error);
    } else if (data && data.length > 0 && data[0].unlocked) {
      // Show unlock notification
      Alert.alert(
        '🎉 New Item Unlocked!',
        `You unlocked: ${data[0].new_item_name}\n\nTotal ${category} unlocked: ${data[0].total_unlocked}`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
    
    // Check if should unlock next level
    const shouldUnlock = DifficultyScaler.shouldUnlockNextLevel(
      level,
      finalGameState.score,
      finalGameState.timeRemaining || 0,
      matchAccuracy
    );
    
    if (shouldUnlock && level < 11) {
      Alert.alert(
        '🎊 Level Up!',
        `You unlocked Level ${level + 1}!\n${DifficultyScaler.getMotivationalMessage(level + 1)}`,
        [{ text: 'Let\'s Go!', style: 'default' }]
      );
    }
    
    // Navigate to results
    navigation.replace('RoundResult', {
      isWinner: finalGameState.isGameOver && finalGameState.matchedPairs.length === gridSize.rows * gridSize.cols / 2,
      score: finalGameState.score,
      time: finalGameState.timeRemaining || 0,
      matches: finalGameState.matchedPairs.length,
      gameMode: 'single',
    });
    
  } catch (error) {
    console.error('Error processing game end:', error);
    // Still navigate to results even if reward processing fails
    navigation.replace('RoundResult', {
      isWinner: false,
      score: finalGameState.score,
      time: 0,
      matches: finalGameState.matchedPairs.length,
      gameMode: 'single',
    });
  }
};
```

## Step 2: Add Collection to Navigation

### Update MainTabNavigator.tsx
```typescript
import { CollectionScreen } from '../screens/CollectionScreen';

// In the Tab.Navigator:
<Tab.Screen 
  name="Collection" 
  component={CollectionScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="collections" size={size} color={color} />
    ),
  }}
/>
```

### Or Add to AppNavigator.tsx
```typescript
import { CollectionScreen } from '../screens/CollectionScreen';

// In the Stack.Navigator:
<Stack.Screen 
  name="Collection" 
  component={CollectionScreen}
  options={{ headerShown: false }}
/>
```

### Update navigation types
```typescript
// In src/navigation/types.ts
export type RootStackParamList = {
  // ... existing screens
  Collection: undefined;
};

// Or in MainTabParamList:
export type MainTabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Collection: undefined; // Add this
  Profile: undefined;
  Admin: undefined;
};
```

## Step 3: Add Collection Button to Profile

### Update ProfileScreen.tsx
```typescript
// Add navigation button
<TouchableOpacity 
  style={styles.collectionButton}
  onPress={() => navigation.navigate('Collection')}
>
  <MaterialIcons name="collections" size={24} color={theme.colors.primary} />
  <Text style={styles.collectionButtonText}>My Collection</Text>
  <MaterialIcons name="chevron-right" size={24} color={theme.colors.gray} />
</TouchableOpacity>

// Add styles
collectionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.white,
  padding: theme.spacing.md,
  borderRadius: theme.radius.md,
  marginBottom: theme.spacing.sm,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
collectionButtonText: {
  flex: 1,
  fontSize: 16,
  fontWeight: '600',
  color: theme.colors.text,
  marginLeft: theme.spacing.sm,
},
```

## Step 4: Update LevelSelectionScreen with Difficulty Info

### Add Difficulty Labels
```typescript
import { DifficultyScaler } from '../../services/DifficultyScaler';

// Update LEVELS array
const LEVELS: LevelOption[] = [
  {
    id: 1,
    name: 'Level 1: Store View',
    layout: 'store',
    timeLimit: 180,
    difficulty: DifficultyScaler.getDifficultyLabel(1),
    description: DifficultyScaler.getDifficultyConfig(1).description,
    icon: '🏪',
    color: DifficultyScaler.getDifficultyColor(1),
    features: ['3 minutes', 'Organized grid', 'Single player', '85% win rate'],
  },
  {
    id: 2,
    name: 'Level 2: Pile View',
    layout: 'pile',
    timeLimit: 120,
    difficulty: DifficultyScaler.getDifficultyLabel(2),
    description: DifficultyScaler.getDifficultyConfig(2).description,
    icon: '📦',
    color: DifficultyScaler.getDifficultyColor(2),
    features: ['2 minutes', 'Drag & spread items', 'Multiplayer support', '65% win rate'],
  },
  // Add more levels dynamically
  ...Array.from({ length: 9 }, (_, i) => {
    const level = i + 3;
    const config = DifficultyScaler.getDifficultyConfig(level);
    return {
      id: level,
      name: `Level ${level}: ${DifficultyScaler.getDifficultyLabel(level)}`,
      layout: 'pile' as const,
      timeLimit: config.timeLimit,
      difficulty: DifficultyScaler.getDifficultyLabel(level),
      description: config.description,
      icon: level >= 5 ? '🔥' : '⚡',
      color: DifficultyScaler.getDifficultyColor(level),
      features: [
        `${config.timeLimit}s time`,
        `${config.itemsCount} pairs`,
        `${(config.winProbability * 100).toFixed(0)}% win rate`,
        config.layout === 'pile' ? 'Pile view' : 'Store view',
      ],
    };
  }),
];
```

## Step 5: Run Database Migrations

### Execute in Supabase SQL Editor
```bash
# 1. Update category constraints
\i sql/06_add_detailed_organization_fields.sql

# 2. Fix leaderboard aggregation
\i sql/08_fix_leaderboard_aggregation.sql

# 3. Add reward system
\i sql/09_reward_system.sql
```

### Or run individually:
```sql
-- Update categories
ALTER TABLE fashion_items 
DROP CONSTRAINT IF EXISTS fashion_items_category_check;

ALTER TABLE fashion_items
ADD CONSTRAINT fashion_items_category_check
CHECK (category IN ('shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses'));

-- Then run the reward system SQL
-- (Copy content from sql/09_reward_system.sql)
```

## Step 6: Test the Integration

### Testing Checklist:

**1. Category Selection:**
- [ ] PLAY button navigates to CategorySelection
- [ ] All 9 categories display
- [ ] Selecting category navigates to LevelSelection
- [ ] Category parameter passes correctly

**2. Level Selection:**
- [ ] All levels display with correct info
- [ ] Difficulty labels show correctly
- [ ] Colors match difficulty
- [ ] Win rates display
- [ ] Selecting level starts game

**3. Game with Difficulty:**
- [ ] Level 1: 3 min, 8 pairs, easy
- [ ] Level 2: 2 min, 12 pairs, medium
- [ ] Higher levels: progressively harder
- [ ] Time limits correct
- [ ] Grid sizes correct

**4. Reward System:**
- [ ] Points calculated after game
- [ ] Unlock check runs
- [ ] Notification shows on unlock
- [ ] Progress updates in database
- [ ] No duplicate unlocks

**5. Collection Screen:**
- [ ] Accessible from navigation
- [ ] Shows unlocked items
- [ ] Progress bars work
- [ ] Category tabs functional
- [ ] Empty state for locked categories

## Step 7: Add Unlock Notification Component

### Create UnlockNotification.tsx
```typescript
// src/components/game/UnlockNotification.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button } from '../common/Button';

interface Props {
  visible: boolean;
  itemName: string;
  itemImage: string;
  category: string;
  totalUnlocked: number;
  onClose: () => void;
}

export const UnlockNotification: React.FC<Props> = ({
  visible,
  itemName,
  itemImage,
  category,
  totalUnlocked,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <MaterialIcons name="celebration" size={48} color={theme.colors.accent} />
          
          <Text style={styles.title}>New Item Unlocked!</Text>
          
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: itemImage }} 
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.itemName}>{itemName}</Text>
          <Text style={styles.category}>{category}</Text>
          
          <Text style={styles.progress}>
            {totalUnlocked} {category} unlocked
          </Text>
          
          <Button
            title="Awesome!"
            onPress={onClose}
            variant="primary"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  category: {
    fontSize: 14,
    color: theme.colors.gray,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  progress: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
  },
});
```

## Step 8: Performance Optimization

### Add Caching for Difficulty Configs
```typescript
// In DifficultyScaler.ts
private static configCache: Map<number, DifficultyConfig> = new Map();

static getDifficultyConfig(level: number): DifficultyConfig {
  if (this.configCache.has(level)) {
    return this.configCache.get(level)!;
  }
  
  const config = this.calculateDifficultyConfig(level);
  this.configCache.set(level, config);
  return config;
}
```

### Optimize Collection Screen Loading
```typescript
// Add pagination
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 12;

// Load items with pagination
const loadCollection = async () => {
  const { data, error } = await supabase
    .from('user_fashion_collection')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', selectedCategory)
    .order('unlocked_at', { ascending: false })
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
  
  // Handle data...
};
```

## Troubleshooting

### Issue: Rewards not unlocking
**Solution:** Check database function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'check_and_unlock_items';
```

### Issue: Category not filtering
**Solution:** Verify category parameter:
```typescript
console.log('Category:', category);
console.log('Type:', typeof category);
```

### Issue: Difficulty not applying
**Solution:** Check DifficultyScaler import:
```typescript
import { DifficultyScaler } from '../../services/DifficultyScaler';
const config = DifficultyScaler.getDifficultyConfig(level);
console.log('Config:', config);
```

## Summary

After completing these steps, you'll have:
- ✅ Full category selection flow
- ✅ 11+ difficulty levels
- ✅ Reward system with unlocks
- ✅ Collection/wardrobe screen
- ✅ Unlock notifications
- ✅ Progress tracking
- ✅ All features integrated

The game is now feature-complete! 🎉
