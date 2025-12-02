// src/types/leaderboard.types.ts

export type LeaderboardType = 'user' | 'team';
export type LeaderboardScope = 
  | 'global' 
  | 'country' 
  | 'state' 
  | 'county' 
  | 'city' 
  | 'high_school'
  | 'college'
  | 'university'
  | 'nonprofit'
  | 'corporation'
  | 'government'
  | 'organization_chapter';
export type LeaderboardPeriod = 'all_time' | 'monthly' | 'weekly' | 'daily';

export interface LeaderboardEntry {
  id: string;
  user_id?: string;
  team_id?: string;
  leaderboard_type: LeaderboardType;
  scope: LeaderboardScope;
  scope_value?: string;
  score: number;
  wins: number;
  matches_played: number;
  rank?: number;
  period: LeaderboardPeriod;
  period_start?: string;
  period_end?: string;
  updated_at: string;
  
  // Joined data
  username?: string;
  full_name?: string;
  avatar_url?: string;
  country?: string;
  team_name?: string;
  team_avatar_url?: string;
}

export interface LeaderboardFilter {
  scope: LeaderboardScope;
  scope_value?: string;
  period?: LeaderboardPeriod;
  leaderboard_type?: LeaderboardType;
  limit?: number;
  offset?: number;
}

export interface LeaderboardStats {
  total_players: number;
  total_teams: number;
  total_matches: number;
  avg_score: number;
  top_score: number;
}

export interface UserRank {
  global_rank?: number;
  country_rank?: number;
  state_rank?: number;
  county_rank?: number;
  city_rank?: number;
  high_school_rank?: number;
  college_rank?: number;
  university_rank?: number;
  nonprofit_rank?: number;
  corporation_rank?: number;
  government_rank?: number;
  organization_chapter_rank?: number;
}
