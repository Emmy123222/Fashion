// src/types/game.types.ts
import { FashionCategory, FashionItem } from './fashion.types';

export type GameMode = 'single_player' | 'multiplayer' | 'team';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type MatchStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface GameConfig {
  id?: string;
  name: string;
  description?: string;
  difficulty_level: DifficultyLevel;
  grid_size: GridSize;
  time_limit: number; // seconds
  items_count: number;
  player_type: string[];
  is_active: boolean;
}

export interface GridSize {
  rows: number;
  cols: number;
}

export interface GameCard {
  id: string;
  fashionItemId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: FashionCategory;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: string; // To identify matching pairs
}

export interface GameState {
  cards: GameCard[];
  matchedPairs: number;
  totalPairs: number;
  timeLeft: number;
  timeElapsed: number;
  score: number;
  combo: number;
  maxCombo: number;
  isGameOver: boolean;
  isWon: boolean;
  isPaused: boolean;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id?: string;
  game_mode: GameMode;
  difficulty_level: DifficultyLevel;
  grid_size: GridSize;
  items_used: string[]; // Fashion item IDs
  score: number;
  matches_completed: number;
  time_taken?: number;
  time_limit: number;
  combo_max: number;
  is_completed: boolean;
  is_won: boolean;
  performance_metrics?: PerformanceMetrics;
  started_at: string;
  completed_at?: string;
}

export interface PerformanceMetrics {
  avg_match_time: number;
  accuracy_rate: number;
  combo_frequency: number;
  speed_score: number;
  difficulty_score: number;
  performance_score: number;
}

export interface GameResult {
  session_id: string;
  is_winner: boolean;
  score: number;
  time: number;
  matches: number;
  combo_max: number;
  game_mode: GameMode;
  rank?: number;
}

// Multiplayer types
export interface Match {
  id: string;
  match_type: 'pvp' | 'team';
  status: MatchStatus;
  game_id?: string;
  difficulty_level: DifficultyLevel;
  grid_size: GridSize;
  items_used: string[];
  time_limit: number;
  winner_id?: string;
  winning_team_id?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  user_id: string;
  team_id?: string;
  score: number;
  matches_completed: number;
  time_taken?: number;
  rank?: number;
  is_ready: boolean;
  joined_at: string;
}

export interface LiveMatchState {
  match: Match;
  participants: MatchParticipant[];
  game_state: GameState;
  current_user_id: string;
}

// Scoring
export interface ScoreCalculation {
  base_score: number;
  time_bonus: number;
  combo_bonus: number;
  difficulty_multiplier: number;
  total_score: number;
}

export const SCORE_CONFIG = {
  BASE_MATCH_SCORE: 100,
  COMBO_MULTIPLIER: 1.5,
  TIME_BONUS_PER_SECOND: 10,
  DIFFICULTY_MULTIPLIERS: {
    1: 1.0,
    2: 1.2,
    3: 1.5,
    4: 1.8,
    5: 2.0,
  },
};

export const TIMER_CONFIG = {
  INITIAL_TIME: 300, // 5 minutes
  TIME_REDUCTION_PER_ROUND: 30, // 30 seconds
  MINIMUM_TIME: 60, // 1 minute minimum
};