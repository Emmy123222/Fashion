// src/screens/game/GameModeScreen.tsx
import React from 'react';
import { StyleSheet,  View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

type GameModeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameMode'>;

interface Props {
  navigation: GameModeScreenNavigationProp;
}

export const GameModeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, hasPremiumAccess } = useAuth();
  const [isPremium, setIsPremium] = React.useState(false);

  React.useEffect(() => {
    checkPremium();
  }, []);

  const checkPremium = async () => {
    const premium = await hasPremiumAccess();
    setIsPremium(premium);
  };

  const handleSinglePlayer = () => {
    navigation.navigate('SinglePlayerGame', {});
  };

  const handleMultiplayer = () => {
    if (!isPremium) {
      navigation.navigate('Subscription');
      return;
    }
    navigation.navigate('MultiplayerLobby');
  };

  const handleTeamMode = () => {
    if (!isPremium) {
      navigation.navigate('Subscription');
      return;
    }
    navigation.navigate('TeamMode');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Game Mode</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Single Player */}
        <TouchableOpacity onPress={handleSinglePlayer} activeOpacity={0.8}>
          <Card style={styles.modeCard}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <MaterialIcons name="person" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.modeTitle}>Single Player</Text>
            <Text style={styles.modeDescription}>
              Play solo and beat your best score. Perfect for practice!
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FREE</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Multiplayer */}
        <TouchableOpacity onPress={handleMultiplayer} activeOpacity={0.8}>
          <Card style={styles.modeCard}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
              <MaterialIcons name="people" size={48} color={theme.colors.warning} />
            </View>
            <Text style={styles.modeTitle}>Multiplayer</Text>
            <Text style={styles.modeDescription}>
              Compete against other players in real-time matches!
            </Text>
            {!isPremium && (
              <View style={[styles.badge, { backgroundColor: theme.colors.warning }]}>
                <MaterialIcons name="lock" size={12} color={theme.colors.white} />
                <Text style={styles.badgeText}>PREMIUM</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>

        {/* Team Mode */}
        <TouchableOpacity onPress={handleTeamMode} activeOpacity={0.8}>
          <Card style={styles.modeCard}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
              <MaterialIcons name="groups" size={48} color={theme.colors.success} />
            </View>
            <Text style={styles.modeTitle}>Team Mode</Text>
            <Text style={styles.modeDescription}>
              Join forces with friends and compete as a team!
            </Text>
            {!isPremium && (
              <View style={[styles.badge, { backgroundColor: theme.colors.warning }]}>
                <MaterialIcons name="lock" size={12} color={theme.colors.white} />
                <Text style={styles.badgeText}>PREMIUM</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>
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
    padding: theme.spacing.lg,
  },
  modeCard: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modeTitle: {
    ...theme.text.h2,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  modeDescription: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    ...theme.text.caption,
    color: theme.colors.white,
    fontWeight: '700',
    marginLeft: 4,
  },
});
