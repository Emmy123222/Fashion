// Feature Lock Component
// Overlay that shows when a feature is locked

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PremiumBadge } from './PremiumBadge';

interface Props {
  featureName: string;
  featureIcon?: string;
  description?: string;
  onUpgrade: () => void;
  children?: React.ReactNode;
}

export const FeatureLock: React.FC<Props> = ({
  featureName,
  featureIcon = '🔒',
  description,
  onUpgrade,
  children,
}) => {
  return (
    <View style={styles.container}>
      {children && <View style={styles.blurredContent}>{children}</View>}
      
      <View style={styles.overlay}>
        <View style={styles.lockCard}>
          <Text style={styles.icon}>{featureIcon}</Text>
          <Text style={styles.title}>{featureName}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <MaterialIcons name="star" size={20} color={theme.colors.white} />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
          
          <Text style={styles.price}>Only $4.99/year</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  blurredContent: {
    flex: 1,
    opacity: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  lockCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  upgradeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  price: {
    fontSize: 14,
    color: theme.colors.gray,
  },
});
