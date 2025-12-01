// src/utils/styles.ts
// Helper to create styles with theme support
import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles: T | ((theme: typeof theme) => T)
): T => {
  if (typeof styles === 'function') {
    return StyleSheet.create(styles(theme)) as T;
  }
  return StyleSheet.create(styles) as T;
};

export { theme };
