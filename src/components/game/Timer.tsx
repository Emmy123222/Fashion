// src/components/game/Timer.tsx
import React from 'react';
import { StyleSheet,  View, Text, Platform } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

interface TimerProps {
  timeLeft: number;
  timeLimit: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, timeLimit }) => {

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const percentage = (timeLeft / timeLimit) * 100;
  const isLowTime = percentage < 20;
  const isMediumTime = percentage < 50 && percentage >= 20;

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="timer" 
        size={20} 
        color={isLowTime ? theme.colors.danger : isMediumTime ? theme.colors.warning : theme.colors.primary} 
      />
      <Text style={[
        styles.time,
        isLowTime && styles.timeLow,
        isMediumTime && styles.timeMedium,
      ]}>
        {timeString}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  time: {
    ...theme.text.h3,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
    color: theme.colors.primary,
  },
  timeMedium: {
    color: theme.colors.warning,
  },
  timeLow: {
    color: theme.colors.danger,
  },
});
