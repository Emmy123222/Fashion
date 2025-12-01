// src/services/team.service.ts
import { supabase } from '../lib/supabase';
import { Team, TeamMember, CreateTeamRequest, UpdateTeamRequest } from '../types/team.types';
import { ApiResponse } from '../types/api.types';

class TeamService {
  /**
   * Create a new team
   */
  async createTeam(captainId: string, teamData: CreateTeamRequest): Promise<ApiResponse<Team>> {
    try {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          captain_id: captainId,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add captain as member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: captainId,
          role: 'captain',
        });

      if (memberError) throw memberError;

      return { success: true, data: team };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to create team',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string): Promise<ApiResponse<Team>> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          profiles:captain_id (username, full_name, avatar_url)
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;

      // Get member count
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      return { 
        success: true, 
        data: { ...data, member_count: count || 0 } 
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch team',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get all active teams
   */
  async getTeams(limit: number = 20, offset: number = 0): Promise<ApiResponse<Team[]>> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          profiles:captain_id (username)
        `)
        .eq('is_active', true)
        .order('total_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch teams',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<ApiResponse<TeamMember[]>> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url, total_score)
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch team members',
          code: error.code,
        },
      };
    }
  }

  /**
   * Join a team
   */
  async joinTeam(teamId: string, userId: string): Promise<ApiResponse> {
    try {
      // Check if team is full
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('max_members')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      if (count && count >= team.max_members) {
        throw new Error('Team is full');
      }

      // Add member
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: 'member',
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to join team',
          code: error.code,
        },
      };
    }
  }

  /**
   * Leave a team
   */
  async leaveTeam(teamId: string, userId: string): Promise<ApiResponse> {
    try {
      // Check if user is captain
      const { data: team } = await supabase
        .from('teams')
        .select('captain_id')
        .eq('id', teamId)
        .single();

      if (team?.captain_id === userId) {
        throw new Error('Captain cannot leave team. Transfer captaincy first.');
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to leave team',
          code: error.code,
        },
      };
    }
  }

  /**
   * Update team
   */
  async updateTeam(teamId: string, updates: UpdateTeamRequest): Promise<ApiResponse<Team>> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to update team',
          code: error.code,
        },
      };
    }
  }

  /**
   * Delete team (captain only)
   */
  async deleteTeam(teamId: string, captainId: string): Promise<ApiResponse> {
    try {
      // Verify captain
      const { data: team } = await supabase
        .from('teams')
        .select('captain_id')
        .eq('id', teamId)
        .single();

      if (team?.captain_id !== captainId) {
        throw new Error('Only captain can delete team');
      }

      const { error } = await supabase
        .from('teams')
        .update({ is_active: false })
        .eq('id', teamId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to delete team',
          code: error.code,
        },
      };
    }
  }

  /**
   * Transfer captaincy
   */
  async transferCaptaincy(teamId: string, currentCaptainId: string, newCaptainId: string): Promise<ApiResponse> {
    try {
      // Verify current captain
      const { data: team } = await supabase
        .from('teams')
        .select('captain_id')
        .eq('id', teamId)
        .single();

      if (team?.captain_id !== currentCaptainId) {
        throw new Error('Only captain can transfer captaincy');
      }

      // Update team captain
      const { error: teamError } = await supabase
        .from('teams')
        .update({ captain_id: newCaptainId })
        .eq('id', teamId);

      if (teamError) throw teamError;

      // Update member roles
      await supabase
        .from('team_members')
        .update({ role: 'member' })
        .eq('team_id', teamId)
        .eq('user_id', currentCaptainId);

      await supabase
        .from('team_members')
        .update({ role: 'captain' })
        .eq('team_id', teamId)
        .eq('user_id', newCaptainId);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to transfer captaincy',
          code: error.code,
        },
      };
    }
  }

  /**
   * Remove team member (captain only)
   */
  async removeMember(teamId: string, captainId: string, memberId: string): Promise<ApiResponse> {
    try {
      // Verify captain
      const { data: team } = await supabase
        .from('teams')
        .select('captain_id')
        .eq('id', teamId)
        .single();

      if (team?.captain_id !== captainId) {
        throw new Error('Only captain can remove members');
      }

      if (memberId === captainId) {
        throw new Error('Captain cannot remove themselves');
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', memberId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to remove member',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<ApiResponse<Team[]>> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          teams (
            *,
            profiles:captain_id (username)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const teams = data?.map(item => item.teams).filter(Boolean) || [];
      return { success: true, data: teams as any };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch user teams',
          code: error.code,
        },
      };
    }
  }

  /**
   * Search teams
   */
  async searchTeams(query: string, limit: number = 20): Promise<ApiResponse<Team[]>> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to search teams',
          code: error.code,
        },
      };
    }
  }
}

export const teamService = new TeamService();
