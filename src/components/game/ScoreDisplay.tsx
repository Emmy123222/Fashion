// src/components/game/ScoreDisplay.tsx
import React from 'react';
import { StyleSheet,  View, Text, Platform } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ScoreDisplayProps {
  score: number;
  combo?: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, combo = 0 }) => {

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <MaterialIcons name="stars" size={20} color={theme.colors.warning} />
        <Text style={styles.score}>{score.toLocaleString()}</Text>
      </View>
      {combo > 1 && (
        <View style={styles.comboContainer}>
          <Text style={styles.comboText}>x{combo} COMBO!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
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
  score: {
    ...theme.text.h3,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
  },
  comboContainer: {
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  comboText: {
    ...theme.text.caption,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
