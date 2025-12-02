// src/screens/game/LevelSelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { GameStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { featureGate } from '../../services/featureGate.service';
import { PremiumBadge } from '../../components/common/PremiumBadge';

type LevelSelectionScreenNavigationProp = NativeStackNavigationProp<
  GameStackParamList,
  'LevelSelection'
>;

type LevelSelectionScreenRouteProp = RouteProp<GameStackParamList, 'LevelSelection'>;

type Props = {
  navigation: LevelSelectionScreenNavigationProp;
  route: LevelSelectionScreenRouteProp;
};

interface LevelOption {
  id: number;
  name: string;
  layout: 'store' | 'pile';
  timeLimit: number;
  difficulty: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

const LEVELS: LevelOption[] = [
  {
    id: 1,
    name: 'Level 1: Store View',
    layout: 'store',
    timeLimit: 180,
    difficulty: 'Easy',
    description: 'Browse items in a neat store layout',
    icon: '🏪',
    color: theme.colors.success,
    features: ['3 minutes', 'Organized grid', 'Single player', 'Perfect for beginners'],
  },
  {
    id: 2,
    name: 'Level 2: Pile View',
    layout: 'pile',
    timeLimit: 120,
    difficulty: 'Medium',
    description: 'Find matches in a scattered pile',
    icon: '📦',
    color: theme.colors.warning,
    features: ['2 minutes', 'Drag & spread items', 'Multiplayer support', 'Team play enabled'],
  },
];

export const LevelSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { category } = route.params;
  const { user } = useAuth();
  const [lockedLevels, setLockedLevels] = useState<Set<number>>(new Set());

  useEffect(() => {
    checkLockedLevels();
  }, [user]);

  const checkLockedLevels = async () => {
    if (!user) return;

    const locked = new Set<number>();
    
    for (const level of LEVELS) {
      if (level.id <= 3) continue; // Levels 1-3 free
      const canAccess = await featureGate.canAccessLevel(user.id, level.id);
      if (!canAccess) {
        locked.add(level.id);
      }
    }
    
    setLockedLevels(locked);
  };

  const handleLevelSelect = async (level: number, layout: 'store' | 'pile') => {
    if (!user) return;

    // Check if level is locked
    if (lockedLevels.has(level)) {
      featureGate.showUpgradePrompt('advanced_levels', navigation);
      return;
    }

    // Check daily game limit
    const { canPlay, gamesLeft } = await featureGate.canPlayGame(user.id);
    if (!canPlay) {
      featureGate.showGameLimitPrompt(gamesLeft, navigation);
      return;
    }

    navigation.navigate('SinglePlayerGame', { 
      category,
      level,
      layout,
    });
  };

  const renderLevel = (level: LevelOption) => {
    const isLocked = lockedLevels.has(level.id);
    
    return (
      <TouchableOpacity
        key={level.id}
        style={[
          styles.levelCard, 
          { borderColor: level.color },
          isLocked && styles.lockedCard
        ]}
        onPress={() => handleLevelSelect(level.id, level.layout)}
        activeOpacity={0.7}
      >
      <View style={styles.levelHeader}>
        <View style={[styles.levelIconContainer, { backgroundColor: level.color + '20' }]}>
          <Text style={styles.levelIcon}>{level.icon}</Text>
        </View>
        <View style={styles.levelTitleContainer}>
          <View style={styles.levelNameRow}>
            <Text style={[styles.levelName, isLocked && styles.lockedText]}>{level.name}</Text>
            {isLocked && <PremiumBadge size="small" />}
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: level.color + '20' }]}>
            <Text style={[styles.difficultyText, { color: level.color }]}>
              {level.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.levelDescription}>{level.description}</Text>

      <View style={styles.featuresContainer}>
        {level.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={16} color={level.color} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.playButton}>
        <Text style={[styles.playButtonText, { color: isLocked ? theme.colors.gray : level.color }]}>
          {isLocked ? 'Locked' : 'Play Now'}
        </Text>
        <MaterialIcons 
          name={isLocked ? "lock" : "play-arrow"} 
          size={24} 
          color={isLocked ? theme.colors.gray : level.color} 
        />
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Level</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryBanner}>
          <Text style={styles.categoryText}>Category: {category.toUpperCase()}</Text>
        </View>

        <Text style={styles.subtitle}>
          Choose your game mode and difficulty
        </Text>

        <View style={styles.levelsContainer}>
          {LEVELS.map(renderLevel)}
        </View>

        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Difficulty increases rapidly at higher levels. Level 5+ is nearly impossible!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  categoryBanner: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  levelsContainer: {
    gap: theme.spacing.md,
  },
  levelCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  levelIcon: {
    fontSize: 32,
  },
  levelTitleContainer: {
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  levelDescription: {
    fontSize: 14,
    color: theme.colors.gray,
    marginBottom: theme.spacing.md,
  },
  featuresContainer: {
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    fontSize: 13,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '20',
    marginTop: theme.spacing.sm,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
});

// Add these styles to the existing StyleSheet
const additionalStyles = {
  levelNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  lockedCard: {
    opacity: 0.6,
  },
  lockedText: {
    color: theme.colors.gray,
  },
};
