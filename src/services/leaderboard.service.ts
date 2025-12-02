// src/services/leaderboard.service.ts
import { supabase } from '../lib/supabase';
import { LeaderboardEntry, LeaderboardFilter, LeaderboardScope } from '../types/leaderboard.types';
import { ApiResponse } from '../types/api.types';

class LeaderboardService {
  /**
   * Get leaderboard entries
   */
  async getLeaderboard(filter: LeaderboardFilter): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      let query = supabase
        .from('leaderboards')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url, country),
          teams:team_id (name, avatar_url)
        `)
        .eq('scope', filter.scope);

      if (filter.scope_value) {
        query = query.eq('scope_value', filter.scope_value);
      }

      if (filter.period) {
        query = query.eq('period', filter.period);
      }

      if (filter.leaderboard_type) {
        query = query.eq('leaderboard_type', filter.leaderboard_type);
      }

      query = query
        .order('rank', { ascending: true })
        .limit(filter.limit || 100);

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map the nested profile data to flat structure
      const mappedData = (data || []).map((entry: any) => ({
        ...entry,
        username: entry.profiles?.username || entry.username,
        full_name: entry.profiles?.full_name || entry.full_name,
        avatar_url: entry.profiles?.avatar_url || entry.avatar_url,
        country: entry.profiles?.country || entry.country,
        team_name: entry.teams?.name || entry.team_name,
        team_avatar_url: entry.teams?.avatar_url || entry.team_avatar_url,
      }));

      // Remove duplicates by user_id, keeping the highest score
      const uniqueUsers = new Map();
      mappedData.forEach((entry: any) => {
        const existing = uniqueUsers.get(entry.user_id);
        if (!existing || entry.score > existing.score) {
          uniqueUsers.set(entry.user_id, entry);
        }
      });

      // Convert back to array and re-rank
      const uniqueData = Array.from(uniqueUsers.values())
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        })
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return { success: true, data: uniqueData };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch leaderboard',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's rank in different scopes
   */
  async getUserRanks(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('scope, scope_value, rank, score')
        .eq('user_id', userId)
        .eq('leaderboard_type', 'user')
        .eq('period', 'all_time');

      if (error) throw error;

      const ranks: any = {};
      data?.forEach(entry => {
        const key = entry.scope_value ? `${entry.scope}_${entry.scope_value}` : entry.scope;
        ranks[key] = {
          rank: entry.rank,
          score: entry.score,
          scope: entry.scope,
          scope_value: entry.scope_value,
        };
      });

      return { success: true, data: ranks };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch user ranks',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get global top players
   */
  async getGlobalTopPlayers(limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'global',
      scope_value: 'global',
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get country leaderboard
   */
  async getCountryLeaderboard(country: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'country',
      scope_value: country,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get state leaderboard
   */
  async getStateLeaderboard(state: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'state',
      scope_value: state,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get city leaderboard
   */
  async getCityLeaderboard(city: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'city',
      scope_value: city,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get county leaderboard
   */
  async getCountyLeaderboard(county: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'county',
      scope_value: county,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get high school leaderboard
   */
  async getHighSchoolLeaderboard(schoolName: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'high_school',
      scope_value: schoolName,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get college leaderboard
   */
  async getCollegeLeaderboard(collegeName: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'college',
      scope_value: collegeName,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get university leaderboard
   */
  async getUniversityLeaderboard(universityName: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'university',
      scope_value: universityName,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get nonprofit organization leaderboard
   */
  async getNonprofitLeaderboard(nonprofitName: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'nonprofit',
      scope_value: nonprofitName,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get corporation leaderboard
   */
  async getCorporationLeaderboard(corporationName: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'corporation',
      scope_value: corporationName,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get government department leaderboard
   */
  async getGovernmentLeaderboard(departmentName: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'government',
      scope_value: departmentName,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get organization chapter leaderboard
   */
  async getOrganizationChapterLeaderboard(chapterName: string, limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope: 'organization_chapter',
      scope_value: chapterName,
      leaderboard_type: 'user',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get team leaderboard
   */
  async getTeamLeaderboard(scope: LeaderboardScope = 'global', limit: number = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.getLeaderboard({
      scope,
      leaderboard_type: 'team',
      period: 'all_time',
      limit,
    });
  }

  /**
   * Get user's position in leaderboard
   */
  async getUserPosition(
    userId: string,
    scope: LeaderboardScope,
    scopeValue?: string
  ): Promise<ApiResponse<LeaderboardEntry>> {
    try {
      let query = supabase
        .from('leaderboards')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url, country)
        `)
        .eq('user_id', userId)
        .eq('scope', scope)
        .eq('leaderboard_type', 'user')
        .eq('period', 'all_time');

      if (scopeValue) {
        query = query.eq('scope_value', scopeValue);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch user position',
          code: error.code,
        },
      };
    }
  }

  /**
   * Recalculate leaderboard ranks (admin)
   */
  async recalculateRanks(scope: LeaderboardScope, scopeValue?: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.rpc('recalculate_leaderboard_ranks', {
        p_scope: scope,
        p_scope_value: scopeValue,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to recalculate ranks',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(scope: LeaderboardScope, scopeValue?: string): Promise<ApiResponse<any>> {
    try {
      let query = supabase
        .from('leaderboards')
        .select('score, matches_played, wins')
        .eq('scope', scope)
        .eq('leaderboard_type', 'user')
        .eq('period', 'all_time');

      if (scopeValue) {
        query = query.eq('scope_value', scopeValue);
      }

      const { data, error } = await query;

      if (error) throw error;

      const entries = data || [];
      const stats = {
        total_players: entries.length,
        total_matches: entries.reduce((sum, e) => sum + e.matches_played, 0),
        total_score: entries.reduce((sum, e) => sum + e.score, 0),
        avg_score: entries.length > 0 
          ? entries.reduce((sum, e) => sum + e.score, 0) / entries.length 
          : 0,
        top_score: entries.length > 0 
          ? Math.max(...entries.map(e => e.score)) 
          : 0,
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch leaderboard stats',
          code: error.code,
        },
      };
    }
  }

  /**
   * Search leaderboard by username
   */
  async searchLeaderboard(
    username: string,
    scope: LeaderboardScope = 'global',
    limit: number = 20
  ): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url, country)
        `)
        .eq('scope', scope)
        .eq('leaderboard_type', 'user')
        .ilike('profiles.username', `%${username}%`)
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to search leaderboard',
          code: error.code,
        },
      };
    }
  }
}

export const leaderboardService = new LeaderboardService();
