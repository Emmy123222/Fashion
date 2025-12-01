// src/types/subscription.types.ts

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type PlanType = 'annual' | 'monthly';
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  plan_type: PlanType;
  amount: number;
  currency: string;
  started_at: string;
  expires_at: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id?: string;
  stripe_payment_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: PlanType;
  features: string[];
  stripe_price_id?: string;
}

export interface PremiumFeatures {
  multiplayer: boolean;
  team_mode: boolean;
  user_uploads: boolean;
  premium_fashion_packs: boolean;
  advanced_leaderboards: boolean;
  ad_free: boolean;
  custom_avatars: boolean;
  special_events: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'annual',
    name: 'Premium Annual',
    description: 'Full access to all features',
    price: 9.99,
    currency: 'USD',
    interval: 'annual',
    features: [
      'Multiplayer Mode',
      'Team Competitions',
      'Upload Your Fashion',
      'Premium AI Fashion Packs',
      'Advanced Leaderboards',
      'Ad-Free Experience',
      'Custom Avatars',
      'Special Events & Tournaments',
    ],
  },
];

export const FREE_FEATURES: PremiumFeatures = {
  multiplayer: false,
  team_mode: false,
  user_uploads: false,
  premium_fashion_packs: false,
  advanced_leaderboards: false,
  ad_free: false,
  custom_avatars: false,
  special_events: false,
};

export const PREMIUM_FEATURES: PremiumFeatures = {
  multiplayer: true,
  team_mode: true,
  user_uploads: true,
  premium_fashion_packs: true,
  advanced_leaderboards: true,
  ad_free: true,
  custom_avatars: true,
  special_events: true,
};
