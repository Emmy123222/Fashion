// Feature Gate Service
// Controls access to premium features based on subscription status

import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export type FeatureType = 
  | 'pile_mode'
  | 'advanced_levels'
  | 'all_categories'
  | 'full_leaderboard'
  | 'rewards_collection'
  | 'multiplayer'
  | 'team_mode'
  | 'unlimited_games';

interface FeatureConfig {
  name: string;
  description: string;
  icon: string;
}

const FEATURE_CONFIGS: Record<FeatureType, FeatureConfig> = {
  pile_mode: {
    name: 'Pile Mode',
    description: 'Drag and spread items in a realistic pile',
    icon: '📦',
  },
  advanced_levels: {
    name: 'Advanced Levels',
    description: 'Access levels 4-11+ with extreme difficulty',
    icon: '🔥',
  },
  all_categories: {
    name: 'All Categories',
    description: 'Unlock all 9 fashion categories',
    icon: '🎨',
  },
  full_leaderboard: {
    name: 'Full Leaderboard',
    description: 'Access all 12 scopes and 4 time periods',
    icon: '🏆',
  },
  rewards_collection: {
    name: 'Rewards & Collection',
    description: 'Earn rewards and build your fashion collection',
    icon: '🎁',
  },
  multiplayer: {
    name: 'Multiplayer Mode',
    description: 'Challenge other players in real-time',
    icon: '⚔️',
  },
  team_mode: {
    name: 'Team Mode',
    description: 'Play with friends in team battles',
    icon: '👥',
  },
  unlimited_games: {
    name: 'Unlimited Games',
    description: 'Play as many games as you want',
    icon: '♾️',
  },
};

// Free tier limits
const FREE_DAILY_GAME_LIMIT = 5;
const FREE_MAX_LEVEL = 3;
const FREE_CATEGORIES = ['shoes'];
const FREE_LEADERBOARD_SCOPES = ['global'];

class FeatureGateService {
  /**
   * Check if user has premium subscription
   */
  async isPremium(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (error) {
        // If column doesn't exist yet, treat as free user (silently)
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          return false;
        }
        return false;
      }

      if (!data) return false;

      // Check if paid and not expired
      if (data.subscription_status === 'paid' || data.subscription_status === 'premium') {
        if (!data.subscription_expires_at) return true;
        return new Date(data.subscription_expires_at) > new Date();
      }

      return false;
    } catch (error: any) {
      // Silently treat as free user on error
      return false;
    }
  }

  /**
   * Check if user can access a specific feature
   */
  async canAccessFeature(userId: string, feature: FeatureType): Promise<boolean> {
    const isPremium = await this.isPremium(userId);
    
    // Premium users can access everything
    if (isPremium) return true;

    // Free users have limited access
    switch (feature) {
      case 'pile_mode':
      case 'advanced_levels':
      case 'all_categories':
      case 'full_leaderboard':
      case 'rewards_collection':
      case 'multiplayer':
      case 'team_mode':
      case 'unlimited_games':
        return false;
      default:
        return true;
    }
  }

  /**
   * Check if user can access a specific level
   */
  async canAccessLevel(userId: string, level: number): Promise<boolean> {
    const isPremium = await this.isPremium(userId);
    
    if (isPremium) return true;
    
    // Free users can only access levels 1-3
    return level <= FREE_MAX_LEVEL;
  }

  /**
   * Check if user can access a specific category
   */
  async canAccessCategory(userId: string, category: string): Promise<boolean> {
    const isPremium = await this.isPremium(userId);
    
    if (isPremium) return true;
    
    // Free users can only access shoes
    return FREE_CATEGORIES.includes(category);
  }

  /**
   * Check if user can access a leaderboard scope
   */
  async canAccessLeaderboardScope(userId: string, scope: string): Promise<boolean> {
    const isPremium = await this.isPremium(userId);
    
    if (isPremium) return true;
    
    // Free users can only access global leaderboard
    return FREE_LEADERBOARD_SCOPES.includes(scope);
  }

  /**
   * Get daily game count for user
   */
  async getDailyGameCount(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', today.toISOString());

      // If table doesn't exist yet, return 0 (allow play)
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          // Silently allow play - table will be created when migrations run
          return 0;
        }
        // For any other error, log but don't show to user
        if (error.message) {
          console.warn('Could not check game count, allowing play:', error.message);
        }
        return 0;
      }

      return count || 0;
    } catch (error: any) {
      // Silently fail open - better UX than blocking users
      if (error?.message) {
        console.warn('Game count check failed, allowing play');
      }
      return 0;
    }
  }

  /**
   * Check if user can play another game
   */
  async canPlayGame(userId: string): Promise<{ canPlay: boolean; gamesLeft: number }> {
    const isPremium = await this.isPremium(userId);
    
    // Premium users have unlimited games
    if (isPremium) {
      return { canPlay: true, gamesLeft: -1 }; // -1 means unlimited
    }

    // Free users have daily limit
    const gamesPlayed = await this.getDailyGameCount(userId);
    const gamesLeft = Math.max(0, FREE_DAILY_GAME_LIMIT - gamesPlayed);
    
    return {
      canPlay: gamesLeft > 0,
      gamesLeft,
    };
  }

  /**
   * Show upgrade prompt for a feature
   */
  showUpgradePrompt(feature: FeatureType, navigation?: any) {
    const config = FEATURE_CONFIGS[feature];
    
    Alert.alert(
      `${config.icon} ${config.name}`,
      `${config.description}\n\nUpgrade to Premium for $4.99/year to unlock this feature and more!`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Upgrade Now',
          style: 'default',
          onPress: () => {
            if (navigation) {
              navigation.navigate('SubscriptionWeb');
            }
          },
        },
      ]
    );
  }

  /**
   * Show game limit reached prompt
   */
  showGameLimitPrompt(gamesLeft: number, navigation?: any) {
    if (gamesLeft > 0) {
      Alert.alert(
        '⚠️ Game Limit',
        `You have ${gamesLeft} game${gamesLeft === 1 ? '' : 's'} left today.\n\nUpgrade to Premium for unlimited games!`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '🚫 Daily Limit Reached',
        `You've played ${FREE_DAILY_GAME_LIMIT} games today.\n\nUpgrade to Premium for unlimited games!`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Upgrade Now',
            style: 'default',
            onPress: () => {
              if (navigation) {
                navigation.navigate('SubscriptionWeb');
              }
            },
          },
        ]
      );
    }
  }

  /**
   * Get feature config
   */
  getFeatureConfig(feature: FeatureType): FeatureConfig {
    return FEATURE_CONFIGS[feature];
  }

  /**
   * Get all locked features for free user
   */
  getLockedFeatures(): FeatureType[] {
    return [
      'pile_mode',
      'advanced_levels',
      'all_categories',
      'full_leaderboard',
      'rewards_collection',
      'multiplayer',
      'team_mode',
      'unlimited_games',
    ];
  }

  /**
   * Get free tier limits
   */
  getFreeLimits() {
    return {
      dailyGames: FREE_DAILY_GAME_LIMIT,
      maxLevel: FREE_MAX_LEVEL,
      categories: FREE_CATEGORIES,
      leaderboardScopes: FREE_LEADERBOARD_SCOPES,
    };
  }
}

export const featureGate = new FeatureGateService();
