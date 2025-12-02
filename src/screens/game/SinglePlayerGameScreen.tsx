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
import { FashionItem, FashionCategory } from '../../types/fashion.types';
import { GameHeader } from '../../components/game/GameHeader';
import { MatchGrid } from '../../components/game/MatchGrid';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { difficultyAdapter } from '../../services/ai/difficultyAdapter';
import { DifficultyScaler } from '../../services/DifficultyScaler';
import { supabase } from '../../lib/supabase';

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
  const { category, level = 1, layout = 'store' } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [isNavigatingToResults, setIsNavigatingToResults] = useState(false);
  
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState(level);
  const [gridSize, setGridSize] = useState({ rows: 4, cols: 4 });
  const [aiTips, setAiTips] = useState<string[]>([]);
  
  // Calculate time limit based on level and layout
  const getTimeLimit = (gameLevel: number, gameLayout: string): number => {
    // Level 1 (Store View): 3 minutes = 180 seconds
    if (gameLevel === 1 || gameLayout === 'store') {
      return 180;
    }
    // Level 2 (Pile View): 2 minutes = 120 seconds
    if (gameLevel === 2 || gameLayout === 'pile') {
      return 120;
    }
    // Higher levels: progressively less time
    const baseTime = 120;
    const reduction = (gameLevel - 2) * 15; // Reduce by 15 seconds per level
    return Math.max(baseTime - reduction, 30); // Minimum 30 seconds
  };
  
  const timeLimit = getTimeLimit(level, layout);

  useEffect(() => {
    loadAIDifficulty();
    
    return () => {
      gameEngineRef.current?.destroy();
    };
  }, []);

  // Watch for game over state (fallback)
  useEffect(() => {
    if (gameState?.isGameOver && sessionId && !isLoading && !isNavigatingToResults) {
      console.log('🏁 useEffect detected game over, calling handleGameEnd');
      setIsNavigatingToResults(true);
      handleGameEnd(gameState);
    }
  }, [gameState?.isGameOver]);

  const loadAIDifficulty = async () => {
    try {
      if (!user) {
        initializeGame();
        return;
      }

      // Get user's performance history
      const metricsResponse = await gameService.getUserPerformanceMetrics(user.id, 10);
      
      if (metricsResponse.success && metricsResponse.data && metricsResponse.data.length > 0) {
        // AI calculates suggested difficulty
        const suggestedLevel = difficultyAdapter.calculateDifficulty(
          metricsResponse.data,
          user.player_type
        );
        
        // Get difficulty config (grid size, time, etc.)
        const config = difficultyAdapter.getDifficultyConfig(suggestedLevel);
        
        // Get personalized tips
        const tips = difficultyAdapter.getPersonalizedTips(metricsResponse.data);
        
        // Analyze trends
        const analysis = difficultyAdapter.analyzeTrends(metricsResponse.data);
        
        console.log('🤖 AI Difficulty Adapter:');
        console.log('  Suggested Level:', suggestedLevel);
        console.log('  Grid Size:', config.gridSize);
        console.log('  Trend:', analysis.trend);
        console.log('  Tips:', tips);
        
        // Apply AI suggestions
        setDifficultyLevel(suggestedLevel);
        setGridSize(config.gridSize);
        setAiTips(tips);
        
        // Show AI recommendation to user
        if (analysis.recommendation) {
          Alert.alert(
            '🤖 AI Difficulty Adapter',
            `${analysis.recommendation}\n\nLevel: ${suggestedLevel}\nGrid: ${config.gridSize.rows}x${config.gridSize.cols}`,
            [{ text: 'Got it!', onPress: () => initializeGame() }]
          );
        } else {
          initializeGame();
        }
      } else {
        // First time player - use default
        console.log('🤖 AI: First time player, using default difficulty');
        initializeGame();
      }
    } catch (error) {
      console.error('AI difficulty calculation failed:', error);
      initializeGame();
    }
  };

  // Process rewards after game ends
  const processRewards = async (finalGameState: GameState) => {
    if (!user || !category) return;
    
    try {
      // Calculate match accuracy
      const totalMatches = finalGameState.matchedPairs;
      const totalPairs = finalGameState.totalPairs;
      const matchAccuracy = totalMatches / Math.max(totalPairs, 1);
      
      // Calculate reward points using DifficultyScaler
      const rewardPoints = DifficultyScaler.calculateRewardPoints(
        level,
        finalGameState.score,
        finalGameState.timeLeft,
        matchAccuracy
      );
      
      console.log(`🎁 Reward Points: ${rewardPoints}`);
      
      // Check for unlocks (only if reward system is set up)
      const { data, error } = await supabase.rpc('check_and_unlock_items', {
        p_user_id: user.id,
        p_category: category,
        p_points_earned: rewardPoints
      });
      
      if (error) {
        // If RLS error or function doesn't exist, skip rewards (migrations not run)
        if (error.code === '42501' || error.code === '42883') {
          console.log('Reward system not set up yet - run migrations to enable');
          return;
        }
        console.error('Error checking unlocks:', error);
      } else if (data && data.length > 0 && data[0].unlocked) {
        // Show unlock notification
        Alert.alert(
          '🎉 New Item Unlocked!',
          `You unlocked: ${data[0].new_item_name}\n\nTotal ${category} unlocked: ${data[0].total_unlocked}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
      
      // Check if should unlock next level
      const shouldUnlock = DifficultyScaler.shouldUnlockNextLevel(
        level,
        finalGameState.score,
        finalGameState.timeLeft,
        matchAccuracy
      );
      
      if (shouldUnlock && level < 11) {
        Alert.alert(
          '🎊 Level Up!',
          `You unlocked Level ${level + 1}!\n${DifficultyScaler.getMotivationalMessage(level + 1)}`,
          [{ text: 'Let\'s Go!', style: 'default' }]
        );
      }
      
    } catch (error) {
      console.error('Error processing rewards:', error);
    }
  };

  const initializeGame = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to play');
        navigation.goBack();
        return;
      }

      const selectedCategory = (category as FashionCategory) || 'shoes';
      const itemsNeeded = (gridSize.rows * gridSize.cols) / 2;
      
      console.log(`🎯 Loading ${itemsNeeded} items from category: ${selectedCategory}`);
      
      // Handle "all" category - load mixed items from all categories
      if (selectedCategory === 'all') {
        console.log('🎨 Loading mixed items from all categories...');
        const allCategories: FashionCategory[] = ['shoes', 'dresses', 'suits', 'accessories', 'hats', 'pants', 'underwear', 'shirts', 'blouses'];
        
        // Calculate items per category (distribute evenly)
        const itemsPerCategory = Math.ceil(itemsNeeded / allCategories.length);
        const mixedItems: FashionItem[] = [];
        
        // Load items from each category
        for (const cat of allCategories) {
          const response = await fashionService.getFashionItems({
            category: cat,
            player_type: user.player_type,
            approved_only: true,
            limit: itemsPerCategory,
          });
          
          if (response.success && response.data && response.data.length > 0) {
            // Take random items from this category
            const shuffled = response.data.sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, Math.min(itemsPerCategory, response.data.length));
            mixedItems.push(...selected);
          }
        }
        
        // Shuffle all mixed items and take what we need
        const finalItems = mixedItems.sort(() => Math.random() - 0.5).slice(0, itemsNeeded);
        
        if (finalItems.length < itemsNeeded) {
          console.log(`⚠️ Only found ${finalItems.length} items, need ${itemsNeeded}`);
          // Fill remaining with random items
          const fallbackResponse = await fashionService.getRandomFashionItems(
            itemsNeeded - finalItems.length,
            user.player_type,
            difficultyLevel
          );
          if (fallbackResponse.success && fallbackResponse.data) {
            finalItems.push(...fallbackResponse.data);
          }
        }
        
        console.log(`✅ Loaded ${finalItems.length} mixed items from multiple categories`);
        await continueGameSetup(finalItems);
        return;
      }
      
      // Handle single category
      const itemsResponse = await fashionService.getFashionItems({
        category: selectedCategory as FashionCategory,
        player_type: user.player_type,
        approved_only: true,
        limit: 100,
      });
      
      // If not enough items in category, get random items
      if (!itemsResponse.success || !itemsResponse.data || itemsResponse.data.length < itemsNeeded) {
        console.log(`⚠️ Not enough ${selectedCategory} items, using fallback...`);
        const fallbackResponse = await fashionService.getRandomFashionItems(
          itemsNeeded,
          user.player_type,
          difficultyLevel
        );
        if (!fallbackResponse.success || !fallbackResponse.data) {
          console.error('❌ Fallback also failed!');
          throw new Error('No fashion items found in database. Please run the seed script.');
        }
        console.log('✅ Using', fallbackResponse.data.length, 'fallback items');
        const fashionItems = fallbackResponse.data.slice(0, itemsNeeded);
        await continueGameSetup(fashionItems);
        return;
      }
      
      console.log(`✅ Found ${itemsResponse.data.length} ${selectedCategory} items in database`);
      
      // Shuffle and select needed number of items
      const allItems = itemsResponse.data;
      const shuffled = allItems.sort(() => Math.random() - 0.5);
      const selectedItems = shuffled.slice(0, itemsNeeded);
      
      await continueGameSetup(selectedItems);
    } catch (error: any) {
      console.error('Failed to initialize game:', error);
      Alert.alert('Error', error.message || 'Failed to start game');
      navigation.goBack();
    }
  };

  const continueGameSetup = async (fashionItems: FashionItem[]) => {
    try {
      if (!user) return;

      console.log('🎮 Setting up game with', fashionItems.length, 'fashion items');
      console.log('📊 Grid size:', gridSize);
      console.log('⏱️ Time limit:', timeLimit, 'seconds');
      console.log('🎯 Difficulty level:', difficultyLevel);

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
      console.log('🎮 Creating GameEngine with callback...');
      const engine = new GameEngine(
        fashionItems,
        gridSize,
        timeLimit,
        difficultyLevel,
        handleGameStateChange
      );

      gameEngineRef.current = engine;
      console.log('⏱️ Starting timer...');
      engine.startTimer();
      const initialState = engine.getGameState();
      setGameState(initialState);
      setIsLoading(false);
      
      console.log('✅ Game initialized successfully!');
      console.log('🎴 Total cards:', initialState.cards.length);
      console.log('🎯 Total pairs:', initialState.totalPairs);
    } catch (error: any) {
      console.error('❌ Failed to setup game:', error);
      Alert.alert('Error', error.message || 'Failed to start game');
      navigation.goBack();
    }
  };

  const handleGameStateChange = (newState: GameState) => {
    console.log('🎮 Game state changed:', {
      isGameOver: newState.isGameOver,
      isWon: newState.isWon,
      matchedPairs: newState.matchedPairs,
      totalPairs: newState.totalPairs,
      timeLeft: newState.timeLeft
    });
    
    setGameState(newState);

    // Check if game is over (only call once)
    if (newState.isGameOver && sessionId && !isNavigatingToResults) {
      console.log('🏁 Game ended! Navigating to results...');
      setIsNavigatingToResults(true);
      handleGameEnd(newState);
    }
  };

  const handleGameEnd = async (finalState: GameState) => {
    console.log('🏁 ========== handleGameEnd START ==========');
    console.log('🏁 finalState:', {
      isGameOver: finalState.isGameOver,
      isWon: finalState.isWon,
      score: finalState.score,
      matchedPairs: finalState.matchedPairs,
      timeElapsed: finalState.timeElapsed,
    });
    
    try {
      const engine = gameEngineRef.current;
      
      if (!engine) {
        console.log('❌ No engine found!');
      }
      
      if (!sessionId) {
        console.log('❌ No sessionId found!');
      }

      let performanceMetrics: any = null;

      // Try to save if we have engine and sessionId
      if (engine && sessionId) {
        console.log('💾 Attempting to save game results...');
        try {
          performanceMetrics = engine.getPerformanceMetrics();

          await gameService.completeGameSession(sessionId, {
            score: finalState.score,
            matches_completed: finalState.matchedPairs,
            time_taken: finalState.timeElapsed,
            combo_max: finalState.maxCombo,
            is_won: finalState.isWon,
            performance_metrics: performanceMetrics,
          });

          if (user) {
            await gameService.savePerformanceMetrics(
              user.id,
              sessionId,
              performanceMetrics
            );
          }
          
          console.log('✅ Game results saved successfully');
        } catch (saveError) {
          console.error('⚠️ Failed to save, but continuing to results:', saveError);
        }
      }

      // 🤖 GROQ AI: Get next difficulty recommendation (DISABLED - Enable when Groq API is configured)
      // if (user && performanceMetrics) {
      //   try {
      //     console.log('🤖 Calling Groq AI for next difficulty...');
      //     const { groqDifficultyService } = await import('../../services/ai/groqDifficultyService');
      //     
      //     const aiRecommendation = await groqDifficultyService.getNextDifficulty({
      //       player_id: user.id,
      //       player_type: user.player_type,
      //       round_number: currentRound,
      //       performance: {
      //         accuracy: finalState.matchedPairs / finalState.totalPairs,
      //         avg_match_time: performanceMetrics.avg_match_time,
      //         mistakes: Math.max(0, finalState.totalPairs - finalState.matchedPairs),
      //         combo_max: finalState.maxCombo,
      //         time_taken: finalState.timeElapsed,
      //         time_limit: timeLimit
      //       },
      //       current_difficulty: {
      //         level: difficultyLevel,
      //         grid_size: gridSize,
      //         time_limit: timeLimit,
      //         items_count: (gridSize.rows * gridSize.cols) / 2
      //       }
      //     });
      //
      //     console.log('✅ AI Recommendation received!');
      //     console.log('🎯 Next Level:', aiRecommendation.next_difficulty.level);
      //     console.log('📐 Next Grid:', aiRecommendation.next_difficulty.grid_size);
      //     console.log('⏱️ Next Time:', aiRecommendation.next_difficulty.time_limit);
      //     console.log('💡 Reasoning:', aiRecommendation.next_difficulty.reasoning);
      //
      //     // Store AI recommendation for next game
      //     // (You can pass this to RoundResult screen or store in state)
      //     
      //   } catch (aiError) {
      //     console.error('⚠️ AI recommendation failed (using fallback):', aiError);
      //   }
      // }

      // Process rewards before navigation
      await processRewards(finalState);
      
      console.log('🚀 NAVIGATING TO ROUNDRESULT NOW...');
      console.log('🚀 Navigation params:', {
        isWinner: finalState.isWon,
        score: finalState.score,
        time: finalState.timeElapsed,
        matches: finalState.matchedPairs,
        gameMode: 'single',
      });
      
      // Navigate immediately - no setTimeout
      navigation.replace('RoundResult', {
        isWinner: finalState.isWon,
        score: finalState.score,
        time: finalState.timeElapsed,
        matches: finalState.matchedPairs,
        gameMode: 'single',
      });
      
      console.log('🏁 ========== handleGameEnd END ==========');
    } catch (error) {
      console.error('❌ CRITICAL ERROR in handleGameEnd:', error);
      console.error('❌ Error stack:', error);
      
      // Try navigation anyway
      try {
        navigation.replace('RoundResult', {
          isWinner: finalState.isWon,
          score: finalState.score,
          time: finalState.timeElapsed,
          matches: finalState.matchedPairs,
          gameMode: 'single',
        });
      } catch (navError) {
        console.error('❌ NAVIGATION ALSO FAILED:', navError);
      }
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

  console.log('🎮 Rendering game - Time left:', gameState?.timeLeft, 'Cards:', gameState?.cards?.length);

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

      {/* DEBUG: Force End Button - Remove this after testing */}
      {__DEV__ && (
        <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
          <Button
            title="🔧 Force End (Test)"
            onPress={() => {
              console.log('🔧 FORCE END BUTTON PRESSED');
              const currentState = gameEngineRef.current?.getGameState();
              if (currentState) {
                const testState: GameState = {
                  ...currentState,
                  isGameOver: true,
                  isWon: true,
                  matchedPairs: currentState.totalPairs,
                };
                console.log('🔧 Calling handleGameEnd with test state:', testState);
                setIsNavigatingToResults(true);
                handleGameEnd(testState);
              }
            }}
            size="small"
          />
        </View>
      )}

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
