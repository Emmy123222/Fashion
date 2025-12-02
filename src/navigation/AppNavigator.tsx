// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useAuth } from '../context/AuthContext';
import { GameModeScreen } from '../screens/game/GameModeScreen';
import { CategorySelectionScreen } from '../screens/game/CategorySelectionScreen';
import { LevelSelectionScreen } from '../screens/game/LevelSelectionScreen';
import { SinglePlayerGameScreen } from '../screens/game/SinglePlayerGameScreen';
import { RoundResultScreen } from '../screens/game/RoundResultScreen';
import { MultiplayerLobbyScreen } from '../screens/game/MultiplayerLobbyScreen';
import { MultiplayerGameScreen } from '../screens/game/MultiplayerGameScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { session, isLoading, user } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !isAppReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!session ? (
          <>
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="Auth" 
              component={AuthNavigator} 
              options={{ gestureEnabled: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="GameMode" component={GameModeScreen} />
            <Stack.Screen 
              name="CategorySelection" 
              component={CategorySelectionScreen} 
            />
            <Stack.Screen 
              name="LevelSelection" 
              component={LevelSelectionScreen} 
            />
            <Stack.Screen 
              name="SinglePlayerGame" 
              component={SinglePlayerGameScreen} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="MultiplayerLobby" 
              component={MultiplayerLobbyScreen} 
            />
            <Stack.Screen 
              name="MultiplayerGame" 
              component={MultiplayerGameScreen} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="RoundResult" component={RoundResultScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};