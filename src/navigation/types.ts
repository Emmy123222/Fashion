// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Game Stack Param List
export type GameStackParamList = {
  CategorySelection: undefined;
  LevelSelection: { category: string };
  SinglePlayerGame: { 
    category: string;
    level: number;
    layout: 'store' | 'pile';
    gameId?: string;
  };
};

// Root Stack Param List
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Game: NavigatorScreenParams<GameStackParamList>;
  GameMode: undefined;
  CategorySelection: undefined;
  LevelSelection: { category: string };
  SinglePlayerGame: { 
    category?: string;
    level?: number;
    layout?: 'store' | 'pile';
    gameId?: string;
  };
  MultiplayerLobby: undefined;
  MultiplayerGame: { matchId: string };
  TeamMode: undefined;
  RoundResult: {
    isWinner: boolean;
    score: number;
    time: number;
    matches: number;
    gameMode: 'single' | 'multiplayer' | 'team';
  };
  UploadFashion: undefined;
  Subscription: undefined;
  Leaderboard: { initialTab?: LeaderboardTabType };
  Settings: undefined;
  UserProfile: { userId?: string };
  // Admin screens
  AdminDashboard: undefined;
  UploadApproval: undefined;
  UserManagement: undefined;
  LeaderboardControl: undefined;
  SubscriptionAnalytics: undefined;
  GameAnalytics: undefined;
  ContentModeration: undefined;
};

// Main Tabs
export type MainTabParamList = {
  Home: undefined;
  Leaderboard: { initialTab?: LeaderboardTabType };
  Collection: undefined;
  Profile: undefined;
  Admin: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ProfileSetup: undefined;
};

// Leaderboard Tabs
export type LeaderboardTabType = 'global' | 'country' | 'city' | 'school' | 'team';

// Extend the RootParamList for type checking
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}