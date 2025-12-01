// src/screens/GameScreen.tsx
import { StyleSheet } from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Animated, 
  Easing,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { GameEngine } from '../services/GameEngine';
import { GameCard, GameConfig, GameState } from '../types/game.types';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 10) / 4; // 4 cards per row with margins

const GameScreen: React.FC = () => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const flipAnimations = useRef<{[key: string]: Animated.Value}>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize flip animations for each card
  const initializeAnimations = (cards: GameCard[]) => {
    cards.forEach(card => {
      if (!flipAnimations.current[card.id]) {
        flipAnimations.current[card.id] = new Animated.Value(0);
      }
    });
  };

  // Flip animation
  const flipCard = (cardId: string, isFlipped: boolean) => {
    return Animated.timing(flipAnimations.current[cardId], {
      toValue: isFlipped ? 180 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.linear,
    });
  };

  // Initialize game
  useEffect(() => {
    const config: GameConfig = {
      gridSize: { rows: 4, cols: 4 },
      initialTime: 180, // 3 minutes in seconds
      difficulty: 'medium',
      imageGenerator: (index) => `https://picsum.photos/id/${index + 100}/200/300`, // Using picsum for demo
    };

    const engine = new GameEngine(config);
    const initialState = engine.getGameState();
    
    // Initialize animations for all cards
    initializeAnimations(initialState.cards);
    
    setGameEngine(engine);
    setGameState(initialState);

    // Start the game loop
    const gameLoop = setInterval(() => {
      if (!isPaused && gameEngine) {
        const newState = gameEngine.getGameState();
        setGameState({ ...newState });
        
        // Check for game over
        if (newState.isGameOver) {
          clearInterval(gameLoop);
        }
      }
    }, 1000);

    timerRef.current = gameLoop;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused]);

  const handleCardPress = useCallback(async (cardId: string) => {
    if (!gameEngine || !gameState || gameState.isGameOver) return;
    
    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;

    // Flip the card
    await flipCard(cardId, true).start();
    
    // Process the move in the game engine
    const newState = gameEngine.flipCard(cardId);
    setGameState({ ...newState });
    
    // If two cards are flipped, check for a match
    const flippedCards = newState.cards.filter(c => c.isFlipped && !c.isMatched);
    if (flippedCards.length === 2) {
      setTimeout(() => {
        const updatedState = gameEngine.checkForMatch();
        updatedState.cards.forEach(card => {
          if (card.isFlipped && !card.isMatched) {
            flipCard(card.id, false).start();
          }
        });
        setGameState({ ...updatedState });
      }, 1000);
    }
  }, [gameEngine, gameState]);

  const renderCard = ({ item }: { item: GameCard }) => {
    // Interpolate the front animation
    const frontAnimatedStyle = {
      transform: [
        {
          rotateY: flipAnimations.current[item.id]?.interpolate({
            inputRange: [0, 180],
            outputRange: ['0deg', '180deg'],
          }) || '0deg',
        },
      ],
    };

    // Interpolate the back animation
    const backAnimatedStyle = {
      transform: [
        {
          rotateY: flipAnimations.current[item.id]?.interpolate({
            inputRange: [0, 180],
            outputRange: ['180deg', '360deg'],
          }) || '180deg',
        },
      ],
    };

    return (
      <TouchableOpacity
        style={[styles.card, item.isMatched && styles.cardMatched]}
        onPress={() => handleCardPress(item.id)}
        disabled={item.isMatched || !gameState || gameState.isGameOver}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.cardFace, 
            styles.cardBack,
            { backfaceVisibility: 'hidden' },
            backAnimatedStyle
          ]}
        >
          <MaterialIcons name="style" size={32} color="#6a5acd" />
        </Animated.View>
        <Animated.View 
          style={[
            styles.cardFace, 
            styles.cardFront,
            { backfaceVisibility: 'hidden' },
            frontAnimatedStyle
          ]}
        >
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.cardImage} 
            resizeMode="cover"
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text>Loading game...</Text>
      </View>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    if (gameEngine) {
      gameEngine.initializeGame();
      const newState = gameEngine.getGameState();
      initializeAnimations(newState.cards);
      setGameState(newState);
      setIsPaused(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <MaterialIcons name="timer" size={20} color="#6a5acd" />
          <Text style={styles.timerText}>{formatTime(gameState.timeLeft)}</Text>
        </View>
        
        <TouchableOpacity onPress={handlePause} style={styles.pauseButton}>
          <MaterialIcons 
            name={isPaused ? 'play-arrow' : 'pause'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {gameState.matchedPairs} / {gameState.totalPairs}
          </Text>
          <MaterialIcons name="stars" size={20} color="#FFD700" />
        </View>
      </View>

      <FlatList
        data={gameState.cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
      />

      {gameState.isGameOver && (
        <View style={styles.gameOver}>
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverText}>
              {gameState.matchedPairs === gameState.totalPairs ? '🎉 You Win! 🎉' : '😢 Game Over'}
            </Text>
            <Text style={styles.gameOverScore}>
              Matched: {gameState.matchedPairs} / {gameState.totalPairs}
            </Text>
            <TouchableOpacity 
              style={styles.restartButton}
              onPress={handleRestart}
            >
              <Text style={styles.restartButtonText}>
                {gameState.matchedPairs === gameState.totalPairs ? 'Play Again' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#4a4a6a',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    marginRight: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#4a4a6a',
  },
  pauseButton: {
    backgroundColor: '#6a5acd',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  grid: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    margin: CARD_MARGIN / 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#6a5acd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cardFront: {
    backgroundColor: '#fff',
  },
  cardMatched: {
    opacity: 0.7,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  gameOver: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  gameOverScore: {
    fontSize: 20,
    color: '#666',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#6a5acd',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default GameScreen;