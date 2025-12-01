// src/services/multiplayer.service.ts
import { supabase } from '../lib/supabase';
import { Match, MatchParticipant, MatchStatus } from '../types/game.types';
import { ApiResponse } from '../types/api.types';
import { RealtimeChannel } from '@supabase/supabase-js';

class MultiplayerService {
  private matchChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * Create a new match
   */
  async createMatch(
    userId: string,
    matchType: 'pvp' | 'team',
    gameConfig: {
      difficulty_level: number;
      grid_size: { rows: number; cols: number };
      items_used: string[];
      time_limit: number;
    }
  ): Promise<ApiResponse<Match>> {
    try {
      // Create match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          match_type: matchType,
          status: 'waiting',
          ...gameConfig,
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('match_participants')
        .insert({
          match_id: match.id,
          user_id: userId,
          is_ready: true,
        });

      if (participantError) throw participantError;

      return { success: true, data: match };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to create match',
          code: error.code,
        },
      };
    }
  }

  /**
   * Find available matches
   */
  async findAvailableMatches(matchType: 'pvp' | 'team' = 'pvp'): Promise<ApiResponse<Match[]>> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_participants (count)
        `)
        .eq('match_type', matchType)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to find matches',
          code: error.code,
        },
      };
    }
  }

  /**
   * Join a match
   */
  async joinMatch(matchId: string, userId: string, teamId?: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('match_participants')
        .insert({
          match_id: matchId,
          user_id: userId,
          team_id: teamId,
          is_ready: false,
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to join match',
          code: error.code,
        },
      };
    }
  }

  /**
   * Leave a match
   */
  async leaveMatch(matchId: string, userId: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId)
        .eq('user_id', userId);

      if (error) throw error;

      // Check if match is empty
      const { count } = await supabase
        .from('match_participants')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', matchId);

      if (count === 0) {
        // Cancel match if empty
        await supabase
          .from('matches')
          .update({ status: 'cancelled' })
          .eq('id', matchId);
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to leave match',
          code: error.code,
        },
      };
    }
  }

  /**
   * Set player ready status
   */
  async setReady(matchId: string, userId: string, isReady: boolean): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('match_participants')
        .update({ is_ready: isReady })
        .eq('match_id', matchId)
        .eq('user_id', userId);

      if (error) throw error;

      // Check if all players are ready
      const { data: participants } = await supabase
        .from('match_participants')
        .select('is_ready')
        .eq('match_id', matchId);

      const allReady = participants?.every(p => p.is_ready) && participants.length >= 2;

      if (allReady) {
        // Start match
        await supabase
          .from('matches')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString(),
          })
          .eq('id', matchId);
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to set ready status',
          code: error.code,
        },
      };
    }
  }

  /**
   * Update participant score
   */
  async updateParticipantScore(
    matchId: string,
    userId: string,
    score: number,
    matchesCompleted: number
  ): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('match_participants')
        .update({
          score,
          matches_completed: matchesCompleted,
        })
        .eq('match_id', matchId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to update score',
          code: error.code,
        },
      };
    }
  }

  /**
   * Complete a match
   */
  async completeMatch(matchId: string, winnerId?: string, winningTeamId?: string): Promise<ApiResponse> {
    try {
      // Get all participants
      const { data: participants } = await supabase
        .from('match_participants')
        .select('*')
        .eq('match_id', matchId)
        .order('score', { ascending: false });

      // Assign ranks
      if (participants) {
        for (let i = 0; i < participants.length; i++) {
          await supabase
            .from('match_participants')
            .update({ rank: i + 1 })
            .eq('id', participants[i].id);
        }
      }

      // Update match status
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          winner_id: winnerId,
          winning_team_id: winningTeamId,
        })
        .eq('id', matchId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to complete match',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get match details
   */
  async getMatch(matchId: string): Promise<ApiResponse<Match>> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch match',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get match participants
   */
  async getMatchParticipants(matchId: string): Promise<ApiResponse<MatchParticipant[]>> {
    try {
      const { data, error } = await supabase
        .from('match_participants')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('match_id', matchId);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch participants',
          code: error.code,
        },
      };
    }
  }

  /**
   * Subscribe to match updates
   */
  subscribeToMatch(matchId: string, callback: (payload: any) => void): RealtimeChannel {
    const channelName = `match:${matchId}`;
    
    // Unsubscribe from existing channel if any
    if (this.matchChannels.has(channelName)) {
      this.matchChannels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants',
          filter: `match_id=eq.${matchId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        callback
      )
      .subscribe();

    this.matchChannels.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe from match updates
   */
  unsubscribeFromMatch(matchId: string): void {
    const channelName = `match:${matchId}`;
    const channel = this.matchChannels.get(channelName);
    
    if (channel) {
      channel.unsubscribe();
      this.matchChannels.delete(channelName);
    }
  }

  /**
   * Send match event (for real-time game state sync)
   */
  async sendMatchEvent(matchId: string, event: any): Promise<void> {
    const channelName = `match:${matchId}`;
    const channel = this.matchChannels.get(channelName);
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event,
      });
    }
  }

  /**
   * Get user's match history
   */
  async getUserMatchHistory(userId: string, limit: number = 10): Promise<ApiResponse<Match[]>> {
    try {
      const { data, error } = await supabase
        .from('match_participants')
        .select(`
          matches (*)
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const matches = data?.map(item => item.matches).filter(Boolean) || [];
      return { success: true, data: matches as any };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch match history',
          code: error.code,
        },
      };
    }
  }
}

export const multiplayerService = new MultiplayerService();
