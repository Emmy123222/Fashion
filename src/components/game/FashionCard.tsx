// src/components/game/FashionCard.tsx
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Image, Animated, Dimensions, StyleSheet, Platform, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { GameCard } from '../../types/game.types';

interface FashionCardProps {
  card: GameCard;
  onPress: (cardId: string) => void;
  gridSize: { rows: number; cols: number };
  disabled?: boolean;
}

export const FashionCard: React.FC<FashionCardProps> = ({
  card,
  onPress,
  gridSize,
  disabled = false,
}) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const { width } = Dimensions.get('window');
  const cardSize = (width - 48) / gridSize.cols - 8;

  useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: card.isFlipped || card.isMatched ? 180 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
  }, [card.isFlipped, card.isMatched]);

  const handlePress = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      // Scale animation on press
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onPress(card.id);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || card.isFlipped || card.isMatched}
      activeOpacity={0.9}
      style={[styles.cardContainer, { width: cardSize, height: cardSize }]}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { rotateY: frontInterpolate },
              { scale: scaleAnimation },
            ],
            opacity: frontOpacity,
          },
        ]}
      >
        <View style={styles.cardBackContent}>
          <MaterialIcons name="style" size={Math.min(cardSize * 0.5, 48)} color={theme.colors.white} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          {
            transform: [
              { rotateY: backInterpolate },
              { scale: scaleAnimation },
            ],
            opacity: backOpacity,
          },
        ]}
      >
        <Image
          source={{ uri: card.thumbnailUrl || card.imageUrl }}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </Animated.View>

      {card.isMatched && (
        <View style={styles.matchedOverlay}>
          <MaterialIcons name="check-circle" size={32} color={theme.colors.success} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: 6,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardBack: {
    backgroundColor: theme.colors.white,
  },
  cardBackContent: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  matchedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
});
