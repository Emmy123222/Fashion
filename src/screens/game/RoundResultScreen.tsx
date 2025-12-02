// src/screens/game/RoundResultScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet,  View, Text, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

type RoundResultScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RoundResult'
>;
type RoundResultScreenRouteProp = RouteProp<RootStackParamList, 'RoundResult'>;

interface Props {
  navigation: RoundResultScreenNavigationProp;
  route: RoundResultScreenRouteProp;
}

export const RoundResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { isWinner, score, time, matches, gameMode } = route.params;

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handlePlayAgain = () => {
    navigation.replace('SinglePlayerGame', {});
  };

  const handleHome = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  const handleLeaderboard = () => {
    navigation.navigate('Main', { screen: 'Leaderboard' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Result Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: isWinner ? theme.colors.success + '20' : theme.colors.danger + '20' }
        ]}>
          <MaterialIcons
            name={isWinner ? 'emoji-events' : 'sentiment-dissatisfied'}
            size={80}
            color={isWinner ? theme.colors.success : theme.colors.danger}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isWinner ? 'Congratulations!' : 'Game Over'}
        </Text>
        <Text style={styles.subtitle}>
          {isWinner 
            ? 'You completed all matches!' 
            : 'Time ran out! Try again to beat your score.'}
        </Text>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="stars" size={32} color={theme.colors.warning} />
              <Text style={styles.statValue}>{score.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <MaterialIcons name="timer" size={32} color={theme.colors.primary} />
              <Text style={styles.statValue}>{timeString}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <MaterialIcons name="check-circle" size={32} color={theme.colors.success} />
              <Text style={styles.statValue}>{matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </View>
        </Card>

        {/* Achievements */}
        {isWinner && (
          <Card style={styles.achievementCard}>
            <Text style={styles.achievementTitle}>🎉 Achievement Unlocked!</Text>
            <Text style={styles.achievementText}>Perfect Match Master</Text>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Play Again"
            onPress={handlePlayAgain}
            fullWidth
            size="large"
            style={styles.button}
          />
          <Button
            title="View Leaderboard"
            onPress={handleLeaderboard}
            variant="outline"
            fullWidth
            size="large"
            style={styles.button}
          />
          <Button
            title="Back to Home"
            onPress={handleHome}
            variant="secondary"
            fullWidth
            size="large"
          />
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
  content: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.text.h1,
    fontSize: 36,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  statsCard: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...theme.text.h2,
    color: theme.colors.text,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    ...theme.text.caption,
    color: theme.colors.gray,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: theme.colors.gray + '30',
  },
  achievementCard: {
    width: '100%',
    backgroundColor: theme.colors.warning + '10',
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  achievementTitle: {
    ...theme.text.h3,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  achievementText: {
    ...theme.text.body,
    color: theme.colors.gray,
  },
  actions: {
    width: '100%',
  },
  button: {
    marginBottom: theme.spacing.md,
  },
});
