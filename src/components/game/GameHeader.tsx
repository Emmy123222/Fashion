// src/components/game/GameHeader.tsx
import React from 'react';
import { StyleSheet,  View, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Timer } from './Timer';
import { ScoreDisplay } from './ScoreDisplay';

interface GameHeaderProps {
  timeLeft: number;
  timeLimit: number;
  score: number;
  combo: number;
  onPause: () => void;
  onQuit: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  timeLeft,
  timeLimit,
  score,
  combo,
  onPause,
  onQuit,
}) => {

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onQuit} style={styles.iconButton}>
        <MaterialIcons name="close" size={28} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.centerContent}>
        <Timer timeLeft={timeLeft} timeLimit={timeLimit} />
        <View style={styles.spacer} />
        <ScoreDisplay score={score} combo={combo} />
      </View>

      <TouchableOpacity onPress={onPause} style={styles.iconButton}>
        <MaterialIcons name="pause" size={28} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl + 20 : theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  spacer: {
    width: theme.spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
