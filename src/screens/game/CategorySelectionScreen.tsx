// src/screens/game/CategorySelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { FashionCategory } from '../../types/fashion.types';
import { GameStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { featureGate } from '../../services/featureGate.service';
import { PremiumBadge } from '../../components/common/PremiumBadge';

type CategorySelectionScreenNavigationProp = NativeStackNavigationProp<
  GameStackParamList,
  'CategorySelection'
>;

type Props = {
  navigation: CategorySelectionScreenNavigationProp;
};

interface CategoryOption {
  id: FashionCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  { 
    id: 'all', 
    name: 'All Categories', 
    icon: '🎨', 
    color: '#6C63FF',
    description: 'Mix of all items - Match within categories!'
  },
  { 
    id: 'shoes', 
    name: 'Shoes', 
    icon: '👟', 
    color: theme.colors.primary,
    description: 'Sneakers, heels, boots & more'
  },
  { 
    id: 'dresses', 
    name: 'Dresses', 
    icon: '👗', 
    color: theme.colors.secondary,
    description: 'Elegant dresses & gowns'
  },
  { 
    id: 'suits', 
    name: 'Suits', 
    icon: '🤵', 
    color: theme.colors.accent,
    description: 'Formal suits & blazers'
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    icon: '👜', 
    color: theme.colors.success,
    description: 'Bags, jewelry & more'
  },
  { 
    id: 'hats', 
    name: 'Hats', 
    icon: '🎩', 
    color: theme.colors.primary,
    description: 'Caps, hats & headwear'
  },
  { 
    id: 'pants', 
    name: 'Pants', 
    icon: '👖', 
    color: theme.colors.secondary,
    description: 'Jeans, trousers & shorts'
  },
  { 
    id: 'underwear', 
    name: 'Underwear', 
    icon: '🩲', 
    color: theme.colors.accent,
    description: 'Undergarments & basics'
  },
  { 
    id: 'shirts', 
    name: 'Shirts', 
    icon: '👔', 
    color: theme.colors.success,
    description: 'T-shirts, polos & dress shirts'
  },
  { 
    id: 'blouses', 
    name: 'Blouses', 
    icon: '👚', 
    color: theme.colors.secondary,
    description: 'Blouses & tops'
  },
];

export const CategorySelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [lockedCategories, setLockedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkLockedCategories();
  }, [user]);

  const checkLockedCategories = async () => {
    if (!user) return;

    const locked = new Set<string>();
    
    for (const category of CATEGORIES) {
      if (category.id === 'shoes') continue; // Shoes always free
      
      const canAccess = await featureGate.canAccessCategory(user.id, category.id);
      if (!canAccess) {
        locked.add(category.id);
      }
    }
    
    setLockedCategories(locked);
  };

  const handleCategorySelect = async (category: FashionCategory) => {
    if (!user) return;

    // Check if category is locked
    if (lockedCategories.has(category)) {
      featureGate.showUpgradePrompt('all_categories', navigation);
      return;
    }

    navigation.navigate('LevelSelection', { category });
  };

  const renderCategory = (category: CategoryOption) => {
    const isLocked = lockedCategories.has(category.id);
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard, 
          { borderColor: category.color },
          isLocked && styles.lockedCard
        ]}
        onPress={() => handleCategorySelect(category.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
          <Text style={[styles.icon, isLocked && styles.lockedIcon]}>{category.icon}</Text>
        </View>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryName, isLocked && styles.lockedText]}>
              {category.name}
            </Text>
            {isLocked && <PremiumBadge size="small" />}
          </View>
          <Text style={[styles.categoryDescription, isLocked && styles.lockedText]}>
            {category.description}
          </Text>
        </View>
        <MaterialIcons 
          name={isLocked ? "lock" : "chevron-right"} 
          size={24} 
          color={isLocked ? theme.colors.gray : category.color} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Category</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Select a fashion category to start matching
        </Text>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.map(renderCategory)}
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
  subtitle: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  categoriesGrid: {
    gap: theme.spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lockedCard: {
    opacity: 0.6,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  lockedText: {
    color: theme.colors.gray,
  },
});
