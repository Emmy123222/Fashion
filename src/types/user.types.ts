// src/types/user.types.ts

export type PlayerType = 'child' | 'teen' | 'adult';
export type SubscriptionStatus = 'free' | 'premium';
export type SchoolType = 'high_school' | 'college' | 'university';
export type OrganizationType = 'nonprofit' | 'corporation' | 'government';

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  player_type: PlayerType;
  date_of_birth?: string;
  country?: string;
  state?: string;
  county?: string;
  city?: string;
  school_name?: string;
  school_type?: SchoolType;
  organization_name?: string;
  organization_type?: OrganizationType;
  is_admin: boolean;
  is_banned: boolean;
  subscription_status: SubscriptionStatus;
  subscription_expires_at?: string;
  total_score: number;
  total_matches: number;
  total_wins: number;
  win_streak: number;
  best_time?: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  player_type?: PlayerType;
  date_of_birth?: string;
  country?: string;
  state?: string;
  county?: string;
  city?: string;
  school_name?: string;
  school_type?: SchoolType;
  organization_name?: string;
  organization_type?: OrganizationType;
}

export interface UserStats {
  total_score: number;
  total_matches: number;
  total_wins: number;
  win_streak: number;
  best_time?: number;
  win_rate: number;
  avg_score: number;
}
