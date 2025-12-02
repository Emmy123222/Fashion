// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput, ScrollView, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { gameService, authService } from '../services';
import { Loader } from '../components/common/Loader';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;

type GameStat = {
  id: string;
  score: number;
  matches: number;
  time: number;
  isWon: boolean;
};

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentGames, setRecentGames] = useState<GameStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    state: '',
    county: '',
    city: '',
    high_school_name: '',
    college_name: '',
    company_name: '',
    nonprofit_name: '',
    corporation_name: '',
    government_department: '',
    organization_chapter: '',
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({
        email: user.email || '',
        state: user.state || '',
        county: user.county || '',
        city: user.city || '',
        high_school_name: user.high_school_name || '',
        college_name: user.college_name || '',
        company_name: user.company_name || '',
        nonprofit_name: user.nonprofit_name || '',
        corporation_name: user.corporation_name || '',
        government_department: user.government_department || '',
        organization_chapter: user.organization_chapter || '',
      });
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      if (!user) return;

      setLoading(true);

      // Get user stats
      const statsResponse = await gameService.getUserStats(user.id);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Get recent games
      const gamesResponse = await gameService.getUserGameSessions(user.id, 9);
      if (gamesResponse.success && gamesResponse.data) {
        const formattedGames = gamesResponse.data.map((game: any) => ({
          id: game.id,
          score: game.score || 0,
          matches: game.matches_completed || 0,
          time: game.time_taken || 0,
          isWon: game.is_won || false,
        }));
        setRecentGames(formattedGames);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await authService.updateProfile(user.id, editForm);
      
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setShowEditModal(false);
        await loadProfileData();
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderGame = ({ item }: { item: GameStat }) => (
    <TouchableOpacity style={styles.gameCard} activeOpacity={0.7}>
      <View style={[styles.gameStatus, { backgroundColor: item.isWon ? theme.colors.success : theme.colors.danger }]}>
        <MaterialIcons 
          name={item.isWon ? 'emoji-events' : 'close'} 
          size={isSmallDevice ? 18 : 24} 
          color={theme.colors.white} 
        />
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameScore} numberOfLines={1}>{item.score} pts</Text>
        <Text style={styles.gameDetails} numberOfLines={2}>
          {item.matches} matches{'\n'}{Math.floor(item.time / 60)}:{(item.time % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <Loader />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons name="person-outline" size={64} color={theme.colors.gray} />
          <Text style={styles.emptyText}>Please log in to view your profile</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadProfileData} style={styles.iconButton}>
            <MaterialIcons name="refresh" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.iconButton}>
            <MaterialIcons name="edit" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconButton}>
            <MaterialIcons name="logout" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={40} color={theme.colors.white} />
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.total_games || 0}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.total_wins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.win_rate?.toFixed(0) || 0}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.fullName}>{user.username || user.full_name || 'Player'}</Text>
        <Text style={styles.bio}>
          {user.player_type} • {user.country || 'No country set'}
        </Text>
        <Text style={styles.bio}>Best Score: {stats?.best_score || 0}</Text>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setShowDetailsModal(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="info-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.moreButtonText}>View More Details</Text>
          <MaterialIcons name="chevron-right" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabActive}>
          <MaterialIcons name="sports-esports" size={24} color={theme.colors.primary} />
          <Text style={styles.tabText}>Recent Games</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recentGames}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        numColumns={isSmallDevice ? 2 : 3}
        key={isSmallDevice ? 'small' : 'large'}
        contentContainerStyle={styles.gamesGrid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.gameRow}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="sports-esports" size={48} color={theme.colors.gray} />
            <Text style={styles.emptyText}>No games played yet</Text>
            <Text style={styles.emptySubtext}>Start playing to see your game history!</Text>
          </View>
        }
      />

      {/* Profile Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {user.email && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="email" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.email}</Text>
                </View>
              )}
              
              {user.state && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.state}</Text>
                </View>
              )}
              
              {user.county && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="location-city" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.county}</Text>
                </View>
              )}
              
              {user.city && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="place" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.city}</Text>
                </View>
              )}
              
              {user.high_school_name && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="school" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.high_school_name}</Text>
                </View>
              )}
              
              {user.college_name && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="school" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.college_name}</Text>
                </View>
              )}
              
              {user.company_name && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="business" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.company_name}</Text>
                </View>
              )}
              
              {user.nonprofit_name && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="volunteer-activism" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.nonprofit_name}</Text>
                </View>
              )}
              
              {user.corporation_name && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="corporate-fare" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.corporation_name}</Text>
                </View>
              )}
              
              {user.government_department && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="account-balance" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.government_department}</Text>
                </View>
              )}
              
              {user.organization_chapter && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="groups" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{user.organization_chapter}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="your.email@example.com"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.sectionTitle}>Location</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>State/Province</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your state or province"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.state}
                  onChangeText={(text) => setEditForm({ ...editForm, state: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>County</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your county"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.county}
                  onChangeText={(text) => setEditForm({ ...editForm, county: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your city"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.city}
                  onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                />
              </View>

              <Text style={styles.sectionTitle}>Education</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>High School</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your high school name"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.high_school_name}
                  onChangeText={(text) => setEditForm({ ...editForm, high_school_name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>College/University</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your college or university name"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.college_name}
                  onChangeText={(text) => setEditForm({ ...editForm, college_name: text })}
                />
              </View>

              <Text style={styles.sectionTitle}>Organizations</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your company name"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.company_name}
                  onChangeText={(text) => setEditForm({ ...editForm, company_name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nonprofit</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nonprofit organization name"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.nonprofit_name}
                  onChangeText={(text) => setEditForm({ ...editForm, nonprofit_name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Corporation</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Corporation name"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.corporation_name}
                  onChangeText={(text) => setEditForm({ ...editForm, corporation_name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Government Department</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Department of Education"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.government_department}
                  onChangeText={(text) => setEditForm({ ...editForm, government_department: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Organization Chapter</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., San Francisco Chapter"
                  placeholderTextColor={theme.colors.gray}
                  value={editForm.organization_chapter}
                  onChangeText={(text) => setEditForm({ ...editForm, organization_chapter: text })}
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
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
    paddingHorizontal: isSmallDevice ? theme.spacing.sm : theme.spacing.md,
    paddingTop: isSmallDevice ? theme.spacing.xl : theme.spacing.xl + theme.spacing.sm,
    paddingBottom: isSmallDevice ? theme.spacing.sm : theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
    backgroundColor: theme.colors.white,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    color: theme.colors.text,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: isSmallDevice ? theme.spacing.md : theme.spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    width: isSmallDevice ? 64 : 80,
    height: isSmallDevice ? 64 : 80,
    borderRadius: isSmallDevice ? 32 : 40,
    marginRight: isSmallDevice ? theme.spacing.md : theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: isSmallDevice ? 18 : 20,
    color: theme.colors.text,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 12,
    color: theme.colors.gray,
  },
  profileInfo: {
    paddingHorizontal: isSmallDevice ? theme.spacing.md : theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  fullName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  bio: {
    fontSize: isSmallDevice ? 13 : 14,
    color: theme.colors.gray,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray + '20',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  tabActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
  },
  tabText: {
    ...theme.text.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
  gamesGrid: {
    padding: theme.spacing.sm,
  },
  gameRow: {
    justifyContent: 'flex-start',
  },
  gameCard: {
    width: isSmallDevice ? (width - 32) / 2 - 8 : (width - 32) / 3 - 8,
    aspectRatio: 1,
    margin: 4,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: isSmallDevice ? theme.spacing.xs : theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameStatus: {
    width: isSmallDevice ? 32 : 40,
    height: isSmallDevice ? 32 : 40,
    borderRadius: isSmallDevice ? 16 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  gameInfo: {
    alignItems: 'center',
  },
  gameScore: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  gameDetails: {
    fontSize: isSmallDevice ? 10 : 12,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  emptyText: {
    fontSize: isSmallDevice ? 16 : 18,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: isSmallDevice ? 13 : 14,
    color: theme.colors.gray,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isSmallDevice ? theme.spacing.md : theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    color: theme.colors.text,
    fontWeight: '600',
  },
  modalBody: {
    padding: isSmallDevice ? theme.spacing.md : theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: isSmallDevice ? theme.spacing.md : theme.spacing.lg,
  },
  inputLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: isSmallDevice ? theme.spacing.sm : theme.spacing.md,
    fontSize: isSmallDevice ? 14 : 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.gray + '30',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: isSmallDevice ? theme.spacing.sm : theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  saveButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: theme.colors.white,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  moreButtonText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '10',
    gap: theme.spacing.md,
  },
  detailText: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    color: theme.colors.text,
  },
});
