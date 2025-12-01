// src/screens/game/SinglePlayerGameScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet,  View, Text, Alert, Modal, Platform } from 'react-native';
import { theme } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { GameEngine } from '../../services/GameEngine';
import { fashionService, gameService } from '../../services';
import { GameState } from '../../types/game.types';
import { FashionItem } from '../../types/fashion.types';
import { GameHeader } from '../../components/game/GameHeader';
import { MatchGrid } from '../../components/game/MatchGrid';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';

type SinglePlayerGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SinglePlayerGame'
>;
type SinglePlayerGameScreenRouteProp = RouteProp<RootStackParamList, 'SinglePlayerGame'>;

interface Props {
  navigation: SinglePlayerGameScreenNavigationProp;
  route: SinglePlayerGameScreenRouteProp;
}

export const SinglePlayerGameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const gameEngineRef = useRef<GameEngine | null>(null);
  const difficultyLevel = 1; // Start with easy, will be adaptive later
  const gridSize = { rows: 4, cols: 4 };
  const timeLimit = 300; // 5 minutes

  useEffect(() => {
    initializeGame();
    
    return () => {
      gameEngineRef.current?.destroy();
    };
  }, []);

  const initializeGame = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to play');
        navigation.goBack();
        return;
      }

      // Get random fashion items
      const itemsNeeded = (gridSize.rows * gridSize.cols) / 2;
      const itemsResponse = await fashionService.getRandomFashionItems(
        itemsNeeded,
        user.player_type,
        difficultyLevel
      );

      if (!itemsResponse.success || !itemsResponse.data) {
        throw new Error('Failed to load fashion items');
      }

      const fashionItems: FashionItem[] = itemsResponse.data;

      // Create game session
      const sessionResponse = await gameService.createGameSession({
        user_id: user.id,
        game_mode: 'single_player',
        difficulty_level: difficultyLevel,
        grid_size: gridSize,
        items_used: fashionItems.map(item => item.id),
        time_limit: timeLimit,
      });

      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error('Failed to create game session');
      }

      setSessionId(sessionResponse.data.id);

      // Initialize game engine
      const engine = new GameEngine(
        fashionItems,
        gridSize,
        timeLimit,
        difficultyLevel,
        handleGameStateChange
      );

      gameEngineRef.current = engine;
      engine.startTimer();
      setGameState(engine.getGameState());
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to initialize game:', error);
      Alert.alert('Error', error.message || 'Failed to start game');
      navigation.goBack();
    }
  };

  const handleGameStateChange = (newState: GameState) => {
    setGameState(newState);

    // Check if game is over
    if (newState.isGameOver && sessionId) {
      handleGameEnd(newState);
    }
  };

  const handleGameEnd = async (finalState: GameState) => {
    try {
      const engine = gameEngineRef.current;
      if (!engine || !sessionId) return;

      const performanceMetrics = engine.getPerformanceMetrics();

      // Complete game session
      await gameService.completeGameSession(sessionId, {
        score: finalState.score,
        matches_completed: finalState.matchedPairs,
        time_taken: finalState.timeElapsed,
        combo_max: finalState.maxCombo,
        is_won: finalState.isWon,
        performance_metrics: performanceMetrics,
      });

      // Save performance metrics for AI
      if (user) {
        await gameService.savePerformanceMetrics(
          user.id,
          sessionId,
          performanceMetrics
        );
      }

      // Navigate to results
      navigation.replace('RoundResult', {
        isWinner: finalState.isWon,
        score: finalState.score,
        time: finalState.timeElapsed,
        matches: finalState.matchedPairs,
        gameMode: 'single',
      });
    } catch (error) {
      console.error('Failed to save game results:', error);
    }
  };

  const handleCardPress = (cardId: string) => {
    if (!gameEngineRef.current || isPaused) return;
    gameEngineRef.current.flipCard(cardId);
  };

  const handlePause = () => {
    setIsPaused(true);
    gameEngineRef.current?.pauseGame();
  };

  const handleResume = () => {
    setIsPaused(false);
    gameEngineRef.current?.resumeGame();
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Game',
      'Are you sure you want to quit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            gameEngineRef.current?.destroy();
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading || !gameState) {
    return <Loader fullScreen text="Loading game..." />;
  }

  return (
    <View style={styles.container}>
      <GameHeader
        timeLeft={gameState.timeLeft}
        timeLimit={timeLimit}
        score={gameState.score}
        combo={gameState.combo}
        onPause={handlePause}
        onQuit={handleQuit}
      />

      <MatchGrid
        cards={gameState.cards}
        gridSize={gridSize}
        onCardPress={handleCardPress}
        disabled={isPaused || gameState.isGameOver}
      />

      {/* Pause Modal */}
      <Modal
        visible={isPaused}
        transparent
        animationType="fade"
        onRequestClose={handleResume}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pauseModal}>
            <Text style={styles.pauseTitle}>Game Paused</Text>
            <Button
              title="Resume"
              onPress={handleResume}
              fullWidth
              style={styles.modalButton}
            />
            <Button
              title="Quit"
              onPress={handleQuit}
              variant="outline"
              fullWidth
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseModal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  pauseTitle: {
    ...theme.text.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalButton: {
    marginBottom: theme.spacing.md,
  },
});
