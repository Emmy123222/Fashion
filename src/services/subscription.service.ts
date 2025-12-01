// src/services/subscription.service.ts
import { supabase } from '../lib/supabase';
import { Subscription, Payment, SubscriptionStatus } from '../types/subscription.types';
import { ApiResponse } from '../types/api.types';

class SubscriptionService {
  /**
   * Create a subscription
   */
  async createSubscription(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    amount: number,
    expiresAt: string
  ): Promise<ApiResponse<Subscription>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status: 'active',
          plan_type: 'annual',
          amount,
          currency: 'USD',
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      // Update profile subscription status
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'premium',
          subscription_expires_at: expiresAt,
        })
        .eq('id', userId);

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to create subscription',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's subscription
   */
  async getUserSubscription(userId: string): Promise<ApiResponse<Subscription>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'No active subscription found',
          code: error.code,
        },
      };
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !data) return false;

      const expiresAt = new Date(data.expires_at);
      return expiresAt > new Date();
    } catch (error) {
      return false;
    }
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus
  ): Promise<ApiResponse> {
    try {
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('id', subscriptionId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Update profile if subscription is no longer active
      if (status !== 'active') {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'free',
            subscription_expires_at: null,
          })
          .eq('id', subscription.user_id);
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to update subscription',
          code: error.code,
        },
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<ApiResponse> {
    try {
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (fetchError) throw fetchError;

      return await this.updateSubscriptionStatus(subscription.id, 'cancelled');
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to cancel subscription',
          code: error.code,
        },
      };
    }
  }

  /**
   * Record a payment
   */
  async recordPayment(
    userId: string,
    subscriptionId: string,
    stripePaymentId: string,
    amount: number,
    status: 'succeeded' | 'pending' | 'failed'
  ): Promise<ApiResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          subscription_id: subscriptionId,
          stripe_payment_id: stripePaymentId,
          amount,
          currency: 'USD',
          status,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to record payment',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(userId: string): Promise<ApiResponse<Payment[]>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch payment history',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get subscription statistics (admin)
   */
  async getSubscriptionStats(): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, amount, created_at');

      if (error) throw error;

      const subscriptions = data || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total_subscriptions: subscriptions.length,
        active_subscriptions: subscriptions.filter(s => s.status === 'active').length,
        cancelled_subscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
        expired_subscriptions: subscriptions.filter(s => s.status === 'expired').length,
        total_revenue: subscriptions
          .filter(s => s.status === 'active')
          .reduce((sum, s) => sum + parseFloat(s.amount), 0),
        monthly_revenue: subscriptions
          .filter(s => s.status === 'active' && new Date(s.created_at) >= thirtyDaysAgo)
          .reduce((sum, s) => sum + parseFloat(s.amount), 0),
        new_subscriptions_this_month: subscriptions
          .filter(s => new Date(s.created_at) >= thirtyDaysAgo).length,
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch subscription stats',
          code: error.code,
        },
      };
    }
  }

  /**
   * Get all subscriptions (admin)
   */
  async getAllSubscriptions(
    status?: SubscriptionStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<Subscription[]>> {
    try {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (username, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch subscriptions',
          code: error.code,
        },
      };
    }
  }

  /**
   * Check and update expired subscriptions
   */
  async checkExpiredSubscriptions(): Promise<ApiResponse> {
    try {
      const { error } = await supabase.rpc('check_subscription_status');

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to check expired subscriptions',
          code: error.code,
        },
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
