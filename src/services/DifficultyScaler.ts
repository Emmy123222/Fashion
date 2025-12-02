// src/services/DifficultyScaler.ts
import { FashionCategory } from '../types/fashion.types';

export interface DifficultyConfig {
  level: number;
  itemsCount: number; // Number of pairs
  timeLimit: number; // Seconds
  gridSize: { rows: number; cols: number };
  similarityThreshold: number; // 0-1, higher = more similar items
  layout: 'store' | 'pile';
  description: string;
  winProbability: number; // Estimated win rate
}

export class DifficultyScaler {
  /**
   * Calculate difficulty configuration for a given level
   * Difficulty increases VERY FAST and becomes nearly impossible
   */
  static getDifficultyConfig(level: number): DifficultyConfig {
    // Level 1: Easy - Store View
    if (level === 1) {
      return {
        level: 1,
        itemsCount: 8, // 8 pairs = 16 cards
        timeLimit: 180, // 3 minutes
        gridSize: { rows: 4, cols: 4 },
        similarityThreshold: 0.3,
        layout: 'store',
        description: 'Easy - Perfect for beginners',
        winProbability: 0.85, // 85% win rate
      };
    }

    // Level 2: Medium - Pile View
    if (level === 2) {
      return {
        level: 2,
        itemsCount: 12, // 12 pairs = 24 cards
        timeLimit: 120, // 2 minutes
        gridSize: { rows: 4, cols: 6 },
        similarityThreshold: 0.5,
        layout: 'pile',
        description: 'Medium - Scattered items',
        winProbability: 0.65, // 65% win rate
      };
    }

    // Level 3: Hard
    if (level === 3) {
      return {
        level: 3,
        itemsCount: 16, // 16 pairs = 32 cards
        timeLimit: 90, // 1.5 minutes
        gridSize: { rows: 4, cols: 8 },
        similarityThreshold: 0.65,
        layout: 'pile',
        description: 'Hard - Very similar items',
        winProbability: 0.45, // 45% win rate
      };
    }

    // Level 4: Very Hard
    if (level === 4) {
      return {
        level: 4,
        itemsCount: 20, // 20 pairs = 40 cards
        timeLimit: 75, // 1.25 minutes
        gridSize: { rows: 5, cols: 8 },
        similarityThreshold: 0.75,
        layout: 'pile',
        description: 'Very Hard - Extreme challenge',
        winProbability: 0.25, // 25% win rate
      };
    }

    // Level 5: Expert
    if (level === 5) {
      return {
        level: 5,
        itemsCount: 25, // 25 pairs = 50 cards
        timeLimit: 60, // 1 minute
        gridSize: { rows: 5, cols: 10 },
        similarityThreshold: 0.85,
        layout: 'pile',
        description: 'Expert - Nearly impossible',
        winProbability: 0.15, // 15% win rate
      };
    }

    // Level 6-10: Insane (progressively harder)
    if (level >= 6 && level <= 10) {
      const extraPairs = (level - 5) * 3;
      const timeReduction = (level - 5) * 5;
      
      return {
        level,
        itemsCount: Math.min(25 + extraPairs, 40), // Cap at 40 pairs
        timeLimit: Math.max(60 - timeReduction, 30), // Minimum 30 seconds
        gridSize: this.calculateGridSize(Math.min(25 + extraPairs, 40)),
        similarityThreshold: Math.min(0.85 + (level - 5) * 0.02, 0.95),
        layout: 'pile',
        description: `Level ${level} - Insane difficulty`,
        winProbability: Math.max(0.15 - (level - 5) * 0.02, 0.05), // 5-15% win rate
      };
    }

    // Level 11+: Impossible
    return {
      level,
      itemsCount: 40, // 40 pairs = 80 cards
      timeLimit: 30, // 30 seconds
      gridSize: { rows: 8, cols: 10 },
      similarityThreshold: 0.98, // Almost identical items
      layout: 'pile',
      description: `Level ${level} - IMPOSSIBLE`,
      winProbability: 0.01, // 1% win rate
    };
  }

  /**
   * Calculate optimal grid size for number of pairs
   */
  private static calculateGridSize(pairs: number): { rows: number; cols: number } {
    const totalCards = pairs * 2;
    
    // Find factors closest to square
    let bestRows = 4;
    let bestCols = Math.ceil(totalCards / 4);
    let bestDiff = Math.abs(bestRows - bestCols);

    for (let rows = 4; rows <= 10; rows++) {
      const cols = Math.ceil(totalCards / rows);
      const diff = Math.abs(rows - cols);
      
      if (diff < bestDiff && rows * cols >= totalCards) {
        bestRows = rows;
        bestCols = cols;
        bestDiff = diff;
      }
    }

    return { rows: bestRows, cols: bestCols };
  }

  /**
   * Get difficulty description for UI
   */
  static getDifficultyLabel(level: number): string {
    if (level === 1) return 'Easy';
    if (level === 2) return 'Medium';
    if (level === 3) return 'Hard';
    if (level === 4) return 'Very Hard';
    if (level === 5) return 'Expert';
    if (level >= 6 && level <= 10) return 'Insane';
    return 'IMPOSSIBLE';
  }

  /**
   * Get difficulty color for UI
   */
  static getDifficultyColor(level: number): string {
    if (level === 1) return '#22C55E'; // Green
    if (level === 2) return '#FFC736'; // Yellow
    if (level === 3) return '#FF4F81'; // Pink
    if (level === 4) return '#EF4444'; // Red
    if (level >= 5) return '#6C63FF'; // Purple
    return '#000000'; // Black for impossible
  }

  /**
   * Calculate score multiplier based on difficulty
   */
  static getScoreMultiplier(level: number): number {
    return 1 + (level - 1) * 0.5; // 1x, 1.5x, 2x, 2.5x, etc.
  }

  /**
   * Get motivational message based on level
   */
  static getMotivationalMessage(level: number): string {
    if (level === 1) return 'Great start! Keep going!';
    if (level === 2) return 'Getting tougher! You can do it!';
    if (level === 3) return 'Impressive! This is hard!';
    if (level === 4) return 'Wow! You\'re really good!';
    if (level === 5) return 'AMAZING! Few reach this level!';
    if (level >= 6 && level <= 10) return 'LEGENDARY! You\'re unstoppable!';
    return 'IMPOSSIBLE! Are you even human?!';
  }

  /**
   * Check if player should unlock next level
   */
  static shouldUnlockNextLevel(
    currentLevel: number,
    score: number,
    timeRemaining: number,
    matchAccuracy: number
  ): boolean {
    const config = this.getDifficultyConfig(currentLevel);
    const timeUsed = config.timeLimit - timeRemaining;
    const timeEfficiency = timeRemaining / config.timeLimit;

    // Requirements get stricter at higher levels
    const minScore = currentLevel * 100;
    const minAccuracy = Math.max(0.7 - (currentLevel * 0.05), 0.5);
    const minTimeEfficiency = Math.max(0.3 - (currentLevel * 0.02), 0.1);

    return (
      score >= minScore &&
      matchAccuracy >= minAccuracy &&
      timeEfficiency >= minTimeEfficiency
    );
  }

  /**
   * Calculate reward points based on performance
   */
  static calculateRewardPoints(
    level: number,
    score: number,
    timeRemaining: number,
    matchAccuracy: number
  ): number {
    const basePoints = score * this.getScoreMultiplier(level);
    const timeBonus = timeRemaining * 2;
    const accuracyBonus = matchAccuracy * 100;

    return Math.floor(basePoints + timeBonus + accuracyBonus);
  }

  /**
   * Get items with similar appearance for higher difficulty
   */
  static filterSimilarItems(
    items: any[],
    category: FashionCategory,
    similarityThreshold: number
  ): any[] {
    // For high similarity threshold, prefer items from same category
    // This makes them look more similar
    if (similarityThreshold > 0.7) {
      return items.filter(item => item.category === category);
    }
    return items;
  }
}
