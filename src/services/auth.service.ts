// src/services/auth.service.ts
import { supabase } from '../lib/supabase';
import { Profile, ProfileUpdate, PlayerType } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
  player_type: PlayerType;
  date_of_birth?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<ApiResponse<Profile>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name,
            player_type: data.player_type,
            date_of_birth: data.date_of_birth,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Get the created profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, data: profile };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Sign up failed',
          code: error.code,
        },
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<ApiResponse<Profile>> {
    try {
      // Debug: Log what we're receiving
      console.log('SignIn RAW data:', data);
      console.log('Email type:', typeof data.email, 'Value:', data.email);
      console.log('Password type:', typeof data.password, 'Length:', data.password?.length);
      
      // Force convert to plain strings and validate
      const email = data.email?.toString().trim() || '';
      const password = data.password?.toString() || '';
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      console.log('Sending to Supabase:', { email, passwordLength: password.length });
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      if (!authData.user) throw new Error('Sign in failed');

      console.log('Auth successful! User:', authData.user.email);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If profile doesn't exist, create a basic one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: authData.user.email?.split('@')[0] || 'user',
            player_type: 'adult',
            is_admin: false,
            is_banned: false,
            subscription_status: 'free',
            total_score: 0,
            total_matches: 0,
            total_wins: 0,
            win_streak: 0,
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return { success: true, data: newProfile };
      }

      return { success: true, data: profile };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Sign in failed',
          code: error.code,
        },
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'fashionmatch://auth/callback',
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Google sign in failed',
          code: error.code,
        },
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Sign out failed',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      return { success: true, data: data.session };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to get session',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<Profile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('No user found');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, data: profile };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to get user',
          code: error.code,
        },
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Profile update failed',
          code: error.code,
        },
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'fashionmatch://auth/reset-password',
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Password reset failed',
          code: error.code,
        },
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Password update failed',
          code: error.code,
        },
      };
    }
  }

  /**
   * Check if user has premium subscription
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (error || !data) return false;

      if (data.subscription_status !== 'premium') return false;
      
      if (data.subscription_expires_at) {
        const expiresAt = new Date(data.subscription_expires_at);
        return expiresAt > new Date();
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
