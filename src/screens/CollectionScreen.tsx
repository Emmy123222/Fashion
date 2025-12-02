// src/screens/CollectionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/common/Loader';
import { FashionCategory } from '../types/fashion.types';
import { featureGate } from '../services/featureGate.service';
import { FeatureLock } from '../components/common/FeatureLock';

interface UnlockedItem {
  id: string;
  fashion_item_id: string;
  category: string;
  unlocked_at: string;
  unlock_score: number;
  name: string;
  image_url: string;
}

interface CategoryProgress {
  category: string;
  current_points: number;
  next_unlock_threshold: number;
  items_unlocked: number;
  progress_percentage: number;
}

const CATEGORIES: { id: FashionCategory; name: string; icon: string }[] = [
  { id: 'shoes', name: 'Shoes', icon: '👟' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
  { id: 'suits', name: 'Suits', icon: '🤵' },
  { id: 'accessories', name: 'Accessories', icon: '👜' },
  { id: 'hats', name: 'Hats', icon: '🎩' },
  { id: 'pants', name: 'Pants', icon: '👖' },
  { id: 'underwear', name: 'Underwear', icon: '🩲' },
  { id: 'shirts', name: 'Shirts', icon: '👔' },
  { id: 'blouses', name: 'Blouses', icon: '👚' },
];

export const CollectionScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isPremium, setIsPremium] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FashionCategory>('shoes');
  const [unlockedItems, setUnlockedItems] = useState<UnlockedItem[]>([]);
  const [progress, setProgress] = useState<CategoryProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumAndLoad();
  }, [user]);

  const checkPremiumAndLoad = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const premium = await featureGate.isPremium(user.id);
    setIsPremium(premium);

    if (premium) {
      loadCollection();
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isPremium) {
      loadCollection();
      loadProgress();
    }
  }, [user, selectedCategory]);

  const loadCollection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_fashion_collection')
        .select(`
          *,
          fashion_items (name, image_url)
        `)
        .eq('user_id', user.id)
        .eq('category', selectedCategory)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        fashion_item_id: item.fashion_item_id,
        category: item.category,
        unlocked_at: item.unlocked_at,
        unlock_score: item.unlock_score,
        name: item.fashion_items?.name || 'Unknown',
        image_url: item.fashion_items?.image_url || '',
      }));

      setUnlockedItems(formatted);
    } catch (error) {
      console.error('Error loading collection:', error);
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('unlock_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', selectedCategory)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProgress({
          category: data.category,
          current_points: data.current_points,
          next_unlock_threshold: data.next_unlock_threshold,
          items_unlocked: data.items_unlocked,
          progress_percentage: (data.current_points / data.next_unlock_threshold) * 100,
        });
      } else {
        // No progress yet
        setProgress({
          category: selectedCategory,
          current_points: 0,
          next_unlock_threshold: 1000,
          items_unlocked: 0,
          progress_percentage: 0,
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: UnlockedItem }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="contain" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemScore}>{item.unlock_score} pts</Text>
      </View>
      <View style={styles.unlockedBadge}>
        <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Loader />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Please log in to view your collection</Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <FeatureLock
        featureName="Rewards & Collection"
        featureIcon="🎁"
        description="Earn rewards and build your fashion collection by playing games"
        onUpgrade={() => navigation.navigate('SubscriptionWeb' as never)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Collection</Text>
        <MaterialIcons name="collections" size={24} color={theme.colors.primary} />
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryTabs}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTab,
              selectedCategory === cat.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === cat.id && styles.categoryTabTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Bar */}
      {progress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {progress.items_unlocked} items unlocked
            </Text>
            <Text style={styles.progressPoints}>
              {progress.current_points} / {progress.next_unlock_threshold} pts
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min(progress.progress_percentage, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressHint}>
            {progress.next_unlock_threshold - progress.current_points} points until next unlock
          </Text>
        </View>
      )}

      {/* Collection Grid */}
      {loading ? (
        <Loader />
      ) : unlockedItems.length > 0 ? (
        <FlatList
          data={unlockedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="lock" size={64} color={theme.colors.gray} />
          <Text style={styles.emptyText}>No items unlocked yet</Text>
          <Text style={styles.emptySubtext}>
            Play games to earn points and unlock {selectedCategory}!
          </Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  categoryScroll: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  categoryTabs: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  categoryTabActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gray,
  },
  categoryTabTextActive: {
    color: theme.colors.white,
  },
  progressContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.gray + '20',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 11,
    color: theme.colors.gray,
  },
  grid: {
    padding: theme.spacing.sm,
  },
  itemCard: {
    flex: 1 / 3,
    aspectRatio: 0.75,
    margin: 4,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  itemInfo: {
    marginTop: theme.spacing.xs,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemScore: {
    fontSize: 10,
    color: theme.colors.gray,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});
