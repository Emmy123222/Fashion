// src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet,  View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { leaderboardService } from '../services';
import { LeaderboardEntry, LeaderboardScope } from '../types/leaderboard.types';
import { Card } from '../components/common/Card';
import { Loader } from '../components/common/Loader';

const SCOPES: { label: string; value: LeaderboardScope }[] = [
  { label: 'Global', value: 'global' },
  { label: 'Country', value: 'country' },
  { label: 'State', value: 'state' },
  { label: 'City', value: 'city' },
  { label: 'School', value: 'school' },
];

export const LeaderboardScreen: React.FC = () => {
  const [selectedScope, setSelectedScope] = useState<LeaderboardScope>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedScope]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await leaderboardService.getLeaderboard({
        scope: selectedScope,
        scope_value: selectedScope === 'global' ? 'global' : undefined,
        leaderboard_type: 'user',
        period: 'all_time',
        limit: 100,
      });

      if (response.success && response.data) {
        setLeaderboard(response.data);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRankBadge = (rank?: number) => {
    if (!rank) return null;

    let badgeColor = theme.colors.gray;
    let icon = 'emoji-events';

    if (rank === 1) {
      badgeColor = '#FFD700'; // Gold
      icon = 'emoji-events';
    } else if (rank === 2) {
      badgeColor = '#C0C0C0'; // Silver
      icon = 'emoji-events';
    } else if (rank === 3) {
      badgeColor = '#CD7F32'; // Bronze
      icon = 'emoji-events';
    }

    return (
      <View style={[styles.rankBadge, { backgroundColor: badgeColor + '20' }]}>
        {rank <= 3 ? (
          <MaterialIcons name={icon} size={24} color={badgeColor} />
        ) : (
          <Text style={[styles.rankNumber, { color: badgeColor }]}>#{rank}</Text>
        )}
      </View>
    );
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <Card style={styles.leaderboardCard} padding="small">
      <View style={styles.leaderboardRow}>
        {renderRankBadge(item.rank || index + 1)}

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={24} color={theme.colors.gray} />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username} numberOfLines={1}>
              {item.username || item.full_name || 'Anonymous'}
            </Text>
            <Text style={styles.stats}>
              {item.wins} wins • {item.matches_played} matches
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{item.score.toLocaleString()}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <TouchableOpacity onPress={loadLeaderboard}>
          <MaterialIcons name="refresh" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Scope Tabs */}
      <View style={styles.tabs}>
        {SCOPES.map((scope) => (
          <TouchableOpacity
            key={scope.value}
            style={[
              styles.tab,
              selectedScope === scope.value && styles.tabActive,
            ]}
            onPress={() => setSelectedScope(scope.value)}
          >
            <Text
              style={[
                styles.tabText,
                selectedScope === scope.value && styles.tabTextActive,
              ]}
            >
              {scope.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <Loader text="Loading rankings..." />
      ) : leaderboard.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="leaderboard" size={64} color={theme.colors.gray} />
          <Text style={styles.emptyText}>No rankings yet</Text>
          <Text style={styles.emptySubtext}>Play games to appear on the leaderboard!</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    ...theme.text.body,
    color: theme.colors.gray,
    fontWeight: '600',
    fontSize: 12,
  },
  tabTextActive: {
    color: theme.colors.white,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  leaderboardCard: {
    marginBottom: theme.spacing.sm,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  rankNumber: {
    ...theme.text.h3,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    ...theme.text.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  stats: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    ...theme.text.h3,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  scoreLabel: {
    ...theme.text.caption,
    color: theme.colors.gray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.text.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});
