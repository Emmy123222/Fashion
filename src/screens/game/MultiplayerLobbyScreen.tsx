// src/screens/game/MultiplayerLobbyScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet,  View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { multiplayerService, fashionService } from '../../services';
import { Match } from '../../types/game.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { featureGate } from '../../services/featureGate.service';
import { FeatureLock } from '../../components/common/FeatureLock';

type MultiplayerLobbyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MultiplayerLobby'
>;

interface Props {
  navigation: MultiplayerLobbyScreenNavigationProp;
}

export const MultiplayerLobbyScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkPremiumAndLoad();
  }, [user]);

  const checkPremiumAndLoad = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const premium = await featureGate.isPremium(user.id);
    setIsPremium(premium);

    if (premium) {
      loadMatches();
      const interval = setInterval(loadMatches, 5000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await multiplayerService.findAvailableMatches('pvp');
      if (response.success && response.data) {
        setMatches(response.data);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!user) return;

    try {
      setIsCreating(true);

      // Get random fashion items
      const itemsResponse = await fashionService.getRandomFashionItems(8, user.player_type, 2);
      if (!itemsResponse.success || !itemsResponse.data) {
        throw new Error('Failed to load fashion items');
      }

      // Create match
      const matchResponse = await multiplayerService.createMatch(
        user.id,
        'pvp',
        {
          difficulty_level: 2,
          grid_size: { rows: 4, cols: 4 },
          items_used: itemsResponse.data.map(item => item.id),
          time_limit: 240,
        }
      );

      if (!matchResponse.success || !matchResponse.data) {
        throw new Error('Failed to create match');
      }

      // Navigate to multiplayer game
      navigation.replace('MultiplayerGame', { matchId: matchResponse.data.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create match');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    if (!user) return;

    try {
      const response = await multiplayerService.joinMatch(matchId, user.id);
      if (!response.success) {
        throw new Error('Failed to join match');
      }

      navigation.replace('MultiplayerGame', { matchId });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join match');
    }
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <Card style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <MaterialIcons name="people" size={24} color={theme.colors.primary} />
        <Text style={styles.matchTitle}>Match #{item.id.slice(0, 8)}</Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchDetail}>Difficulty: Level {item.difficulty_level}</Text>
        <Text style={styles.matchDetail}>Time: {Math.floor(item.time_limit / 60)} minutes</Text>
      </View>
      <Button
        title="Join Match"
        onPress={() => handleJoinMatch(item.id)}
        size="small"
        fullWidth
      />
    </Card>
  );

  if (isLoading) {
    return <Loader fullScreen text="Checking access..." />;
  }

  if (!isPremium) {
    return (
      <FeatureLock
        featureName="Multiplayer Mode"
        featureIcon="⚔️"
        description="Challenge other players in real-time matches"
        onUpgrade={() => navigation.navigate('SubscriptionWeb' as never)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Multiplayer Lobby</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Button
          title="Create New Match"
          onPress={handleCreateMatch}
          loading={isCreating}
          fullWidth
          size="large"
          style={styles.createButton}
        />

        <Text style={styles.sectionTitle}>Available Matches</Text>

        {matches.length === 0 ? (
          <Card style={styles.emptyCard}>
            <MaterialIcons name="search-off" size={48} color={theme.colors.gray} />
            <Text style={styles.emptyText}>No matches available</Text>
            <Text style={styles.emptySubtext}>Create a new match to start playing!</Text>
          </Card>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatch}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.matchList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.text.h2,
    color: theme.colors.text,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  createButton: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  matchList: {
    paddingBottom: theme.spacing.xl,
  },
  matchCard: {
    marginBottom: theme.spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  matchTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  matchInfo: {
    marginBottom: theme.spacing.md,
  },
  matchDetail: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginBottom: 4,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
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
