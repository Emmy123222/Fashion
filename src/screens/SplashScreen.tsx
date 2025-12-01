// src/screens/SplashScreen.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>FM</Text>
        </View>
        <Text style={styles.title}>Fashion Match</Text>
      </View>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    ...theme.text.h1,
    color: theme.colors.primary,
  },
  loadingText: {
    ...theme.text.body,
    color: theme.colors.gray,
    marginTop: theme.spacing.xl,
  },
});