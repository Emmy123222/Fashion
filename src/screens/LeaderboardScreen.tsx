// src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { leaderboardService, gameService } from '../services';
import { LeaderboardEntry, LeaderboardScope } from '../types/leaderboard.types';
import { Card } from '../components/common/Card';
import { Loader } from '../components/common/Loader';

const SCOPES: { label: string; value: LeaderboardScope }[] = [
  { label: 'Global', value: 'global' },
  { label: 'Country', value: 'country' },
  { label: 'State', value: 'state' },
  { label: 'County', value: 'county' },
  { label: 'City', value: 'city' },
  { label: 'High School', value: 'high_school' },
  { label: 'College', value: 'college' },
  { label: 'University', value: 'university' },
  { label: 'Nonprofit', value: 'nonprofit' },
  { label: 'Corporation', value: 'corporation' },
  { label: 'Government', value: 'government' },
  { label: 'Chapter', value: 'organization_chapter' },
];

const PERIODS = [
  { label: 'Today', value: 'daily' },
  { label: 'This Week', value: 'weekly' },
  { label: 'This Month', value: 'monthly' },
  { label: 'All-Time', value: 'all_time' },
] as const;

export const LeaderboardScreen: React.FC = () => {
  const [selectedScope, setSelectedScope] = useState<LeaderboardScope>('global');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedScope, selectedPeriod]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await leaderboardService.getLeaderboard({
        scope: selectedScope,
        scope_value: selectedScope === 'global' ? 'global' : undefined,
        leaderboard_type: 'user',
        period: selectedPeriod,
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

  const handlePlayerPress = async (player: LeaderboardEntry) => {
    if (!player.user_id) return;
    
    try {
      setSelectedPlayer(player);
      setShowProfileModal(true);
      
      // Load player stats
      const statsResponse = await gameService.getUserStats(player.user_id);
      if (statsResponse.success) {
        setPlayerStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load player stats:', error);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedPlayer(null);
    setPlayerStats(null);
  };

  const renderRankBadge = (rank?: number) => {
    if (!rank) return null;

    let badgeColor: string = theme.colors.gray;
    let iconName: any = 'emoji-events';

    if (rank === 1) {
      badgeColor = theme.colors.accent; // Gold Yellow
    } else if (rank === 2) {
      badgeColor = '#C0C0C0'; // Silver
    } else if (rank === 3) {
      badgeColor = '#CD7F32'; // Bronze
    } else {
      badgeColor = theme.colors.primary; // Royal Purple for others
    }

    return (
      <View style={[styles.rankBadge, { backgroundColor: badgeColor + '20' }]}>
        {rank <= 3 ? (
          <MaterialIcons name={iconName} size={24} color={badgeColor} />
        ) : (
          <Text style={[styles.rankNumber, { color: badgeColor }]}>#{rank}</Text>
        )}
      </View>
    );
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <TouchableOpacity onPress={() => handlePlayerPress(item)}>
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
              <View style={styles.playerInfo}>
                {item.country && (
                  <Text style={styles.country}>🌍 {item.country}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{item.score.toLocaleString()}</Text>
            <Text style={styles.scoreLabel}>points</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <TouchableOpacity onPress={loadLeaderboard} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Period Tabs */}
      <View style={styles.periodTabs}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodTab,
              selectedPeriod === period.value && styles.periodTabActive,
            ]}
            onPress={() => setSelectedPeriod(period.value)}
          >
            <Text
              style={[
                styles.periodTabText,
                selectedPeriod === period.value && styles.periodTabTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scope Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scopeScrollView}
        contentContainerStyle={styles.scopeTabs}
      >
        {SCOPES.map((scope) => (
          <TouchableOpacity
            key={scope.value}
            style={[
              styles.scopeTab,
              selectedScope === scope.value && styles.scopeTabActive,
            ]}
            onPress={() => setSelectedScope(scope.value)}
          >
            <Text
              style={[
                styles.scopeTabText,
                selectedScope === scope.value && styles.scopeTabTextActive,
              ]}
            >
              {scope.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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

      {/* Public Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeProfileModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Player Profile</Text>
              <TouchableOpacity onPress={closeProfileModal}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedPlayer && (
                <>
                  <View style={styles.profileHeader}>
                    <View style={styles.profileAvatar}>
                      {selectedPlayer.avatar_url ? (
                        <Image source={{ uri: selectedPlayer.avatar_url }} style={styles.profileAvatarImage} />
                      ) : (
                        <MaterialIcons name="person" size={48} color={theme.colors.white} />
                      )}
                    </View>
                    <Text style={styles.profileName}>
                      {selectedPlayer.username || selectedPlayer.full_name || 'Anonymous'}
                    </Text>
                    {selectedPlayer.country && (
                      <Text style={styles.profileCountry}>🌍 {selectedPlayer.country}</Text>
                    )}
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <View style={styles.statBoxInner}>
                        <Text style={styles.statValue}>{selectedPlayer.rank || '-'}</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                      </View>
                    </View>
                    <View style={styles.statBox}>
                      <View style={styles.statBoxInner}>
                        <Text style={styles.statValue}>{selectedPlayer.score.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Total Score</Text>
                      </View>
                    </View>
                    <View style={styles.statBox}>
                      <View style={styles.statBoxInner}>
                        <Text style={styles.statValue}>{selectedPlayer.wins || 0}</Text>
                        <Text style={styles.statLabel}>Wins</Text>
                      </View>
                    </View>
                    <View style={styles.statBox}>
                      <View style={styles.statBoxInner}>
                        <Text style={styles.statValue}>{selectedPlayer.matches_played || 0}</Text>
                        <Text style={styles.statLabel}>Games Played</Text>
                      </View>
                    </View>
                  </View>

                  {playerStats && (
                    <View style={styles.additionalStats}>
                      <Text style={styles.sectionTitle}>Performance Stats</Text>
                      <View style={styles.statRow}>
                        <Text style={styles.statRowLabel}>Win Rate</Text>
                        <Text style={styles.statRowValue}>
                          {playerStats.win_rate?.toFixed(1) || 0}%
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statRowLabel}>Average Score</Text>
                        <Text style={styles.statRowValue}>
                          {playerStats.avg_score?.toFixed(0) || 0}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statRowLabel}>Best Score</Text>
                        <Text style={styles.statRowValue}>
                          {playerStats.best_score || 0}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statRowLabel}>Win Streak</Text>
                        <Text style={styles.statRowValue}>
                          {playerStats.win_streak || 0}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl + theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  refreshButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  periodTab: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    marginHorizontal: 2,
    minHeight: 36,
  },
  periodTabActive: {
    backgroundColor: theme.colors.primary,
  },
  periodTabText: {
    fontSize: 11,
    color: theme.colors.gray,
    fontWeight: '600',
    textAlign: 'center',
  },
  periodTabTextActive: {
    color: theme.colors.white,
  },
  scopeScrollView: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
    maxHeight: 50,
  },
  scopeTabs: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
  },
  scopeTab: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scopeTabActive: {
    backgroundColor: theme.colors.secondary,
  },
  scopeTabText: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  scopeTabTextActive: {
    color: theme.colors.white,
  },
  list: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  leaderboardCard: {
    marginBottom: theme.spacing.xs,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0, // Important for text truncation
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.gray + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    flex: 1,
    minWidth: 0, // Important for text truncation
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  country: {
    fontSize: 11,
    color: theme.colors.gray,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    marginLeft: theme.spacing.xs,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  scoreLabel: {
    fontSize: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Deep Navy with opacity
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  modalTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 22,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  profileCountry: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: theme.spacing.lg,
  },
  statBox: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: theme.spacing.xs,
  },
  statBoxInner: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  additionalStats: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  statRowLabel: {
    ...theme.text.body,
    color: theme.colors.text,
  },
  statRowValue: {
    ...theme.text.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
