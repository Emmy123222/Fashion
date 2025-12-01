// src/services/game.service.ts
import { supabase } from '../lib/supabase';
import { GameSession, GameConfig, GameMode, PerformanceMetrics } from '../types/game.types';
import { ApiResponse } from '../types/api.types';

interface CreateGameSessionData {
  user_id: string;
  game_id?: string;
  game_mode: GameMode;
  difficulty_level: number;
  grid_size: { rows: number; cols: number };
  items_used: string[];
  time_limit: number;
}

interface CompleteGameSessionData {
  score: number;
  matches_completed: number;
  time_taken: number;
  combo_max: number;
  is_won: boolean;
  performance_metrics?: PerformanceMetrics;
}

class GameService {
  /**
   * Get game configurations
   */
  async getGameConfigs(): Promise<ApiResponse<GameConfig[]>> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('difficulty_level', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch game configs',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get game config by difficulty
   */
  async getGameConfigByDifficulty(difficulty: number): Promise<ApiResponse<GameConfig>> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('difficulty_level', difficulty)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch game config',
          code: error.code,
        },
      };
    }
  }

  /**
   * Create a new game session
   */
  async createGameSession(sessionData: CreateGameSessionData): Promise<ApiResponse<GameSession>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          ...sessionData,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to create game session',
          code: error.code,
        },
      };
    }
  }

  /**
   * Update game session
   */
  async updateGameSession(
    sessionId: string,
    updates: Partial<GameSession>
  ): Promise<ApiResponse<GameSession>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to update game session',
          code: error.code,
        },
      };
    }
  }

  /**
   * Complete a game session
   */
  async completeGameSession(
    sessionId: string,
    completionData: CompleteGameSessionData
  ): Promise<ApiResponse<GameSession>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update({
          ...completionData,
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to complete game session',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's game sessions
   */
  async getUserGameSessions(
    userId: string,
    limit: number = 10
  ): Promise<ApiResponse<GameSession[]>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch game sessions',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's best scores
   */
  async getUserBestScores(userId: string, gameMode?: GameMode): Promise<ApiResponse<GameSession[]>> {
    try {
      let query = supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('score', { ascending: false })
        .limit(10);

      if (gameMode) {
        query = query.eq('game_mode', gameMode);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch best scores',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('score, is_won, time_taken, matches_completed')
        .eq('user_id', userId)
        .eq('is_completed', true);

      if (error) throw error;

      const sessions = data || [];
      const stats = {
        total_games: sessions.length,
        total_wins: sessions.filter(s => s.is_won).length,
        total_score: sessions.reduce((sum, s) => sum + s.score, 0),
        avg_score: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length 
          : 0,
        best_score: sessions.length > 0 
          ? Math.max(...sessions.map(s => s.score)) 
          : 0,
        avg_time: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + (s.time_taken || 0), 0) / sessions.length 
          : 0,
        win_rate: sessions.length > 0 
          ? (sessions.filter(s => s.is_won).length / sessions.length) * 100 
          : 0,
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch user stats',
          code: error.code,
        },
      };
    }
  }

  /**
   * Save performance metrics
   */
  async savePerformanceMetrics(
    userId: string,
    sessionId: string,
    metrics: PerformanceMetrics
  ): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          user_id: userId,
          session_id: sessionId,
          ...metrics,
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to save performance metrics',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's recent performance metrics
   */
  async getUserPerformanceMetrics(
    userId: string,
    limit: number = 10
  ): Promise<ApiResponse<PerformanceMetrics[]>> {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch performance metrics',
          code: error.code,
        },
      };
    }
  }

  /**
   * Calculate suggested difficulty based on performance
   */
  async getSuggestedDifficulty(userId: string): Promise<ApiResponse<number>> {
    try {
      const metricsResponse = await this.getUserPerformanceMetrics(userId, 5);
      
      if (!metricsResponse.success || !metricsResponse.data || metricsResponse.data.length === 0) {
        return { success: true, data: 1 }; // Default to easiest
      }

      const metrics = metricsResponse.data;
      const avgPerformance = metrics.reduce((sum, m) => sum + m.performance_score, 0) / metrics.length;

      // Calculate suggested difficulty (1-5)
      let suggestedDifficulty = 1;
      if (avgPerformance >= 90) suggestedDifficulty = 5;
      else if (avgPerformance >= 75) suggestedDifficulty = 4;
      else if (avgPerformance >= 60) suggestedDifficulty = 3;
      else if (avgPerformance >= 40) suggestedDifficulty = 2;

      return { success: true, data: suggestedDifficulty };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to calculate difficulty',
          code: error.code,
        },
      };
    }
  }
}

export const gameService = new GameService();
