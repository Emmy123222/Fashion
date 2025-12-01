// src/screens/game/MultiplayerGameScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet,  View, Text, Alert, Modal } from 'react-native';
import { theme } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { GameEngine } from '../../services/GameEngine';
import { multiplayerService, fashionService, gameService } from '../../services';
import { GameState, MatchParticipant } from '../../types/game.types';
import { GameHeader } from '../../components/game/GameHeader';
import { MatchGrid } from '../../components/game/MatchGrid';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

type MultiplayerGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MultiplayerGame'
>;
type MultiplayerGameScreenRouteProp = RouteProp<RootStackParamList, 'MultiplayerGame'>;

interface Props {
  navigation: MultiplayerGameScreenNavigationProp;
  route: MultiplayerGameScreenRouteProp;
}

export const MultiplayerGameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { matchId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameEngineRef = useRef<GameEngine | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    initializeMatch();
    
    return () => {
      gameEngineRef.current?.destroy();
      if (channelRef.current) {
        multiplayerService.unsubscribeFromMatch(matchId);
      }
    };
  }, []);

  const initializeMatch = async () => {
    try {
      if (!user) return;

      // Get match details
      const matchResponse = await multiplayerService.getMatch(matchId);
      if (!matchResponse.success || !matchResponse.data) {
        throw new Error('Failed to load match');
      }

      const match = matchResponse.data;

      // Get participants
      const participantsResponse = await multiplayerService.getMatchParticipants(matchId);
      if (!participantsResponse.success || !participantsResponse.data) {
        throw new Error('Failed to load participants');
      }

      setParticipants(participantsResponse.data);

      // Get fashion items
      const itemsResponse = await fashionService.getFashionItemsByIds(match.items_used);
      if (!itemsResponse.success || !itemsResponse.data) {
        throw new Error('Failed to load fashion items');
      }

      // Initialize game engine
      const engine = new GameEngine(
        itemsResponse.data,
        match.grid_size,
        match.time_limit,
        match.difficulty_level,
        handleGameStateChange
      );

      gameEngineRef.current = engine;

      // Subscribe to real-time updates
      subscribeToMatch();

      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to initialize match:', error);
      Alert.alert('Error', error.message || 'Failed to load match');
      navigation.goBack();
    }
  };

  const subscribeToMatch = () => {
    channelRef.current = multiplayerService.subscribeToMatch(matchId, (payload) => {
      // Handle real-time updates
      if (payload.eventType === 'UPDATE') {
        if (payload.table === 'matches' && payload.new.status === 'in_progress') {
          handleMatchStart();
        } else if (payload.table === 'match_participants') {
          loadParticipants();
        }
      }
    });
  };

  const loadParticipants = async () => {
    const response = await multiplayerService.getMatchParticipants(matchId);
    if (response.success && response.data) {
      setParticipants(response.data);
      
      // Check if all players are ready
      const allReady = response.data.every(p => p.is_ready) && response.data.length >= 2;
      if (allReady && !gameStarted) {
        handleMatchStart();
      }
    }
  };

  const handleReady = async () => {
    if (!user) return;

    try {
      await multiplayerService.setReady(matchId, user.id, true);
      setIsReady(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to set ready status');
    }
  };

  const handleMatchStart = () => {
    setGameStarted(true);
    gameEngineRef.current?.startTimer();
    const state = gameEngineRef.current?.getGameState();
    if (state) setGameState(state);
  };

  const handleGameStateChange = async (newState: GameState) => {
    setGameState(newState);

    // Update score in real-time
    if (user && gameStarted) {
      await multiplayerService.updateParticipantScore(
        matchId,
        user.id,
        newState.score,
        newState.matchedPairs
      );
    }

    // Check if game is over
    if (newState.isGameOver) {
      handleGameEnd(newState);
    }
  };

  const handleGameEnd = async (finalState: GameState) => {
    try {
      if (!user) return;

      // Determine winner
      const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
      const winnerId = sortedParticipants[0]?.user_id;

      // Complete match
      await multiplayerService.completeMatch(matchId, winnerId);

      // Navigate to results
      navigation.replace('RoundResult', {
        isWinner: winnerId === user.id,
        score: finalState.score,
        time: finalState.timeElapsed,
        matches: finalState.matchedPairs,
        gameMode: 'multiplayer',
      });
    } catch (error) {
      console.error('Failed to complete match:', error);
    }
  };

  const handleCardPress = (cardId: string) => {
    if (!gameEngineRef.current || isPaused || !gameStarted) return;
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
      'Quit Match',
      'Are you sure you want to quit? You will lose the match.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: async () => {
            if (user) {
              await multiplayerService.leaveMatch(matchId, user.id);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getOpponent = () => {
    return participants.find(p => p.user_id !== user?.id);
  };

  if (isLoading || !gameState) {
    return <Loader fullScreen text="Loading match..." />;
  }

  // Waiting room
  if (!gameStarted) {
    const opponent = getOpponent();
    
    return (
      <View style={styles.container}>
        <View style={styles.waitingRoom}>
          <Text style={styles.waitingTitle}>Waiting for Players</Text>
          
          <Card style={styles.playersCard}>
            {participants.map((participant) => (
              <View key={participant.id} style={styles.playerRow}>
                <Text style={styles.playerName}>
                  {participant.user_id === user?.id ? 'You' : 'Opponent'}
                </Text>
                {participant.is_ready ? (
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyText}>Ready</Text>
                  </View>
                ) : (
                  <Text style={styles.waitingText}>Waiting...</Text>
                )}
              </View>
            ))}
          </Card>

          {!isReady && (
            <Button
              title="Ready"
              onPress={handleReady}
              fullWidth
              size="large"
            />
          )}

          {isReady && (
            <Text style={styles.waitingMessage}>
              Waiting for opponent to be ready...
            </Text>
          )}

          <Button
            title="Leave Match"
            onPress={handleQuit}
            variant="outline"
            fullWidth
            style={styles.leaveButton}
          />
        </View>
      </View>
    );
  }

  // Active game
  const opponent = getOpponent();

  return (
    <View style={styles.container}>
      <GameHeader
        timeLeft={gameState.timeLeft}
        timeLimit={300}
        score={gameState.score}
        combo={gameState.combo}
        onPause={handlePause}
        onQuit={handleQuit}
      />

      {/* Opponent Score */}
      {opponent && (
        <Card style={styles.opponentCard} padding="small">
          <Text style={styles.opponentLabel}>Opponent</Text>
          <Text style={styles.opponentScore}>{opponent.score || 0}</Text>
        </Card>
      )}

      <MatchGrid
        cards={gameState.cards}
        gridSize={{ rows: 4, cols: 4 }}
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
  waitingRoom: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  waitingTitle: {
    ...theme.text.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  playersCard: {
    marginBottom: theme.spacing.xl,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  playerName: {
    ...theme.text.h3,
    color: theme.colors.text,
  },
  readyBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  readyText: {
    ...theme.text.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  waitingText: {
    ...theme.text.body,
    color: theme.colors.gray,
  },
  waitingMessage: {
    ...theme.text.body,
    color: theme.colors.gray,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  leaveButton: {
    marginTop: theme.spacing.md,
  },
  opponentCard: {
    margin: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opponentLabel: {
    ...theme.text.body,
    color: theme.colors.gray,
  },
  opponentScore: {
    ...theme.text.h2,
    color: theme.colors.danger,
    fontWeight: '700',
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
