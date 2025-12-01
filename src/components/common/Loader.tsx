// src/components/common/Loader.tsx
import React from 'react';
import { StyleSheet,  View, ActivityIndicator, Text } from 'react-native';
import { theme } from '../../theme';

interface LoaderProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  text,
  fullScreen = false,
}) => {

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  text: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginTop: theme.spacing.md,
  },
});
