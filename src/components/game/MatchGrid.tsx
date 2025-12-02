// src/components/game/MatchGrid.tsx
import React from 'react';
import { StyleSheet,  View, FlatList } from 'react-native';
import { theme } from '../../theme';
import { GameCard } from '../../types/game.types';
import { FashionCard } from './FashionCard';

interface MatchGridProps {
  cards: GameCard[];
  gridSize: { rows: number; cols: number };
  onCardPress: (cardId: string) => void;
  disabled?: boolean;
}

export const MatchGrid: React.FC<MatchGridProps> = ({
  cards,
  gridSize,
  onCardPress,
  disabled = false,
}) => {

  const renderCard = ({ item }: { item: GameCard }) => (
    <FashionCard
      card={item}
      onPress={onCardPress}
      gridSize={gridSize}
      disabled={disabled}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={gridSize.cols}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={gridSize.cols > 1 ? styles.row : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  grid: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  row: {
    justifyContent: 'center',
  },
});
