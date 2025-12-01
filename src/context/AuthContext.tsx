// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { Profile, PlayerType } from '../types/user.types';

type AuthContextType = {
  user: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { 
    email: string; 
    password: string; 
    username: string;
    full_name?: string;
    player_type: PlayerType;
    date_of_birth?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  hasPremiumAccess: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionResponse = await authService.getSession();
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data);
          
          const userResponse = await authService.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            setUser(userResponse.data);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session) {
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.signIn({ email, password });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Sign in failed');
      }
      
      setUser(response.data || null);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: { 
    email: string; 
    password: string; 
    username: string;
    full_name?: string;
    player_type: PlayerType;
    date_of_birth?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authService.signUp(data);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Sign up failed');
      }
      
      setUser(response.data || null);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const response = await authService.signOut();
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Sign out failed');
      }
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword(email);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setIsLoading(true);
      const response = await authService.updateProfile(user.id, updates);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Profile update failed');
      }
      
      setUser(response.data || null);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPremiumAccess = async (): Promise<boolean> => {
    if (!user) return false;
    return await authService.hasPremiumAccess(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        hasPremiumAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};