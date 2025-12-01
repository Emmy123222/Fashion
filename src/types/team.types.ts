// src/types/team.types.ts

export type TeamRole = 'captain' | 'co_captain' | 'member';

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  captain_id: string;
  total_score: number;
  total_matches: number;
  total_wins: number;
  is_active: boolean;
  max_members: number;
  created_at: string;
  updated_at: string;
  
  // Joined data
  captain_username?: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  
  // Joined user data
  username?: string;
  full_name?: string;
  avatar_url?: string;
  total_score?: number;
}

export interface TeamStats {
  total_score: number;
  total_matches: number;
  total_wins: number;
  win_rate: number;
  avg_score_per_match: number;
  member_count: number;
  rank?: number;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  invited_user_id: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  avatar_url?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  avatar_url?: string;
  max_members?: number;
}
