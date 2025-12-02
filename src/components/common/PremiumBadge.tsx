// Premium Badge Component
// Shows "Premium" badge on locked features

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface Props {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: any;
}

export const PremiumBadge: React.FC<Props> = ({ 
  size = 'medium', 
  onPress,
  style 
}) => {
  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20,
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.badge, sizeStyles[size], style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <MaterialIcons 
        name="lock" 
        size={iconSizes[size]} 
        color={theme.colors.white} 
      />
      <Text style={[styles.text, size === 'small' && styles.textSmall]}>
        Premium
      </Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  textSmall: {
    fontSize: 10,
  },
});
