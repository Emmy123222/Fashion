// src/services/ai/difficultyAdapter.ts
import { PerformanceMetrics } from '../../types/game.types';
import { PlayerType } from '../../types/user.types';

interface DifficultyConfig {
  level: number;
  gridSize: { rows: number; cols: number };
  timeLimit: number;
  itemsCount: number;
}

class DifficultyAdapter {
  // Base difficulty configurations
  private difficultyLevels: DifficultyConfig[] = [
    { level: 1, gridSize: { rows: 4, cols: 4 }, timeLimit: 300, itemsCount: 8 },
    { level: 2, gridSize: { rows: 4, cols: 5 }, timeLimit: 240, itemsCount: 10 },
    { level: 3, gridSize: { rows: 6, cols: 6 }, timeLimit: 180, itemsCount: 18 },
    { level: 4, gridSize: { rows: 6, cols: 8 }, timeLimit: 150, itemsCount: 24 },
    { level: 5, gridSize: { rows: 8, cols: 8 }, timeLimit: 120, itemsCount: 32 },
  ];

  /**
   * Calculate suggested difficulty based on performance metrics
   */
  calculateDifficulty(metrics: PerformanceMetrics[], playerType: PlayerType): number {
    if (metrics.length === 0) {
      return this.getDefaultDifficulty(playerType);
    }

    // Get recent performance (last 5-10 games)
    const recentMetrics = metrics.slice(0, Math.min(10, metrics.length));

    // Calculate average performance score
    const avgPerformance = recentMetrics.reduce((sum, m) => sum + m.performance_score, 0) / recentMetrics.length;

    // Calculate average accuracy
    const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.accuracy_rate, 0) / recentMetrics.length;

    // Calculate average speed (lower is better)
    const avgSpeed = recentMetrics.reduce((sum, m) => sum + m.avg_match_time, 0) / recentMetrics.length;

    // Determine difficulty based on performance
    let suggestedLevel = 1;

    if (avgPerformance >= 90 && avgAccuracy >= 0.9 && avgSpeed < 2) {
      suggestedLevel = 5; // Expert
    } else if (avgPerformance >= 75 && avgAccuracy >= 0.8 && avgSpeed < 3) {
      suggestedLevel = 4; // Advanced
    } else if (avgPerformance >= 60 && avgAccuracy >= 0.7 && avgSpeed < 4) {
      suggestedLevel = 3; // Intermediate
    } else if (avgPerformance >= 40 && avgAccuracy >= 0.6) {
      suggestedLevel = 2; // Beginner+
    } else {
      suggestedLevel = 1; // Beginner
    }

    // Adjust for player type
    suggestedLevel = this.adjustForPlayerType(suggestedLevel, playerType);

    // Ensure gradual progression (don't jump more than 1 level)
    const currentLevel = recentMetrics[0]?.difficulty_level || 1;
    if (Math.abs(suggestedLevel - currentLevel) > 1) {
      suggestedLevel = currentLevel + (suggestedLevel > currentLevel ? 1 : -1);
    }

    return Math.max(1, Math.min(5, suggestedLevel));
  }

  /**
   * Get default difficulty for player type
   */
  private getDefaultDifficulty(playerType: PlayerType): number {
    switch (playerType) {
      case 'child':
        return 1;
      case 'teen':
        return 2;
      case 'adult':
        return 2;
      default:
        return 1;
    }
  }

  /**
   * Adjust difficulty based on player type
   */
  private adjustForPlayerType(level: number, playerType: PlayerType): number {
    switch (playerType) {
      case 'child':
        // Cap at level 3 for children
        return Math.min(level, 3);
      case 'teen':
        // Cap at level 4 for teens
        return Math.min(level, 4);
      case 'adult':
        // No cap for adults
        return level;
      default:
        return level;
    }
  }

  /**
   * Get difficulty configuration
   */
  getDifficultyConfig(level: number): DifficultyConfig {
    return this.difficultyLevels[level - 1] || this.difficultyLevels[0];
  }

  /**
   * Calculate performance score from game metrics
   */
  calculatePerformanceScore(
    avgMatchTime: number,
    accuracyRate: number,
    comboFrequency: number,
    timeLeft: number,
    timeLimit: number
  ): number {
    // Speed score (0-100, lower time is better)
    const speedScore = Math.max(0, 100 - (avgMatchTime * 10));

    // Accuracy score (0-100)
    const accuracyScore = accuracyRate * 100;

    // Combo score (0-100)
    const comboScore = comboFrequency * 100;

    // Time bonus (0-20)
    const timeBonus = (timeLeft / timeLimit) * 20;

    // Weighted average
    const performanceScore = (
      speedScore * 0.3 +
      accuracyScore * 0.4 +
      comboScore * 0.2 +
      timeBonus * 0.1
    );

    return Math.round(performanceScore);
  }

  /**
   * Analyze player trends
   */
  analyzeTrends(metrics: PerformanceMetrics[]): {
    isImproving: boolean;
    trend: 'up' | 'down' | 'stable';
    recommendation: string;
  } {
    if (metrics.length < 3) {
      return {
        isImproving: false,
        trend: 'stable',
        recommendation: 'Keep playing to establish your skill level',
      };
    }

    // Compare recent vs older performance
    const recentAvg = metrics.slice(0, 3).reduce((sum, m) => sum + m.performance_score, 0) / 3;
    const olderAvg = metrics.slice(3, 6).reduce((sum, m) => sum + m.performance_score, 0) / Math.min(3, metrics.length - 3);

    const difference = recentAvg - olderAvg;

    if (difference > 10) {
      return {
        isImproving: true,
        trend: 'up',
        recommendation: 'Great progress! Consider increasing difficulty.',
      };
    } else if (difference < -10) {
      return {
        isImproving: false,
        trend: 'down',
        recommendation: 'Take your time. Consider easier difficulty.',
      };
    } else {
      return {
        isImproving: false,
        trend: 'stable',
        recommendation: 'You\'re performing consistently. Keep it up!',
      };
    }
  }

  /**
   * Get personalized tips based on performance
   */
  getPersonalizedTips(metrics: PerformanceMetrics[]): string[] {
    if (metrics.length === 0) return [];

    const recent = metrics[0];
    const tips: string[] = [];

    if (recent.avg_match_time > 5) {
      tips.push('Try to match cards faster for higher scores');
    }

    if (recent.accuracy_rate < 0.7) {
      tips.push('Focus on remembering card positions');
    }

    if (recent.combo_frequency < 0.3) {
      tips.push('Build combos by matching cards quickly in succession');
    }

    if (tips.length === 0) {
      tips.push('You\'re doing great! Keep up the good work!');
    }

    return tips;
  }
}

export const difficultyAdapter = new DifficultyAdapter();

// Usage example:
/*
// Calculate suggested difficulty
const suggestedLevel = difficultyAdapter.calculateDifficulty(
  userPerformanceMetrics,
  'adult'
);

// Get difficulty config
const config = difficultyAdapter.getDifficultyConfig(suggestedLevel);

// Analyze trends
const analysis = difficultyAdapter.analyzeTrends(userPerformanceMetrics);

// Get tips
const tips = difficultyAdapter.getPersonalizedTips(userPerformanceMetrics);
*/
